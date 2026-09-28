import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FolderKanban, Receipt } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ROUTES } from "../../routes/routeConstants";
import { getClientProjectById } from "../../services/projectService";

const statusBadgeClass = {
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

const paymentBadgeClass = {
  not_generated: "bg-slate-100 text-slate-700 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  overdue: "bg-red-50 text-red-700 ring-red-100",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return "Not set";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 px-4 py-3">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-black capitalize text-slate-950">{value}</p>
  </div>
);

const ClientProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getClientProjectById(id);
      setProject(result.data.project);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <FolderKanban size={28} className="text-slate-400" />
        <h1 className="mt-4 text-xl font-black text-slate-950">
          Project not found
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {errorMessage || "This project is not available for your account."}
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.CLIENT_PROJECTS)}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </section>
    );
  }

  const invoice = project.latestInvoice;
  const paymentStatus = project.paymentStatus || "pending";
  const invoiceStatus = project.invoiceStatus || "not_generated";

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLIENT_PROJECTS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            My Project
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            {project.projectName}
          </h1>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
            statusBadgeClass[project.status] || statusBadgeClass.not_started
          }`}
        >
          {formatLabel(project.status)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Status" value={formatLabel(project.status)} />
        <DetailItem label="Deadline" value={formatDate(project.deadline)} />
        <DetailItem label="Payment Status" value={formatLabel(paymentStatus)} />
        <DetailItem label="Invoice Status" value={formatLabel(invoiceStatus)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Project Details</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {project.description || "No project description available."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
              <CalendarDays size={13} />
              {formatDate(project.deadline)}
            </span>
            {project.category && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {project.category}
              </span>
            )}
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-black text-slate-950">
            <Receipt size={19} />
            Invoice
          </div>
          {invoice ? (
            <div className="mt-4 space-y-3">
              <DetailItem label="Invoice Number" value={invoice.invoiceNumber} />
              <DetailItem label="Amount" value={formatCurrency(invoice.amount)} />
              <DetailItem label="Due Date" value={formatDate(invoice.dueDate)} />
              <DetailItem label="Paid Date" value={formatDate(invoice.paidDate)} />
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                  paymentBadgeClass[invoice.paymentStatus] ||
                  paymentBadgeClass.pending
                }`}
              >
                {formatLabel(invoice.paymentStatus)}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              No invoice has been generated for this project yet.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default ClientProjectDetails;
