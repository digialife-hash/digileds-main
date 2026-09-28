import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleUserRound,
  KeyRound,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PageHeader from "../layout/PageHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { apiRequest } from "../../services/api.js";

export default function Settings() {
  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const initials = useMemo(() => {
    const source =
      name?.trim() ||
      user?.name?.trim() ||
      "Admin";

    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  }, [name, user?.name]);

  async function handleSave(event) {
    event.preventDefault();

    setSaved(false);
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your display name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setSaving(true);

      const { user: updatedUser } =
        await apiRequest("/auth/me", {
          method: "PATCH",
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
          }),
        });

      updateUser(updatedUser);
      setName(updatedUser?.name || trimmedName);
      setEmail(updatedUser?.email || trimmedEmail);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save your profile right now. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />

        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />

        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative px-4 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8">
        <PageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Manage your profile, account security and current session."
        />

        <div className="mx-auto mt-6 w-full max-w-[1500px]">
          {/* ===================================================
              TOP PROFILE CARD
          ==================================================== */}

          <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/[0.72] shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/35 to-transparent dark:via-orange-400/20" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-orange-400/[0.08] via-transparent to-cyan-400/[0.07] dark:from-orange-400/[0.045] dark:to-cyan-400/[0.04]" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-400/10 blur-[90px] dark:bg-orange-400/[0.055]" />

            <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px] dark:bg-cyan-400/[0.045]" />

            <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
              {/* Header */}

              <div className="flex flex-col gap-5 border-b border-stone-200/70 pb-7 transition-colors duration-300 dark:border-white/[0.06] md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  {/* Avatar */}

                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-[22px] bg-gradient-to-br from-orange-400/40 via-amber-300/20 to-cyan-400/30 blur-md dark:from-orange-400/20 dark:via-amber-300/10 dark:to-cyan-400/20" />

                    <div className="relative grid h-[68px] w-[68px] place-items-center rounded-[21px] border border-white/90 bg-gradient-to-br from-white/90 to-stone-100/70 text-xl font-black tracking-tight text-stone-800 shadow-[0_14px_35px_rgba(15,23,42,0.09)] dark:border-white/[0.08] dark:from-white/[0.09] dark:to-white/[0.035] dark:text-white dark:shadow-[0_14px_35px_rgba(0,0,0,0.28)]">
                      {initials || (
                        <CircleUserRound size={27} />
                      )}
                    </div>

                    <div className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-emerald-500 shadow-md dark:border-[#0b1220]">
                      <Check
                        size={12}
                        strokeWidth={3}
                        className="text-white"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-black tracking-tight text-stone-950 transition-colors duration-300 dark:text-white sm:text-[22px]">
                        Profile
                      </h2>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                        Active
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                      Keep your account information up to date.
                    </p>
                  </div>
                </div>

                {/* Security badge */}

                <div className="flex w-full items-center justify-between rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-[0_12px_35px_rgba(0,0,0,0.22)] sm:w-auto sm:justify-start">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-orange-100 bg-orange-50 dark:border-orange-400/15 dark:bg-orange-400/10">
                      <ShieldCheck
                        size={17}
                        strokeWidth={2}
                        className="text-orange-500 dark:text-orange-300"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500">
                        Account
                      </p>

                      <p className="mt-0.5 text-xs font-bold text-stone-700 dark:text-slate-300">
                        Secure profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSave}
                className="mt-7"
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <ProfileField
                    id="display-name"
                    label="Display name"
                    value={name}
                    onChange={setName}
                    placeholder="Enter your name"
                    type="text"
                    icon={
                      <UserRound
                        size={17}
                        strokeWidth={1.8}
                      />
                    }
                    autoComplete="name"
                  />

                  <ProfileField
                    id="email"
                    label="Email address"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    type="email"
                    icon={
                      <Mail
                        size={17}
                        strokeWidth={1.8}
                      />
                    }
                    autoComplete="email"
                  />
                </div>

                {/* Error */}

                {error ? (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3.5 text-sm text-red-700 transition-colors duration-300 dark:border-red-400/15 dark:bg-red-400/[0.08] dark:text-red-300">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500 dark:bg-red-400" />

                    <p className="leading-5">
                      {error}
                    </p>
                  </div>
                ) : null}

                {/* Save row */}

                <div className="mt-7 flex flex-col gap-3 border-t border-stone-200/70 pt-6 transition-colors duration-300 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {saved ? (
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-400/10">
                          <Check
                            size={13}
                            strokeWidth={2.8}
                          />
                        </span>

                        Changes saved successfully
                      </div>
                    ) : (
                      <p className="text-xs leading-5 text-stone-400 dark:text-slate-500">
                        Your profile details are saved securely to your account.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="group relative inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-stone-950 px-6 text-sm font-extrabold text-white shadow-[0_16px_35px_rgba(15,23,42,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(249,115,22,0.18)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:shadow-[0_16px_35px_rgba(0,0,0,0.28)] dark:hover:bg-slate-100 sm:w-auto"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/60 via-transparent to-cyan-400/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-orange-500/35 dark:to-cyan-400/25" />

                    <span className="pointer-events-none absolute inset-y-0 left-0 w-20 -translate-x-full skew-x-[-18deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[430%]" />

                    <span className="relative z-10 flex items-center gap-2">
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/25 dark:border-t-slate-950" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check
                            size={16}
                            strokeWidth={2.5}
                          />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save
                            size={16}
                            strokeWidth={2}
                          />
                          Save changes
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* ===================================================
              SECURITY / SESSION
          ==================================================== */}

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.15fr]">
            {/* Security */}

            <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/[0.72] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-[0_20px_65px_rgba(0,0,0,0.24)] sm:p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent dark:via-violet-400/15" />

              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-violet-100 bg-violet-50 dark:border-violet-400/15 dark:bg-violet-400/10">
                  <KeyRound
                    size={19}
                    strokeWidth={1.8}
                    className="text-violet-600 dark:text-violet-300"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-stone-950 dark:text-white">
                      Account security
                    </h3>

                    <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
                      Protected
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm leading-6 text-stone-500 dark:text-slate-400">
                    Your account is protected by the authentication system.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <SecurityItem
                  icon={
                    <ShieldCheck size={16} />
                  }
                  title="Authenticated session"
                  description="Your current session is active."
                  status="Active"
                />

                <SecurityItem
                  icon={<Mail size={16} />}
                  title="Email account"
                  description={
                    email ||
                    "No email address provided."
                  }
                  status={
                    email ? "Set" : "Missing"
                  }
                />
              </div>
            </div>

            {/* Session */}

            <div className="relative overflow-hidden rounded-[26px] border border-black/[0.06] bg-stone-950 p-5 text-white shadow-[0_20px_65px_rgba(0,0,0,0.14)] transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#0b1220] dark:shadow-[0_25px_75px_rgba(0,0,0,0.4)] sm:p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent dark:via-orange-400/25" />

              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-[90px] dark:bg-orange-500/[0.12]" />

              <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-[100px] dark:bg-cyan-400/[0.07]" />

              <div className="relative">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl dark:bg-white/[0.05]">
                      <ShieldCheck
                        size={20}
                        strokeWidth={1.8}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                        Current session
                      </p>

                      <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                        You’re securely signed in
                      </h3>

                      <p className="mt-1.5 max-w-md text-sm leading-6 text-white/55">
                        End this session whenever you need to sign out from the
                        admin workspace.
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] sm:grid">
                    <ChevronRight
                      size={17}
                      className="text-white/40"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-white/45">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    Session active
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-sm font-bold text-red-300 transition-all duration-300 hover:border-red-400/30 hover:bg-red-500/15 hover:text-red-200 sm:w-auto"
                  >
                    <LogOut
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-x-0.5"
                    />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              FOOT NOTE
          ==================================================== */}

          <div className="flex flex-col gap-2 px-1 pb-5 pt-5 text-xs text-stone-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Profile settings</p>

            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Secured admin workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE FIELD
========================================================= */

function ProfileField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  autoComplete,
}) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-2.5 block pl-1 text-[10px] font-black uppercase tracking-[0.15em] text-stone-500 dark:text-slate-400"
      >
        {label}
      </label>

      <div className="relative flex min-h-[60px] items-center rounded-2xl border border-stone-200/80 bg-stone-50/80 px-2 transition-all duration-300 focus-within:border-orange-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.06),0_15px_35px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.035] dark:focus-within:border-orange-400/30 dark:focus-within:bg-white/[0.05] dark:focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.05),0_15px_35px_rgba(0,0,0,0.2)]">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white bg-white text-stone-400 shadow-sm transition-colors duration-300 group-focus-within:text-orange-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-500 dark:group-focus-within:text-orange-300">
          {icon}
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400 dark:text-slate-200 dark:placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}

/* =========================================================
   SECURITY ITEM
========================================================= */

function SecurityItem({
  icon,
  title,
  description,
  status,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/70 bg-stone-50/70 px-4 py-3.5 transition-colors duration-300 dark:border-white/[0.06] dark:bg-white/[0.025]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white bg-white text-stone-500 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-stone-800 dark:text-slate-200">
            {title}
          </p>

          <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${
          status === "Missing"
            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300"
        }`}
      >
        {status}
      </span>
    </div>
  );
}