import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { SITE_API } from "../utils.js";

/* =========================================================
   CONSTANTS 
========================================================= */

const STATUSES = ["new", "contacted", "qualified", "converted", "closed"];

const OPENING_CATEGORIES = [
  "Development",
  "Design",
  "Marketing",
  "Creative",
  "Sales",
  "Operations",
  "Management",
];

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];

const INITIAL_OPENING = {
  title: "",
  category: "Development",
  location: "Noida / Hybrid",
  employmentType: "Full-time",
  description: "",
  isActive: true,
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  new: {
    label: "New",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-400/10",
    border: "border-sky-200 dark:border-sky-400/20",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-400/10",
    border: "border-violet-200 dark:border-violet-400/20",
  },
  qualified: {
    label: "Qualified",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-400/10",
    border: "border-amber-200 dark:border-amber-400/20",
  },
  converted: {
    label: "Converted",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-400/10",
    border: "border-emerald-200 dark:border-emerald-400/20",
  },
  closed: {
    label: "Closed",
    dot: "bg-slate-500",
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
  },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-300",
      bg: "bg-slate-50 dark:bg-slate-800",
      border: "border-slate-200 dark:border-slate-700",
    }
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function clean(value) {
  return String(value ?? "").trim();
}

function makeUrl(value) {
  const raw = clean(value);

  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `https://${raw}`;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, description, icon: Icon, iconClass = "" }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, required = false, children, hint = "", error = "" }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block break-words text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-emerald-500">*</span>}

        {hint && (
          <span className="ml-1 font-medium normal-case tracking-normal text-slate-400">
            ({hint})
          </span>
        )}
      </label>

      {children}

      {error && (
        <div className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold leading-5 text-rose-600">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INPUT CLASSES
========================================================= */

const inputClass = `
  box-border h-11 w-full min-w-0 max-w-full
  rounded-xl border border-slate-200
  bg-slate-50/70 px-3.5
  text-sm font-medium text-slate-800
  outline-none transition
  placeholder:text-slate-400
  focus:border-emerald-500
  focus:bg-white
  focus:ring-4 focus:ring-emerald-500/10
  dark:border-slate-800
  dark:bg-slate-900
  dark:text-slate-100
  dark:placeholder:text-slate-500
`;

const textareaClass = `
  box-border w-full min-w-0 max-w-full
  resize-none rounded-xl border border-slate-200
  bg-slate-50/70 p-3.5
  text-sm font-medium text-slate-800
  outline-none transition
  placeholder:text-slate-400
  focus:border-emerald-500
  focus:bg-white
  focus:ring-4 focus:ring-emerald-500/10
  dark:border-slate-800
  dark:bg-slate-900
  dark:text-slate-100
  dark:placeholder:text-slate-500
`;

/* =========================================================
   MODAL
========================================================= */

function ModalShell({
  title,
  subtitle,
  icon: Icon = BriefcaseBusiness,
  onClose,
  children,
  maxWidth = "max-w-4xl",
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`flex max-h-[96vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-slate-950 sm:max-h-[92vh] sm:rounded-[28px]`}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-emerald-900/20 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-lg font-black sm:text-xl">
                  {title}
                </h2>

                {subtitle && (
                  <p className="mt-1 break-words text-xs leading-5 text-white/65">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   CAREER OPENING FORM MODAL
========================================================= */

function OpeningModal({
  initialData,
  editingId,
  onClose,
  onSaved,
  setGlobalError,
}) {
  const [form, setForm] = useState(
    initialData || {
      ...INITIAL_OPENING,
    },
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(editingId);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) return current;

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function validate() {
    const nextErrors = {};

    if (!clean(form.title)) {
      nextErrors.title = "Job title is required.";
    }

    if (!clean(form.category)) {
      nextErrors.category = "Category is required.";
    }

    if (!clean(form.location)) {
      nextErrors.location = "Location is required.";
    }

    if (!clean(form.employmentType)) {
      nextErrors.employmentType = "Employment type is required.";
    }

    if (!clean(form.description)) {
      nextErrors.description = "Job description is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setGlobalError("");

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const url = isEditing
        ? `${SITE_API}/api/career-openings/${editingId}`
        : `${SITE_API}/api/career-openings`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category.trim(),
          location: form.location.trim(),
          employmentType: form.employmentType.trim(),
          description: form.description.trim(),
          isActive: Boolean(form.isActive),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Career opening could not be saved.");
      }

      onSaved(result.data, isEditing);
      onClose();
    } catch (error) {
      setGlobalError(error.message || "Career opening could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={isEditing ? "Edit Career Opening" : "Create Career Opening"}
      subtitle={
        isEditing
          ? "Update the details of this public job opening."
          : "Create a new opening that will appear on the Careers page."
      }
      icon={BriefcaseBusiness}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-7" noValidate>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Job title" required error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={inputClass}
              placeholder="e.g. React Developer"
            />
          </Field>

          <Field label="Category" required error={errors.category}>
            <div className="relative">
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className={`${inputClass} appearance-none pr-10`}
              >
                {OPENING_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          <Field label="Location" required error={errors.location}>
            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              className={inputClass}
              placeholder="Noida / Hybrid"
            />
          </Field>

          <Field label="Employment type" required error={errors.employmentType}>
            <div className="relative">
              <select
                value={form.employmentType}
                onChange={(event) =>
                  updateField("employmentType", event.target.value)
                }
                className={`${inputClass} appearance-none pr-10`}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          <div className="md:col-span-2">
            <Field label="Job description" required error={errors.description}>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={textareaClass}
                placeholder="Describe responsibilities, skills, expectations and role details..."
              />
            </Field>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-black text-slate-800 dark:text-white">
              Public visibility
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Active openings are shown on the public Careers page.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateField("isActive", !form.isActive)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              form.isActive
                ? "bg-emerald-500"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label="Toggle opening visibility"
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                form.isActive ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-white transition hover:bg-emerald-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                {isEditing ? "Update Opening" : "Create Opening"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* =========================================================
   APPLICATION VIEW MODAL
========================================================= */

function ApplicationModal({ application, onClose, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);

  const [status, setStatus] = useState(application.status || "new");

  const [adminNote, setAdminNote] = useState(application.adminNote || "");

  const [saving, setSaving] = useState(false);

  async function saveChanges() {
    setSaving(true);

    try {
      await onUpdate({
        id: application.id,
        status,
        adminNote,
      });

      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const fullName = clean(application.fullName) || "Unnamed Lead";

  const website = clean(application.website);

  return (
    <ModalShell
      title={fullName}
      subtitle={application.email || "Lead application details"}
      icon={User}
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px]">
        {/* =============================================
            CONTENT
        ============================================= */}

        <div className="min-w-0 space-y-6 p-5 sm:p-7">
          {/* Header summary */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-400/[0.05]">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Submitted
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {formatDate(application.createdAt || application.created_at)}
                </p>
              </div>

              <StatusBadge status={application.status} />
            </div>
          </div>

          {/* Contact information */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <User size={18} className="text-emerald-500" />

              <h3 className="font-black text-slate-900 dark:text-white">
                Contact Information
              </h3>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Full Name
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {fullName}
                </p>
              </div>

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Email
                </p>

                {application.email ? (
                  <a
                    href={`mailto:${application.email}`}
                    className="mt-2 block break-all text-sm font-semibold text-emerald-600 hover:underline"
                  >
                    {application.email}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-500">—</p>
                )}
              </div>

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Phone
                </p>

                {application.phone ? (
                  <a
                    href={`tel:${application.phone}`}
                    className="mt-2 block break-words text-sm font-semibold text-emerald-600 hover:underline"
                  >
                    {application.phone}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-500">—</p>
                )}
              </div>

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Location
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {[application.city, application.state, application.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-emerald-500" />

              <h3 className="font-black text-slate-900 dark:text-white">
                Company Information
              </h3>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailBox label="Company Name" value={application.companyName} />

              <DetailBox
                label="Company Email"
                value={application.companyEmail}
                link={
                  application.companyEmail
                    ? `mailto:${application.companyEmail}`
                    : ""
                }
              />

              <DetailBox
                label="Company Phone"
                value={application.companyPhone}
                link={
                  application.companyPhone
                    ? `tel:${application.companyPhone}`
                    : ""
                }
              />

              <DetailBox
                label="Website"
                value={website}
                link={website ? makeUrl(website) : ""}
                external={Boolean(website)}
              />

              <DetailBox
                label="Company Address"
                value={application.companyAddress}
                full
              />
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseBusiness size={18} className="text-emerald-500" />

              <h3 className="font-black text-slate-900 dark:text-white">
                Product / Requirement
              </h3>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailBox label="Product Name" value={application.productName} />

              <DetailBox
                label="Product Category"
                value={application.productCategory}
              />

              <DetailBox
                label="Estimated Budget"
                value={application.estimatedBudget}
              />

              <DetailBox
                label="Expected Timeline"
                value={application.expectedTimeline}
              />

              <DetailBox label="Address" value={application.address} full />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-500" />

              <h3 className="font-black text-slate-900 dark:text-white">
                Requirements
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                {application.requirements || "No requirements provided."}
              </p>
            </div>
          </div>
        </div>

        {/* =============================================
            SIDEBAR
        ============================================= */}

        <aside className="min-w-0 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:p-6 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-0">
            {!editing ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Current Status
                  </p>

                  <div className="mt-3">
                    <StatusBadge status={application.status || "new"} />
                  </div>
                </div>

                {application.adminNote && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-400/[0.05]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                      Admin Note
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-amber-800 dark:text-amber-300">
                      {application.adminNote}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Edit3 size={16} />
                  Edit Status
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(application.id)}
                  className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400"
                >
                  <Trash2 size={16} />
                  Delete Application
                </button>

                {application.createdAt && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <CalendarDays
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Submitted
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-slate-900">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Status
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {getStatusConfig(item).label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block text-xs font-black text-slate-700 dark:text-slate-300">
                  Admin Note
                  <textarea
                    value={adminNote}
                    onChange={(event) => setAdminNote(event.target.value)}
                    rows={6}
                    placeholder="Internal note..."
                    className={`${textareaClass} mt-2`}
                  />
                </label>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveChanges}
                    disabled={saving}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-black text-white disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        Save
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </ModalShell>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  label,
  value,
  link = "",
  external = false,
  full = false,
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      {link ? (
        <a
          href={link}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="mt-2 flex min-w-0 items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline"
        >
          <span className="min-w-0 break-all">{value || "—"}</span>

          {external && <ExternalLink size={14} className="shrink-0" />}
        </a>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CareerApplicationsPage() {
  const [items, setItems] = useState([]);

  const [openings, setOpenings] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [loadingOpenings, setLoadingOpenings] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [viewing, setViewing] = useState(null);

  const [openingModal, setOpeningModal] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =======================================================
     LOAD APPLICATIONS
  ======================================================= */

  async function loadApplications(options = {}) {
    const refresh = options.refresh === true;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${SITE_API}/api/lead-applications`, {
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Applications could not be loaded.");
      }

      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (loadError) {
      setError(loadError.message || "Applications could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =======================================================
     LOAD OPENINGS
  ======================================================= */

  async function loadOpenings() {
    setLoadingOpenings(true);

    try {
      const response = await fetch(`${SITE_API}/api/career-openings/manage`, {
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Career openings could not be loaded.",
        );
      }

      setOpenings(Array.isArray(result.data) ? result.data : []);
    } catch (openingError) {
      setError(openingError.message || "Career openings could not be loaded.");
    } finally {
      setLoadingOpenings(false);
    }
  }

  useEffect(() => {
    loadApplications();
    loadOpenings();
  }, []);

  /* =======================================================
     MESSAGE AUTO CLEAR
  ======================================================= */

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timeout = setTimeout(() => {
      setMessage("");
      setError("");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [message, error]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(
    () => ({
      total: items.length,

      new: items.filter((item) => item.status === "new").length,

      contacted: items.filter((item) => item.status === "contacted").length,

      qualified: items.filter((item) => item.status === "qualified").length,

      converted: items.filter((item) => item.status === "converted").length,

      closed: items.filter((item) => item.status === "closed").length,
    }),
    [items],
  );

  /* =======================================================
     FILTERED
  ======================================================= */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const statusMatches =
        statusFilter === "all" || item.status === statusFilter;

      if (!statusMatches) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.fullName,
        item.email,
        item.phone,
        item.companyName,
        item.productName,
        item.productCategory,
        item.status,
        item.city,
        item.state,
        item.country,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, statusFilter]);

  /* =======================================================
     OPENING SAVE
  ======================================================= */

  function handleOpeningSaved(data, isEditing) {
    if (isEditing) {
      setOpenings((current) =>
        current.map((opening) => (opening.id === data.id ? data : opening)),
      );

      setMessage("Career opening updated successfully.");
    } else {
      setOpenings((current) => [data, ...current]);

      setMessage("Career opening created successfully.");
    }
  }

  /* =======================================================
     DELETE OPENING
  ======================================================= */

  async function removeOpening(id) {
    const opening = openings.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Delete "${opening?.title || "this opening"}" permanently?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${SITE_API}/api/career-openings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Career opening could not be deleted.",
        );
      }

      setOpenings((current) => current.filter((opening) => opening.id !== id));

      setMessage("Career opening deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message || "Career opening could not be deleted.");
    }
  }

  /* =======================================================
     TOGGLE OPENING
  ======================================================= */

  async function toggleOpening(opening) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${SITE_API}/api/career-openings/${opening.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            isActive: !opening.isActive,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Career opening could not be updated.",
        );
      }

      setOpenings((current) =>
        current.map((item) => (item.id === opening.id ? result.data : item)),
      );

      setMessage(
        `Opening ${
          !opening.isActive ? "activated" : "deactivated"
        } successfully.`,
      );
    } catch (toggleError) {
      setError(toggleError.message || "Career opening could not be updated.");
    }
  }

  /* =======================================================
     UPDATE APPLICATION
  ======================================================= */

  async function updateApplication({ id, status, adminNote }) {
    setError("");

    try {
      const response = await fetch(`${SITE_API}/api/lead-applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
          adminNote,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Application could not be updated.");
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? result.data : item)),
      );

      setViewing(result.data);

      setMessage("Application updated successfully.");

      return result.data;
    } catch (saveError) {
      setError(saveError.message || "Application could not be updated.");

      throw saveError;
    }
  }

  /* =======================================================
     DELETE APPLICATION
  ======================================================= */

  async function remove(id) {
    const application = items.find((item) => item.id === id);

    const name = clean(application?.fullName) || "this application";

    const confirmed = window.confirm(`Delete ${name} permanently?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${SITE_API}/api/lead-applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Application could not be deleted.");
      }

      setItems((current) => current.filter((item) => item.id !== id));

      if (viewing?.id === id) {
        setViewing(null);
      }

      setMessage("Application deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message || "Application could not be deleted.");
    }
  }

  /* =======================================================
     DELETE ALL
  ======================================================= */

  async function removeAll() {
    if (!items.length) {
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${items.length} lead applications permanently?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${SITE_API}/api/lead-applications`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Lead applications could not be deleted.",
        );
      }

      setItems([]);
      setViewing(null);

      setMessage(
        result.message || "All lead applications deleted successfully.",
      );
    } catch (deleteError) {
      setError(
        deleteError.message || "Lead applications could not be deleted.",
      );
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="min-w-0 space-y-5 pb-10">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                {filtered.length} visible
              </span>
            </div>

            <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Lead Applications
            </h1>

            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage enquiries submitted through the website lead application
              form and keep your recruitment openings up to date.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() =>
                loadApplications({
                  refresh: true,
                })
              }
              disabled={refreshing}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={removeAll}
              disabled={!items.length}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400"
            >
              <Trash2 size={15} />
              Delete all
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          ALERT
      =================================================== */}

      {(error || message) && (
        <div
          className={`flex min-w-0 items-start gap-3 rounded-2xl border px-4 py-3 ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-400/10 dark:text-rose-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-400/10 dark:text-emerald-300"
          }`}
        >
          {error ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}

          <p className="min-w-0 break-words text-sm font-semibold leading-6">
            {error || message}
          </p>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
            }}
            className="ml-auto shrink-0 rounded-lg p-1 hover:bg-black/5"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard
          title="Total"
          value={stats.total}
          description="All leads"
          icon={Users}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
        />

        <StatCard
          title="New"
          value={stats.new}
          description="Fresh leads"
          icon={Send}
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400"
        />

        <StatCard
          title="Contacted"
          value={stats.contacted}
          description="Reached"
          icon={Phone}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400"
        />

        <StatCard
          title="Qualified"
          value={stats.qualified}
          description="Potential leads"
          icon={CheckCircle2}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
        />

        <StatCard
          title="Converted"
          value={stats.converted}
          description="Won leads"
          icon={Check}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
        />

        <StatCard
          title="Closed"
          value={stats.closed}
          description="Closed records"
          icon={Clock3}
          iconClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        />
      </div>

      {/* ===================================================
          LEAD FILTERS
      =================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-2xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, company, email, phone, product..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={`${inputClass} appearance-none pr-10 sm:min-w-[180px]`}
            >
              <option value="all">All Statuses</option>

              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getStatusConfig(status).label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {(search || statusFilter !== "all") && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              Filters:
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Search: {search}
                <X size={11} />
              </button>
            )}

            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                {getStatusConfig(statusFilter).label}
                <X size={11} />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="text-[10px] font-black text-emerald-600"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ===================================================
          APPLICATION TABLE
      =================================================== */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-900"
              >
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-3 w-72 max-w-full rounded bg-slate-100 dark:bg-slate-900" />
                </div>

                <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
              <Users size={28} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
              No lead applications found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search term or status filter.
            </p>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70">
                <tr>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Lead
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Company
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0 dark:border-slate-900 dark:hover:bg-slate-900/50"
                  >
                    {/* Lead */}
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                          <User size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate font-black text-slate-900 dark:text-white">
                            {item.fullName || "Unnamed Lead"}
                          </p>

                          <p className="mt-1 max-w-[230px] truncate text-xs text-slate-500">
                            {item.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-4">
                      <div className="max-w-[220px]">
                        <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
                          {item.companyName || "—"}
                        </p>

                        {item.companyEmail && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {item.companyEmail}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="max-w-[210px]">
                        <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
                          {item.productName || "—"}
                        </p>

                        {item.productCategory && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {item.productCategory}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <CalendarDays size={14} className="shrink-0" />

                        {formatDateShort(item.createdAt || item.created_at)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status || "new"} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewing(item)}
                          title="View application"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          title="Delete application"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-400/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================
          CAREER OPENINGS
      =================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness size={18} className="text-emerald-500" />

                <h2 className="text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                  Career Openings
                </h2>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Manage the jobs displayed on the public Digital Alife Careers
                page.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpeningModal({
                  editingId: "",
                  data: {
                    ...INITIAL_OPENING,
                  },
                })
              }
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-white transition hover:bg-emerald-600 sm:w-auto"
            >
              <Plus size={17} />
              Add Opening
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loadingOpenings ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-slate-100 p-5 dark:border-slate-900"
                >
                  <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-3 h-3 w-56 rounded bg-slate-100 dark:bg-slate-900" />

                  <div className="mt-4 h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-900" />
                </div>
              ))}
            </div>
          ) : openings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <BriefcaseBusiness size={25} />
              </div>

              <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                No career openings yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first public job opening.
              </p>

              <button
                type="button"
                onClick={() =>
                  setOpeningModal({
                    editingId: "",
                    data: {
                      ...INITIAL_OPENING,
                    },
                  })
                }
                className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white"
              >
                Create Opening
              </button>
            </div>
          ) : (
            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              {openings.map((opening) => (
                <div
                  key={opening.id}
                  className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-emerald-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 ${
                      opening.isActive
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />

                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                            {opening.category || "General"}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                              opening.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                                : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {opening.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <h3 className="mt-3 break-words text-lg font-black text-slate-900 dark:text-white">
                          {opening.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {opening.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={13} className="text-emerald-500" />
                              {opening.location}
                            </span>
                          )}

                          {opening.employmentType && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 size={13} className="text-emerald-500" />
                              {opening.employmentType}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setOpeningModal({
                            editingId: opening.id,
                            data: {
                              title: opening.title || "",
                              category: opening.category || "Development",
                              location: opening.location || "Noida / Hybrid",
                              employmentType:
                                opening.employmentType || "Full-time",
                              description: opening.description || "",
                              isActive: Boolean(opening.isActive),
                            },
                          })
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        title="Edit opening"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>

                    <p className="line-clamp-3 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {opening.description || "No description added."}
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => toggleOpening(opening)}
                        className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black ${
                          opening.isActive
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {opening.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeOpening(opening.id)}
                        className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-black text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-400/10 dark:text-rose-400"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          APPLICATION MODAL
      =================================================== */}

      {viewing && (
        <ApplicationModal
          application={viewing}
          onClose={() => setViewing(null)}
          onDelete={remove}
          onUpdate={updateApplication}
        />
      )}

      {/* ===================================================
          OPENING MODAL
      =================================================== */}

      {openingModal && (
        <OpeningModal
          editingId={openingModal.editingId}
          initialData={openingModal.data}
          onClose={() => setOpeningModal(null)}
          onSaved={handleOpeningSaved}
          setGlobalError={setError}
        />
      )}
    </section>
  );
}
