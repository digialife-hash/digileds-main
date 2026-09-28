import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import {
  createInvoice,
  getMyEmployeeBills,
  getMyEmployeeInvoiceOptions,
} from "../../services/invoiceService";
import { ROUTES } from "../../routes/routeConstants";
import { openInvoicePrintView } from "../../utils/invoicePrint";

const statusBadgeClass = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  overdue: "bg-red-50 text-red-700 ring-red-100",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getProjectName = (project) => {
  if (!project) return "Project";
  if (typeof project === "string") return project;
  return project.projectName || "Project";
};

const getClientName = (client) => {
  if (!client) return "Client";
  if (typeof client === "string") return client;
  return client.companyName || client.clientName || "Client";
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getGeneratedBy = (user) => {
  if (!user) return "System";
  if (typeof user === "string") return user;
  return `${user.name || "User"}${user.role ? ` (${formatLabel(user.role)})` : ""}`;
};

const defaultFormData = {
  clientId: "",
  projectId: "",
  items: [{ description: "", amount: "" }],
  tax: "",
  paymentStatus: "pending",
  dueDate: "",
  paidDate: "",
};

const EmployeeBills = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProjects = formData.clientId
    ? projects.filter((project) => getId(project.clientId) === formData.clientId)
    : projects;
  const clientOptions = useMemo(
    () => [
      ["", "Select client"],
      ...clients.map((client) => [client._id, getClientName(client)]),
    ],
    [clients]
  );
  const projectOptions = useMemo(
    () => [
      ["", "Select project"],
      ...filteredProjects.map((project) => [project._id, project.projectName]),
    ],
    [filteredProjects]
  );
  const paymentStatusOptions = useMemo(
    () => Object.keys(statusBadgeClass).map((status) => [status, formatLabel(status)]),
    []
  );

  const invoiceAmount = formData.items.reduce((total, item) => {
    const amount = Number(item.amount || 0);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const taxPercentage = Number(formData.tax || 0);
  const taxAmount = Number.isFinite(taxPercentage)
    ? (invoiceAmount * taxPercentage) / 100
    : 0;
  const totalAmount = invoiceAmount + taxAmount;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const [billResult, optionResult] = await Promise.all([
        getMyEmployeeBills({ limit: 100 }),
        getMyEmployeeInvoiceOptions(),
      ]);
      setInvoices(billResult.data.invoices || []);
      setClients(optionResult.data.clients || []);
      setProjects(optionResult.data.projects || []);
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
    void fetchData();
  }, [navigate]);

  const updateItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { description: "", amount: "" }],
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await createInvoice({
        ...formData,
        tax: Number(formData.tax || 0),
        items: formData.items.map((item) => ({
          description: item.description,
          amount: Number(item.amount || 0),
        })),
        paidDate: formData.paidDate || undefined,
      });

      setIsModalOpen(false);
      setFormData(defaultFormData);
      setSuccessMessage("Invoice generated successfully");
      await fetchData();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.EMPLOYEE_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Project billing
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Bills
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData(defaultFormData);
            setSuccessMessage("");
            setErrorMessage("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Generate Invoice
        </button>
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

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white text-center">
          <FileText size={28} className="text-slate-400" />
          <h2 className="mt-4 text-lg font-black text-slate-950">No bills found</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bills for your assigned projects will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {invoices.map((invoice) => (
            <article
              key={invoice._id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-blue-700">
                    {invoice.invoiceNumber}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                    {getProjectName(invoice.projectId)}
                  </h2>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                    statusBadgeClass[invoice.paymentStatus] || statusBadgeClass.pending
                  }`}
                >
                  {formatLabel(invoice.paymentStatus)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Due Date
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-black text-slate-950">
                    <CalendarDays size={14} />
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Client
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {getClientName(invoice.clientId)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Generated By
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {getGeneratedBy(invoice.createdBy)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => openInvoicePrintView(invoice, "print")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => openInvoicePrintView(invoice, "pdf")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={16} />
                  Save PDF
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Employee Invoice
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Generate Invoice
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Client</span>
                  <SelectDropdown
                    value={formData.clientId}
                    options={clientOptions}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        clientId: event.target.value,
                        projectId: "",
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Project</span>
                  <SelectDropdown
                    value={formData.projectId}
                    options={projectOptions}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        projectId: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">Items / Services</span>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm font-bold text-blue-700 transition hover:text-blue-900"
                    >
                      Add item
                    </button>
                  </div>
                  <div className="mt-2 space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid gap-3 sm:grid-cols-[1fr_180px_44px]">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(event) => updateItem(index, "description", event.target.value)}
                          placeholder="Service description"
                          className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(event) => updateItem(index, "amount", event.target.value)}
                          placeholder="Amount"
                          className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-3 text-red-700 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Tax (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, tax: event.target.value }))
                    }
                    placeholder="18"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Payment Status</span>
                  <SelectDropdown
                    value={formData.paymentStatus}
                    options={paymentStatusOptions}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        paymentStatus: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Due Date</span>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, dueDate: event.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Paid Date</span>
                  <input
                    type="date"
                    value={formData.paidDate}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, paidDate: event.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Amount</p>
                  <p className="mt-1 font-black text-slate-950">{formatCurrency(invoiceAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Tax</p>
                  <p className="mt-1 font-black text-slate-950">
                    {taxPercentage || 0}% ({formatCurrency(taxAmount)})
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Total</p>
                  <p className="mt-1 font-black text-slate-950">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={17} />
                {isSubmitting ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeeBills;
