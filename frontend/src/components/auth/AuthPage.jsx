import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const heroImage = "/uploads/login.png";

function formatLockoutMessage(lockedUntil) {
  const lockoutDate = new Date(lockedUntil);
  if (Number.isNaN(lockoutDate.getTime())) {
    return "Too many incorrect login attempts. Please try again later.";
  }

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(lockoutDate);
  const remainingMinutes = Math.max(
    1,
    Math.ceil((lockoutDate.getTime() - Date.now()) / 60000),
  );

  return `Too many incorrect login attempts. For security, login is temporarily locked. Please try again at ${formattedDate} (about ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"} from now).`;
}

/* =========================================================
   INPUT
========================================================= */
const inputClass =
  "h-12.5 w-full rounded-xl border border-slate-200 bg-white " +
  "px-4 text-sm text-slate-800 outline-none transition-all duration-200 " +
  "placeholder:text-slate-400 hover:border-violet-200 " +
  "focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

function Input({ icon, type = "text", value, onChange, ...props }) {
  return (
    <label className="group relative block">
      <span
        className="
          pointer-events-none absolute
          left-3.5 top-1/2 z-10
          -translate-y-1/2
          text-slate-400
          transition-colors
          group-focus-within:text-violet-600
        "
      >
        {icon}
      </span>

      <input
        {...props}
        type={type}
        value={value}
        onChange={onChange}
        className={`${inputClass} pl-11`}
      />
    </label>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */
function PasswordInput({
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="relative">
      <Input
        icon={<LockKeyhole size={18} />}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={8}
        required
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle password visibility"
        className="
          absolute right-3.5 top-1/2
          -translate-y-1/2
          text-slate-400
          transition-all
          hover:scale-110
          hover:text-violet-600
        "
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

/* =========================================================
   AUTH PAGE
========================================================= */
export default function AuthPage({ mode = "login" }) {
  const location = useLocation();

  const isForgot = mode === "forgot";
  const isSignup = mode === "signup";
  const isOffice = mode === "office";
  const requestedPath = location.state?.from;
  const defaultDashboard = isOffice
    ? "/office-management/dashboard"
    : "/admin/dashboard#demos";
  const redirectPath =
    requestedPath === "/admin/dashboard" ? requestedPath : defaultDashboard;

  const [form, setForm] = useState({
    name: "",
    email: "",
    login: "",
    password: "",
    otp: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [passkeyRequired, setPasskeyRequired] = useState(false);
  const [passkeyOptions, setPasskeyOptions] = useState(null);

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));

    setError("");
    setMessage("");
  };

  async function usePasskey() {
    setError("");
    setBusy(true);
    try {
      const authBasePath = "/api/auth";
      const response = await fetch(`${authBasePath}/passkey/verify`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          await startAuthentication({ optionsJSON: passkeyOptions }),
        ),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Passkey verification failed.");
      }
      window.location.assign(redirectPath);
    } catch (requestError) {
      if (requestError.name !== "NotAllowedError") {
        setError(requestError.message || "Passkey verification failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  /* =======================================================
     SUBMIT
  ======================================================== */
  async function submit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (isSignup && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    const authBasePath = isOffice
      ? "/api/office-management/auth"
      : "/api/auth";
    const endpoint = isSignup
      ? `${authBasePath}/register`
      : isForgot
      ? `${authBasePath}/forgot-password`
      : mfaRequired
        ? `${authBasePath}/login/super-admin/verify-2fa`
        : `${authBasePath}/login`;

    const body = isSignup
      ? {
          name: form.name,
          email: form.email,
          password: form.password,
        }
      : isForgot
      ? { email: form.email }
      : mfaRequired
        ? { email: form.login, otp: form.otp }
      : {
          ...(isOffice ? { email: form.login } : { login: form.login }),
          password: form.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 429 && data.lockedUntil) {
          throw new Error(formatLockoutMessage(data.lockedUntil));
        }
        throw new Error(data.message || "Request failed.");
      }

      if (isSignup) {
        window.location.assign("/login");
      } else if (isForgot) {
        setMessage(
          data.message || "Password reset link has been sent to your email.",
        );
      } else if (data.passkeyRequired) {
        setPasskeyRequired(true);
        setPasskeyOptions(data.passkeyOptions);
        setMfaRequired(Boolean(data.mfaRequired));
        setMessage("Password accepted. Use your passkey to continue.");
      } else if (data.data?.requiresTwoFactor) {
        setMfaRequired(true);
        setMessage(
          data.message || "Enter the six-digit code from your authenticator app.",
        );
      } else {
        const authenticatedUser = data.data?.user || data.user;
        const accessToken = data.data?.token || data.token;
        const dashboardPermissions = authenticatedUser?.permissions || {};
        const hasSocialDashboard =
          authenticatedUser?.role === "super_admin" ||
          dashboardPermissions.socialDashboard?.view === true;
        const hasAdminDashboard =
          authenticatedUser?.role === "super_admin" ||
          dashboardPermissions.adminDashboard?.view === true;
        const hasOfficeDashboard =
          authenticatedUser?.role === "super_admin" ||
          dashboardPermissions.officeDashboard?.view === true;
        const loginRedirect = isOffice
          ? hasOfficeDashboard
            ? "/office-management/dashboard"
            : "/office-management/unauthorized"
          : authenticatedUser?.role === "user" ||
              (!hasAdminDashboard && !hasSocialDashboard && !hasOfficeDashboard)
            ? "/"
            : hasAdminDashboard || hasSocialDashboard || !hasOfficeDashboard
              ? redirectPath
              : "/admin/dashboard#office-dashboard";
        if (authenticatedUser) {
          const storedUser = accessToken
            ? { ...authenticatedUser, token: accessToken }
            : authenticatedUser;
          localStorage.setItem(
            isOffice ? "office_user" : "demo_admin_user",
            JSON.stringify(storedUser),
          );
          // Both dashboard shells use the same shared authentication now.
          localStorage.setItem("office_user", JSON.stringify(storedUser));
        }

        window.location.assign(loginRedirect);
      }

    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  /* =======================================================
     TEXT
  ======================================================== */
  const title = isSignup ? "Create your account" : isForgot ? "Reset your password" : "Welcome back!";

  const subtitle = isSignup
    ? "Create a user account. User accounts do not receive dashboard access."
    : isForgot
    ? "Enter your email and we will send you a secure reset link."
    : isOffice
      ? "Sign in to access your Office Management workspace."
      : "Admin login only. Sign in to access the dashboard.";

  const badge = isSignup
    ? "USER SIGN UP"
    : isForgot
    ? "ACCOUNT RECOVERY"
    : isOffice
      ? "OFFICE MANAGEMENT"
      : "ADMIN ACCESS";

  return (
    <main
      className="
        relative
        h-screen
        w-full
        overflow-hidden
        bg-slate-950
      "
    >
      <style>{`
        /* =====================================================
           BACKGROUND IMAGE ANIMATION
        ====================================================== */

        @keyframes authImageZoom {
          0% {
            transform: scale(1);
          }

          100% {
            transform: scale(1.09);
          }
        }

        @keyframes authCardIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes glowMove {
          0%, 100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(20px, -15px);
          }
        }

        .auth-bg-image {
          animation:
            authImageZoom
            18s
            ease-out
            forwards;
        }

        .auth-card-animation {
          animation:
            authCardIn
            0.55s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .auth-glow {
          animation:
            glowMove
            8s
            ease-in-out
            infinite;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}
      <img
        src={heroImage}
        alt="Digital Alife"
        className="
          auth-bg-image
          absolute inset-0
          h-full w-full
          object-cover
          object-center
        "
      />

      {/* =====================================================
          IMAGE EFFECTS
      ====================================================== */}

      {/* Blur effect */}
      <div
        className="
          absolute inset-0
          scale-105
          bg-black/5
          backdrop-blur-[2px]
        "
      />

      {/* Overall dark overlay */}
      <div
        className="
          absolute inset-0
          bg-slate-950/25
        "
      />

      {/* Left side dark gradient */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-r
          from-slate-950/70
          via-slate-950/30
          to-transparent
        "
      />

      {/* Bottom cinematic gradient */}
      <div
        className="
          absolute inset-x-0 bottom-0 h-2/5
          bg-gradient-to-t
          from-slate-950/45
          to-transparent
        "
      />

      {/* =====================================================
          DECORATIVE GLOW
      ====================================================== */}
      <div
        className="
          auth-glow
          pointer-events-none
          absolute
          -left-20
          top-1/4
          h-64
          w-64
          rounded-full
          bg-violet-500/20
          blur-[90px]
        "
      />

      <div
        className="
          auth-glow
          pointer-events-none
          absolute
          bottom-0
          right-1/4
          h-56
          w-56
          rounded-full
          bg-fuchsia-500/15
          blur-[90px]
        "
      />

      {/* =====================================================
          MAIN
      ====================================================== */}
      <div
        className="
          relative z-10
          flex h-full
          items-center
          justify-center
          px-3 py-3

          sm:px-6
          sm:py-5

          lg:justify-start
          lg:px-8
          xl:px-14
          2xl:px-20
        "
      >
        {/* ===================================================
            AUTH WHITE BOX
        ==================================================== */}
        <div
          className="
            auth-card-animation

            w-full
            max-w-[510px]

            rounded-[1.6rem]
            border border-white/70

            bg-white/95

            px-5
            py-5

            shadow-[0_25px_80px_rgba(0,0,0,0.28)]

            backdrop-blur-xl

            sm:rounded-[2rem]
            sm:px-7
            sm:py-7

            md:px-8
            md:py-8

            lg:max-w-[520px]

            max-h-[calc(100vh-24px)]

            overflow-hidden
          "
        >
          {/* =================================================
              HEADER
          ================================================== */}
          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >
            <Link
              to="/"
              className="
                flex
                items-center
                gap-2.5
                text-base
                font-black
                text-slate-900

                sm:text-lg
              "
            >
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  bg-gradient-to-br
                  from-pink-400
                  via-fuchsia-500
                  to-violet-600

                  text-xs
                  font-black
                  text-white

                  shadow-lg
                  shadow-violet-500/20
                "
              >
                DA
              </span>

              <span>Digital Alife</span>
            </Link>

            <Link
              to="/"
              className="
                text-xs
                font-semibold
                text-slate-400
                transition
                hover:text-violet-600
              "
            >
              Home
            </Link>
          </div>

          {/* =================================================
              HEADING
          ================================================== */}
          <div className="mb-5">
            <p
              className="
                text-[10px]
                font-black
                tracking-[0.22em]
                text-violet-600

                sm:text-[11px]
              "
            >
              {badge}
            </p>

            <h1
              className="
                mt-1.5
                text-2xl
                font-black
                tracking-tight
                text-slate-900

                sm:text-3xl
              "
            >
              {title}
            </h1>

            <p
              className="
                mt-2
                max-w-md
                text-xs
                leading-5
                text-slate-500

                sm:text-sm
                sm:leading-5
              "
            >
              {subtitle}
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================== */}
          <form onSubmit={submit} className="space-y-3">
            {/* FORGOT */}
            {isSignup && (
              <>
                <Input
                  icon={<UserRound size={18} />}
                  placeholder="Full name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={update("name")}
                />
                <Input
                  icon={<Mail size={18} />}
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                />
                <PasswordInput
                  value={form.password}
                  onChange={update("password")}
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  placeholder="Password (8+ characters)"
                  autoComplete="new-password"
                />
                <PasswordInput
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((value) => !value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </>
            )}

            {isForgot && (
              <Input
                icon={<Mail size={18} />}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                required
                value={form.email}
                onChange={update("email")}
              />
            )}

            {/* LOGIN */}
            {!isForgot && !isSignup && !mfaRequired && !passkeyRequired && (
              <Input
                icon={<UserRound size={18} />}
                placeholder="Username or email"
                autoComplete="username"
                required
                value={form.login}
                onChange={update("login")}
              />
            )}

            {/* PASSWORD */}
            {!isForgot && !isSignup && !mfaRequired && !passkeyRequired && (
              <>
                <PasswordInput
                  value={form.password}
                  onChange={update("password")}
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  placeholder="Password (8+ characters)"
                  autoComplete={"current-password"}
                />
              </>
            )}

            {!isForgot && mfaRequired && !passkeyRequired && (
              <Input
                icon={<ShieldCheck size={18} />}
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="6-digit authenticator code"
                autoComplete="one-time-code"
                required
                value={form.otp}
                onChange={update("otp")}
              />
            )}

            {/* ERROR */}
            {error && (
              <div
                className="
                  rounded-xl
                  border border-red-200
                  bg-red-50
                  px-3.5
                  py-2.5
                  text-xs
                  leading-4
                  text-red-700
                "
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div
                className="
                  rounded-xl
                  border border-emerald-200
                  bg-emerald-50
                  px-3.5
                  py-2.5
                  text-xs
                  leading-4
                  text-emerald-700
                "
              >
                {message}
              </div>
            )}

            {/* =================================================
                SUBMIT BUTTON
            ================================================== */}
            {passkeyRequired && passkeyOptions && (
              <button
                type="button"
                disabled={busy}
                onClick={usePasskey}
                className="flex h-12.5 w-full items-center justify-center rounded-xl border border-violet-300 bg-violet-50 px-4 text-sm font-extrabold text-violet-700 disabled:opacity-60"
              >
                {busy ? "Waiting for passkey..." : "Use passkey"}
              </button>
            )}

            {passkeyRequired && mfaRequired && (
              <button
                type="button"
                onClick={() => {
                  setPasskeyRequired(false);
                  setMessage("Enter the code from your authenticator app.");
                }}
                className="w-full text-xs font-bold text-slate-500 hover:text-violet-600"
              >
                Use authenticator code instead
              </button>
            )}

            <button
              type="submit"
              disabled={busy}
              className="
                mt-1
                flex
                h-12.5
                w-full
                items-center
                justify-between

                rounded-xl

                bg-gradient-to-r
                from-pink-400
                via-fuchsia-500
                to-violet-600

                px-4

                text-sm
                font-extrabold
                text-white

                shadow-lg
                shadow-violet-500/20

                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:shadow-xl
                hover:shadow-violet-500/30

                active:translate-y-0

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <span>
                {busy
                  ? "Please wait..."
                  : isForgot
                    ? "Send reset link"
                    : isSignup
                      ? "Create account"
                    : passkeyRequired
                      ? "Verify passkey above"
                      : mfaRequired
                      ? "Verify code"
                      : "Login"}
              </span>

              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/15
                "
              >
                <ArrowRight size={17} />
              </span>
            </button>
          </form>

          {/* =================================================
              LINKS
          ================================================== */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              gap-3
              text-xs

              sm:text-sm
            "
          >
            {(isForgot || isSignup) && (
              <Link
                to="/login"
                className="
                  font-bold
                  text-violet-700
                  transition
                  hover:text-violet-900
                "
              >
                ← Back to login
              </Link>
            )}

            {mode === "login" && (
              <div className="flex items-center gap-4">
                <Link
                  to="/signup"
                  className="shrink-0 font-semibold text-slate-500 transition hover:text-violet-700"
                >
                  Create account
                </Link>
                <Link
                  to="/forgot-password"
                  className="shrink-0 font-semibold text-slate-500 transition hover:text-violet-700"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {/* =================================================
              SECURITY
          ================================================== */}
          {!isForgot && (
            <div
              className="
                mt-4
                flex
                items-start
                gap-2

                border-t
                border-slate-100

                pt-3

                text-[10px]
                leading-4
                text-slate-400

                sm:text-xs
              "
            >
              <ShieldCheck
                size={14}
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-500
                "
              />

              <span>
                Your account information is protected with secure encryption.
              </span>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================== */}
          <p
            className="
              mt-3
              text-center
              text-[9px]
              text-slate-400
            "
          >
            © {new Date().getFullYear()} Digital Alife. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center gap-3 text-[10px] text-slate-400">
            <Link to="/privacy-policy" className="hover:text-violet-600">Privacy</Link>
            <Link to="/cookie-policy" className="hover:text-violet-600">Cookies</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
