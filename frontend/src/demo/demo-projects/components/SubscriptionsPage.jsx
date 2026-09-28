import { useEffect, useState } from "react";
import {
  Check,
  Edit3,
  Eye,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  CircleDollarSign,
  FileText,
  ListChecks,
  ArrowUpDown,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { SITE_API } from "../utils.js";

const EMPTY = {
  name: "",
  description: "",
  monthlyPrice: "",
  permanentPrice: "",
  features: "",
  popular: false,
  isActive: true,
  sortOrder: 0,
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);

  const [form, setForm] = useState(EMPTY);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState("");

  const [viewingPlan, setViewingPlan] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  /* =========================================================
     LOAD
  ========================================================= */

  async function load() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [plansResponse, ordersResponse] = await Promise.all([
        fetch(`${SITE_API}/api/subscriptions/plans/manage`, {
          credentials: "include",
        }),
        fetch(`${SITE_API}/api/subscriptions/orders`, {
          credentials: "include",
        }),
      ]);

      const plansResult = await plansResponse.json();

      const ordersResult = await ordersResponse.json();

      if (!plansResponse.ok || !plansResult.success) {
        throw new Error(plansResult.message || "Plans could not be loaded.");
      }

      if (!ordersResponse.ok || !ordersResult.success) {
        throw new Error(
          ordersResult.message || "Requests could not be loaded.",
        );
      }

      setPlans(plansResult.data || []);
      setOrders(ordersResult.data || []);
    } catch (loadError) {
      setError(
        loadError?.message || "Something went wrong while loading data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* =========================================================
     SAVE PLAN
  ========================================================= */

  async function savePlan(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${SITE_API}/api/subscriptions/plans${
          editingId ? `/${editingId}` : ""
        }`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Plan could not be saved.");
      }

      setPlans((current) => {
        const updated = editingId
          ? current.map((plan) => (plan.id === editingId ? result.data : plan))
          : [...current, result.data];

        return [...updated].sort(
          (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
        );
      });

      setForm(EMPTY);
      setEditingId("");

      setMessage(
        editingId
          ? "Subscription plan updated successfully."
          : "Subscription plan created successfully.",
      );
    } catch (saveError) {
      setError(saveError?.message || "Plan could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     EDIT PLAN
  ========================================================= */

  function editPlan(plan) {
    setEditingId(plan.id);

    setForm({
      ...plan,
      features: (plan.features || []).join("\n"),
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice ?? "",
      permanentPrice: plan.permanentPrice ?? "",
      sortOrder: plan.sortOrder ?? 0,
      popular: Boolean(plan.popular),
      isActive: plan.isActive !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     DELETE PLAN
  ========================================================= */

  async function deletePlan(id) {
    if (
      !window.confirm(
        "Delete this subscription plan? Existing requests will remain.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${SITE_API}/api/subscriptions/plans/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Plan could not be deleted.");
      }

      setPlans((current) => current.filter((plan) => plan.id !== id));

      setMessage("Subscription plan deleted successfully.");
    } catch (deleteError) {
      setError(deleteError?.message || "Plan could not be deleted.");
    }
  }

  /* =========================================================
     UPDATE ORDER
  ========================================================= */

  async function updateOrder(id, status) {
    try {
      const response = await fetch(
        `${SITE_API}/api/subscriptions/orders/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Request could not be updated.");
      }

      setOrders((current) =>
        current.map((order) => (order.id === id ? result.data : order)),
      );

      setMessage(`Request ${status} successfully.`);
    } catch (updateError) {
      setError(updateError?.message || "Request could not be updated.");
    }
  }

  /* =========================================================
     EDIT ORDER
  ========================================================= */

  function editOrder(order) {
    setEditingOrder({
      ...order,
      customerName: order.customerName || "",
      customerEmail: order.customerEmail || "",
      customerPhone: order.customerPhone || "",
      message: order.message || "",
    });
  }

  /* =========================================================
     SAVE ORDER
  ========================================================= */

  async function saveOrder(event) {
    event.preventDefault();

    if (!editingOrder?.id) {
      return;
    }

    try {
      const response = await fetch(
        `${SITE_API}/api/subscriptions/orders/${editingOrder.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editingOrder),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Request could not be updated.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === editingOrder.id ? result.data : order,
        ),
      );

      setEditingOrder(null);

      setMessage("Subscription request updated successfully.");
    } catch (updateError) {
      setError(updateError?.message || "Request could not be updated.");
    }
  }

  /* =========================================================
     DELETE ORDER
  ========================================================= */

  async function deleteOrder(id) {
    if (!window.confirm("Delete this subscription request?")) {
      return;
    }

    try {
      const response = await fetch(
        `${SITE_API}/api/subscriptions/orders/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Request could not be deleted.");
      }

      setOrders((current) => current.filter((order) => order.id !== id));

      setMessage("Subscription request deleted successfully.");
    } catch (deleteError) {
      setError(deleteError?.message || "Request could not be deleted.");
    }
  }

  /* =========================================================
     INPUT HELPERS
  ========================================================= */

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateOrderField(key, value) {
    setEditingOrder((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function statusClass(status) {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400";

      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400";
    }
  }

  return (
    <section className="space-y-6 pb-10">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Manage plans & requests
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Create subscription plans, manage public pricing, and review
            customer subscription requests from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="
            inline-flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-xs
            font-bold
            text-slate-700
            shadow-sm
            transition
            hover:border-emerald-300
            hover:text-emerald-600
            disabled:cursor-not-allowed
            disabled:opacity-50
            dark:border-slate-800
            dark:bg-slate-900
            dark:text-slate-300
            dark:hover:border-emerald-500/40
            sm:w-auto
          "
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Reload
        </button>
      </div>

      {/* =====================================================
          ALERT
      ===================================================== */}

      {(error || message) && (
        <div
          className={`
            flex
            items-start
            gap-3
            rounded-2xl
            border
            px-4
            py-3.5
            text-sm
            shadow-sm
            ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
            }
          `}
        >
          {error ? (
            <X size={17} className="mt-0.5 shrink-0" />
          ) : (
            <Check size={17} className="mt-0.5 shrink-0" />
          )}

          <span className="leading-6">{error || message}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
            }}
            className="ml-auto rounded-lg p-1 opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =====================================================
          PLAN FORM
      ===================================================== */}

      <form
        onSubmit={savePlan}
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* Form header */}
        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {editingId ? <Edit3 size={16} /> : <Plus size={17} />}
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingId
                    ? "Edit subscription plan"
                    : "Create subscription plan"}
                </h2>
              </div>

              <p className="mt-1 pl-11 text-xs text-slate-500 dark:text-slate-400">
                Fill in the details below. Every field is clearly labelled for
                easy management.
              </p>
            </div>

            {editingId && (
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                Editing existing plan
              </span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* Basic fields */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Plan Name */}
            <div>
              <label
                htmlFor="plan-name"
                className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Plan Name
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <div className="relative">
                <Sparkles
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="plan-name"
                  name="name"
                  required
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="e.g. Professional"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-3
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-4
                    focus:ring-emerald-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                    dark:focus:border-emerald-500
                  "
                />
              </div>
            </div>

            {/* Monthly */}
            <div>
              <label
                htmlFor="monthly-price"
                className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Monthly Price
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <div className="relative">
                <CircleDollarSign
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                  ₹
                </span>

                <input
                  id="monthly-price"
                  name="monthlyPrice"
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.monthlyPrice}
                  onChange={(event) =>
                    updateForm("monthlyPrice", event.target.value)
                  }
                  placeholder="999"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-14
                    pr-3
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-4
                    focus:ring-emerald-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                  "
                />
              </div>
            </div>

            {/* Permanent */}
            <div>
              <label
                htmlFor="permanent-price"
                className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Permanent Price
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <div className="relative">
                <CircleDollarSign
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                  ₹
                </span>

                <input
                  id="permanent-price"
                  name="permanentPrice"
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.permanentPrice}
                  onChange={(event) =>
                    updateForm("permanentPrice", event.target.value)
                  }
                  placeholder="9999"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-14
                    pr-3
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-4
                    focus:ring-emerald-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                  "
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label
                htmlFor="sort-order"
                className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Sort Order
              </label>

              <div className="relative">
                <ArrowUpDown
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="sort-order"
                  name="sortOrder"
                  min="0"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    updateForm("sortOrder", event.target.value)
                  }
                  placeholder="0"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                    focus:ring-4
                    focus:ring-emerald-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                  "
                />
              </div>

              <p className="mt-1.5 text-[11px] text-slate-400">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="plan-description"
              className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Plan Description
            </label>

            <div className="relative">
              <FileText
                size={15}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
              />

              <textarea
                id="plan-description"
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Write a short description of this subscription plan..."
                className="
                  min-h-[105px]
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  py-3
                  pl-10
                  pr-3
                  text-sm
                  leading-6
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-emerald-500
                  focus:ring-4
                  focus:ring-emerald-500/10
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                "
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label
              htmlFor="plan-features"
              className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Plan Features
            </label>

            <div className="relative">
              <ListChecks
                size={15}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
              />

              <textarea
                id="plan-features"
                rows={6}
                value={form.features}
                onChange={(event) => updateForm("features", event.target.value)}
                placeholder={`One feature per line\nUnlimited projects\nPriority support\nAdvanced analytics`}
                className="
                  min-h-[145px]
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  py-3
                  pl-10
                  pr-3
                  text-sm
                  leading-6
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-emerald-500
                  focus:ring-4
                  focus:ring-emerald-500/10
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                "
              />
            </div>

            <p className="mt-1.5 text-[11px] text-slate-400">
              Enter one feature on each new line.
            </p>
          </div>

          {/* Toggles */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Popular Plan
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  Highlight this plan publicly.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.popular}
                onChange={(event) =>
                  updateForm("popular", event.target.checked)
                }
                className="h-5 w-5 rounded accent-emerald-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Active Plan
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  Show this plan on the public page.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateForm("isActive", event.target.checked)
                }
                className="h-5 w-5 rounded accent-emerald-600"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : editingId ? (
                <Edit3 size={16} />
              ) : (
                <Plus size={16} />
              )}

              {saving ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId("");
                  setForm(EMPTY);
                }}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  text-sm
                  font-bold
                  text-slate-700
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* =====================================================
          PLANS
      ===================================================== */}

      <section>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Public subscription plans
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            These plans are displayed on your public Subscription page.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : plans.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-lg
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Sparkles size={9} />
                    Popular
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate pr-16 text-lg font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(plan.monthlyPrice || 0).toLocaleString("en-IN")}
                      /month
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      ₹
                      {Number(plan.permanentPrice || 0).toLocaleString("en-IN")}{" "}
                      permanent
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingPlan(plan)}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      text-slate-500
                      transition
                      hover:border-emerald-300
                      hover:bg-emerald-50
                      hover:text-emerald-600
                      dark:border-slate-700
                      dark:hover:border-emerald-500/30
                      dark:hover:bg-emerald-500/10
                      dark:hover:text-emerald-400
                    "
                    title="View plan"
                  >
                    <Eye size={15} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {plan.features?.length || 0} features
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      plan.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    {plan.isActive ? "Public" : "Hidden"}
                  </span>
                </div>

                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => editPlan(plan)}
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      border
                      border-slate-200
                      px-3
                      py-2.5
                      text-xs
                      font-bold
                      text-slate-700
                      hover:border-emerald-300
                      hover:text-emerald-600
                      dark:border-slate-700
                      dark:text-slate-300
                    "
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePlan(plan.id)}
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      border
                      border-rose-200
                      px-3
                      py-2.5
                      text-xs
                      font-bold
                      text-rose-600
                      hover:bg-rose-50
                      dark:border-rose-500/20
                      dark:hover:bg-rose-500/10
                    "
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <Sparkles className="mx-auto text-slate-300 dark:text-slate-600" />

            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              No subscription plans yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Create your first plan using the form above.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          PLAN VIEW MODAL
      ===================================================== */}

      {viewingPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setViewingPlan(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-2xl
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Subscription Plan
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {viewingPlan.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewingPlan(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {viewingPlan.description && (
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {viewingPlan.description}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Monthly
                </p>

                <p className="mt-1 text-xl font-black text-emerald-600">
                  ₹
                  {Number(viewingPlan.monthlyPrice || 0).toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Permanent
                </p>

                <p className="mt-1 text-xl font-black text-emerald-600">
                  ₹
                  {Number(viewingPlan.permanentPrice || 0).toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Included features
              </h3>

              <ul className="mt-3 space-y-2">
                {(viewingPlan.features || []).length ? (
                  viewingPlan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No features added.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CUSTOMER REQUESTS
      ===================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Customer subscription requests
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            These requests are submitted from the public subscription page.
            Approve or reject pending requests from here.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {orders.length ? (
            orders.map((order) => (
              <article
                key={order.id}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  transition
                  hover:shadow-sm
                  dark:border-slate-800
                  dark:bg-slate-950
                "
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-900 dark:text-white">
                        {order.customerName}
                      </h3>

                      <span className="text-slate-300">•</span>

                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {order.planName}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Mail size={13} />
                        <span className="break-all">{order.customerEmail}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone size={13} />
                        <span>{order.customerPhone}</span>
                      </div>

                      <div>
                        Billing:{" "}
                        <b className="text-slate-700 dark:text-slate-300">
                          {order.billing}
                        </b>
                      </div>

                      <div>
                        Amount:{" "}
                        <b className="text-slate-700 dark:text-slate-300">
                          ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                        </b>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {order.message && (
                      <div className="mt-4 flex gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <MessageSquare
                          size={14}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Customer message
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {order.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 lg:w-auto lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setViewingOrder(order)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <Eye size={14} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => editOrder(order)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:bg-slate-900"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Pending actions */}
                {order.status === "pending" && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => updateOrder(order.id, "approved")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <Check size={14} />
                      Approve subscription
                    </button>

                    <button
                      type="button"
                      onClick={() => updateOrder(order.id, "rejected")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <User className="mx-auto text-slate-300 dark:text-slate-600" />

              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                No customer requests yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                New subscription requests will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          VIEW REQUEST MODAL
      ===================================================== */}

      {viewingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setViewingOrder(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-2xl
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Subscription Request
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Request details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                ["Customer", viewingOrder.customerName],
                ["Email", viewingOrder.customerEmail],
                ["Phone", viewingOrder.customerPhone],
                ["Plan", viewingOrder.planName],
                ["Billing", viewingOrder.billing],
                [
                  "Amount",
                  `₹${Number(viewingOrder.amount || 0).toLocaleString(
                    "en-IN",
                  )}`,
                ],
                ["Status", viewingOrder.status],
                [
                  "Requested",
                  viewingOrder.createdAt
                    ? new Date(viewingOrder.createdAt).toLocaleString()
                    : "—",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </span>

                  <span className="break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-slate-400" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer message
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {viewingOrder.message || "No message provided."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT REQUEST MODAL
      ===================================================== */}

      {editingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setEditingOrder(null)}
        >
          <form
            onSubmit={saveOrder}
            onClick={(event) => event.stopPropagation()}
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-2xl
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Customer Request
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Edit subscription request
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              {/* Customer Name */}
              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Customer Name
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <User
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="customer-name"
                    required
                    value={editingOrder.customerName}
                    onChange={(event) =>
                      updateOrderField("customerName", event.target.value)
                    }
                    placeholder="Customer full name"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                    "
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="customer-email"
                  className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Customer Email
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="customer-email"
                    required
                    type="email"
                    value={editingOrder.customerEmail}
                    onChange={(event) =>
                      updateOrderField("customerEmail", event.target.value)
                    }
                    placeholder="customer@example.com"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                    "
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="customer-phone"
                  className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Customer Phone
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <Phone
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="customer-phone"
                    required
                    value={editingOrder.customerPhone}
                    onChange={(event) =>
                      updateOrderField("customerPhone", event.target.value)
                    }
                    placeholder="Customer phone number"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                    "
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="customer-message"
                  className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Customer Message
                </label>

                <div className="relative">
                  <MessageSquare
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                  />

                  <textarea
                    id="customer-message"
                    rows={5}
                    value={editingOrder.message}
                    onChange={(event) =>
                      updateOrderField("message", event.target.value)
                    }
                    placeholder="Customer message..."
                    className="
                      min-h-[120px]
                      w-full
                      resize-y
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      py-3
                      pl-10
                      pr-3
                      text-sm
                      leading-6
                      outline-none
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                    "
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <Check size={15} />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
