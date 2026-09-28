import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Copy,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";

import {
  createClient,
  getClientById,
  updateClient,
} from "../../services/clientService";

import { ROUTES } from "../../routes/routeConstants";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
  clientName: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  businessCategory: "",
  taxType: "with_tax",
  gstNumber: "",
  status: "active",
  notes: "",
  password: "",
};

/* =========================================================
   REQUIRED FIELDS
========================================================= */

const requiredFields = [
  "clientName",
  "companyName",
  "email",
  "phone",
  "businessCategory",
];

/* =========================================================
   VALIDATION
========================================================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/* =========================================================
   OPTIONS
========================================================= */

const statusOptions = [
  ["active", "Active"],
  ["inactive", "Inactive"],
];

const taxTypeOptions = [
  ["with_tax", "With Tax"],
  ["without_tax", "Without Tax"],
];

/* =========================================================
   COMPONENT
========================================================= */

const ClientForm = ({
  clientId,
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const { id: routeClientId } = useParams();
  const navigate = useNavigate();

  const effectiveClientId =
    clientId || routeClientId;

  const isEditMode =
    Boolean(effectiveClientId);

  /* =======================================================
     STATE
  ======================================================= */

  const [formData, setFormData] =
    useState(initialFormData);

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [backendError, setBackendError] =
    useState("");

  const [isLoadingClient, setIsLoadingClient] =
    useState(isEditMode);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [createdCredentials, setCreatedCredentials] =
    useState(null);

  const [copied, setCopied] =
    useState(false);

  const pageTitle = isEditMode
    ? "Edit Client"
    : "Add Client";

  const isWithoutTax =
    formData.taxType === "without_tax";

  /* =======================================================
     FETCH CLIENT
  ======================================================= */

  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        ...initialFormData,
      });

      setFieldErrors({});
      setBackendError("");
      setIsLoadingClient(false);

      return;
    }

    const fetchClient = async () => {
      try {
        setIsLoadingClient(true);
        setBackendError("");

        const result =
          await getClientById(
            effectiveClientId,
          );

        const client =
          result?.data?.client || {};

        const hasTaxExempt =
          client.taxExempt === true ||
          client.taxExempt === "true";

        /*
         * Existing clients:
         *
         * taxExempt = true  -> without tax
         * taxExempt = false -> with tax
         *
         * Older clients without taxExempt:
         * GST present       -> with tax
         * GST absent        -> without tax
         */

        let taxType = "with_tax";

        if (hasTaxExempt) {
          taxType = "without_tax";
        } else if (
          client.taxExempt === false ||
          client.taxExempt === "false"
        ) {
          taxType = "with_tax";
        } else if (!client.gstNumber) {
          taxType = "without_tax";
        }

        setFormData({
          clientName:
            client.clientName || "",

          companyName:
            client.companyName || "",

          email:
            client.email || "",

          phone:
            client.phone || "",

          address:
            client.address || "",

          businessCategory:
            client.businessCategory || "",

          taxType,

          gstNumber:
            client.gstNumber || "",

          status:
            client.status || "active",

          notes:
            client.notes || "",

          password: "",
        });

      } catch (error) {
        if (error.status === 401) {
          navigate(
            ROUTES.LOGIN,
            { replace: true },
          );
          return;
        }

        if (error.status === 403) {
          navigate(
            ROUTES.UNAUTHORIZED,
            { replace: true },
          );
          return;
        }

        setBackendError(
          error?.message ||
            "Unable to load client.",
        );
      } finally {
        setIsLoadingClient(false);
      }
    };

    void fetchClient();
  }, [
    effectiveClientId,
    isEditMode,
    navigate,
  ]);

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm = () => {
    const errors = {};

    requiredFields.forEach(
      (field) => {
        if (
          !String(
            formData[field] || "",
          ).trim()
        ) {
          errors[field] =
            "This field is required";
        }
      },
    );

    /* ---------------------------------------------
       EMAIL
    --------------------------------------------- */

    const email =
      String(
        formData.email || "",
      ).trim();

    if (
      email &&
      !emailRegex.test(email)
    ) {
      errors.email =
        "Enter a valid email address";
    }

    /* ---------------------------------------------
       PHONE
    --------------------------------------------- */

    const phone =
      String(
        formData.phone || "",
      ).trim();

    if (
      phone &&
      !/^\d{10}$/.test(phone)
    ) {
      errors.phone =
        "Enter a valid 10-digit phone number";
    }

    /* ---------------------------------------------
       GST
       ONLY REQUIRED/VALIDATED FOR WITH TAX
    --------------------------------------------- */

    const gstNumber =
      String(
        formData.gstNumber || "",
      )
        .trim()
        .toUpperCase();

    if (
      formData.taxType === "with_tax" &&
      gstNumber &&
      !gstRegex.test(gstNumber)
    ) {
      errors.gstNumber =
        "Enter a valid GST number";
    }

    /* ---------------------------------------------
       PASSWORD
       CREATE ONLY
    --------------------------------------------- */

    if (
      !isEditMode &&
      String(
        formData.password || "",
      ).trim()
    ) {
      const password =
        String(
          formData.password || "",
        ).trim();

      if (
        !strongPasswordRegex.test(
          password,
        )
      ) {
        errors.password =
          "Password must be 8+ chars with uppercase, lowercase, number and symbol";
      }
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  /* =======================================================
     HANDLE CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    /*
     * When user selects WITHOUT TAX:
     *
     * - Clear GST
     * - Remove GST validation error
     */
    if (
      name === "taxType" &&
      value === "without_tax"
    ) {
      setFormData(
        (current) => ({
          ...current,
          taxType: value,
          gstNumber: "",
        }),
      );

      setFieldErrors(
        (current) => ({
          ...current,
          taxType: "",
          gstNumber: "",
        }),
      );

      return;
    }

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

    if (fieldErrors[name]) {
      setFieldErrors(
        (current) => ({
          ...current,
          [name]: "",
        }),
      );
    }
  };

  /* =======================================================
     BUILD PAYLOAD
  ======================================================= */

  const buildPayload = () => {
    const payload = {
      clientName:
        String(
          formData.clientName || "",
        ).trim(),

      companyName:
        String(
          formData.companyName || "",
        ).trim(),

      email:
        String(
          formData.email || "",
        )
          .trim()
          .toLowerCase(),

      phone:
        String(
          formData.phone || "",
        ).trim(),

      address:
        String(
          formData.address || "",
        ).trim(),

      businessCategory:
        String(
          formData.businessCategory || "",
        ).trim(),

      status:
        formData.status || "active",

      notes:
        String(
          formData.notes || "",
        ).trim(),

      /*
       * Backend-friendly tax flag.
       *
       * with_tax    -> false
       * without_tax -> true
       */
      taxExempt:
        formData.taxType ===
        "without_tax",
    };

    /* ---------------------------------------------
       GST NUMBER
    --------------------------------------------- */

    if (
      formData.taxType ===
      "with_tax"
    ) {
      const gstNumber =
        String(
          formData.gstNumber || "",
        )
          .trim()
          .toUpperCase();

      if (gstNumber) {
        payload.gstNumber =
          gstNumber;
      }
    }

    /*
     * WITHOUT TAX:
     * GST is completely removed.
     */
    if (
      formData.taxType ===
      "without_tax"
    ) {
      delete payload.gstNumber;
    }

    /* ---------------------------------------------
       PASSWORD
    --------------------------------------------- */

    /*
     * Never send password on edit.
     * On create, send only when admin entered one.
     */
    if (
      isEditMode ||
      !String(
        formData.password || "",
      ).trim()
    ) {
      return payload;
    }

    payload.password =
      String(
        formData.password || "",
      ).trim();

    return payload;
  };

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate(
      ROUTES.SUPER_ADMIN_CLIENTS,
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setBackendError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload =
        buildPayload();

      /* ---------------------------------------------
         UPDATE
      --------------------------------------------- */

      if (isEditMode) {
        await updateClient(
          effectiveClientId,
          payload,
        );

        if (onSuccess) {
          onSuccess();
          return;
        }

        navigate(
          ROUTES.SUPER_ADMIN_CLIENTS,
          {
            replace: true,
          },
        );

        return;
      }

      /* ---------------------------------------------
         CREATE
      --------------------------------------------- */

      const result =
        await createClient(
          payload,
        );

      const generatedPassword =
        result?.data
          ?.generatedPassword;

      /*
       * Backend auto-generated password.
       */
      if (generatedPassword) {
        setCreatedCredentials({
          email:
            String(
              formData.email || "",
            )
              .trim()
              .toLowerCase(),

          password:
            generatedPassword,
        });

        return;
      }

      if (onSuccess) {
        onSuccess();
        return;
      }

      navigate(
        ROUTES.SUPER_ADMIN_CLIENTS,
        {
          replace: true,
        },
      );
    } catch (error) {
      if (error.status === 401) {
        navigate(
          ROUTES.LOGIN,
          {
            replace: true,
          },
        );
        return;
      }

      if (error.status === 403) {
        navigate(
          ROUTES.UNAUTHORIZED,
          {
            replace: true,
          },
        );
        return;
      }

      setBackendError(
        error?.message ||
          "Unable to save client.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     CREDENTIALS DONE
  ======================================================= */

  const handleCredentialsDone = () => {
    setCreatedCredentials(null);

    if (onSuccess) {
      onSuccess();
      return;
    }

    navigate(
      ROUTES.SUPER_ADMIN_CLIENTS,
      {
        replace: true,
      },
    );
  };

  /* =======================================================
     COPY PASSWORD
  ======================================================= */

  const handleCopyPassword =
    async () => {
      if (!createdCredentials) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          createdCredentials.password,
        );

        setCopied(true);

        setTimeout(
          () => {
            setCopied(false);
          },
          2000,
        );
      } catch {
        /*
         * Clipboard may be unavailable.
         */
      }
    };

  /* =======================================================
     GENERIC INPUT
  ======================================================= */

  const renderInput = ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
  }) => (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}
            *
          </span>
        )}
      </span>

      {name === "phone" ? (
        <PhoneInput
          name={name}
          value={formData[name]}
          onChange={handleChange}
          error={fieldErrors[name]}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
            fieldErrors[name]
              ? "border-red-300 focus:border-red-300 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
          }`}
        />
      )}

      {fieldErrors[name] && (
        <p className="mt-1 text-xs font-semibold text-red-600">
          {fieldErrors[name]}
        </p>
      )}
    </label>
  );

  /* =======================================================
     PASSWORD INPUT
  ======================================================= */

  const renderPasswordInput =
    () => (
      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">
          Password

          <span className="ml-1 text-xs font-semibold text-slate-400">
            (optional — leave blank to auto-generate)
          </span>
        </span>

        <div className="relative mt-2">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Set a login password or leave blank"
            autoComplete="new-password"
            className={`h-11 w-full rounded-lg border bg-white px-3 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              fieldErrors.password
                ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
            }`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            tabIndex={-1}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}
          </button>
        </div>

        {fieldErrors.password ? (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {fieldErrors.password}
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">
            8+ characters with uppercase, lowercase, number and symbol.
          </p>
        )}
      </label>
    );

  /* =======================================================
     TAX SELECT
  ======================================================= */

  const renderTaxType = () => (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        Tax Type
      </span>

      <SelectDropdown
        name="taxType"
        value={formData.taxType}
        onChange={handleChange}
        options={taxTypeOptions}
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      />

      <p className="mt-1.5 text-xs text-slate-400">
        {isWithoutTax
          ? "GST will not be used for this client."
          : "GST can be added for this client."}
      </p>

      {fieldErrors.taxType && (
        <p className="mt-1 text-xs font-semibold text-red-600">
          {fieldErrors.taxType}
        </p>
      )}
    </label>
  );

  /* =======================================================
     CREDENTIALS SCREEN
  ======================================================= */

  if (createdCredentials) {
    return (
      <div className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Client Management
            </p>

            <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              Client Created
            </h1>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="mx-auto max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
            <ShieldCheck
              size={28}
              className="mx-auto text-emerald-600"
            />

            <h2 className="mt-3 text-base font-black text-slate-950">
              Save these login credentials
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              A password was auto-generated for this client. Share it with them securely — it won't be shown again.
            </p>

            <div className="mt-4 space-y-3 text-left">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                  {createdCredentials.email}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Password
                </p>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="break-all font-mono text-sm font-bold text-slate-900">
                    {createdCredentials.password}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleCopyPassword
                    }
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Copy size={13} />

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleCredentialsDone
              }
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     FORM CONTENT
  ======================================================= */

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-col"
    >
      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Client Management
          </p>

          <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
            {pageTitle}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close client form"
        >
          <X size={20} />
        </button>
      </div>

      {/* ================================================
          LOADING
      ================================================= */}

      {isLoadingClient ? (
        <div className="flex min-h-80 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* ============================================
              FORM BODY
          ============================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {backendError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {backendError}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {/* -----------------------------------------
                  CLIENT NAME
              ----------------------------------------- */}

              {renderInput({
                label: "Client Name",
                name: "clientName",
                placeholder: "Rahul Sharma",
                required: true,
              })}

              {/* -----------------------------------------
                  COMPANY NAME
              ----------------------------------------- */}

              {renderInput({
                label: "Company Name",
                name: "companyName",
                placeholder:
                  "Sharma Tech Solutions",
                required: true,
              })}

              {/* -----------------------------------------
                  EMAIL
              ----------------------------------------- */}

              {renderInput({
                label: "Email",
                name: "email",
                type: "email",
                placeholder:
                  "rahul@company.com",
                required: true,
              })}

              {/* -----------------------------------------
                  PHONE
              ----------------------------------------- */}

              {renderInput({
                label: "Phone",
                name: "phone",
                placeholder:
                  "9876543210",
                required: true,
              })}

              {/* -----------------------------------------
                  BUSINESS CATEGORY
              ----------------------------------------- */}

              {renderInput({
                label:
                  "Business Category",
                name: "businessCategory",
                placeholder:
                  "IT Services",
                required: true,
              })}

              {/* -----------------------------------------
                  TAX TYPE
              ----------------------------------------- */}

              {renderTaxType()}

              {/* -----------------------------------------
                  GST NUMBER
                  ONLY WITH TAX
              ----------------------------------------- */}

              {!isWithoutTax &&
                renderInput({
                  label: "GST Number",
                  name: "gstNumber",
                  placeholder:
                    "27ABCDE1234F1Z5",
                })}

              {/* -----------------------------------------
                  STATUS
              ----------------------------------------- */}

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Status
                </span>

                <SelectDropdown
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={
                    statusOptions
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Inactive clients can remain in the system without being treated as active.
                </p>
              </label>

              {/* -----------------------------------------
                  PASSWORD
                  CREATE ONLY
              ----------------------------------------- */}

              {!isEditMode &&
                renderPasswordInput()}

              {/* -----------------------------------------
                  ADDRESS
              ----------------------------------------- */}

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">
                  Address
                </span>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={
                    handleChange
                  }
                  rows={3}
                  placeholder="Client address"
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              {/* -----------------------------------------
                  NOTES
              ----------------------------------------- */}

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">
                  Notes
                </span>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Internal notes for this client"
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>

          {/* ============================================
              FOOTER ACTIONS
          ============================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={17} />

              {isSubmitting
                ? "Saving..."
                : "Save Client"}
            </button>
          </div>
        </>
      )}
    </form>
  );

  /* =======================================================
     MODAL
  ======================================================= */

  if (isModal) {
    return formContent;
  }

  /* =======================================================
     FULL PAGE
  ======================================================= */

  return (
    <section className="h-full overflow-y-auto pb-8">
      <PageBackButton
        fallbackPath={
          ROUTES.SUPER_ADMIN_CLIENTS
        }
        className="mb-6"
      />

      <div className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white shadow-sm">
        {formContent}
      </div>
    </section>
  );
};

export default ClientForm;