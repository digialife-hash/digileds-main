import {
  AlertCircle,
  BellRing,
  Check,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  Image as ImageIcon,
  Link2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SITE_API } from "../utils.js";

/* ==========================================================================
SETTINGS SECTIONS POPUP CONTROL
========================================================================== */

const SETTING_SECTIONS = [
  {
    id: "site",
    label: "Site & Assets",
    shortLabel: "Site",
    description: "Company branding, website identity and visual assets.",
    icon: Globe2,
  },
  {
    id: "contact",
    label: "Contact",
    shortLabel: "Contact",
    description: "Phone, email, WhatsApp, Skype and office address.",
    icon: Phone,
  },
  {
    id: "social",
    label: "Social",
    shortLabel: "Social",
    description: "Social media, company profile and review links.",
    icon: Share2,
  },
  {
    id: "payment",
    label: "Payment",
    shortLabel: "Payment",
    description: "Online gateway and manual payment configuration.",
    icon: CreditCard,
  },
  {
    id: "popup",
    label: "Popup",
    shortLabel: "Popup",
    description: "Lead, promotional and contact popup controls.",
    icon: BellRing,
  },
];

const POPUP_DEFAULTS = {
  enabled: false,
  show_once: true,
  delay_seconds: 5,
  position: "bottom-right",
  title: "",
  message: "",
  button_text: "Contact us",
  button_url: "/contact",
  collect_name: true,
  collect_email: true,
  collect_phone: true,
  collect_message: true,
};

/* ==========================================================================
HELPERS
========================================================================== */

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function humanizeKey(value = "") {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function setAtPath(source, path, value) {
  const copy = structuredClone(source || {});

  let target = copy;

  path.forEach((part, index) => {
    if (index === path.length - 1) {
      target[part] = value;
      return;
    }

    if (
      !target[part] ||
      typeof target[part] !== "object" ||
      Array.isArray(target[part])
    ) {
      target[part] = {};
    }

    target = target[part];
  });

  return copy;
}

function looksLikeUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  return /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
}

function looksLikeEmail(value) {
  return (
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

function normaliseSettings(value) {
  const source = isObject(value) ? value : {};
  return {
    ...source,
    popup: {
      ...POPUP_DEFAULTS,
      ...(isObject(source.popup) ? source.popup : {}),
    },
  };
}

function validateSettings(value) {
  const urlFields = [
    ["site.url", value.site?.url],
    ["social.facebook", value.social?.facebook],
    ["social.instagram", value.social?.instagram],
    ["social.linkedin", value.social?.linkedin],
    ["social.twitter", value.social?.twitter],
    ["social.youtube", value.social?.youtube],
    ["social.pinterest", value.social?.pinterest],
    ["external.company_profile", value.external?.company_profile],
    ["external.google_review", value.external?.google_review],
    ["external.facebook_review", value.external?.facebook_review],
    ["external.clutch_review", value.external?.clutch_review],
    ["external.goodfirms_review", value.external?.goodfirms_review],
  ];

  for (const [field, fieldValue] of urlFields) {
    if (fieldValue && fieldValue !== "#" && !looksLikeUrl(fieldValue)) {
      return `${humanizeKey(field)} must be a valid URL.`;
    }
  }

  const emailFields = [
    ["contact.primary_email", value.contact?.primary_email],
    ["contact.hr_email", value.contact?.hr_email],
  ];
  for (const [field, fieldValue] of emailFields) {
    if (fieldValue && !looksLikeEmail(fieldValue)) {
      return `${humanizeKey(field)} must be a valid email address.`;
    }
  }

  return "";
}

function assetUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/")) {
    return `${SITE_API}${raw}`;
  }
  return raw;
}

function AssetUploader({ label, field, value, onChange, onUpload, uploading }) {
  const inputId = `asset-${field}`;
  const preview = assetUrl(value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between gap-3">
        <FieldLabel>{label}</FieldLabel>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={uploading}
            className="text-[11px] font-bold text-red-600 disabled:opacity-50 dark:text-red-400"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
        {preview && field === "hero_video" ? (
          <video
            src={preview}
            className="max-h-full max-w-full object-contain"
            controls
            muted
          />
        ) : preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className="max-h-full max-w-full object-contain p-2"
          />
        ) : (
          <div className="text-center text-xs font-semibold text-slate-400">
            <ImageIcon size={22} className="mx-auto mb-2" />
            No image selected
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <ImageIcon size={14} />
          Choose file
        </label>
        <input
          id={inputId}
          type="file"
          accept={
            field === "hero_video"
              ? "video/mp4,video/webm"
              : field === "favicon"
                ? "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                : "image/png,image/jpeg,image/webp,image/svg+xml"
          }
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onUpload(field, file);
          }}
        />
        {uploading && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <LoaderCircle size={14} className="animate-spin" />
            Uploading...
          </span>
        )}
      </div>
      <input
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Or enter an existing relative / absolute URL"
        disabled={uploading}
        className="mt-3 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      />
      <p className="mt-2 text-[11px] leading-5 text-slate-400">
        {field === "hero_video" ? "MP4 or WebM" : "PNG, JPEG, WebP, SVG"}
        {field === "favicon" ? ", or ICO" : ""}; maximum 10 MB.
      </p>
    </div>
  );
}

/* ==========================================================================
STANDARD INPUTS
========================================================================== */

function FieldLabel({ children }) {
  return (
    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
      {children}{" "}
    </span>
  );
}

function BaseInput({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  placeholder = "",
  rightSlot = null,
}) {
  return (
    <label className="block min-w-0">
      {" "}
      <FieldLabel>{label} </FieldLabel>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${rightSlot ? "pr-12" : "pr-3.5"}`}
        />

        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </label>
  );
}

function TextField({ label, value, onChange }) {
  return <BaseInput label={label} value={value} onChange={onChange} />;
}

function UrlField({ label, value, onChange }) {
  return (
    <BaseInput
      label={label}
      value={value}
      onChange={onChange}
      type="url"
      icon={Link2}
      placeholder="https://example.com"
    />
  );
}

function EmailField({ label, value, onChange }) {
  return (
    <BaseInput
      label={label}
      value={value}
      onChange={onChange}
      type="email"
      icon={Mail}
      placeholder="name@example.com"
    />
  );
}

function PhoneField({ label, value, onChange }) {
  return (
    <BaseInput
      label={label}
      value={value}
      onChange={onChange}
      type="tel"
      icon={Phone}
      placeholder="Enter phone number"
    />
  );
}

function SecretField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <BaseInput
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? "text" : "password"}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
          aria-label={visible ? "Hide value" : "Show value"}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}{" "}
        </button>
      }
    />
  );
}

function TextAreaField({ label, value, onChange, rows = 5, className = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      {" "}
      <FieldLabel>{label} </FieldLabel>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700"
      />
    </label>
  );
}

function ToggleField({ label, description, value, onChange }) {
  return (
    <div className="flex min-h-[78px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      {" "}
      <div className="min-w-0">
        {" "}
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {label}{" "}
        </p>
        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          {description || (value ? "Enabled" : "Disabled")}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          value ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ==========================================================================
SETTINGS CARD
========================================================================== */

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {" "}
      <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-900">
        {" "}
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {" "}
              <Icon size={18} />{" "}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {title}
            </h3>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

/* ==========================================================================
SITE & ASSETS
========================================================================== */

function SiteSection({ settings, update, uploadAsset, uploadingAsset }) {
  const site = settings.site || {};

  const assets = settings.assets || {};

  return (
    <div className="space-y-4">
      {" "}
      <SettingsCard
        icon={Globe2}
        title="Website identity"
        description="Core company and website information."
      >
        {" "}
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Company name"
            value={site.name}
            onChange={(next) => update(["site", "name"], next)}
          />

          <UrlField
            label="Website URL"
            value={site.url}
            onChange={(next) => update(["site", "url"], next)}
          />

          <TextAreaField
            label="Tagline"
            value={site.tagline}
            onChange={(next) => update(["site", "tagline"], next)}
            rows={4}
          />

          <TextField
            label="Base path"
            value={site.base_path}
            onChange={(next) => update(["site", "base_path"], next)}
          />
        </div>
      </SettingsCard>
      <SettingsCard
        icon={ImageIcon}
        title="Brand assets"
        description="Logo, favicon and Open Graph image configuration."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["favicon", "Favicon"],
            ["logo_light", "Light logo"],
            ["logo_dark", "Dark logo"],
            ["og_image", "OG image"],
            ["hero_image", "Hero image"],
            ["hero_video", "Hero video"],
          ].map(([field, label]) => (
            <AssetUploader
              key={field}
              label={label}
              field={field}
              value={assets[field]}
              onChange={(next) => update(["assets", field], next)}
              onUpload={uploadAsset}
              uploading={uploadingAsset === field}
            />
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 p-3.5 dark:border-blue-500/20 dark:bg-blue-500/10">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
          />

          <p className="text-xs leading-5 text-blue-700 dark:text-blue-300">
            You can use either a relative asset path or a complete public URL.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ==========================================================================
CONTACT
========================================================================== */

function ContactSection({ settings, update }) {
  const contact = settings.contact || {};

  return (
    <div className="space-y-4">
      {" "}
      <SettingsCard
        icon={Phone}
        title="Phone & messaging"
        description="Sales, support and WhatsApp communication channels."
      >
        {" "}
        <div className="grid gap-4 md:grid-cols-2">
          <PhoneField
            label="Sales phone"
            value={contact.sales_phone}
            onChange={(next) => update(["contact", "sales_phone"], next)}
          />

          <PhoneField
            label="Support phone"
            value={contact.support_phone}
            onChange={(next) => update(["contact", "support_phone"], next)}
          />

          <PhoneField
            label="WhatsApp phone"
            value={contact.whatsapp_phone}
            onChange={(next) => update(["contact", "whatsapp_phone"], next)}
          />

          <TextField
            label="Skype"
            value={contact.skype}
            onChange={(next) => update(["contact", "skype"], next)}
          />
        </div>
      </SettingsCard>
      <SettingsCard
        icon={Mail}
        title="Email"
        description="Primary business and HR communication addresses."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EmailField
            label="Primary email"
            value={contact.primary_email}
            onChange={(next) => update(["contact", "primary_email"], next)}
          />

          <EmailField
            label="HR email"
            value={contact.hr_email}
            onChange={(next) => update(["contact", "hr_email"], next)}
          />
        </div>
      </SettingsCard>
      <SettingsCard
        icon={MapPin}
        title="Office address"
        description="Address displayed on the public website."
      >
        <TextAreaField
          label="Office address"
          value={contact.address}
          onChange={(next) => update(["contact", "address"], next)}
          rows={5}
        />
      </SettingsCard>
    </div>
  );
}

/* ==========================================================================
SOCIAL
========================================================================== */

function SocialField({ label, value, path, update, icon = Link2 }) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      {" "}
      <div className="mb-3 flex items-center gap-2.5">
        {" "}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-300">
          {" "}
          <Icon size={14} />{" "}
        </div>
        <span className="text-xs font-black text-slate-700 dark:text-slate-200">
          {label}
        </span>
      </div>
      <UrlField
        label="Profile URL"
        value={value}
        onChange={(next) => update(path, next)}
      />
    </div>
  );
}

function SocialSection({ settings, update }) {
  const social = settings.social || {};

  const external = settings.external || {};

  return (
    <div className="space-y-4">
      {" "}
      <SettingsCard
        icon={Share2}
        title="Social profiles"
        description="Public social media links used across the website."
      >
        {" "}
        <div className="grid gap-3 md:grid-cols-2">
          <SocialField
            label="Facebook"
            value={social.facebook}
            path={["social", "facebook"]}
            update={update}
            icon={Share2}
          />

          <SocialField
            label="Instagram"
            value={social.instagram}
            path={["social", "instagram"]}
            update={update}
            icon={Link2}
          />

          <SocialField
            label="LinkedIn"
            value={social.linkedin}
            path={["social", "linkedin"]}
            update={update}
            icon={Link2}
          />

          <SocialField
            label="X / Twitter"
            value={social.twitter}
            path={["social", "twitter"]}
            update={update}
            icon={Link2}
          />

          <SocialField
            label="YouTube"
            value={social.youtube}
            path={["social", "youtube"]}
            update={update}
            icon={Link2}
          />

          <SocialField
            label="Pinterest"
            value={social.pinterest}
            path={["social", "pinterest"]}
            update={update}
            icon={Link2}
          />
        </div>
      </SettingsCard>
      <SettingsCard
        icon={ExternalLink}
        title="Company & review links"
        description="External profile and review destinations."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <UrlField
            label="Company profile"
            value={external.company_profile}
            onChange={(next) => update(["external", "company_profile"], next)}
          />

          <UrlField
            label="Google review"
            value={external.google_review}
            onChange={(next) => update(["external", "google_review"], next)}
          />

          <UrlField
            label="Facebook review"
            value={external.facebook_review}
            onChange={(next) => update(["external", "facebook_review"], next)}
          />

          <UrlField
            label="Clutch review"
            value={external.clutch_review}
            onChange={(next) => update(["external", "clutch_review"], next)}
          />

          <UrlField
            label="GoodFirms review"
            value={external.goodfirms_review}
            onChange={(next) => update(["external", "goodfirms_review"], next)}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* ==========================================================================
PAYMENT
========================================================================== */

function PaymentSection({ settings, update, uploadAsset, uploadingAsset }) {
  const payments = settings.payments || {};

  const manual = settings.manual_payment || {};

  return (
    <div className="space-y-4">
      {" "}
      <SettingsCard
        icon={CreditCard}
        title="Online payment"
        description="Configure Razorpay and customer checkout options."
      >
        {" "}
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Razorpay Key ID"
            value={payments.razorpay_key_id}
            onChange={(next) => update(["payments", "razorpay_key_id"], next)}
          />

          <SecretField
            label="Razorpay Key Secret"
            value={payments.razorpay_key_secret}
            onChange={(next) =>
              update(["payments", "razorpay_key_secret"], next)
            }
          />

          <TextField
            label="Currency"
            value={payments.currency}
            onChange={(next) =>
              update(["payments", "currency"], next.toUpperCase())
            }
          />

          <ToggleField
            label="Razorpay checkout"
            description="Allow customers to pay through Razorpay."
            value={Boolean(payments.shop_offer_razorpay)}
            onChange={(next) =>
              update(["payments", "shop_offer_razorpay"], next)
            }
          />

          <ToggleField
            label="Manual payment"
            description="Allow UPI or bank transfer payment."
            value={Boolean(payments.shop_offer_manual)}
            onChange={(next) => update(["payments", "shop_offer_manual"], next)}
          />
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
            Payment credentials are sensitive. Keep them restricted to trusted
            administrators and never expose secrets in public API responses.
          </p>
        </div>
      </SettingsCard>
      <SettingsCard
        icon={WalletCards}
        title="Manual payment"
        description="UPI and bank transfer details for offline payments."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="UPI ID"
            value={manual.upi_id}
            onChange={(next) => update(["manual_payment", "upi_id"], next)}
          />

          <AssetUploader
            label="Payment QR image"
            field="qr_image"
            value={manual.qr_image}
            onChange={(next) => update(["manual_payment", "qr_image"], next)}
            onUpload={uploadAsset}
            uploading={uploadingAsset === "qr_image"}
          />

          <TextField
            label="Bank name"
            value={manual.bank_name}
            onChange={(next) => update(["manual_payment", "bank_name"], next)}
          />

          <TextField
            label="Account holder"
            value={manual.account_holder}
            onChange={(next) =>
              update(["manual_payment", "account_holder"], next)
            }
          />

          <TextField
            label="Account number"
            value={manual.account_number}
            onChange={(next) =>
              update(["manual_payment", "account_number"], next)
            }
          />

          <TextField
            label="IFSC code"
            value={manual.ifsc_code}
            onChange={(next) =>
              update(["manual_payment", "ifsc_code"], next.toUpperCase())
            }
          />

          <TextField
            label="Bank branch"
            value={manual.bank_branch}
            onChange={(next) => update(["manual_payment", "bank_branch"], next)}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* ==========================================================================
POPUP
========================================================================== */

function PopupSection({ settings, update }) {
  const popup = settings.popup || {};

  return (
    <div className="space-y-4">
      {" "}
      <div className="rounded-[26px] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-slate-950">
        {" "}
        <div className="flex items-start gap-3.5">
          {" "}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            {" "}
            <BellRing size={20} />{" "}
          </div>
          <div>

            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
              Lead & contact popup
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Configure a website popup for enquiries, promotions and lead
              collection.
            </p>
          </div>
        </div>
      </div>
      <SettingsCard
        icon={BellRing}
        title="Popup behaviour"
        description="Control visibility, timing and placement."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleField
            label="Enable popup"
            description="Show the popup on the public website."
            value={Boolean(popup.enabled)}
            onChange={(next) => update(["popup", "enabled"], next)}
          />

          <ToggleField
            label="Show once per visitor"
            description="Avoid repeatedly opening the popup for the same visitor."
            value={popup.show_once ?? true}
            onChange={(next) => update(["popup", "show_once"], next)}
          />

          <TextField
            label="Delay seconds"
            value={popup.delay_seconds ?? "5"}
            onChange={(next) => update(["popup", "delay_seconds"], next)}
          />

          <TextField
            label="Position"
            value={popup.position ?? "bottom-right"}
            onChange={(next) => update(["popup", "position"], next)}
          />
        </div>
      </SettingsCard>
      <SettingsCard
        icon={Sparkles}
        title="Popup content"
        description="Content and call-to-action presented to visitors."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Title"
            value={popup.title ?? ""}
            onChange={(next) => update(["popup", "title"], next)}
          />

          <TextField
            label="Button text"
            value={popup.button_text ?? "Contact us"}
            onChange={(next) => update(["popup", "button_text"], next)}
          />

          <TextAreaField
            label="Message"
            value={popup.message ?? ""}
            onChange={(next) => update(["popup", "message"], next)}
            rows={5}
          />

          <TextField
            label="Button URL"
            value={popup.button_url ?? "/contact"}
            onChange={(next) => update(["popup", "button_url"], next)}
          />
        </div>
      </SettingsCard>
      <SettingsCard
        icon={Mail}
        title="Lead fields"
        description="Choose which information the popup collects."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleField
            label="Collect name"
            description="Ask visitors for their name."
            value={popup.collect_name ?? true}
            onChange={(next) => update(["popup", "collect_name"], next)}
          />

          <ToggleField
            label="Collect email"
            description="Ask visitors for their email address."
            value={popup.collect_email ?? true}
            onChange={(next) => update(["popup", "collect_email"], next)}
          />

          <ToggleField
            label="Collect phone"
            description="Ask visitors for their phone number."
            value={popup.collect_phone ?? true}
            onChange={(next) => update(["popup", "collect_phone"], next)}
          />

          <ToggleField
            label="Collect message"
            description="Allow visitors to describe their requirement."
            value={popup.collect_message ?? true}
            onChange={(next) => update(["popup", "collect_message"], next)}
          />
        </div>
      </SettingsCard>
      {!settings.popup && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
          <Sparkles
            size={16}
            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
          />

          <p className="text-xs leading-5 text-blue-700 dark:text-blue-300">
            Popup configuration is not currently present in your database
            configuration. Saving this section will add the{" "}
            <code className="rounded bg-blue-100 px-1 dark:bg-blue-500/20">
              popup
            </code>{" "}
            object without removing your existing settings.
          </p>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
MAIN COMPONENT
========================================================================== */

export default function CrmSettingsPage() {
  const [settings, setSettings] = useState(null);

  const [originalSettings, setOriginalSettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [uploadingAsset, setUploadingAsset] = useState("");

  const [activeSection, setActiveSection] = useState("site");

  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------------------------------------------------------------- */
  /* Load                                                                     */
  /* ---------------------------------------------------------------------- */

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/settings`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Settings could not be loaded.");
      }

      const siteConfig = result.data?.find(
        (item) => item.key_name === "site_config",
      );

      let parsed = siteConfig?.value;

      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = {};
        }
      }

      const nextSettings = normaliseSettings(parsed);

      const cloned = structuredClone(nextSettings);

      setSettings(cloned);
      setOriginalSettings(structuredClone(cloned));
    } catch (loadError) {
      setError(loadError?.message || "Settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Dirty state                                                             */
  /* ---------------------------------------------------------------------- */

  const hasChanges = useMemo(() => {
    if (!settings || !originalSettings) {
      return false;
    }

    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  /* ---------------------------------------------------------------------- */
  /* Search                                                                   */
  /* ---------------------------------------------------------------------- */

  const visibleSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return SETTING_SECTIONS;
    }

    return SETTING_SECTIONS.filter((section) =>
      [section.label, section.shortLabel, section.description]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  function handleSearch(value) {
    setSearchQuery(value);

    const query = value.trim().toLowerCase();

    if (!query) {
      return;
    }

    const exactMatch = SETTING_SECTIONS.find(
      (section) =>
        section.label.toLowerCase().includes(query) ||
        section.shortLabel.toLowerCase().includes(query),
    );

    if (exactMatch) {
      setActiveSection(exactMatch.id);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Update                                                                   */
  /* ---------------------------------------------------------------------- */

  function update(path, value) {
    setSettings((current) => setAtPath(current, path, value));

    setMessage("");
    setError("");
  }

  async function uploadAsset(field, file) {
    setUploadingAsset(field);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("field", field);
      formData.append("asset", file);

      const response = await fetch(
        `${SITE_API}/api/demo-proxy/settings/assets`,
        {
          method: "POST",
          body: formData,
        },
      );
      const result = await response.json();

      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.message || "Asset upload failed.");
      }

      const path =
        field === "qr_image"
          ? ["manual_payment", "qr_image"]
          : ["assets", field];
      update(path, result.url);
      setMessage(`${humanizeKey(field)} uploaded. Save changes to apply it.`);
    } catch (uploadError) {
      setError(uploadError?.message || "Asset upload failed.");
    } finally {
      setUploadingAsset("");
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Save                                                                     */
  /* ---------------------------------------------------------------------- */

  async function saveSettings() {
    if (!settings || saving || !hasChanges) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const validationError = validateSettings(settings);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key_name: "site_config",
          value: settings,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Settings could not be saved.");
      }

      const saved = structuredClone(settings);

      setOriginalSettings(saved);

      setMessage("Settings saved successfully.");
    } catch (saveError) {
      setError(saveError?.message || "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Discard                                                                  */
  /* ---------------------------------------------------------------------- */

  function discardChanges() {
    if (!originalSettings) {
      return;
    }

    setSettings(structuredClone(originalSettings));

    setMessage("Unsaved changes discarded.");

    setError("");
  }

  /* ---------------------------------------------------------------------- */
  /* Active section                                                           */
  /* ---------------------------------------------------------------------- */

  const activeConfig =
    SETTING_SECTIONS.find((section) => section.id === activeSection) ||
    SETTING_SECTIONS[0];

  const ActiveIcon = activeConfig.icon;

  /* ---------------------------------------------------------------------- */
  /* Render section                                                           */
  /* ---------------------------------------------------------------------- */

  function renderActiveSection() {
    switch (activeConfig.id) {
      case "contact":
        return <ContactSection settings={settings || {}} update={update} />;

      case "social":
        return <SocialSection settings={settings || {}} update={update} />;

      case "payment":
        return (
          <PaymentSection
            settings={settings || {}}
            update={update}
            uploadAsset={uploadAsset}
            uploadingAsset={uploadingAsset}
          />
        );

      case "popup":
        return <PopupSection settings={settings || {}} update={update} />;

      case "site":
      default:
        return (
          <SiteSection
            settings={settings || {}}
            update={update}
            uploadAsset={uploadAsset}
            uploadingAsset={uploadingAsset}
          />
        );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                  */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-950">
        {" "}
        <div className="flex min-h-[440px] items-center justify-center">
          {" "}
          <div className="text-center">
            {" "}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950">
              {" "}
              <LoaderCircle size={25} className="animate-spin" />{" "}
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-950 dark:text-white">
              Loading site settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Syncing the current configuration from MySQL.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                       */
  /* ---------------------------------------------------------------------- */

  return (
    <section className="mx-auto w-full max-w-[1500px] space-y-4 overflow-x-hidden sm:space-y-5">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 sm:h-12 sm:w-12 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Settings2 size={21} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {hasChanges && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Sparkles size={10} />
                    Unsaved changes
                  </span>
                )}
              </div>

              <h1 className="mt-1 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl dark:text-white">
                Site configuration
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Manage your site's identity, contact channels, social profiles,
                payments and lead popup from one centralized workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {hasChanges && (
              <button
                type="button"
                onClick={discardChanges}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <X size={15} />
                Discard
              </button>
            )}

            <button
              type="button"
              onClick={loadSettings}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <RefreshCw size={15} />
              Reload
            </button>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving || !hasChanges}
              className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:text-sm"
            >
              {saving ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}

              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-5 relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search settings..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-950"
          />
        </div>
      </header>

      {/* ================================================================== */}
      {/* FEEDBACK                                                           */}
      {/* ================================================================== */}

      {message && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check size={17} className="mt-0.5 shrink-0" />

          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />

          <span className="break-words">{error}</span>
        </div>
      )}

      {/* ================================================================== */}
      {/* WORKSPACE                                                          */}
      {/* ================================================================== */}

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[265px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)]">
        {/* NAVIGATION */}
        <aside className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:top-5 lg:h-fit">
          <div className="mb-3 hidden px-2 pt-1 lg:block">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              CONFIGURATION
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {visibleSections.map((section) => {
              const Icon = section.icon;

              const active = activeSection === section.id;

              let available = true;

              if (section.id === "popup") {
                available = Boolean(settings?.popup);
              } else if (section.id === "payment") {
                available = Boolean(settings?.payments);
              } else {
                available = Boolean(settings?.[section.id]);
              }

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex min-w-[155px] shrink-0 items-center gap-3 rounded-2xl p-2.5 text-left transition lg:min-w-0 lg:p-3 ${
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl lg:h-10 lg:w-10 ${
                      active
                        ? "bg-white/10 dark:bg-slate-950/10"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black sm:text-sm">
                      {section.label}
                    </span>

                    <span
                      className={`mt-0.5 hidden truncate text-[10px] leading-4 lg:block ${
                        active
                          ? "text-white/60 dark:text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>

                  {available ? (
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        active
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      }`}
                    >
                      <Check size={12} />
                    </span>
                  ) : (
                    <ChevronRight
                      size={15}
                      className={active ? "opacity-70" : "text-slate-400"}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:block dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                <WalletCards size={14} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  MySQL backed
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  Existing configuration is preserved when changes are saved.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 hidden rounded-2xl border border-slate-200 bg-white p-3.5 lg:block dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />

              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Admin configuration
              </span>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="min-w-0">
          <div className="mb-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ActiveIcon size={18} />
              </div>

              <div className="min-w-0">

                <h2 className="mt-0.5 truncate text-lg font-black text-slate-950 dark:text-white">
                  {activeConfig.label}
                </h2>
              </div>
            </div>
          </div>

          {renderActiveSection()}
        </main>
      </div>
    </section>
  );
}
