import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  Receipt,
  Eye,
  Download,
  ListFilter,
  BarChart2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getPaymentHistoryApi,
  getPaymentAnalyticsApi,
  exportPaymentHistoryApi,
  updatePaymentStatusApi,
} from "../../services/paymentHistoryService";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useAuth } from "../../context/authStore";

import PaymentStatusBadge from "../../components/payments/PaymentStatusBadge";
import PaymentAnalyticsDashboard from "../../components/payments/PaymentAnalyticsDashboard";
import PaymentReceiptModal from "../../components/payments/PaymentReceiptModal";
import PaymentDetailsDrawer from "../../components/payments/PaymentDetailsDrawer";

const PAYMENT_STATUSES = ["Pending", "Processing", "Paid", "Failed", "Cancelled"];
const PAYMENT_MODES = ["Bank Transfer", "UPI", "Cash", "Cheque"];

const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'dashboard'
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Modals & Drawers
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [receiptModalPaymentId, setReceiptModalPaymentId] = useState(null);

  // Status Change Dialog State
  const [statusUpdateTarget, setStatusUpdateTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("Paid");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchAnalytics();
  }, [pagination.page, selectedStatus, selectedMode, search]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        paymentMode: selectedMode,
        minAmount,
        maxAmount,
      };

      const res = await getPaymentHistoryApi(params);
      if (res.success) {
        setPayments(res.data.payments || []);
        if (res.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getPaymentAnalyticsApi();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Exporting payment history...");
      const response = await exportPaymentHistoryApi({
        search,
        status: selectedStatus,
        paymentMode: selectedMode,
      });

      toast.dismiss();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payment-history-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Payment history exported successfully");
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to export payment history");
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusUpdateTarget) return;

    try {
      setIsUpdatingStatus(true);
      const res = await updatePaymentStatusApi(statusUpdateTarget._id, {
        status: newStatus,
        remarks: statusRemarks,
      });

      if (res.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        setStatusUpdateTarget(null);
        setStatusRemarks("");
        fetchPayments();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Commission Payment History
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Track discursions, transaction references & download official payment receipts
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export History</span>
        </button>
      </div>

      {/* Top Module Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          to={isAdmin ? ROUTES.SUPER_ADMIN_PAYMENTS : ROUTES.REFERRAL_PARTNER_PAYMENTS}
          className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
        >
          Payment History
        </Link>
        <Link
          to={isAdmin ? ROUTES.SUPER_ADMIN_COMMISSIONS : ROUTES.REFERRAL_PARTNER_COMMISSIONS}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Commissions
        </Link>
        {isAdmin && (
          <Link
            to={ROUTES.SUPER_ADMIN_PARTNER_MANAGEMENT}
            className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Partner Directory
          </Link>
        )}
      </div>

      {/* View Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("table")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "table"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span>Payment Records</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Dashboard Analytics</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DASHBOARD ANALYTICS */}
      {activeTab === "dashboard" && (
        <PaymentAnalyticsDashboard
          analytics={analytics}
          isLoading={isLoadingAnalytics}
        />
      )}

      {/* VIEW 2: PAYMENTS TABLE */}
      {activeTab === "table" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Search Payment ID, Receipt #, Txn #..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="">All Statuses</option>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="">All Payment Modes</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                  showFilterDrawer
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Drawer Filter */}
          {showFilterDrawer && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Min payout amount"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Max payout amount"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Payment ID</th>
                  <th className="px-4 py-3.5">Receipt #</th>
                  <th className="px-4 py-3.5">Partner Name</th>
                  <th className="px-4 py-3.5">Amount Paid</th>
                  <th className="px-4 py-3.5">Payment Mode</th>
                  <th className="px-4 py-3.5">Transaction #</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Payment Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs text-slate-500 font-semibold">
                          Loading payment history...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="h-8 w-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">
                          No payment records found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p._id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-extrabold text-blue-600 whitespace-nowrap">
                        {p.paymentId}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                        {p.receiptNumber}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {p.partnerId?.userId?.name || "Partner"}
                      </td>

                      <td className="px-4 py-3.5 font-extrabold text-emerald-600 text-sm whitespace-nowrap">
                        {formatCurrency(p.amountPaid)}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                        {p.paymentMode}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {p.transactionNumber || "N/A"}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <PaymentStatusBadge status={p.paymentStatus} />
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(p.paymentDate || p.createdAt).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPaymentId(p._id);
                              setShowDetailsDrawer(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setReceiptModalPaymentId(p._id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Official Receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                setStatusUpdateTarget(p);
                                setNewStatus(p.paymentStatus || "Paid");
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                              title="Update Status"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <span className="font-semibold text-slate-500">
                Showing {payments.length} of {pagination.total} payments
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-slate-800">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Drawer */}
      <PaymentDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedPaymentId(null);
        }}
        paymentId={selectedPaymentId}
      />

      {/* Receipt Modal */}
      {receiptModalPaymentId && (
        <PaymentReceiptModal
          isOpen={Boolean(receiptModalPaymentId)}
          onClose={() => setReceiptModalPaymentId(null)}
          paymentId={receiptModalPaymentId}
        />
      )}

      {/* Status Update Modal */}
      {statusUpdateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update Payment Status
              </h3>
              <button
                onClick={() => setStatusUpdateTarget(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold"
                >
                  {PAYMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Remarks
                </label>
                <textarea
                  rows="2"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Reason for status change..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusUpdateTarget(null)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
