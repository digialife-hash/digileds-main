import React, { useState, useEffect } from "react";
import {
  Wallet,
  Search,
  Filter,
  Plus,
  Settings,
  CreditCard,
  Download,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  ListFilter,
  BarChart2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Square,
  CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCommissionsApi,
  getCommissionAnalyticsApi,
  exportCommissionsApi,
} from "../../services/commissionService";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useAuth } from "../../context/authStore";

import CommissionStatusBadge from "../../components/commissions/CommissionStatusBadge";
import CommissionAnalyticsDashboard from "../../components/commissions/CommissionAnalyticsDashboard";
import CommissionRuleModal from "../../components/commissions/CommissionRuleModal";
import CommissionDetailsDrawer from "../../components/commissions/CommissionDetailsDrawer";
import CommissionAdjustmentModal from "../../components/commissions/CommissionAdjustmentModal";
import CommissionApprovalModal from "../../components/commissions/CommissionApprovalModal";
import ProcessPaymentModal from "../../components/commissions/ProcessPaymentModal";

const STATUS_OPTIONS = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Paid",
  "Cancelled",
];

const COMMISSION_TYPES = [
  "Percentage Based",
  "Fixed Amount",
  "Manual Commission",
  "Project Based",
  "Monthly Commission",
];

const CommissionManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'dashboard'
  const [commissions, setCommissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Bulk Selection State for Payouts
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Drawers
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedCommissionId, setSelectedCommissionId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const [approvalModalTarget, setApprovalModalTarget] = useState(null);
  const [adjustmentModalTarget, setAdjustmentModalTarget] = useState(null);
  const [paymentModalCommissions, setPaymentModalCommissions] = useState(null);

  useEffect(() => {
    fetchCommissions();
    fetchAnalytics();
  }, [pagination.page, selectedStatus, selectedType, search]);

  const fetchCommissions = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        commissionType: selectedType,
        minAmount,
        maxAmount,
      };

      const res = await getCommissionsApi(params);
      if (res.success) {
        setCommissions(res.data.commissions || []);
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
      toast.error("Failed to load commissions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getCommissionAnalyticsApi();
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
      toast.loading("Exporting commissions...");
      const response = await exportCommissionsApi({
        search,
        status: selectedStatus,
        commissionType: selectedType,
      });

      toast.dismiss();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `commissions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Commissions exported successfully");
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to export commissions");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(commissions.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const selectedCommissionsList = commissions.filter((c) =>
    selectedIds.includes(c._id)
  );

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Commission Management
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Automated commission engine, approvals, adjustments & payout processing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowRuleModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-blue-600" />
              <span>Configure Rules</span>
            </button>
          )}

          {isAdmin && selectedIds.length > 0 && (
            <button
              onClick={() => setPaymentModalCommissions(selectedCommissionsList)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Module Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          to={isAdmin ? ROUTES.SUPER_ADMIN_COMMISSIONS : ROUTES.REFERRAL_PARTNER_COMMISSIONS}
          className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
        >
          Commissions
        </Link>
        <Link
          to={isAdmin ? ROUTES.SUPER_ADMIN_PAYMENTS : ROUTES.REFERRAL_PARTNER_PAYMENTS}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Payment History
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

      {/* View Mode Switcher */}
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
            <span>Commission List</span>
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
        <CommissionAnalyticsDashboard
          analytics={analytics}
          isLoading={isLoadingAnalytics}
        />
      )}

      {/* VIEW 2: COMMISSIONS TABLE */}
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
                placeholder="Search Commission ID..."
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
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="">All Commission Types</option>
                {COMMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
                  placeholder="Min commission amount"
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
                  placeholder="Max commission amount"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  {isAdmin && (
                    <th className="px-4 py-3.5 w-8">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          commissions.length > 0 &&
                          selectedIds.length === commissions.length
                        }
                        className="h-4 w-4 rounded-md border-slate-300 text-blue-600"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3.5">Commission ID</th>
                  <th className="px-4 py-3.5">Referral & Client</th>
                  <th className="px-4 py-3.5">Partner Name</th>
                  <th className="px-4 py-3.5">Project Value</th>
                  <th className="px-4 py-3.5">Type & Rate</th>
                  <th className="px-4 py-3.5">Gross / Net Amount</th>
                  <th className="px-4 py-3.5">Status</th>
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
                          Loading commissions...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Wallet className="h-8 w-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">
                          No commission records found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commissions.map((comm) => {
                    const isSelected = selectedIds.includes(comm._id);
                    return (
                      <tr
                        key={comm._id}
                        className={`group hover:bg-slate-50/80 transition-colors ${
                          isSelected ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {isAdmin && (
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(comm._id)}
                              className="h-4 w-4 rounded-md border-slate-300 text-blue-600"
                            />
                          </td>
                        )}

                        <td className="px-4 py-3.5 font-extrabold text-blue-600 whitespace-nowrap">
                          {comm.commissionId}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">
                            {comm.referralId?.clientName || "Client"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Ref: {comm.referralId?.referralId || "N/A"}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {comm.partnerId?.userId?.name || "Partner"}
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {formatCurrency(comm.projectValue)}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">
                            {comm.commissionType}
                          </div>
                          <div className="text-[11px] text-indigo-600 font-semibold">
                            {comm.commissionPercentage}%
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-[11px] text-slate-400">
                            Gross: {formatCurrency(comm.grossCommission)}
                          </div>
                          <div className="font-extrabold text-emerald-600 text-sm">
                            {formatCurrency(comm.netCommission)}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CommissionStatusBadge status={comm.status} />
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCommissionId(comm._id);
                                setShowDetailsDrawer(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => setApprovalModalTarget(comm)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                                title="Approve / Reject"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => setAdjustmentModalTarget(comm)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                                title="Manual Adjustment"
                              >
                                <SlidersHorizontal className="h-4 w-4" />
                              </button>
                            )}

                            {isAdmin && comm.status !== "Paid" && (
                              <button
                                onClick={() => setPaymentModalCommissions([comm])}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                                title="Process Payment"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <span className="font-semibold text-slate-500">
                Showing {commissions.length} of {pagination.total} commissions
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

      {/* Rule Config Modal */}
      <CommissionRuleModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        onSuccess={() => {
          fetchCommissions();
          fetchAnalytics();
        }}
      />

      {/* Details Drawer */}
      <CommissionDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedCommissionId(null);
        }}
        commissionId={selectedCommissionId}
        onRefreshParent={() => {
          fetchCommissions();
          fetchAnalytics();
        }}
      />

      {/* Approval Modal */}
      {approvalModalTarget && (
        <CommissionApprovalModal
          isOpen={Boolean(approvalModalTarget)}
          onClose={() => setApprovalModalTarget(null)}
          commission={approvalModalTarget}
          onSuccess={() => {
            fetchCommissions();
            fetchAnalytics();
          }}
        />
      )}

      {/* Adjustment Modal */}
      {adjustmentModalTarget && (
        <CommissionAdjustmentModal
          isOpen={Boolean(adjustmentModalTarget)}
          onClose={() => setAdjustmentModalTarget(null)}
          commission={adjustmentModalTarget}
          onSuccess={() => {
            fetchCommissions();
            fetchAnalytics();
          }}
        />
      )}

      {/* Payment Processing Modal */}
      {paymentModalCommissions && (
        <ProcessPaymentModal
          isOpen={Boolean(paymentModalCommissions)}
          onClose={() => setPaymentModalCommissions(null)}
          selectedCommissions={paymentModalCommissions}
          onSuccess={() => {
            setSelectedIds([]);
            fetchCommissions();
            fetchAnalytics();
          }}
        />
      )}
    </div>
  );
};

export default CommissionManagementPage;
