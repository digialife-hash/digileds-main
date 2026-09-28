import { Download, Eye, FileText, Plus, Printer, RefreshCw } from "lucide-react";
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
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getClientName = (client, invoice) => {
  if (client && typeof client !== "string") {
    return client.companyName || client.clientName || "Client";
  }
  return invoice?.clientSnapshot?.companyName || invoice?.clientSnapshot?.clientName || "Client";
};

const getServiceName = (invoice, fallbackServiceName) => {
  const serviceDetail = invoice?.serviceDetailId;
  if (serviceDetail && typeof serviceDetail !== "string") {
    return serviceDetail.serviceName || fallbackServiceName;
  }
  return fallbackServiceName || invoice?.serviceType || "Service";
};

const getProjectName = (project) => {
  if (!project) return "Not linked";
  if (typeof project === "string") return project;
  return project.projectName || "Project";
};

const getPaidAmount = (invoice) => Number(invoice?.advancePayment || 0);
const getTotalAmount = (invoice) => Number(invoice?.totalAmount || invoice?.amount || 0);
const getDueAmount = (invoice) =>
  Number(
    invoice?.balanceAmount ?? Math.max(0, getTotalAmount(invoice) - getPaidAmount(invoice))
  );

const BillingInvoicesSection = ({
  invoices = [],
  isLoading = false,
  errorMessage = "",
  onRetry,
  onCreateInvoice,
  onViewInvoice,
  serviceName = "Service",
  canCreate = false,
}) => {
  const summary = invoices.reduce(
    (totals, invoice) => {
      totals.totalInvoiced += getTotalAmount(invoice);
      totals.totalPaid += getPaidAmount(invoice);
      totals.totalPending += getDueAmount(invoice);
      return totals;
    },
    { totalInvoiced: 0, totalPaid: 0, totalPending: 0 }
  );

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-950">Billing & Invoices</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Invoice history connected with this service.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Invoiced", summary.totalInvoiced],
          ["Total Paid", summary.totalPaid],
          ["Pending", summary.totalPending],
          ["Invoices", invoices.length, false],
        ].map(([label, value, isMoney = true]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {isMoney ? formatCurrency(value) : value}
            </p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
          <RefreshCw className="mr-2 animate-spin" size={16} />
          Loading invoices...
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-center">
          <FileText size={26} className="text-slate-400" />
          <p className="mt-3 text-sm font-black text-slate-950">
            No invoices have been created for this service yet.
          </p>
          {canCreate && (
            <button
              type="button"
              onClick={onCreateInvoice}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              <Plus size={14} />
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Related Service</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Tax/GST</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Advance</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="align-top transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-black text-slate-950">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {invoice.invoiceDate || formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {getClientName(invoice.clientId, invoice)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {getServiceName(invoice, serviceName)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {getProjectName(invoice.projectId)}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-950">
                    {formatCurrency(getTotalAmount(invoice))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {invoice.taxExempt ? "Tax exempt" : `${Number(invoice.tax || 0)}%`}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">-</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {formatCurrency(invoice.advancePayment)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {formatCurrency(getPaidAmount(invoice))}
                  </td>
                  <td className="px-4 py-3 font-black text-blue-800">
                    {formatCurrency(getDueAmount(invoice))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">-</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                        statusBadgeClass[invoice.paymentStatus] || statusBadgeClass.pending
                      }`}
                    >
                      {formatLabel(invoice.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onViewInvoice?.(invoice)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openInvoicePrintView(invoice, "print")}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Printer size={13} />
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => openInvoicePrintView(invoice, "pdf")}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Download size={13} />
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default BillingInvoicesSection;
