import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus, Send, Trash2, UploadCloud } from "lucide-react";
import PageBackButton from "../../components/common/PageBackButton";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";
import { createServiceRequest } from "../../services/serviceRequestService";
import { ROUTES } from "../../routes/routeConstants";
import { useAuth } from "../../context/authStore";

const initialFormData = {
  clientPhone: "",
  companyName: "",
  address: "",
  gstNumber: "",
  serviceRequired: "",
  projectTitle: "",
  projectDescription: "",
  budgetRange: "",
  deadline: "",
  priority: "medium",
  category: "",
};

const requiredFields = [
  "clientPhone",
  "companyName",
  "serviceRequired",
  "projectTitle",
  "projectDescription",
  "category",
];

const priorityOptions = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const ClientSubmitService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [referenceLinks, setReferenceLinks] = useState([""]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      clientPhone: user?.phone || "",
    }));
  }, [user?.phone]);

  const validateForm = () => {
    const errors = {};

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        errors[field] = "This field is required";
      }
    });

    if (formData.deadline) {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.deadline = "Deadline cannot be in the past";
      }
    }

    const phone = formData.clientPhone.trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.clientPhone = "Enter a valid 10-digit phone number";
    }

    const gstNumber = formData.gstNumber.trim().toUpperCase();
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstNumber)) {
      errors.gstNumber = "Enter a valid GST number";
    }

    referenceLinks.forEach((link, index) => {
      if (!link.trim()) return;

      try {
        new URL(link);
      } catch {
        errors[`referenceLinks.${index}`] = "Enter a valid URL";
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const updateReferenceLink = (index, value) => {
    setReferenceLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index ? value : link
      )
    );

    const errorKey = `referenceLinks.${index}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((current) => ({
        ...current,
        [errorKey]: "",
      }));
    }
  };

  const addReferenceLink = () => {
    setReferenceLinks((current) => [...current, ""]);
  };

  const removeReferenceLink = (index) => {
    setReferenceLinks((current) =>
      current.length === 1
        ? [""]
        : current.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const buildPayload = () => ({
    ...formData,
    serviceRequired: formData.serviceRequired.trim(),
    clientPhone: formData.clientPhone.trim(),
    companyName: formData.companyName.trim(),
    address: formData.address.trim(),
    gstNumber: formData.gstNumber.trim().toUpperCase(),
    projectTitle: formData.projectTitle.trim(),
    projectDescription: formData.projectDescription.trim(),
    budgetRange: formData.budgetRange.trim(),
    category: formData.category.trim(),
    referenceLinks: referenceLinks.map((link) => link.trim()).filter(Boolean),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBackendError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await createServiceRequest(buildPayload());

      setSuccessMessage("Service request submitted successfully.");
      window.setTimeout(() => {
        navigate(ROUTES.CLIENT_REQUESTS);
      }, 900);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setBackendError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {required && <span className="text-red-500"> *</span>}
      </span>
      {name === "clientPhone" ? (
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

  return (
    <section className="h-full overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.CLIENT_DASHBOARD} className="mb-6" />
      <div className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Service Request
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Submit a Project Requirement
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Share your requirement with the team. Your identity is taken from your
          secure login session, so no client ID is needed here.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">
            Requirement Details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep the description clear so the team can review it quickly.
          </p>
        </div>

        <div className="space-y-5 p-5">
          {backendError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {backendError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Client Name
              </span>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Client Email
              </span>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-500 outline-none"
              />
            </label>

            {renderInput({
              label: "Client Phone",
              name: "clientPhone",
              placeholder: "9876543210",
              required: true,
            })}

            {renderInput({
              label: "Company Name",
              name: "companyName",
              placeholder: "Sharma Tech Solutions",
              required: true,
            })}

            {renderInput({
              label: "GST Number",
              name: "gstNumber",
              placeholder: "27ABCDE1234F1Z5",
            })}

            {renderInput({
              label: "Service Required",
              name: "serviceRequired",
              placeholder: "Website Development",
              required: true,
            })}

            {renderInput({
              label: "Project Title",
              name: "projectTitle",
              placeholder: "Company Portfolio Website",
              required: true,
            })}

            {renderInput({
              label: "Budget Range",
              name: "budgetRange",
              placeholder: "50000-100000",
            })}

            {renderInput({
              label: "Deadline",
              name: "deadline",
              type: "date",
            })}

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Priority</span>
              <SelectDropdown
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {renderInput({
              label: "Category",
              name: "category",
              placeholder: "Web Development",
              required: true,
            })}
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Address</span>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Company address"
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Project Description <span className="text-red-500">*</span>
            </span>
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Describe goals, pages, features, integrations, design references, and any business constraints."
              className={`mt-2 w-full resize-none rounded-lg border bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                fieldErrors.projectDescription
                  ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
              }`}
            />
            {fieldErrors.projectDescription && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {fieldErrors.projectDescription}
              </p>
            )}
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Reference Links
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add websites, documents, or examples that help explain the request.
                </p>
              </div>
              <button
                type="button"
                onClick={addReferenceLink}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {referenceLinks.map((link, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="url"
                        value={link}
                        onChange={(event) =>
                          updateReferenceLink(index, event.target.value)
                        }
                        placeholder="https://example.com"
                        className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                          fieldErrors[`referenceLinks.${index}`]
                            ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReferenceLink(index)}
                      className="rounded-lg border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                      aria-label="Remove reference link"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  {fieldErrors[`referenceLinks.${index}`] && (
                    <p className="text-xs font-semibold text-red-600">
                      {fieldErrors[`referenceLinks.${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <UploadCloud size={23} />
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-900">
              Attachments coming soon
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              File upload support will be added here later. For now, use reference links.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLIENT_REQUESTS)}
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
            <Send size={17} />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ClientSubmitService;
