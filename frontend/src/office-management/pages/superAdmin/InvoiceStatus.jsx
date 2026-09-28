import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  X,
  Receipt,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  User,
  Layers,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getInvoices } from "../../services/invoiceService";

const statusBadgeClass = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  overdue: "bg-red-50 text-red-700 ring-red-100",
};

const statusIcon = {
  pending: Clock,
  partially_paid: Wallet,
  paid: CheckCircle2,
  overdue: AlertCircle,
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

const formatDateTime12h = (value) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  const datePart = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
};

const getClient = (client) => (client && typeof client === "object" ? client : {});
const getServiceDetail = (detail) =>
  detail && typeof detail === "object" ? detail : {};
const getCreatedBy = (user) => (user && typeof user === "object" ? user : {});

const getAdvancePaymentsList = (invoice) => {
  if (Array.isArray(invoice.advancePayments) && invoice.advancePayments.length) {
    return invoice.advancePayments.map((payment, index) => ({
      id: payment._id || `advance-${index}`,
      amount: Number(payment.amount || 0),
      mode: payment.mode || "offline",
      receivedBy: payment.receivedBy || "",
      recordedAt: payment.recordedAt || payment.date || invoice.createdAt,
    }));
  }
  return [];
};

export default function InvoiceStatus() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const result = await getInvoices({ limit: 200 });
        setInvoices(result.data.invoices || []);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load invoices");
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return invoices;
    return invoices.filter((invoice) => {
      const client = getClient(invoice.clientId);
      return (
        invoice.invoiceNumber?.toLowerCase().includes(term) ||
        client.clientName?.toLowerCase().includes(term) ||
        client.companyName?.toLowerCase().includes(term)
      );
    });
  }, [invoices, searchTerm]);

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.totalBilled += Number(invoice.totalAmount || 0);
        acc.totalReceived += Number(invoice.totalAdvancePaid || 0);
        acc.totalDue += Number(
          invoice.balanceAmount ??
            Number(invoice.totalAmount || 0) - Number(invoice.totalAdvancePaid || 0),
        );
        return acc;
      },
      { totalBilled: 0, totalReceived: 0, totalDue: 0 },
    );
  }, [invoices]);

  const closeDetail = () => setSelectedInvoice(null);

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Billing
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Invoice Status
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Overview of all generated invoices and their payment status.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Total Invoices
          </p>
          <p className="mt-1 text-xl font-black text-slate-950">
            {invoices.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Total Billed
          </p>
          <p className="mt-1 text-xl font-black text-slate-950">
            {formatCurrency(stats.totalBilled)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Total Received
          </p>
          <p className="mt-1 text-xl font-black text-emerald-800">
            {formatCurrency(stats.totalReceived)}
          </p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            Total Due
          </p>
          <p className="mt-1 text-xl font-black text-blue-800">
            {formatCurrency(stats.totalDue)}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by invoice number, client or company"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white text-center">
          <FileText size={28} className="text-slate-400" />
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No invoices found
          </h2>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filteredInvoices.map((invoice) => {
              const client = getClient(invoice.clientId);
              const StatusIcon = statusIcon[invoice.paymentStatus] || Clock;
              const dueAmount =
                invoice.balanceAmount ??
                Number(invoice.totalAmount || 0) -
                  Number(invoice.totalAdvancePaid || 0);
              return (
                <button
                  key={invoice._id}
                  type="button"
                  onClick={() => setSelectedInvoice(invoice)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                      {client.companyName || client.clientName || "Client"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ring-1 ${
                          statusBadgeClass[invoice.paymentStatus] ||
                          statusBadgeClass.pending
                        }`}
                      >
                        <StatusIcon size={11} />
                        {formatLabel(invoice.paymentStatus)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-slate-950">
                      {formatCurrency(invoice.totalAmount)}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-blue-700">
                      Due {formatCurrency(Math.max(0, dueAmount))}
                    </p>
                    <ChevronRight
                      size={16}
                      className="ml-auto mt-1 text-slate-300"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Paid Payment</th>
                  <th className="px-5 py-4">Due Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => {
                  const client = getClient(invoice.clientId);
                  const StatusIcon = statusIcon[invoice.paymentStatus] || Clock;
                  const dueAmount =
                    invoice.balanceAmount ??
                    Number(invoice.totalAmount || 0) -
                      Number(invoice.totalAdvancePaid || 0);
                  return (
                    <tr
                      key={invoice._id}
                      onClick={() => setSelectedInvoice(invoice)}
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-black text-slate-950">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Created {formatDate(invoice.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {client.companyName || "Client"}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                          {client.clientName || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-sm font-black text-slate-900">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-5 py-4 align-top text-sm font-black text-emerald-700">
                        {formatCurrency(invoice.totalAdvancePaid || 0)}
                      </td>
                      <td className="px-5 py-4 align-top text-sm font-black text-blue-800">
                        {formatCurrency(Math.max(0, dueAmount))}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                            statusBadgeClass[invoice.paymentStatus] ||
                            statusBadgeClass.pending
                          }`}
                        >
                          <StatusIcon size={12} />
                          {formatLabel(invoice.paymentStatus)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={closeDetail} />
      )}
    </section>
  );
}

function InvoiceDetailModal({ invoice, onClose }) {
  const client = getClient(invoice.clientId);
  const createdBy = getCreatedBy(invoice.createdBy);
  const serviceDetail = getServiceDetail(invoice.serviceDetailId);
  const advancePayments = getAdvancePaymentsList(invoice);
  const StatusIcon = statusIcon[invoice.paymentStatus] || Clock;
  const dueAmount =
    invoice.balanceAmount ??
    Number(invoice.totalAmount || 0) - Number(invoice.totalAdvancePaid || 0);
  const showTax = Number(invoice.tax || 0) !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Invoice Details
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {invoice.invoiceNumber}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {invoice.invoiceDate} · {invoice.invoiceTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                statusBadgeClass[invoice.paymentStatus] ||
                statusBadgeClass.pending
              }`}
            >
              <StatusIcon size={12} />
              {formatLabel(invoice.paymentStatus)}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
          {/* Client info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Building2 size={13} />
              Client
            </p>
            <p className="text-sm font-black text-slate-950">
              {client.companyName || "N/A"}
            </p>
            <div className="mt-2 grid gap-1.5 text-xs font-semibold text-slate-600 sm:grid-cols-2">
              <p className="flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                {client.clientName || "N/A"}
              </p>
              {client.status && (
                <p className="flex items-center gap-1.5 capitalize">
                  <Layers size={13} className="text-slate-400" />
                  {formatLabel(client.status)}
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                {client.email || "N/A"}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                {client.phone || "N/A"}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Service Type
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {serviceDetail.serviceType
                  ? formatLabel(serviceDetail.serviceType)
                  : "Not linked"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Generated By
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {createdBy.name || "System"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Receipt size={13} />
              Items
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              {(invoice.items || []).map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <span className="font-semibold text-slate-700">
                    {item.description || "—"}
                  </span>
                  <span className="shrink-0 font-black text-slate-950">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advance payments */}
          {advancePayments.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Wallet size={13} />
                Advance Payments
              </p>
              <div className="space-y-1.5">
                {advancePayments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    <span className="truncate">
                      #{index + 1} {formatCurrency(payment.amount)} ·{" "}
                      {formatLabel(payment.mode)}
                      {payment.receivedBy ? ` · ${payment.receivedBy}` : ""}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatDateTime12h(payment.recordedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment summary */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Total Amount
              </p>
              <p className="mt-1 font-black text-slate-950">
                {formatCurrency(invoice.totalAmount)}
              </p>
            </div>
            {showTax && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Tax
                </p>
                <p className="mt-1 font-black text-slate-950">
                  {invoice.tax}%
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Advance Paid
              </p>
              <p className="mt-1 font-black text-emerald-700">
                {formatCurrency(invoice.totalAdvancePaid || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Balance Due
              </p>
              <p className="mt-1 font-black text-blue-800">
                {formatCurrency(Math.max(0, dueAmount))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}