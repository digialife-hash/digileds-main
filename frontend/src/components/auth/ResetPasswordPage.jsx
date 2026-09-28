import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_SITE_API_URL || "";

function getPasswordStrength(password) {
  if (!password) {
    return {
      label: "Enter a password",
      score: 0,
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      label: "Weak password",
      score,
    };
  }

  if (score <= 4) {
    return {
      label: "Good password",
      score,
    };
  }

  return {
    label: "Strong password",
    score,
  };
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  setVisible,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-slate-400">
          <LockKeyhole size={17} />
        </div>

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={8}
          required
          autoComplete={
            label === "New password" ? "new-password" : "new-password"
          }
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-12 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-slate-800"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [state, setState] = useState({
    busy: false,
    error: "",
    message: "",
  });

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function submit(event) {
    event.preventDefault();

    if (!token) {
      setState({
        busy: false,
        error: "This password reset link is invalid or incomplete.",
        message: "",
      });
      return;
    }

    if (password.length < 8) {
      setState({
        busy: false,
        error: "Password must be at least 8 characters long.",
        message: "",
      });
      return;
    }

    if (password !== confirmPassword) {
      setState({
        busy: false,
        error: "Passwords do not match.",
        message: "",
      });
      return;
    }

    setState({
      busy: true,
      error: "",
      message: "",
    });

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
        },
      );

      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setState({
        busy: false,
        error: "",
        message: data.message || "Password updated successfully.",
      });

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setState({
        busy: false,
        error: error?.message || "Something went wrong. Please try again.",
        message: "",
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
        <section className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[0.8fr_1.2fr]">
          {/* =================================================
              LEFT PANEL
          ================================================= */}

          <aside className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-black">Admin Security</p>

                  <p className="text-[10px] text-white/45">Account recovery</p>
                </div>
              </div>
            </div>

            <div className="relative py-10">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[30px] border border-white/10 bg-white/5 shadow-2xl">
                <KeyRound
                  size={52}
                  strokeWidth={1.5}
                  className="text-white/90"
                />
              </div>

              <div className="mt-7">
                <h2 className="text-3xl font-black tracking-tight">
                  Secure your
                  <br />
                  account.
                </h2>

                <p className="mt-3 max-w-xs text-sm leading-6 text-white/50">
                  Choose a strong password that you do not use anywhere else.
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-2 text-[10px] font-semibold text-white/40">
              <ShieldCheck size={13} />
              Protected password recovery
            </div>
          </aside>

          {/* =================================================
              FORM
          ================================================= */}

          <div className="flex items-center">
            <div className="mx-auto w-full max-w-md px-5 py-8 sm:px-10 sm:py-10">
              {/* mobile brand */}
              <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <ShieldCheck size={16} />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    Admin Security
                  </p>

                  <p className="text-[9px] text-slate-400">Account recovery</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                  Account Recovery
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Set new password
                </h1>

                <p className="mt-2.5 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Create a new password to regain secure access to your account.
                </p>
              </div>

              {!token && (
                <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-500/20 dark:bg-red-500/10">
                  <X size={16} className="mt-0.5 shrink-0 text-red-500" />

                  <p className="text-xs font-semibold leading-5 text-red-700 dark:text-red-400">
                    This reset link is invalid or the token is missing. Please
                    request a new password reset link.
                  </p>
                </div>
              )}

              <form onSubmit={submit} className="mt-7 space-y-4">
                <PasswordField
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  visible={showPassword}
                  setVisible={setShowPassword}
                  placeholder="Enter new password"
                />

                {/* password strength */}
                {password && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        Password strength
                      </span>

                      <span
                        className={`text-[10px] font-extrabold ${
                          strength.score >= 5
                            ? "text-emerald-600 dark:text-emerald-400"
                            : strength.score >= 3
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-500"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div
                          key={item}
                          className={`h-1.5 rounded-full ${
                            item <= strength.score
                              ? strength.score >= 5
                                ? "bg-emerald-500"
                                : strength.score >= 3
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <PasswordField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  visible={showConfirm}
                  setVisible={setShowConfirm}
                  placeholder="Re-enter your password"
                />

                {/* match */}
                {confirmPassword && (
                  <div
                    className={`flex items-center gap-2 text-[11px] font-bold ${
                      mismatch
                        ? "text-red-500"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {mismatch ? (
                      <>
                        <X size={13} />
                        Passwords do not match
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        Passwords match
                      </>
                    )}
                  </div>
                )}

                {/* messages */}
                {state.error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {state.error}
                  </div>
                )}

                {state.message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-semibold leading-5 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {state.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    state.busy ||
                    !token ||
                    password.length < 8 ||
                    password !== confirmPassword
                  }
                  className="group flex h-12 w-full items-center justify-between rounded-xl bg-slate-950 px-4.5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <span>
                    {state.busy ? "Updating password..." : "Update password"}
                  </span>

                  {state.busy ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950" />
                  ) : (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center dark:border-slate-900">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  Back to login
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
