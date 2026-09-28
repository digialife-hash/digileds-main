import React, { useState, useEffect } from "react";
import {
  IdCard,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  Eye,
  RefreshCw,
  XCircle,
  Trash2,
  ListFilter,
  BarChart2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getIDCardsApi,
  getIDCardAnalyticsApi,
  exportIDCardsApi,
  deleteIDCardApi,
} from "../../services/idCardService";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useAuth } from "../../context/authStore";

import IDCardStatusBadge from "../../components/idCards/IDCardStatusBadge";
import IDCardAnalyticsDashboard from "../../components/idCards/IDCardAnalyticsDashboard";
import GenerateIDCardModal from "../../components/idCards/GenerateIDCardModal";
import IDCardDetailsDrawer from "../../components/idCards/IDCardDetailsDrawer";
import RenewIDCardModal from "../../components/idCards/RenewIDCardModal";
import RevokeIDCardModal from "../../components/idCards/RevokeIDCardModal";
import PrintIDCardModal from "../../components/idCards/PrintIDCardModal";

const STATUS_OPTIONS = ["Active", "Expired", "Renewed", "Revoked"];

const IDCardManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'dashboard'
  const [idCards, setIDCards] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Modals & Drawers
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedIDCardId, setSelectedIDCardId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const [renewTargetCard, setRenewTargetCard] = useState(null);
  const [revokeTargetCard, setRevokeTargetCard] = useState(null);
  const [printTargetCards, setPrintTargetCards] = useState(null);

  useEffect(() => {
    fetchIDCards();
    fetchAnalytics();
  }, [pagination.page, selectedStatus, designationFilter, search]);

  const fetchIDCards = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        designation: designationFilter,
      };

      const res = await getIDCardsApi(params);
      if (res.success) {
        setIDCards(res.data.idCards || []);
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
      toast.error("Failed to load ID Cards");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getIDCardAnalyticsApi();
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
      toast.loading("Exporting ID Cards...");
      const response = await exportIDCardsApi({
        search,
        status: selectedStatus,
        designation: designationFilter,
      });

      toast.dismiss();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `id-cards-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("ID Cards exported successfully");
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to export ID Cards");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ID card?")) return;

    try {
      const res = await deleteIDCardApi(id);
      if (res.success) {
        toast.success("ID Card deleted successfully");
        fetchIDCards();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete ID Card");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            ID Card Management
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Generate digital ID cards, manage renewals, revocations & QR verifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Generate ID Card</span>
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
          to={isAdmin ? ROUTES.SUPER_ADMIN_ID_CARDS : ROUTES.REFERRAL_PARTNER_ID_CARD}
          className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
        >
          Digital ID Cards
        </Link>
        <Link
          to={isAdmin ? ROUTES.SUPER_ADMIN_CERTIFICATES : ROUTES.REFERRAL_PARTNER_CERTIFICATES}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Certificates
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
            <span>ID Card Directory</span>
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
        <IDCardAnalyticsDashboard
          analytics={analytics}
          isLoading={isLoadingAnalytics}
        />
      )}

      {/* VIEW 2: ID CARDS TABLE */}
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
                placeholder="Search ID Number, Partner Name, Code..."
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
                  Filter Designation
                </label>
                <input
                  type="text"
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                  placeholder="e.g. Senior Partner"
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
                  <th className="px-4 py-3.5">ID Number</th>
                  <th className="px-4 py-3.5">Partner Name</th>
                  <th className="px-4 py-3.5">Partner Code</th>
                  <th className="px-4 py-3.5">Designation</th>
                  <th className="px-4 py-3.5">Joining Date</th>
                  <th className="px-4 py-3.5">Expiry Date</th>
                  <th className="px-4 py-3.5">Status</th>
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
                          Loading ID cards...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : idCards.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <IdCard className="h-8 w-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">
                          No ID Card records found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  idCards.map((card) => (
                    <tr
                      key={card._id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-extrabold text-blue-600 whitespace-nowrap">
                        {card.cardNumber}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {card.partnerName}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-700">
                        {card.partnerCode}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {card.designation}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(card.joiningDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] font-bold text-amber-600 whitespace-nowrap">
                        {new Date(card.expiryDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <IDCardStatusBadge status={card.status} />
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedIDCardId(card._id);
                              setShowDetailsDrawer(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setPrintTargetCards([card])}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Print / Export PDF"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {isAdmin && card.status !== "Revoked" && (
                            <button
                              onClick={() => setRenewTargetCard(card)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                              title="Renew ID Card"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}

                          {isAdmin && card.status !== "Revoked" && (
                            <button
                              onClick={() => setRevokeTargetCard(card)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Revoke ID Card"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(card._id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete"
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <span className="font-semibold text-slate-500">
                Showing {idCards.length} of {pagination.total} ID cards
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

      {/* Modals & Drawers */}
      <GenerateIDCardModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={() => {
          fetchIDCards();
          fetchAnalytics();
        }}
      />

      <IDCardDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedIDCardId(null);
        }}
        idCardId={selectedIDCardId}
        onRefreshParent={() => {
          fetchIDCards();
          fetchAnalytics();
        }}
      />

      {renewTargetCard && (
        <RenewIDCardModal
          isOpen={Boolean(renewTargetCard)}
          onClose={() => setRenewTargetCard(null)}
          idCard={renewTargetCard}
          onSuccess={() => {
            fetchIDCards();
            fetchAnalytics();
          }}
        />
      )}

      {revokeTargetCard && (
        <RevokeIDCardModal
          isOpen={Boolean(revokeTargetCard)}
          onClose={() => setRevokeTargetCard(null)}
          idCard={revokeTargetCard}
          onSuccess={() => {
            fetchIDCards();
            fetchAnalytics();
          }}
        />
      )}

      {printTargetCards && (
        <PrintIDCardModal
          isOpen={Boolean(printTargetCards)}
          onClose={() => setPrintTargetCards(null)}
          idCards={printTargetCards}
        />
      )}
    </div>
  );
};

export default IDCardManagementPage;
