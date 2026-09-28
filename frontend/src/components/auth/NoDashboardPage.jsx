import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function NoDashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-black">Account active</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Your user account is active, but no dashboard has been assigned to it.
          Please contact an administrator if you need access.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
