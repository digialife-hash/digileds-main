import { useState } from "react";
import Button from "../ui/Button";

export default function ContactForm({ compact = false }) {
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const apiUrl = import.meta.env.VITE_SITE_API_URL || "";
  if (sent)
    return (
      <div className="rounded-2xl bg-[#eaf7f1] p-7 text-[#0C2C50]">
        <h2 className="text-xl font-bold">Thank you!</h2>
        <p className="mt-2">
          Your enquiry has been received. Our team will get back to you shortly.
        </p>
      </div>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
          const response = await fetch(`${apiUrl}/api/contact-enquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const result = await response.json();
          if (!response.ok || !result.success)
            throw new Error(
              result.message || "Your enquiry could not be sent.",
            );
          setSent(true);
        } catch (submitError) {
          setError(submitError.message);
        } finally {
          setSaving(false);
        }
      }}
      className="rounded-2xl bg-white p-6 shadow-lg sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Name
          <input
            required
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-[#2E9E6D]"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Phone
          <input
            required
            type="tel"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-[#2E9E6D]"
            placeholder="Your phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-700">
        Email
        <input
          required
          type="email"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-[#2E9E6D]"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      {!compact && (
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Service needed
          <select
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 outline-none focus:border-[#2E9E6D]"
          >
            <option>Choose a service</option>
            <option>Web Development</option>
            <option>Mobile App Development</option>
            <option>Digital Marketing</option>
            <option>Custom Software</option>
          </select>
        </label>
      )}
      <label className="mt-4 block text-sm font-medium text-slate-700">
        Tell us about your project
        <textarea
          required
          rows="4"
          className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-[#2E9E6D]"
          placeholder="A brief description..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        disabled={saving}
        className="mt-6 rounded-xl px-6 py-3 font-semibold disabled:opacity-60"
      >
        {saving ? "Sending..." : "Send enquiry"}
      </Button>
    </form>
  );
}
