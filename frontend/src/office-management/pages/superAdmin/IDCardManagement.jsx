import React, { useState, useEffect } from "react";
import {
  IdCard,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Download,
  Eye,
  RotateCcw,
  XCircle,
  AlertTriangle,
  UserCheck,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getIDCardsApi,
  getIDCardAnalyticsApi,
  exportIDCardsApi,
  suspendIDCardApi,
  regenerateQRTokenApi,
} from "../../services/idCardService";
import IDCardStatusBadge from "../../components/idCards/IDCardStatusBadge";
import GenerateIDCardModal from "../../components/idCards/GenerateIDCardModal";
import IDCardDetailsDrawer from "../../components/idCards/IDCardDetailsDrawer";
import PrintIDCardModal from "../../components/idCards/PrintIDCardModal";
import RenewIDCardModal from "../../components/idCards/RenewIDCardModal";
import RevokeIDCardModal from "../../components/idCards/RevokeIDCardModal";

const IDCardManagement = () => {
  const [cards, setCards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filter States
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'employee', 'referral_partner', 'Active', 'Expired', 'Revoked'
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Modals / Drawers State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState(null);
  const [selectedCardForPrint, setSelectedCardForPrint] = useState(null);
  const [selectedCardForRenew, setSelectedCardForRenew] = useState(null);
  const [selectedCardForRevoke, setSelectedCardForRevoke] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchCards();
  }, [activeTab, search, selectedDepartment, pagination.page]);

  const fetchAnalytics = async () => {
    try {
      const res = await getIDCardAnalyticsApi();
      if (res?.success) {
        setAnalytics(res.data?.metrics);
      }
    } catch (err) {
      console.error("Error fetching ID card analytics:", err);
    }
  };

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
      };

      if (activeTab === "employee" || activeTab === "referral_partner") {
        params.entityType = activeTab;
      } else if (["Active", "Expired", "Revoked", "Suspended"].includes(activeTab)) {
        params.status = activeTab;
      }

      if (selectedDepartment) {
        params.department = selectedDepartment;
      }

      const res = await getIDCardsApi(params);
      if (res?.success) {
        setCards(res.data.idCards || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ID Cards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportIDCardsApi();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `id-cards-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("ID Cards exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export ID Cards CSV");
    }
  };

  const handleToggleSuspend = async (card) => {
    try {
      const actionText = card.status === "Suspended" ? "reactivate" : "suspend";
      if (window.confirm(`Are you sure you want to ${actionText} ID Card ${card.cardNumber}?`)) {
        const res = await suspendIDCardApi(card._id);
        if (res?.success) {
          toast.success(`ID Card ${actionText}d successfully`);
          fetchCards();
          fetchAnalytics();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleRegenerateQR = async (card) => {
    try {
      if (window.confirm(`Regenerate QR token for ${card.partnerName}? Previous printed QR code will become invalid.`)) {
        const res = await regenerateQRTokenApi(card._id);
        if (res?.success) {
          toast.success("QR verification token regenerated!");
          fetchCards();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to regenerate QR");
    }
  };

  const metrics = analytics || {
    totalIDCards: 0,
    activeIDCards: 0,
    employeeCards: 0,
    partnerCards: 0,
    expiredIDCards: 0,
    revokedIDCards: 0,
    suspendedCards: 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20">
              <IdCard size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                ID Card Management
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Global identity credentials system for Employees and Referral Partners
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs transition"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
          >
            <Plus size={16} />
            <span>Generate ID Card</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Cards
            </span>
            <Users size={16} className="text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{metrics.totalIDCards}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active Cards
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 mt-1">{metrics.activeIDCards}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Employees
            </span>
            <UserCheck size={16} className="text-blue-500" />
          </div>
          <p className="text-xl font-black text-blue-600 mt-1">{metrics.employeeCards}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Partners
            </span>
            <Building2 size={16} className="text-indigo-500" />
          </div>
          <p className="text-xl font-black text-indigo-600 mt-1">{metrics.partnerCards}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Expired
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600 mt-1">{metrics.expiredIDCards}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Revoked
            </span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-1">{metrics.revokedIDCards}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Suspended
            </span>
            <AlertTriangle size={16} className="text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-700 mt-1">{metrics.suspendedCards}</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-xs overflow-hidden space-y-4 p-5">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
            {[
              { id: "all", label: "All ID Cards" },
              { id: "employee", label: "Employees" },
              { id: "referral_partner", label: "Referral Partners" },
              { id: "Active", label: "Active" },
              { id: "Expired", label: "Expired" },
              { id: "Revoked", label: "Revoked" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Department Filter */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Search name, ID, card #..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <button
              onClick={() => {
                fetchCards();
                fetchAnalytics();
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Refresh Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* ID Cards Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="animate-spin" size={24} />
              <span className="text-xs font-medium">Loading ID Cards...</span>
            </div>
          ) : cards.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <IdCard size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold">No ID Cards Found</p>
              <p className="text-xs text-slate-400">
                Generate a new card or modify your active filter settings.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Holder</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">ID Code</th>
                  <th className="py-3 px-4">Card Number</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {cards.map((card) => {
                  const isEmp = card.entityType === "employee";
                  const holderName = card.partnerName || card.holderName || "—";
                  const photo =
                    card.partnerPhoto ||
                    (isEmp ? card.employeeId?.photo : card.partnerId?.profilePicture);

                  return (
                    <tr key={card._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              photo ||
                              "https://ui-avatars.com/api/?name=" + encodeURIComponent(holderName)
                            }
                            alt={holderName}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{holderName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {card.department ? `Dept: ${card.department}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                            isEmp
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {isEmp ? "Employee" : "Partner"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-700">
                        {card.partnerCode || card.displayId || "—"}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {card.cardNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600">{card.designation}</td>

                      <td className="py-3 px-4 text-slate-600">
                        {card.expiryDate
                          ? new Date(card.expiryDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <IDCardStatusBadge status={card.status} size="small" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedCardForDetails(card)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => setSelectedCardForPrint(card)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Print Card"
                          >
                            <Printer size={15} />
                          </button>

                          <button
                            onClick={() => setSelectedCardForRenew(card)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Renew Validity"
                          >
                            <RotateCcw size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(card)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title={card.status === "Suspended" ? "Reactivate Card" : "Suspend Card"}
                          >
                            <AlertTriangle size={15} />
                          </button>

                          <button
                            onClick={() => handleRegenerateQR(card)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                            title="Regenerate QR Code"
                          >
                            <QrCode size={15} />
                          </button>

                          {card.status !== "Revoked" && (
                            <button
                              onClick={() => setSelectedCardForRevoke(card)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Revoke ID Card"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-2">
            <span className="text-xs text-slate-500">
              Showing page <span className="font-bold">{pagination.page}</span> of{" "}
              <span className="font-bold">{pagination.pages}</span> ({pagination.total} cards)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <GenerateIDCardModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={() => {
          fetchCards();
          fetchAnalytics();
        }}
      />

      <IDCardDetailsDrawer
        isOpen={!!selectedCardForDetails}
        idCardId={selectedCardForDetails?._id}
        idCard={selectedCardForDetails}
        onClose={() => setSelectedCardForDetails(null)}
      />

      <PrintIDCardModal
        isOpen={!!selectedCardForPrint}
        idCards={selectedCardForPrint ? [selectedCardForPrint] : []}
        idCard={selectedCardForPrint}
        onClose={() => setSelectedCardForPrint(null)}
      />

      <RenewIDCardModal
        isOpen={!!selectedCardForRenew}
        idCard={selectedCardForRenew}
        onClose={() => setSelectedCardForRenew(null)}
        onSuccess={() => {
          fetchCards();
          fetchAnalytics();
        }}
      />

      <RevokeIDCardModal
        isOpen={!!selectedCardForRevoke}
        idCard={selectedCardForRevoke}
        onClose={() => setSelectedCardForRevoke(null)}
        onSuccess={() => {
          fetchCards();
          fetchAnalytics();
        }}
      />
    </div>
  );
};

export default IDCardManagement;
