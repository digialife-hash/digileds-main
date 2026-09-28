import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "./PageHero";
import Button from "../ui/Button";
const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

const extraServices = [
  {
    title: "Landing Page",
    price: "₹3,999",
    text: "Single-page high-converting landing page.",
  },
  {
    title: "E-Commerce Website",
    price: "₹24,999",
    text: "Online store with products, cart and checkout.",
  },
  {
    title: "Web Application",
    price: "₹39,999",
    text: "Custom web application according to your requirements.",
  },
  {
    title: "Android / iOS App",
    price: "₹49,999",
    text: "Custom mobile application development.",
  },
  {
    title: "UI/UX Design",
    price: "₹7,999",
    text: "Professional interface and user experience design.",
  },
  {
    title: "Digital Marketing",
    price: "₹9,999/mo",
    text: "Social media, SEO and digital marketing services.",
  },
];

const BILLING_COPY = {
  monthly: {
    eyebrow: "Monthly Plans",
    title: "Start small, pay month to month.",
    description:
      "Low upfront cost — your website, hosting and support are billed every month. Pause or cancel anytime.",
    suffix: "/ month",
    note: "These are monthly starting prices. You can switch to a one-time permanent plan anytime — cost adjusts based on pages, features, integrations and project complexity.",
  },
  permanent: {
    eyebrow: "Permanent Plans",
    title: "Pay once, own it forever.",
    description:
      "A single one-time payment — no recurring bills. The website is yours to keep, permanently.",
    suffix: "one-time",
    note: "These are one-time starting prices. Final cost depends on pages, features, integrations, content and project complexity.",
  },
};

/* =========================================================
   BILLING TOGGLE
========================================================= */

function BillingToggle({ billing, setBilling }) {
  return (
    <div className="mx-auto mt-6 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
      <button
        type="button"
        onClick={() => setBilling("monthly")}
        className={`rounded-full px-5 py-2 text-xs font-bold transition ${
          billing === "monthly"
            ? "bg-[#0C2C50] text-white shadow-sm dark:bg-[#2E9E6D]"
            : "text-slate-500 hover:text-[#0C2C50] dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        Monthly
      </button>

      <button
        type="button"
        onClick={() => setBilling("permanent")}
        className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition ${
          billing === "permanent"
            ? "bg-[#2E9E6D] text-white shadow-sm"
            : "text-slate-500 hover:text-[#2E9E6D] dark:text-slate-400"
        }`}
      >
        Permanent
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
            billing === "permanent"
              ? "bg-white/20 text-white"
              : "bg-[#eaf7f1] text-[#2E9E6D] dark:bg-emerald-500/10 dark:text-emerald-400"
          }`}
        >
          One-time
        </span>
      </button>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Subcription() {
  const [billing, setBilling] = useState("monthly");
  const [livePlans, setLivePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [request, setRequest] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const copy = BILLING_COPY[billing];

  useEffect(() => {
    fetch(`${SITE_API}/api/subscriptions/plans`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success)
          throw new Error(result.message || "Plans unavailable");
        setLivePlans(result.data);
      })
      .catch((error) =>
        console.error("Subscription plans could not be loaded:", error),
      );
  }, []);

  const displayedPlans = livePlans.map((plan) => ({
    ...plan,
    desc: plan.description || "Plan details will be shared after your request.",
    price: plan.price || {
      monthly: `₹${Number(plan.monthlyPrice || 0).toLocaleString("en-IN")}`,
      permanent: `₹${Number(plan.permanentPrice || 0).toLocaleString("en-IN")}`,
    },
    points: plan.points || plan.features || [],
  }));

  async function submitRequest(event) {
    event.preventDefault();
    setSending(true);
    setRequestMessage("");
    try {
      const response = await fetch(`${SITE_API}/api/subscriptions/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billing,
          customerName: request.name,
          customerEmail: request.email,
          customerPhone: request.phone,
          message: request.message,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Request could not be sent.");
      setRequestMessage(
        "Request sent successfully. Our team will call you within 10 minutes.",
      );
      setRequest({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setRequestMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="overflow-hidden bg-white text-slate-700 dark:bg-[#020817] dark:text-slate-300">
      <PageHero
        eyebrow="Simple & transparent pricing"
        title="Choose the right solution for your business."
        description="Clear starting prices for websites, apps, design and digital marketing. Final pricing depends on your exact requirements."
        action="Get a Custom Quote"
      />

      {/* =====================================================
          MAIN PLANS
      ====================================================== */}

      <section className="bg-[#f7faf9] px-6 py-20 dark:bg-[#07141A] sm:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">

            <h2 className="mt-4 !text-5xl font-black text-[#0C2C50] dark:text-white sm:text-4xl">
              {copy.title}
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              {copy.description}
            </p>

            <BillingToggle billing={billing} setBilling={setBilling} />
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {displayedPlans.length > 0 ? (
              displayedPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative rounded-3xl border bg-white p-7 transition duration-300 hover:-translate-y-1 dark:bg-slate-900 ${
                    plan.popular
                      ? "border-[#2E9E6D] shadow-[0_20px_60px_rgba(46,158,109,.12)] dark:shadow-[0_20px_60px_rgba(46,158,109,.16)]"
                      : "border-slate-200 shadow-sm dark:border-slate-800 dark:shadow-black/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2E9E6D] px-4 py-1.5 text-xs font-bold text-white">
                      MOST POPULAR
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-[#0C2C50] dark:text-white">
                    {plan.name}
                  </h3>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {plan.desc}
                  </p>

                  <div className="mt-7">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Starting from
                    </span>

                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-4xl font-black text-[#2E9E6D]">
                        {plan.price[billing]}
                      </span>

                      <span className="mb-1 text-sm text-slate-400 dark:text-slate-500">
                        {copy.suffix}
                      </span>
                    </div>
                  </div>

                  <div className="my-7 h-px bg-slate-100 dark:bg-slate-800" />

                  <p className="text-sm font-bold text-[#0C2C50] dark:text-white">
                    What's included
                  </p>

                  <ul className="mt-5 space-y-3">
                    {plan.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                      >
                        <span className="font-bold text-[#2E9E6D]">✓</span>

                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setRequestMessage("");
                    }}
                    variant="unstyled"
                    className={`mt-8 rounded-xl px-5 py-3.5 text-center text-sm font-bold transition ${
                      plan.popular
                        ? "bg-[#2E9E6D] text-white hover:bg-[#27895f]"
                        : "bg-[#0C2C50] text-white hover:bg-[#2E9E6D] dark:bg-slate-800 dark:hover:bg-[#2E9E6D]"
                    }`}
                  >
                    Choose {plan.name}
                    {billing === "monthly" ? " · Monthly" : " · Permanent"}
                  </Button>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900 lg:col-span-3">
                <h3 className="text-xl font-black text-[#0C2C50] dark:text-white">
                  Plans coming soon
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Our team is preparing subscription plans. Please check back
                  soon or request a custom quote.
                </p>
                <Button
                  as={Link}
                  to="/quote"
                  variant="dark"
                  className="mt-5 rounded-xl px-5 py-3 text-sm font-bold"
                >
                  Request a Custom Quote
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedPlan && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <form
            onSubmit={submitRequest}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <h2 className="text-2xl font-black text-[#0C2C50] dark:text-white">
              Request {selectedPlan.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {billing === "monthly" ? "Monthly" : "Permanent"} plan selected.
              Admin approval ke baad subscription activate hogi.
            </p>
            <div className="mt-5 grid gap-3">
              {Object.entries({
                name: "Your name",
                email: "Email address",
                phone: "Phone number",
              }).map(([key, label]) => (
                <input
                  key={key}
                  required
                  value={request[key]}
                  onChange={(event) =>
                    setRequest({ ...request, [key]: event.target.value })
                  }
                  placeholder={label}
                  type={
                    key === "email" ? "email" : key === "phone" ? "tel" : "text"
                  }
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
                />
              ))}
              <textarea
                value={request.message}
                onChange={(event) =>
                  setRequest({ ...request, message: event.target.value })
                }
                placeholder="Any requirement or preferred call time (optional)"
                rows={3}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
              />
              {requestMessage && (
                <p className="text-sm text-emerald-600">{requestMessage}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="h-11 flex-1 rounded-xl border text-sm font-bold"
                >
                  Close
                </button>
                <button
                  disabled={sending}
                  className="h-11 flex-1 rounded-xl bg-emerald-600 text-sm font-bold text-white disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          OTHER SERVICES
      ====================================================== */}

      <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">

            <h2 className="mt-4 !text-4xl font-black text-[#0C2C50] dark:text-white sm:text-4xl">
              Need something specific?
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              Select the service you need and get a clear starting price. These
              are one-time project prices, regardless of the billing option
              chosen above.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {extraServices.map((service) => (
              <article
                key={service.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#2E9E6D]/30 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:shadow-black/25"
              >
                <h3 className="text-lg font-bold text-[#0C2C50] dark:text-white">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {service.text}
                </p>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Starting from
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#2E9E6D]">
                      {service.price}
                    </p>
                  </div>

                  <Button
                    as={Link}
                    to="/quote"
                    variant="dark"
                    className="rounded-lg px-4 py-2 text-xs font-bold group-hover:bg-[#2E9E6D]"
                  >
                    Enquire
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTE
      ====================================================== */}

      <section className="bg-white px-6 pb-20 dark:bg-[#020817] sm:px-10 lg:pb-24">
        <div className="mx-auto max-w-7xl rounded-2xl border border-transparent bg-[#f7faf9] px-6 py-8 text-center dark:border-slate-800 dark:bg-[#07141A] sm:px-10">
          <h3 className="font-bold text-4xl text-[#0C2C50] dark:text-white">
             Pricing note
          </h3>

          <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {copy.note}
          </p>

          <Button
            as={Link}
            to="/quote"
            variant="dark"
            className="mt-5 rounded-xl px-6 py-3 text-sm font-bold dark:bg-[#2E9E6D] dark:hover:bg-[#27895f]"
          >
            Get Exact Project Price
          </Button>
        </div>
      </section>
    </main>
  );
}
