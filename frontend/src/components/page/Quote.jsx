import React, { useState } from "react";
import QuoteHero from "./QuoteHero";
import QuoteRequest from "./QuoteRequest"
import {
  UserRound,
  Building2,
  Package,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Sparkles,
  AlertCircle,
  LoaderCircle,
  FileText,
  WalletCards,
  Clock3,
  MessageSquareText,
  BriefcaseBusiness,
} from "lucide-react";

import Button from "../ui/Button";

/* =========================================================
   COLORS
========================================================= */

const GREEN = "#10B981";
const GREEN_DARK = "#059669";
const GREEN_LIGHT = "#6EE7B7";

/* =========================================================
   LEAD STEPS
========================================================= */

const leadSteps = [
  {
    id: 1,
    title: "Client Details",
    icon: UserRound,
  },
  {
    id: 2,
    title: "Company Details",
    icon: Building2,
  },
  {
    id: 3,
    title: "Product Details",
    icon: Package,
  },
  {
    id: 4,
    title: "Submission",
    icon: Send,
  },
];

/* =========================================================
   QUOTE STEPS
========================================================= */

const quoteSteps = [
  {
    id: 1,
    title: "Your Details",
    icon: UserRound,
  },
  {
    id: 2,
    title: "Project Details",
    icon: BriefcaseBusiness,
  },
  {
    id: 3,
    title: "Review",
    icon: Check,
  },
];

/* =========================================================
   STATES
========================================================= */

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
];

/* =========================================================
   EXISTING LEAD FORM
========================================================= */

const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone_code: "+91",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",

  companyName: "",
  companyEmail: "",
  companyPhone: "",
  website: "",
  companyAddress: "",

  productName: "",
  productCategory: "",
  estimatedBudget: "",
  expectedTimeline: "",
  requirements: "",
};

/* =========================================================
   QUOTE FORM
========================================================= */

const INITIAL_QUOTE_FORM = {
  full_name: "",
  email: "",
  phone_code: "+91",
  phone: "",

  companyName: "",

  service: "",
  projectType: "",
  budget: "",
  timeline: "",
  requirements: "",
};

/* =========================================================
   INPUT CLASSES
========================================================= */

const inputClass = `
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-4
  py-3.5
  text-sm
  font-medium
  text-slate-800
  outline-none
  transition-all
  duration-200
  placeholder:text-slate-400
  focus:border-emerald-400
  focus:ring-4
  focus:ring-emerald-500/10
  dark:border-slate-700
  dark:bg-slate-900
  dark:text-white
  dark:placeholder:text-slate-500
  dark:focus:border-emerald-500
`;

const selectClass = `
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-4
  py-3.5
  text-sm
  font-medium
  text-slate-800
  outline-none
  transition-all
  duration-200
  focus:border-emerald-400
  focus:ring-4
  focus:ring-emerald-500/10
  dark:border-slate-700
  dark:bg-slate-900
  dark:text-white
  dark:focus:border-emerald-500
`;

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required = false,
  hint = "",
  icon: Icon,
  error,
  children,
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="flex min-w-0 items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-200">
          {Icon && (
            <span className="text-emerald-500">
              <Icon size={15} />
            </span>
          )}

          <span className="truncate">
            {label}
          </span>

          {required && (
            <span className="font-black text-red-500">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="shrink-0 text-[10px] font-semibold text-slate-400">
            {hint}
          </span>
        )}
      </div>

      <div
        className={
          error
            ? "[&_input]:border-red-400 [&_input]:ring-4 [&_input]:ring-red-500/10 [&_select]:border-red-400 [&_select]:ring-4 [&_select]:ring-red-500/10 [&_textarea]:border-red-400 [&_textarea]:ring-4 [&_textarea]:ring-red-500/10"
            : ""
        }
      >
        {React.cloneElement(children, {
          "aria-invalid": Boolean(error),
        })}
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,.25)] dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: `${GREEN}12`,
              color: GREEN_DARK,
            }}
          >
            <Icon size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900 sm:text-xl dark:text-white">
              {title}
            </h2>

            <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   STEP INDICATOR
========================================================= */

function StepIndicator({
  currentStep,
  steps = leadSteps,
}) {
  return (
    <div className="mb-6 overflow-x-auto pb-1">
      <div className="mx-auto flex min-w-[520px] items-center justify-center">
        {steps.map((step, index) => {
          const active = currentStep === step.id;
          const completed = currentStep > step.id;

          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black transition-all duration-300 ${
                    active || completed
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  {completed ? (
                    <Check size={15} strokeWidth={3} />
                  ) : (
                    <Icon size={15} />
                  )}
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wide ${
                    active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`mx-3 h-px w-8 shrink-0 sm:w-12 ${
                    currentStep > step.id
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW ROW
========================================================= */

function ReviewRow({
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
        !last
          ? "border-b border-emerald-500/10"
          : ""
      }`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span className="break-all text-sm font-bold text-slate-700 sm:text-right dark:text-slate-200">
        {value || "Not provided"}
      </span>
    </div>
  );
}

/* =========================================================
   QUOTE REVIEW ROW
========================================================= */

function QuoteReviewRow({
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        !last
          ? "border-b border-emerald-500/10"
          : ""
      }`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span className="break-words text-sm font-bold text-slate-700 sm:max-w-[65%] sm:text-right dark:text-slate-200">
        {value || "Not provided"}
      </span>
    </div>
  );
}

/* =========================================================
   QUOTE REQUEST FORM
========================================================= */



/* =========================================================
   MAIN QUOTE COMPONENT
========================================================= */

function Quote() {
  const [activeMode, setActiveMode] =
    useState("quote");

  const [currentStep, setCurrentStep] =
    useState(1);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] =
    useState({});

  const [apiError, setApiError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [QuetsOpen, setQuetsOpen] =
    useState(false);

  /* =======================================================
     OPEN QUOTE
  ======================================================= */

  const openQuoteMode = () => {
    setActiveMode("quote");
    setQuetsOpen(true);

    setTimeout(() => {
      document
        .getElementById("quote-form-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =======================================================
     OPEN LEAD
  ======================================================= */

  const openLeadMode = () => {
    setActiveMode("lead");
    setQuetsOpen(true);

    setCurrentStep(1);
    setErrors({});
    setApiError("");

    setTimeout(() => {
      document
        .getElementById("quote-form-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = (
    name,
    value,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = {
        ...prev,
      };

      delete next[name];

      return next;
    });

    setApiError("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.full_name.trim()) {
        newErrors.full_name =
          "Full name is required.";
      } else if (
        formData.full_name.trim()
          .length < 2
      ) {
        newErrors.full_name =
          "Please enter a valid full name.";
      }

      if (!formData.email.trim()) {
        newErrors.email =
          "Email address is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.email.trim(),
        )
      ) {
        newErrors.email =
          "Please enter a valid email address.";
      }

      if (!formData.phone.trim()) {
        newErrors.phone =
          "Phone number is required.";
      } else if (
        !/^[0-9]{7,15}$/.test(
          formData.phone.trim(),
        )
      ) {
        newErrors.phone =
          "Please enter a valid phone number.";
      }

      if (!formData.address.trim()) {
        newErrors.address =
          "Address is required.";
      }

      if (!formData.city.trim()) {
        newErrors.city =
          "City is required.";
      }

      if (!formData.state) {
        newErrors.state =
          "Please select a state.";
      }

      if (!formData.country.trim()) {
        newErrors.country =
          "Country is required.";
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim()) {
        newErrors.companyName =
          "Company name is required.";
      }

      if (!formData.companyEmail.trim()) {
        newErrors.companyEmail =
          "Company email is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.companyEmail.trim(),
        )
      ) {
        newErrors.companyEmail =
          "Please enter a valid company email.";
      }

      if (!formData.companyPhone.trim()) {
        newErrors.companyPhone =
          "Company phone is required.";
      } else if (
        !/^[0-9]{7,15}$/.test(
          formData.companyPhone.trim(),
        )
      ) {
        newErrors.companyPhone =
          "Please enter a valid company phone.";
      }

      if (
        formData.website.trim() &&
        !/^https?:\/\/.+/i.test(
          formData.website.trim(),
        )
      ) {
        newErrors.website =
          "Website must start with http:// or https://";
      }

      if (
        !formData.companyAddress.trim()
      ) {
        newErrors.companyAddress =
          "Company address is required.";
      }
    }

    if (step === 3) {
      if (!formData.productName.trim()) {
        newErrors.productName =
          "Product name is required.";
      }

      if (!formData.productCategory) {
        newErrors.productCategory =
          "Please select a product category.";
      }
    }

    setErrors(newErrors);

    if (
      Object.keys(newErrors).length >
      0
    ) {
      setTimeout(() => {
        const firstError =
          document.querySelector(
            '[aria-invalid="true"]',
          );

        firstError?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);

      return false;
    }

    return true;
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const nextStep = () => {
    setApiError("");

    if (
      !validateStep(currentStep)
    ) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(
        (prev) => prev + 1,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const previousStep = () => {
    setApiError("");
    setErrors({});

    if (currentStep > 1) {
      setCurrentStep(
        (prev) => prev - 1,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError("");

    const step1Valid =
      validateStep(1);

    if (!step1Valid) {
      setCurrentStep(1);
      return;
    }

    const step2Valid =
      validateStep(2);

    if (!step2Valid) {
      setCurrentStep(2);
      return;
    }

    const step3Valid =
      validateStep(3);

    if (!step3Valid) {
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = (
        import.meta.env
          .VITE_SITE_API_URL || ""
      ).replace(/\/+$/, "");

      const response = await fetch(
        `${apiUrl}/api/lead-applications`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...formData,

            fullName:
              formData.full_name,

            phoneCode:
              formData.phone_code,
          }),
        },
      );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Lead application could not be submitted. Please try again.",
        );
      }

      setFormData(INITIAL_FORM);
      setErrors({});
      setApiError("");
      setCurrentStep(1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      window.alert(
        result.message ||
          "Lead application submitted successfully.",
      );
    } catch (error) {
      console.error(
        "Lead submission error:",
        error,
      );

      setApiError(
        error.message ||
          "Something went wrong while submitting the registration.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#E9EEF5] text-slate-700 dark:bg-[#020817] dark:text-slate-300">

      {/* =====================================================
          HERO
      ====================================================== */}

      <QuoteHero
        setQuetsOpen={setQuetsOpen}
        onGetQuotes={openQuoteMode}
        onGenerateLeads={openLeadMode}
      />

      {/* =====================================================
          DECORATIVE IMAGE
      ====================================================== */}

      <div
        style={{
          background:
            "url(/images/laxic.jpg)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "20%",
        }}
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          top-180
          h-40
        "
      />

      {/* =====================================================
          FORM AREA
      ====================================================== */}

      <div
        id="quote-form-section"
        className="
          relative
          overflow-hidden
          px-3
          py-8
          sm:px-6
          sm:py-12
          lg:py-16
        "
      >

        {/* GREEN GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            -right-40
            -top-40
            h-[320px]
            w-[320px]
            rounded-full
            blur-3xl
            sm:h-[420px]
            sm:w-[420px]
          "
          style={{
            background: `radial-gradient(circle, ${GREEN}22, transparent 70%)`,
          }}
        />

        <div
          className="
            pointer-events-none
            absolute
            -left-40
            top-[40%]
            h-[300px]
            w-[300px]
            rounded-full
            blur-3xl
            sm:h-[400px]
            sm:w-[400px]
          "
          style={{
            background: `radial-gradient(circle, ${GREEN_LIGHT}20, transparent 70%)`,
          }}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="relative z-10 mx-auto w-full max-w-4xl">


          {/* =================================================
              QUOTE MODE
          ================================================= */}

          {activeMode === "quote" && (
            <div>  
              <QuoteRequest/>
            </div>
          )}

          {/* =================================================
              LEAD MODE
          ================================================= */}

          {activeMode === "lead" && (
            <div>

              {/* HEADER */}

              <div className="mb-8 text-center sm:mb-10">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] sm:px-4 sm:text-xs"
                  style={{
                    color: GREEN_DARK,
                    background: `${GREEN}12`,
                    border: `1px solid ${GREEN}25`,
                  }}
                >
                  <Sparkles size={13} />

                  Lead Registration
                </div>

                <h1 className="mb-3 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] dark:text-white">
                  Corporate Lead Registration
                </h1>

                <p className="mx-auto max-w-2xl px-2 text-sm font-medium leading-6 text-slate-500 sm:text-base sm:leading-7 dark:text-slate-400">
                  Provide the client, company and
                  product details below to register a
                  qualified prospect in our system.
                </p>
              </div>

              {/* STEP INDICATOR */}

              <StepIndicator
                currentStep={currentStep}
                steps={leadSteps}
              />

              {/* API ERROR */}

              {apiError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                >
                  <AlertCircle
                    className="mt-0.5 shrink-0"
                    size={19}
                  />

                  <div className="min-w-0">
                    <p className="font-extrabold">
                      Submission Error
                    </p>

                    <p className="mt-0.5 font-medium">
                      {apiError}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  LEAD FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                noValidate
              >

                {/* =================================================
                    STEP 1
                ================================================= */}

                {currentStep === 1 && (
                  <SectionCard
                    title="Client Details"
                    description="Enter the primary contact person's information."
                    icon={UserRound}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      <div className="sm:col-span-2">
                        <Field
                          label="Full Name"
                          required
                          icon={UserRound}
                          error={errors.full_name}
                        >
                          <input
                            type="text"
                            name="full_name"
                            value={
                              formData.full_name
                            }
                            onChange={(e) =>
                              updateField(
                                "full_name",
                                e.target.value,
                              )
                            }
                            placeholder="Enter client's full name"
                            className={inputClass}
                            autoComplete="name"
                          />
                        </Field>
                      </div>

                      <Field
                        label="Email Address"
                        required
                        icon={Mail}
                        error={errors.email}
                      >
                        <input
                          type="email"
                          name="email"
                          value={
                            formData.email
                          }
                          onChange={(e) =>
                            updateField(
                              "email",
                              e.target.value,
                            )
                          }
                          placeholder="client@company.com"
                          className={inputClass}
                          autoComplete="email"
                        />
                      </Field>

                      <Field
                        label="Phone Number"
                        required
                        error={errors.phone}
                      >
                        <div className="flex min-w-0 gap-2 sm:gap-3">

                          <select
                            name="phone_code"
                            value={
                              formData.phone_code
                            }
                            onChange={(e) =>
                              updateField(
                                "phone_code",
                                e.target.value,
                              )
                            }
                            className={`${selectClass} w-[92px] shrink-0 px-2 sm:w-[105px] sm:px-4`}
                          >
                            <option value="+91">
                              🇮🇳 +91
                            </option>

                            <option value="+1">
                              🇺🇸 +1
                            </option>

                            <option value="+44">
                              🇬🇧 +44
                            </option>

                            <option value="+61">
                              🇦🇺 +61
                            </option>

                            <option value="+971">
                              🇦🇪 +971
                            </option>
                          </select>

                          <div className="relative min-w-0 flex-1">
                            <Phone
                              size={17}
                              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                            />

                            <input
                              type="tel"
                              name="phone"
                              value={
                                formData.phone
                              }
                              onChange={(e) =>
                                updateField(
                                  "phone",
                                  e.target.value.replace(
                                    /\D/g,
                                    "",
                                  ),
                                )
                              }
                              placeholder="9876543210"
                              className={`${inputClass} pl-11`}
                              autoComplete="tel"
                              inputMode="numeric"
                            />
                          </div>

                        </div>
                      </Field>

                      <div className="sm:col-span-2">
                        <Field
                          label="Address"
                          required
                          icon={MapPin}
                          error={errors.address}
                        >
                          <input
                            type="text"
                            name="address"
                            value={
                              formData.address
                            }
                            onChange={(e) =>
                              updateField(
                                "address",
                                e.target.value,
                              )
                            }
                            placeholder="House/Office No, Street Area"
                            className={inputClass}
                            autoComplete="street-address"
                          />
                        </Field>
                      </div>

                      <Field
                        label="City"
                        required
                        icon={MapPin}
                        error={errors.city}
                      >
                        <input
                          type="text"
                          name="city"
                          value={
                            formData.city
                          }
                          onChange={(e) =>
                            updateField(
                              "city",
                              e.target.value,
                            )
                          }
                          placeholder="Enter city"
                          className={inputClass}
                          autoComplete="address-level2"
                        />
                      </Field>

                      <Field
                        label="State"
                        required
                        error={errors.state}
                      >
                        <select
                          name="state"
                          value={
                            formData.state
                          }
                          onChange={(e) =>
                            updateField(
                              "state",
                              e.target.value,
                            )
                          }
                          className={selectClass}
                        >
                          <option value="">
                            Select State
                          </option>

                          {states.map(
                            (state) => (
                              <option
                                key={state}
                                value={state}
                              >
                                {state}
                              </option>
                            ),
                          )}
                        </select>
                      </Field>

                      <div className="sm:col-span-2">
                        <Field
                          label="Country"
                          required
                          icon={Globe2}
                          error={errors.country}
                        >
                          <input
                            type="text"
                            name="country"
                            value={
                              formData.country
                            }
                            onChange={(e) =>
                              updateField(
                                "country",
                                e.target.value,
                              )
                            }
                            placeholder="Enter country"
                            className={inputClass}
                            autoComplete="country-name"
                          />
                        </Field>
                      </div>

                    </div>
                  </SectionCard>
                )}

                {/* =================================================
                    STEP 2
                ================================================= */}

                {currentStep === 2 && (
                  <SectionCard
                    title="Company Details"
                    description="Enter the company information associated with this lead."
                    icon={Building2}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      <Field
                        label="Company Name"
                        required
                        icon={Building2}
                        error={
                          errors.companyName
                        }
                      >
                        <input
                          type="text"
                          name="companyName"
                          value={
                            formData.companyName
                          }
                          onChange={(e) =>
                            updateField(
                              "companyName",
                              e.target.value,
                            )
                          }
                          placeholder="Enter company name"
                          className={inputClass}
                          autoComplete="organization"
                        />
                      </Field>

                      <Field
                        label="Company Email"
                        required
                        icon={Mail}
                        error={
                          errors.companyEmail
                        }
                      >
                        <input
                          type="email"
                          name="companyEmail"
                          value={
                            formData.companyEmail
                          }
                          onChange={(e) =>
                            updateField(
                              "companyEmail",
                              e.target.value,
                            )
                          }
                          placeholder="company@example.com"
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="Company Phone"
                        required
                        icon={Phone}
                        error={
                          errors.companyPhone
                        }
                      >
                        <input
                          type="tel"
                          name="companyPhone"
                          value={
                            formData.companyPhone
                          }
                          onChange={(e) =>
                            updateField(
                              "companyPhone",
                              e.target.value.replace(
                                /\D/g,
                                "",
                              ),
                            )
                          }
                          placeholder="9876543210"
                          className={inputClass}
                          inputMode="numeric"
                        />
                      </Field>

                      <Field
                        label="Website"
                        icon={Globe2}
                        hint="Optional"
                        error={
                          errors.website
                        }
                      >
                        <input
                          type="url"
                          name="website"
                          value={
                            formData.website
                          }
                          onChange={(e) =>
                            updateField(
                              "website",
                              e.target.value,
                            )
                          }
                          placeholder="https://company.com"
                          className={inputClass}
                        />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field
                          label="Company Address"
                          required
                          icon={MapPin}
                          error={
                            errors.companyAddress
                          }
                        >
                          <input
                            type="text"
                            name="companyAddress"
                            value={
                              formData.companyAddress
                            }
                            onChange={(e) =>
                              updateField(
                                "companyAddress",
                                e.target.value,
                              )
                            }
                            placeholder="Company office address"
                            className={inputClass}
                            autoComplete="street-address"
                          />
                        </Field>
                      </div>

                    </div>
                  </SectionCard>
                )}

                {/* =================================================
                    STEP 3
                ================================================= */}

                {currentStep === 3 && (
                  <SectionCard
                    title="Product Details"
                    description="Tell us what product or service the client is interested in."
                    icon={Package}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      <Field
                        label="Product Name"
                        required
                        error={
                          errors.productName
                        }
                      >
                        <input
                          type="text"
                          name="productName"
                          value={
                            formData.productName
                          }
                          onChange={(e) =>
                            updateField(
                              "productName",
                              e.target.value,
                            )
                          }
                          placeholder="Enter product name"
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="Product Category"
                        required
                        error={
                          errors.productCategory
                        }
                      >
                        <select
                          name="productCategory"
                          value={
                            formData.productCategory
                          }
                          onChange={(e) =>
                            updateField(
                              "productCategory",
                              e.target.value,
                            )
                          }
                          className={selectClass}
                        >
                          <option value="">
                            Select Category
                          </option>

                          <option value="software">
                            Software
                          </option>

                          <option value="service">
                            Service
                          </option>

                          <option value="saas">
                            SaaS
                          </option>

                          <option value="marketing">
                            Marketing
                          </option>

                          <option value="other">
                            Other
                          </option>
                        </select>
                      </Field>

                      <Field
                        label="Estimated Budget"
                        hint="Optional"
                      >
                        <input
                          type="text"
                          name="estimatedBudget"
                          value={
                            formData.estimatedBudget
                          }
                          onChange={(e) =>
                            updateField(
                              "estimatedBudget",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. ₹5,00,000"
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="Expected Timeline"
                        hint="Optional"
                      >
                        <input
                          type="text"
                          name="expectedTimeline"
                          value={
                            formData.expectedTimeline
                          }
                          onChange={(e) =>
                            updateField(
                              "expectedTimeline",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. 3 Months"
                          className={inputClass}
                        />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field
                          label="Requirements"
                          hint="Optional"
                        >
                          <textarea
                            name="requirements"
                            value={
                              formData.requirements
                            }
                            onChange={(e) =>
                              updateField(
                                "requirements",
                                e.target.value,
                              )
                            }
                            rows={5}
                            placeholder="Describe the client's requirements..."
                            className={`${inputClass} resize-none`}
                          />
                        </Field>
                      </div>

                    </div>
                  </SectionCard>
                )}

                {/* =================================================
                    STEP 4
                ================================================= */}

                {currentStep === 4 && (
                  <SectionCard
                    title="Review & Submission"
                    description="Review the information before submitting the lead."
                    icon={Send}
                  >
                    <div className="py-4 sm:py-8">

                      <div
                        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl sm:mb-6 sm:h-20 sm:w-20"
                        style={{
                          background: `${GREEN}12`,
                          color: GREEN_DARK,
                        }}
                      >
                        <Check
                          size={32}
                          strokeWidth={2.5}
                        />
                      </div>

                      <div className="text-center">
                        <h3 className="mb-2 text-xl font-black text-slate-900 sm:text-2xl dark:text-white">
                          Ready to Submit
                        </h3>

                        <p className="mx-auto max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                          Please review the important
                          details below. Optional fields
                          can be left empty.
                        </p>
                      </div>

                      <div className="mt-7 overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03]">

                        <ReviewRow
                          label="Client"
                          value={
                            formData.full_name
                          }
                        />

                        <ReviewRow
                          label="Email"
                          value={
                            formData.email
                          }
                        />

                        <ReviewRow
                          label="Phone"
                          value={`${formData.phone_code} ${formData.phone}`}
                        />

                        <ReviewRow
                          label="Company"
                          value={
                            formData.companyName
                          }
                        />

                        <ReviewRow
                          label="Product"
                          value={
                            formData.productName
                          }
                        />

                        <ReviewRow
                          label="Location"
                          value={
                            formData.city &&
                            formData.state
                              ? `${formData.city}, ${formData.state}`
                              : "Not provided"
                          }
                          last
                        />

                      </div>

                      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/60">
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <p className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
                          Your information is securely
                          stored and used only for lead
                          registration purposes.
                        </p>
                      </div>

                    </div>
                  </SectionCard>
                )}

                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-7 sm:flex-row sm:items-center sm:justify-between">

                  <Button
                    variant="outline"
                    type="button"
                    onClick={previousStep}
                    disabled={
                      currentStep === 1 ||
                      isSubmitting
                    }
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 sm:w-auto sm:px-6"
                  >
                    <ChevronLeft
                      size={17}
                      className="transition-transform group-hover:-translate-x-1"
                    />

                    Previous
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 sm:w-auto sm:px-7"
                      style={{
                        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                        boxShadow:
                          "0 12px 25px rgba(16,185,129,.22)",
                      }}
                    >
                      Next Step

                      <ChevronRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-7"
                      style={{
                        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                        boxShadow:
                          "0 12px 25px rgba(16,185,129,.22)",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />

                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Registration

                          <Send
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </Button>
                  )}

                </div>

                {/* BOTTOM INFO */}

                <div className="mt-6 text-center sm:mt-8">
                  <p className="text-[11px] font-medium leading-5 text-slate-400 dark:text-slate-500">
                    Fields marked with{" "}
                    <span className="font-black text-red-500">
                      *
                    </span>{" "}
                    are required. Other fields are
                    optional.
                  </p>
                </div>

              </form>

              {/* SWITCH TO QUOTE */}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={openQuoteMode}
                  className="text-xs font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400"
                >
                  Want a project quotation instead?
                  <span className="ml-1 underline">
                    Get Quote
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Quote;