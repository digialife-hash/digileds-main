import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { startRegistration } from "@simplewebauthn/browser";

export default function SecurityPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setup, setSetup] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState("all");
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [passkeys, setPasskeys] = useState([]);
  const [passkeyName, setPasskeyName] = useState("Admin passkey");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.detail || data.message || "Request failed.");
    }
    return data;
  }

  async function load(nextPage = activityPage, nextFilter = activityFilter) {
    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: "25",
      });
      if (nextFilter !== "all") query.set("success", nextFilter);
      const [session, logData] = await Promise.all([
        request("/api/auth/session"),
        request(`/api/auth/security-activity?${query.toString()}`),
      ]);
      setMfaEnabled(Boolean(session.user?.mfaEnabled));
      setActivities(logData.activities || []);
      setActivityPagination(logData.pagination || null);
      const sessionData = await request("/api/auth/sessions");
      setSessions(sessionData.sessions || []);
      const passkeyData = await request("/api/auth/passkeys");
      setPasskeys(passkeyData.passkeys || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    load(1, "all");
  }, []);

  useEffect(() => {
    let active = true;
    if (!setup?.otpauthUrl) {
      setQrCode("");
      return undefined;
    }
    QRCode.toDataURL(setup.otpauthUrl, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
    }).then((dataUrl) => {
      if (active) setQrCode(dataUrl);
    }).catch((requestError) => {
      if (active) setError(`Could not generate MFA QR code: ${requestError.message}`);
    });
    return () => {
      active = false;
    };
  }, [setup]);

  async function startMfa() {
    setError("");
    try {
      setSetup(await request("/api/auth/mfa/setup", { method: "POST", body: "{}" }));
      setMessage("Scan the setup URI in your authenticator app, then verify it below.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateMfa(enable) {
    setError("");
    try {
      await request(`/api/auth/mfa/${enable ? "enable" : "disable"}`, {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      setOtp("");
      setSetup(null);
      setQrCode("");
      setMfaEnabled(enable);
      setMessage(enable ? "MFA enabled." : "MFA disabled.");
      await load(activityPage, activityFilter);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function logoutAll() {
    try {
      await request("/api/auth/logout-all", { method: "POST", body: "{}" });
      window.location.assign("/login");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function revokeSession(sessionId, current) {
    setError("");
    try {
      const result = await request(`/api/auth/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      });
      if (result.current || current) {
        window.location.assign("/login");
        return;
      }
      setSessions((items) => items.filter((item) => item.sessionId !== sessionId));
      setMessage("Session revoked.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function registerPasskey() {
    setError("");
    try {
      const optionData = await request("/api/auth/passkeys/options", {
        method: "POST",
        body: "{}",
      });
      const credential = await startRegistration({
        optionsJSON: optionData.options,
      });
      await request("/api/auth/passkeys/register", {
        method: "POST",
        body: JSON.stringify({ ...credential, name: passkeyName }),
      });
      setMessage("Passkey registered successfully.");
      setPasskeyName("Admin passkey");
      await load(activityPage, activityFilter);
    } catch (requestError) {
      setError(
        requestError.name === "NotAllowedError"
          ? "Passkey setup was cancelled or blocked by the browser. Allow passkeys for this site and try again."
          : requestError.message,
      );
    }
  }

  async function removePasskey(credentialId) {
    setError("");
    try {
      await request(`/api/auth/passkeys/${encodeURIComponent(credentialId)}`, {
        method: "DELETE",
      });
      setPasskeys((items) => items.filter((item) => item.id !== credentialId));
      setMessage("Passkey revoked.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeActivityFilter(value) {
    setActivityFilter(value);
    setActivityPage(1);
    await load(1, value);
  }

  async function changeActivityPage(nextPage) {
    setActivityPage(nextPage);
    await load(nextPage, activityFilter);
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">Security</h1>
        <p className="mt-1 text-sm text-slate-500">Manage MFA, sessions, and administrator activity.</p>
      </div>
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Authenticator app MFA</h2>
            <p className="mt-1 text-sm text-slate-500">{mfaEnabled ? "Enabled" : "Not enabled"}</p>
          </div>
          {!mfaEnabled && !setup && <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white" onClick={startMfa}>Set up MFA</button>}
          {mfaEnabled && (
            <div className="flex gap-2">
              <input className="w-32 rounded-lg border px-3 py-2" inputMode="numeric" maxLength={6} placeholder="MFA code" value={otp} onChange={(event) => setOtp(event.target.value)} />
              <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600" onClick={() => updateMfa(false)}>Disable MFA</button>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Passkeys</h2>
              <p className="mt-1 text-sm text-slate-500">Use your device PIN, fingerprint, Face ID, or security key after password login.</p>
            </div>
            <div className="flex gap-2">
              <input
                value={passkeyName}
                onChange={(event) => setPasskeyName(event.target.value)}
                className="w-36 rounded-lg border px-3 py-2 text-sm"
                maxLength={80}
                placeholder="Device name"
              />
              <button type="button" onClick={registerPasskey} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold text-white">
                Add passkey
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {passkeys.map((passkey) => (
              <div key={passkey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div>
                  <p className="font-semibold dark:text-white">{passkey.name}</p>
                  <p className="text-xs text-slate-500">
                    Added {passkey.createdAt ? new Date(passkey.createdAt).toLocaleString() : "unknown"}
                    {passkey.lastUsedAt ? ` - Last used ${new Date(passkey.lastUsedAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => removePasskey(passkey.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">
                  Revoke
                </button>
              </div>
            ))}
            {!passkeys.length && <p className="text-sm text-slate-500">No passkeys registered.</p>}
          </div>
        </div>
        {setup && (
          <div className="mt-4 space-y-3 text-sm">
            <p>Scan this QR code in Google Authenticator, Microsoft Authenticator, or another TOTP app:</p>
            {qrCode ? (
              <div className="inline-flex rounded-xl bg-white p-3 shadow-sm">
                <img src={qrCode} alt="MFA authenticator QR code" width="220" height="220" />
              </div>
            ) : (
              <p className="text-xs text-slate-500">Generating QR code...</p>
            )}
            <p className="text-xs text-slate-500">If the QR code does not scan, enter this URI manually:</p>
            <code className="block break-all rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">{setup.otpauthUrl}</code>
            <p className="font-mono text-xs">Secret: {setup.secret}</p>
            <div className="flex gap-2">
              <input className="rounded-lg border px-3 py-2" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={otp} onChange={(event) => setOtp(event.target.value)} />
              <button className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white" onClick={() => updateMfa(true)}>Enable</button>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 dark:text-white">Sessions</h2>
          <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600" onClick={logoutAll}>Log out all devices</button>
        </div>
        <p className="mt-2 text-sm text-slate-500">Revoke one device or invalidate every existing admin access and refresh token.</p>
        <div className="mt-4 space-y-2">
          {sessions.map((session) => (
            <div key={session.sessionId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div className="min-w-0">
                <p className="font-semibold dark:text-white">
                  {session.current ? "This device" : "Admin session"}
                  {session.ip ? ` - ${session.ip}` : ""}
                </p>
                <p className="truncate text-xs text-slate-500">
                  Last active: {new Date(session.lastSeenAt).toLocaleString()}
                  {session.userAgent ? ` - ${session.userAgent}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                onClick={() => revokeSession(session.sessionId, session.current)}
              >
                Revoke
              </button>
            </div>
          ))}
          {!sessions.length && <p className="text-sm text-slate-500">No active sessions found.</p>}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h2 className="font-bold dark:text-white">Recent security activity</h2>
            <p className="mt-1 text-xs text-slate-500">Admin-only audit trail. Failed events should be investigated.</p>
          </div>
          <select
            value={activityFilter}
            onChange={(event) => changeActivityFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All activity</option>
            <option value="true">Successful only</option>
            <option value="false">Failed only</option>
          </select>
        </div>
        <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {activities.map((activity, index) => (
            <div key={`${activity.timestamp}-${index}`} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <span className="font-semibold dark:text-white">{activity.event}</span>
              <span className={activity.success ? "text-emerald-600" : "text-red-600"}>{activity.success ? "Success" : "Failed"}</span>
              <span className="text-xs text-slate-500">{activity.ip || "Unknown IP"}</span>
              <time className="text-slate-400">{new Date(activity.timestamp).toLocaleString()}</time>
            </div>
          ))}
          {!activities.length && <p className="p-5 text-sm text-slate-500">No activity recorded yet.</p>}
        </div>
        {activityPagination && activityPagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 text-xs dark:border-slate-800">
            <span className="text-slate-500">
              Page {activityPagination.page} of {activityPagination.pages} ({activityPagination.total} events)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={activityPagination.page <= 1}
                onClick={() => changeActivityPage(activityPagination.page - 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={activityPagination.page >= activityPagination.pages}
                onClick={() => changeActivityPage(activityPagination.page + 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
