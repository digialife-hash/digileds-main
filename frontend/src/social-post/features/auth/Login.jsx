import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import AuthShell from "./AuthShell.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <span className="rounded-full border border-stone-300 px-3 py-2 text-xs uppercase tracking-widest text-stone-500">
        Welcome back
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">
        Good to see you.
      </h1>
      <p className="mt-2 text-stone-500">Log in to continue creating.</p>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold">
          Email address
          <input
            className="rounded-xl border border-stone-200 p-3 font-normal outline-none focus:border-stone-900"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Password
          <span className="relative">
            <input
              className="w-full rounded-xl border border-stone-200 p-3 pr-11 font-normal outline-none focus:border-stone-900"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Link
          className="text-right text-xs font-semibold text-orange-600"
          to="/social-post/forgot-password"
        >
          Forgot password?
        </Link>
        <button
          disabled={submitting}
          className="rounded-xl bg-stone-900 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in →"}
        </button>
      </form>
    </AuthShell>
  );
}
