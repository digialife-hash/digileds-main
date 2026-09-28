import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  RefreshCw,
  BarChart2,
  ListFilter,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getReferralsApi,
  getReferralAnalyticsApi,
  exportReferralsApi,
  deleteReferralApi,
} from "../../services/referralClientService";
import { getEmployees } from "../../services/employeeService";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useAuth } from "../../context/authStore";

import ReferralStatusBadge from "../../components/referrals/ReferralStatusBadge";
import ReferralAnalyticsDashboard from "../../components/referrals/ReferralAnalyticsDashboard";
import AddReferralModal from "../../components/referrals/AddReferralModal";
import ReferralDetailsDrawer from "../../components/referrals/ReferralDetailsDrawer";
import ReferralStatusChangeModal from "../../components/referrals/ReferralStatusChangeModal";
import AssignEmployeeModal from "../../components/referrals/AssignEmployeeModal";

const STATUS_OPTIONS = [
  "New",
  "Assigned",
  "Contacted",
  "Interested",
  "Follow Up",
  "Negotiation",
  "Converted",
  "Lost",
  "Cancelled",
];

const ReferralClientManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);
  const isPartner = user?.role === "referral_partner";

  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'dashboard'
  const [referrals, setReferrals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [service, setService] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Employees List for filters/assign
  const [employees, setEmployees] = useState([]);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const [statusModalTarget, setStatusModalTarget] = useState(null);
  const [assignModalTarget, setAssignModalTarget] = useState(null);

  useEffect(() => {
    fetchReferrals();
    fetchAnalytics();
    if (isAdmin) {
      fetchEmployeesList();
    }
  }, [pagination.page, selectedStatus, selectedEmployee, search]);

  const fetchEmployeesList = async () => {
    try {
      const res = await getEmployees({ limit: 100 });
      if (res.success && res.data?.employees) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        assignedEmployee: selectedEmployee,
        service,
        minBudget,
        maxBudget,
        startDate,
        endDate,
      };

      const res = await getReferralsApi(params);
      if (res.success) {
        setReferrals(res.data.referrals || []);
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
      toast.error("Failed to load referrals");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getReferralAnalyticsApi();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleExport = async (format = "csv") => {
    try {
      toast.loading(`Exporting referrals as ${format.toUpperCase()}...`);
      const response = await exportReferralsApi({
        format,
        search,
        status: selectedStatus,
        assignedEmployee: selectedEmployee,
        service,
        minBudget,
        maxBudget,
        startDate,
        endDate,
      });

      toast.dismiss();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `referrals-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Referrals exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to export referrals");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this referral?")) return;
    try {
      const res = await deleteReferralApi(id);
      if (res.success) {
        toast.success("Referral deleted");
        fetchReferrals();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete referral");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Referral Client Management
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Submit, assign, track and manage complete referral client lifecycle
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Dropdown / Button */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              title="Export as CSV"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Submit New Referral Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Referral</span>
          </button>
        </div>
      </div>

      {/* Top Partner Hub Sub-Navigation (Admin Only) */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <Link
            to={ROUTES.SUPER_ADMIN_REFERRALS}
            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
          >
            Referral Clients
          </Link>
          <Link
            to={ROUTES.SUPER_ADMIN_PARTNER_MANAGEMENT}
            className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Partner Directory
          </Link>
          <Link
            to={ROUTES.SUPER_ADMIN_COMMISSIONS}
            className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Commissions
          </Link>
          <Link
            to={ROUTES.SUPER_ADMIN_ID_CARDS}
            className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Digital ID Cards
          </Link>
          <Link
            to={ROUTES.SUPER_ADMIN_CERTIFICATES}
            className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Certificates
          </Link>
        </div>
      )}

      {/* Main View Mode Selector (Analytics Dashboard vs Referral Table) */}
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
            <span>Referrals List</span>
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
        <ReferralAnalyticsDashboard
          analytics={analytics}
          isLoading={isLoadingAnalytics}
        />
      )}

      {/* VIEW 2: REFERRALS TABLE */}
      {activeTab === "table" && (
        <div className="space-y-4">
          {/* Search Bar & Filter Drawer Toggle */}
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
                placeholder="Search by ID, Client, Company, Mobile, Email, Service..."
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

              {isAdmin && (
                <select
                  value={selectedEmployee}
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="">All Assigned Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              )}

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

          {/* Multi-Filter Bar Drawer */}
          {showFilterDrawer && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Service Required
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="Filter service..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Min Budget (₹)
                </label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="Min amount"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Max Budget (₹)
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max amount"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => {
                    setService("");
                    setMinBudget("");
                    setMaxBudget("");
                    setStartDate("");
                    setEndDate("");
                    setSelectedStatus("");
                    setSelectedEmployee("");
                    setSearch("");
                  }}
                  className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    setPagination((p) => ({ ...p, page: 1 }));
                    fetchReferrals();
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Referral Data Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Referral ID</th>
                  <th className="px-4 py-3.5">Client & Company</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Service & Budget</th>
                  <th className="px-4 py-3.5">Assigned Employee</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs text-slate-500 font-semibold">
                          Loading referrals...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">
                          No referrals found
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Try adjusting your search criteria or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref) => (
                    <tr
                      key={ref._id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Referral ID */}
                      <td className="px-4 py-3.5 font-extrabold text-blue-600 whitespace-nowrap">
                        {ref.referralId || "REF-0000"}
                      </td>

                      {/* Client & Company */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">
                          {ref.clientName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ref.companyName || "No Company"}
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {ref.mobileNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ref.email}
                        </div>
                      </td>

                      {/* Service & Budget */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {ref.serviceRequired}
                        </div>
                        <div className="font-bold text-emerald-600">
                          {formatCurrency(ref.estimatedBudget)}
                        </div>
                      </td>

                      {/* Assigned Employee */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {ref.assignedEmployee ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            <span>{ref.assignedEmployee.name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <ReferralStatusBadge status={ref.status} />
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(ref.createdAt).toLocaleDateString("en-IN")}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReferralId(ref._id);
                              setShowDetailsDrawer(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            title="View Full Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setStatusModalTarget(ref)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                            title="Change Status"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setAssignModalTarget(ref)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                              title="Assign Employee"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(ref._id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete Referral"
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <span className="font-semibold text-slate-500">
                Showing {referrals.length} of {pagination.total} referrals
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-slate-800">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Referral Modal */}
      <AddReferralModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchReferrals();
          fetchAnalytics();
        }}
      />

      {/* Referral Details Drawer */}
      <ReferralDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedReferralId(null);
        }}
        referralId={selectedReferralId}
        onRefreshParent={() => {
          fetchReferrals();
          fetchAnalytics();
        }}
      />

      {/* Quick Status Change Modal */}
      {statusModalTarget && (
        <ReferralStatusChangeModal
          isOpen={Boolean(statusModalTarget)}
          onClose={() => setStatusModalTarget(null)}
          referral={statusModalTarget}
          onSuccess={() => {
            fetchReferrals();
            fetchAnalytics();
          }}
        />
      )}

      {/* Quick Assign Employee Modal */}
      {assignModalTarget && (
        <AssignEmployeeModal
          isOpen={Boolean(assignModalTarget)}
          onClose={() => setAssignModalTarget(null)}
          referral={assignModalTarget}
          onSuccess={() => {
            fetchReferrals();
            fetchAnalytics();
          }}
        />
      )}
    </div>
  );
};

export default ReferralClientManagementPage;
