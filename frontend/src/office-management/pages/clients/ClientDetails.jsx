import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  KeyRound,
  Receipt,
  Tag,
  Trash2,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { deleteClient, getClientById } from "../../services/clientService";
import { getProjects } from "../../services/projectService";
import { getAllFollowUpsApi } from "../../services/followUpService";
import { getAllQuotationsApi } from "../../services/quotationService";
import { getInvoices } from "../../services/invoiceService";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import ClientForm from "./ClientForm";

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
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

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Tab Data
  const [projects, setProjects] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const canDeleteClients = user?.role === "super_admin";
  const clientsRoute = ROUTES.SUPER_ADMIN_CLIENTS;

  const fetchClient = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);

      const result = await getClientById(id);
      setClient(result.data.client);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      if (error.status === 404) {
        setIsNotFound(true);
        return;
      }

      setErrorMessage(error.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    if (!id) return;
    setIsTabLoading(true);
    try {
      if (tab === "projects") {
        const res = await getProjects({ clientId: id });
        setProjects(res.data.projects || []);
      } else if (tab === "followups") {
        const res = await getAllFollowUpsApi({ clientId: id });
        setFollowUps(res.data.followUps || []);
      } else if (tab === "quotations") {
        const res = await getAllQuotationsApi({ clientId: id });
        setQuotations(res.data.quotations || []);
      } else if (tab === "invoices") {
        const res = await getInvoices({ clientId: id });
        setInvoices(res.data.invoices || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsTabLoading(false);
    }
  };

  useEffect(() => {
    void fetchClient();
  }, [id]);

  useEffect(() => {
    if (activeTab !== "info") {
      fetchTabData(activeTab);
    }
  }, [activeTab, id]);

  const handleDeleteClient = async () => {
    const shouldDelete = window.confirm(
      `Delete ${client.companyName}? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      await deleteClient(id);
      navigate(clientsRoute, { replace: true });
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

  if (isNotFound) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Building2 size={25} />
        </div>
        <h1 className="mt-4 text-xl font-black text-slate-950">Client not found</h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          The client may have been deleted or the link may be incorrect.
        </p>
        <button
          type="button"
          onClick={() => navigate(clientsRoute)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Clients
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Client Profile (CRM)
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {client.companyName}
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(clientsRoute)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to Clients
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <Edit3 size={17} />
            Edit
          </button>
          {canDeleteClients && (
            <button
              type="button"
              onClick={handleDeleteClient}
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

      {/* CRM Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 size={16} /> Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "projects"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BriefcaseBusiness size={16} /> Projects
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("followups")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "followups"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CalendarCheck size={16} /> Follow-ups
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quotations")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "quotations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText size={16} /> Quotations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "invoices"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Receipt size={16} /> Invoices
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-950">
                  {client.clientName}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                    statusBadgeClass[client.status] || statusBadgeClass.inactive
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Created {formatDate(client.createdAt)}
              </p>
            </div>
          </div>
       {console.log(client)}
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Company Name" value={client.companyName} icon={Building2} />
            <DetailItem label="Client Name" value={client.clientName} icon={Building2} />
            <DetailItem label="Email" value={client.email} icon={Mail} />
            <DetailItem label="Phone" value={client.phone} icon={Phone} />
            <DetailItem label="Password" value={client.phone} icon={KeyRound} />
            <DetailItem label="Business Category" value={client.businessCategory} icon={Tag} />
            <DetailItem label="GST Number" value={client.gstNumber} />
            <div className="md:col-span-2 xl:col-span-3">
              <DetailItem label="Address" value={client.address} icon={MapPin} />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <DetailItem label="Notes" value={client.notes} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4">Client Projects</h3>
          {isTabLoading ? (
            <LoadingSpinner />
          ) : projects.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400">No projects found for this client.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{p.projectName}</h4>
                    <p className="text-xs font-semibold text-slate-500">{p.category || "General"} • {p.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{formatCurrency(p.budget)}</p>
                    <p className="text-[10px] text-slate-400">Progress: {p.progressPercentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "followups" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4">Follow-up History</h3>
          {isTabLoading ? (
            <LoadingSpinner />
          ) : followUps.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400">No follow-ups recorded for this client.</p>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => (
                <div key={f._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{f.type} • {formatDate(f.followUpDate)}</h4>
                    <p className="text-xs font-semibold text-slate-500">{f.notes || "No notes"}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "quotations" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4">Quotations</h3>
          {isTabLoading ? (
            <LoadingSpinner />
          ) : quotations.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400">No quotations found for this client.</p>
          ) : (
            <div className="space-y-3">
              {quotations.map((q) => (
                <div key={q._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{q.quotationNumber}</h4>
                    <p className="text-xs font-semibold text-slate-500">Date: {formatDate(q.quotationDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{formatCurrency(q.totalAmount)}</p>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4">Invoices & Payments</h3>
          {isTabLoading ? (
            <LoadingSpinner />
          ) : invoices.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400">No invoices found for this client.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{inv.invoiceNumber}</h4>
                    <p className="text-xs font-semibold text-slate-500">Due: {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{formatCurrency(inv.totalAmount)}</p>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-700 capitalize">
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <ClientForm
              clientId={id}
              isModal
              onCancel={() => setIsEditModalOpen(false)}
              onSuccess={async () => {
                setIsEditModalOpen(false);
                await fetchClient({ silent: true });
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientDetails;
