import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import AuthShell from "./AuthShell.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { forgotPassword } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <span className="rounded-full border border-stone-300 px-3 py-2 text-xs uppercase tracking-widest text-stone-500">
        Reset password
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">
        You'll be back in no time.
      </h1>
      <p className="mt-2 text-stone-500">
        Enter your email and we'll send a reset link.
      </p>
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
        {message && (
          <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={submitting}
          className="rounded-xl bg-stone-900 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send reset link →"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link className="font-semibold text-orange-600" to="/social-post/login">
          ← Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
