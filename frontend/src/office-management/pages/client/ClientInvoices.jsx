// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   FileText,
//   FolderKanban,
//   Printer,
// } from "lucide-react";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import PageBackButton from "../../components/common/PageBackButton";
// import { getMyInvoices } from "../../services/invoiceService";
// import { ROUTES } from "../../routes/routeConstants";
// import { openInvoicePrintView } from "../../utils/invoicePrint";

// const statusBadgeClass = {
//   pending: "bg-amber-50 text-amber-700 ring-amber-100",
//   partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
//   paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
//   overdue: "bg-red-50 text-red-700 ring-red-100",
// };

// const formatLabel = (value = "") => value.replaceAll("_", " ");

// const formatCurrency = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(Number(value || 0));

// const formatDate = (value) => {
//   if (!value) return "Not available";
//   return new Intl.DateTimeFormat("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }).format(new Date(value));
// };


// const formatPlainDate = (value) => {
//   if (!value) return "";
//   const parsed = new Date(`${value}T00:00:00`);
//   if (Number.isNaN(parsed.getTime())) return value;
//   return new Intl.DateTimeFormat("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }).format(parsed);
// };

// const formatPlainTime = (value) => {
//   if (!value) return "";
//   const [hourStr, minute] = value.split(":");
//   const hour = Number(hourStr);
//   if (Number.isNaN(hour)) return value;
//   const period = hour >= 12 ? "PM" : "AM";
//   const hour12 = hour % 12 || 12;
//   return `${hour12}:${minute} ${period}`;
// };

// const paymentModeBadgeClass = {
//   online: "bg-indigo-50 text-indigo-700 ring-indigo-100",
//   offline: "bg-slate-100 text-slate-700 ring-slate-200",
// };
// const getProjectName = (project) => {
//   if (!project) return "Project";
//   if (typeof project === "string") return project;
//   return project.projectName || "Project";
// };

// const getGeneratedBy = (user) => {
//   if (!user) return "System";
//   if (typeof user === "string") return user;
//   return `${user.name || "User"}${user.role ? ` (${formatLabel(user.role)})` : ""}`;
// };

// const ClientInvoices = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [invoices, setInvoices] = useState([]);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 0,
//   });
//   const [page, setPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");

//   const fetchInvoices = async () => {
//     try {
//       setIsLoading(true);
//       setErrorMessage("");

//       const invoiceId = searchParams.get("invoiceId");
//       const result = await getMyInvoices({
//         page,
//         limit: invoiceId ? 100 : pagination.limit,
//       });
//       const list = result.data.invoices || [];
//       setInvoices(
//         invoiceId
//           ? [...list].sort((a, b) => (a._id === invoiceId ? -1 : b._id === invoiceId ? 1 : 0))
//           : list
//       );
//       setPagination(result.data.pagination || pagination);
//     } catch (error) {
//       if (error.status === 401) {
//         navigate(ROUTES.LOGIN, { replace: true });
//         return;
//       }
//       if (error.status === 403) {
//         navigate(ROUTES.UNAUTHORIZED, { replace: true });
//         return;
//       }
//       setErrorMessage(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchInvoices();
//   }, [page, searchParams]);

//   const goToPage = (nextPage) => {
//     if (nextPage < 1 || nextPage > pagination.totalPages) return;
//     setPage(nextPage);
//   };

//   return (
//     <section className="h-full space-y-6 overflow-y-auto pb-8">
//       <PageBackButton fallbackPath={ROUTES.CLIENT_DASHBOARD} />
//       <div className="border-b border-slate-200 pb-5">
//         <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
//           Billing
//         </p>
//         <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
//           Payment Status
//         </h1>
//       </div>

//       {errorMessage && (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
//           {errorMessage}
//         </div>
//       )}

//       {isLoading ? (
//         <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
//           <LoadingSpinner />
//         </div>
//       ) : invoices.length === 0 ? (
//         <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
//           <FileText size={28} className="text-slate-400" />
//           <h2 className="mt-4 text-lg font-black text-slate-950">
//             No invoices found
//           </h2>
//           <p className="mt-1 max-w-md text-sm text-slate-500">
//             Invoices generated for your projects will appear here.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="grid gap-4 xl:grid-cols-2">
//             {invoices.map((invoice) => (
//               <article
//                 key={invoice._id}
//                 className={`rounded-lg border bg-white p-5 shadow-sm ${
//                   searchParams.get("invoiceId") === invoice._id
//                     ? "border-blue-400 ring-2 ring-blue-100"
//                     : "border-slate-200"
//                 }`}
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
//                       {invoice.invoiceNumber}
//                     </p>
//                     <h2 className="mt-1 truncate text-lg font-black text-slate-950">
//                       {getProjectName(invoice.projectId)}
//                     </h2>
//                   </div>
//                   <span
//                     className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
//                       statusBadgeClass[invoice.paymentStatus] || statusBadgeClass.pending
//                     }`}
//                   >
//                     {formatLabel(invoice.paymentStatus)}
//                   </span>
//                 </div>

//                 <div className="mt-5 grid gap-3 sm:grid-cols-2">
//                   <div className="rounded-lg bg-slate-50 px-3 py-2">
//                     <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
//                       Invoice Amount
//                     </p>
//                     <p className="mt-1 text-sm font-black text-slate-950">
//                       {formatCurrency(invoice.totalAmount)}
//                     </p>
//                   </div>
//                   <div className="rounded-lg bg-slate-50 px-3 py-2">
//                     <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
//                       Due Date
//                     </p>
//                     <p className="mt-1 inline-flex items-center gap-2 text-sm font-black text-slate-950">
//                       <CalendarDays size={14} />
//                       {formatDate(invoice.dueDate)}
//                     </p>
//                   </div>
//                   <div className="rounded-lg bg-slate-50 px-3 py-2">
//                     <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
//                       Paid Date
//                     </p>
//                     <p className="mt-1 text-sm font-black text-slate-950">
//                       {formatDate(invoice.paidDate)}
//                     </p>
//                   </div>
//                   <div className="rounded-lg bg-slate-50 px-3 py-2">
//                     <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
//                       Project
//                     </p>
//                     <p className="mt-1 inline-flex items-center gap-2 text-sm font-black text-slate-950">
//                       <FolderKanban size={14} />
//                       {getProjectName(invoice.projectId)}
//                     </p>
//                   </div>
//                   <div className="rounded-lg bg-slate-50 px-3 py-2 sm:col-span-2">
//                     <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
//                       Generated By
//                     </p>
//                     <p className="mt-1 text-sm font-black text-slate-950">
//                       {getGeneratedBy(invoice.createdBy)}
//                     </p>
//                   </div>
//                 </div>






//                 <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => openInvoicePrintView(invoice, "print")}
//                     className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
//                   >
//                     <Printer size={16} />
//                     Print
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => openInvoicePrintView(invoice, "pdf")}
//                     className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
//                   >
//                     <Download size={16} />
//                     Save PDF
//                   </button>
//                 </div>
//               </article>
//             ))}
//           </div>

//           <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-sm font-semibold text-slate-600">
//               Showing page {pagination.page} of {pagination.totalPages || 1} -{" "}
//               {pagination.total} invoices
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => goToPage(page - 1)}
//                 disabled={page <= 1}
//                 className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
//               >
//                 <ChevronLeft size={16} />
//                 Previous
//               </button>
//               <button
//                 type="button"
//                 onClick={() => goToPage(page + 1)}
//                 disabled={page >= pagination.totalPages}
//                 className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
//               >
//                 Next
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </section>
//   );
// };

// export default ClientInvoices;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  FolderKanban,
  History,
  IndianRupee,
  Landmark,
  Printer,
  ReceiptText,
  Wallet,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { getMyInvoices } from "../../services/invoiceService";
import { ROUTES } from "../../routes/routeConstants";
import { openInvoicePrintView } from "../../utils/invoicePrint";

const statusBadgeClass = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  overdue: "bg-red-50 text-red-700 ring-red-100",
};

const modeBadgeClass = {
  online: "bg-violet-50 text-violet-700 ring-violet-100",
  offline: "bg-slate-100 text-slate-700 ring-slate-200",
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

// Recorded advance-payment timestamps come back as full ISO datetimes.
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

const getProjectName = (project) => {
  if (!project) return "No project linked";
  if (typeof project === "string") return project;
  return project.projectName || "No project linked";
};

const getGeneratedBy = (user) => {
  if (!user) return "System";
  if (typeof user === "string") return user;
  return `${user.name || "User"}${user.role ? ` · ${formatLabel(user.role)}` : ""}`;
};

// A small labelled figure used across the summary strip.
const SummaryStat = ({ icon: Icon, label, value, tone = "default" }) => {
  const toneClass =
    tone === "highlight"
      ? "bg-blue-50 ring-blue-100"
      : "bg-slate-50 ring-slate-100";
  const valueToneClass = tone === "highlight" ? "text-blue-800" : "text-slate-950";
  const labelToneClass = tone === "highlight" ? "text-blue-600" : "text-slate-500";

  return (
    <div className={`rounded-lg px-3 py-2.5 ring-1 ${toneClass}`}>
      <p
        className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${labelToneClass}`}
      >
        <Icon size={12} />
        {label}
      </p>
      <p className={`mt-1 text-base font-black tabular-nums ${valueToneClass}`}>
        {value}
      </p>
    </div>
  );
};

const ClientInvoices = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const invoiceId = searchParams.get("invoiceId");
      const result = await getMyInvoices({
        page,
        limit: invoiceId ? 100 : pagination.limit,
      });
      const list = result.data.invoices || [];
      setInvoices(
        invoiceId
          ? [...list].sort((a, b) => (a._id === invoiceId ? -1 : b._id === invoiceId ? 1 : 0))
          : list
      );
      setPagination(result.data.pagination || pagination);
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
    void fetchInvoices();
  }, [page, searchParams]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.CLIENT_DASHBOARD} />
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Billing
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Payment Status
        </h1>
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
      ) : invoices.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <FileText size={28} className="text-slate-400" />
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No invoices found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Invoices generated for your projects will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {invoices.map((invoice) => {
              const taxAmount = Number(invoice.tax || 0);
              const advancePayments = invoice.advancePayments || [];
              const balanceDue =
                invoice.balanceAmount ??
                Math.max(0, invoice.totalAmount - (invoice.totalAdvancePaid || 0));

              return (
                <article
                  key={invoice._id}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                    searchParams.get("invoiceId") === invoice._id
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {invoice.invoiceNumber}
                      </p>
                      <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                        {getProjectName(invoice.projectId)}
                      </h2>
                      <p className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <FolderKanban size={13} />
                        Generated by {getGeneratedBy(invoice.createdBy)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          statusBadgeClass[invoice.paymentStatus] || statusBadgeClass.pending
                        }`}
                      >
                        {formatLabel(invoice.paymentStatus)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          modeBadgeClass[invoice.paymentMode] || modeBadgeClass.offline
                        }`}
                      >
                        {invoice.paymentMode === "online" ? (
                          <Wallet size={12} />
                        ) : (
                          <Landmark size={12} />
                        )}
                        {formatLabel(invoice.paymentMode || "offline")}
                      </span>
                    </div>
                  </div>

                  {/* Date meta row */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <ReceiptText size={13} className="text-slate-400" />
                      Invoiced {invoice.invoiceDate}
                      {invoice.invoiceTime ? ` at ${invoice.invoiceTime}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-slate-400" />
                      Due {formatDate(invoice.dueDate)}
                    </span>
                  </div>

                  {/* Financial summary */}
                  <div className="px-5 py-4">
                    <div
                      className={`grid grid-cols-2 gap-2.5 ${
                        taxAmount > 0 ? "sm:grid-cols-4" : "sm:grid-cols-3"
                      }`}
                    >
                      <SummaryStat
                        icon={IndianRupee}
                        label="Total Amount"
                        value={formatCurrency(invoice.totalAmount)}
                      />
                      <SummaryStat
                        icon={Wallet}
                        label="Advance Paid"
                        value={formatCurrency(invoice.totalAdvancePaid)}
                      />
                      {taxAmount > 0 && (
                        <SummaryStat
                          icon={ReceiptText}
                          label="Tax"
                          value={formatCurrency(taxAmount)}
                        />
                      )}
                      <SummaryStat
                        icon={Landmark}
                        label="Balance Due"
                        value={formatCurrency(balanceDue)}
                        tone="highlight"
                      />
                    </div>
                  </div>

                  {/* Line items */}
                  {invoice.items?.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Items
                      </p>
                      <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
                        {invoice.items.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
                          >
                            <span className="min-w-0 truncate font-semibold text-slate-700">
                              {item.description}
                            </span>
                            <span className="shrink-0 font-black tabular-nums text-slate-950">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advance payment history */}
                  {advancePayments.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <History size={13} />
                        Payment History
                      </p>
                      <div className="mt-2 space-y-2">
                        {advancePayments.map((payment) => (
                          <div
                            key={payment._id}
                            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black tabular-nums text-slate-950">
                                {formatCurrency(payment.amount)}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ring-1 ${
                                  modeBadgeClass[payment.mode] || modeBadgeClass.offline
                                }`}
                              >
                                {formatLabel(payment.mode || "offline")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                              {payment.receivedBy && (
                                <span>Received by {payment.receivedBy}</span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <Clock size={11} />
                                {formatDateTime(payment.recordedAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
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
              );
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Showing page {pagination.page} of {pagination.totalPages || 1} -{" "}
              {pagination.total} invoices
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ClientInvoices;