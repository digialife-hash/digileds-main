import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  FolderKanban,
  Link2,
  Mail,
  MessageSquare,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import {
  convertServiceRequestToProject,
  deleteServiceRequest,
  getServiceRequestById,
  updateServiceRequestBySuperAdmin,
  updateServiceRequestStatus,
} from "../../services/serviceRequestService";
import { ROUTES } from "../../routes/routeConstants";

const statusSteps = [
  { key: "submitted", label: "Submitted" },
  { key: "reviewed", label: "Reviewed" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

const priorityOptions = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const nextStatusByCurrent = {
  submitted: "reviewed",
  reviewed: "approved",
  approved: "in_progress",
  in_progress: "completed",
  completed: "closed",
};

const statusBadgeClass = {
  submitted: "bg-sky-50 text-sky-700 ring-sky-100",
  reviewed: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-100",
  completed: "bg-green-50 text-green-700 ring-green-100",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const priorityBadgeClass = {
  low: "bg-slate-100 text-slate-600 ring-slate-200",
  medium: "bg-blue-50 text-blue-700 ring-blue-100",
  high: "bg-orange-50 text-orange-700 ring-orange-100",
  urgent: "bg-red-50 text-red-700 ring-red-100",
};

const timelineToneClass = {
  submitted: {
    active: "border-sky-200 bg-sky-50 text-sky-800",
    icon: "text-sky-600",
  },
  reviewed: {
    active: "border-indigo-200 bg-indigo-50 text-indigo-800",
    icon: "text-indigo-600",
  },
  approved: {
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "text-emerald-600",
  },
  in_progress: {
    active: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-600",
  },
  completed: {
    active: "border-green-200 bg-green-50 text-green-800",
    icon: "text-green-600",
  },
  closed: {
    active: "border-slate-300 bg-slate-100 text-slate-700",
    icon: "text-slate-600",
  },
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={15} />}
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-semibold text-slate-900">
      {value || "Not provided"}
    </p>
  </div>
);

const getProjectId = (projectId) => {
  if (!projectId) return "";
  if (typeof projectId === "string") return projectId;

  return projectId._id || "";
};

const SuperAdminServiceRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [editData, setEditData] = useState({
    clientName: "",
    clientEmail: "",
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editModalError, setEditModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isSuperAdmin = user?.role === "super_admin";

  const currentStatusIndex = useMemo(() => {
    return statusSteps.findIndex((step) => step.key === request?.status);
  }, [request?.status]);

  const statusHistoryByStatus = useMemo(() => {
    return (request?.statusHistory || []).reduce((history, event) => {
      history[event.status] = event;
      return history;
    }, {});
  }, [request?.statusHistory]);

  const nextStatus = request ? nextStatusByCurrent[request.status] : "";
  const nextStatusOptions = useMemo(
    () => [
      nextStatus
        ? [nextStatus, nextStatus.replace("_", " ")]
        : [request?.status || "", "No next status"],
    ],
    [nextStatus, request?.status]
  );

  const canConvert =
    isSuperAdmin &&
    request &&
    ["approved", "in_progress"].includes(request.status) &&
    !request.convertedToProject;

  const canDelete = isSuperAdmin && request && !request.convertedToProject;
  const linkedProjectId = getProjectId(request?.projectId);

  const fetchRequest = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");

      const result = await getServiceRequestById(id);
      const serviceRequest = result.data.serviceRequest;

      setRequest(serviceRequest);
      setSelectedStatus(nextStatusByCurrent[serviceRequest.status] || serviceRequest.status);
      setAdminRemarks(serviceRequest.adminRemarks || "");
      setEditData({
        clientName: serviceRequest.clientName || "",
        clientEmail: serviceRequest.clientEmail || "",
        clientPhone: serviceRequest.clientPhone || "",
        companyName: serviceRequest.companyName || "",
        address: serviceRequest.address || "",
        gstNumber: serviceRequest.gstNumber || "",
        serviceRequired: serviceRequest.serviceRequired || "",
        projectTitle: serviceRequest.projectTitle || "",
        projectDescription: serviceRequest.projectDescription || "",
        budgetRange: serviceRequest.budgetRange || "",
        deadline: serviceRequest.deadline
          ? serviceRequest.deadline.slice(0, 10)
          : "",
        priority: serviceRequest.priority || "medium",
        category: serviceRequest.category || "",
      });
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequest();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === request.status) return;

    try {
      setIsSavingStatus(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateServiceRequestStatus(id, {
        status: selectedStatus,
        adminRemarks,
      });

      setSuccessMessage("Status updated successfully.");
      await fetchRequest({ silent: true });
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveDetails = async () => {
    try {
      setIsSavingDetails(true);
      setErrorMessage("");
      setEditModalError("");
      setSuccessMessage("");

      await updateServiceRequestBySuperAdmin(id, {
        ...editData,
        adminRemarks,
      });

      setSuccessMessage("Request details updated successfully.");
      setIsEditModalOpen(false);
      await fetchRequest({ silent: true });
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setEditModalError(error.message);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleConvertToProject = async () => {
    const shouldConvert = window.confirm(
      `Convert "${request.projectTitle}" into a project?`
    );

    if (!shouldConvert) return;

    try {
      setIsConverting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await convertServiceRequestToProject(id);

      setSuccessMessage("Request converted to project successfully.");
      await fetchRequest({ silent: true });
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `Delete "${request.projectTitle}"? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");

      await deleteServiceRequest(id);
      navigate(ROUTES.SUPER_ADMIN_SERVICE_REQUESTS, { replace: true });
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!request && errorMessage) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <FileText size={25} />
        </div>
        <h1 className="mt-4 text-xl font-black text-slate-950">
          Unable to load request
        </h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">{errorMessage}</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SUPER_ADMIN_SERVICE_REQUESTS)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Requests
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Service Request Details
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {request.projectTitle}
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_SERVICE_REQUESTS)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          {!request.convertedToProject && (
            <button
              type="button"
              onClick={() => {
                setEditModalError("");
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              <Edit3 size={17} />
              Edit Request
            </button>
          )}

          {canConvert && (
            <button
              type="button"
              onClick={handleConvertToProject}
              disabled={isConverting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FolderKanban size={17} />
              {isConverting ? "Converting..." : "Convert to Project"}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Trash2 size={17} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              {request.serviceRequired}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              {request.projectDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                statusBadgeClass[request.status] || statusBadgeClass.closed
              }`}
            >
              {request.status?.replace("_", " ")}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                priorityBadgeClass[request.priority] || priorityBadgeClass.medium
              }`}
            >
              {request.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Status Timeline</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const tone = timelineToneClass[step.key];
                const event = statusHistoryByStatus[step.key];
                const fallbackDate =
                  step.key === "submitted" && isCompleted ? request.createdAt : "";
                const eventDate = event?.changedAt || fallbackDate;

                return (
                  <div
                    key={step.key}
                    className={`rounded-lg border p-4 ${
                      isCompleted
                        ? tone.active
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={18}
                        className={isCompleted ? tone.icon : "text-slate-300"}
                      />
                      <span className="text-sm font-bold">{step.label}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold opacity-80">
                      {isCompleted
                        ? formatDateTime(eventDate) || "Time unavailable"
                        : "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Category" value={request.category} icon={FolderKanban} />
            <DetailItem label="Budget Range" value={request.budgetRange} />
            <DetailItem label="Deadline" value={formatDate(request.deadline)} icon={CalendarDays} />
            <DetailItem label="Created At" value={formatDate(request.createdAt)} />
          </div>

          {request.referenceLinks?.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Reference Links</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {request.referenceLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Link2 size={16} className="shrink-0" />
                    <span className="truncate">{link}</span>
                    <ExternalLink size={15} className="ml-auto shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {request.convertedToProject && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                    Same Work Item
                  </p>
                  <h2 className="mt-1 text-lg font-black text-emerald-950">
                    This request is now tracked as a project
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-emerald-800">
                    The project page is the execution view for this same client requirement.
                  </p>
                </div>

                {linkedProjectId && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${ROUTES.SUPER_ADMIN_PROJECTS}/${linkedProjectId}`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    <FolderKanban size={17} />
                    View Project
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Client Info</h2>
            <div className="mt-4 space-y-3">
              <DetailItem label="Client Name" value={request.clientName} icon={User} />
              <DetailItem label="Client Email" value={request.clientEmail} icon={Mail} />
              <DetailItem label="Client Phone" value={request.clientPhone} />
              <DetailItem label="Company Name" value={request.companyName} />
              <DetailItem label="GST Number" value={request.gstNumber} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">User Review</h2>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-slate-700">Next Status</span>
              <SelectDropdown
                value={selectedStatus}
                options={nextStatusOptions}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={!nextStatus}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-slate-700">
                User Remarks
              </span>
              <textarea
                value={adminRemarks}
                onChange={(event) => setAdminRemarks(event.target.value)}
                rows={5}
                placeholder="Add review notes or feedback for the client"
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={!nextStatus || isSavingStatus}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={17} />
              {isSavingStatus ? "Saving..." : "Update Status"}
            </button>

            {request.adminRemarks && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MessageSquare size={16} />
                  Current Remarks
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {request.adminRemarks}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Request Correction
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Edit Service Request
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fix missing or incorrect details before approval.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditModalError("");
                  setIsEditModalOpen(false);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close edit request modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {editModalError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {editModalError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["clientName", "Client Name"],
                  ["clientEmail", "Client Email"],
                  ["clientPhone", "Client Phone"],
                  ["companyName", "Company Name"],
                  ["gstNumber", "GST Number"],
                  ["serviceRequired", "Service Required"],
                  ["projectTitle", "Project Title"],
                  ["budgetRange", "Budget Range"],
                  ["deadline", "Deadline"],
                  ["category", "Category"],
                ].map(([name, label]) => (
                  <label key={name} className="block">
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>
                    {name === "clientPhone" ? (
                      <PhoneInput
                        name={name}
                        value={editData[name]}
                        onChange={handleEditChange}
                        placeholder={label}
                      />
                    ) : (
                      <input
                        type={name === "deadline" ? "date" : "text"}
                        name={name}
                        value={editData[name]}
                        onChange={handleEditChange}
                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      />
                    )}
                  </label>
                ))}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Priority</span>
                  <SelectDropdown
                    name="priority"
                    value={editData.priority}
                    options={priorityOptions}
                    onChange={handleEditChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Address
                  </span>
                  <textarea
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Project Description
                  </span>
                  <textarea
                    name="projectDescription"
                    value={editData.projectDescription}
                    onChange={handleEditChange}
                    rows={5}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditModalError("");
                  setIsEditModalOpen(false);
                }}
                disabled={isSavingDetails}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={isSavingDetails}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSavingDetails ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminServiceRequestDetails;
