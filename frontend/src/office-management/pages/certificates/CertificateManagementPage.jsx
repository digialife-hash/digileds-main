import React, { useState, useEffect } from "react";
import {
  Award,
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  RefreshCw,
  XCircle,
  Users,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCertificatesApi,
  getCertificateAnalyticsApi,
  deleteCertificateApi,
} from "../../services/certificateService";
import { useAuth } from "../../context/authStore";
import CertificateStatusBadge from "../../components/certificates/CertificateStatusBadge";
import IssueCertificateModal from "../../components/certificates/IssueCertificateModal";
import CertificateDetailsDrawer from "../../components/certificates/CertificateDetailsDrawer";
import RenewCertificateModal from "../../components/certificates/RenewCertificateModal";
import RevokeCertificateModal from "../../components/certificates/RevokeCertificateModal";
import PrintCertificateModal from "../../components/certificates/PrintCertificateModal";

const CertificateManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'employee', 'referral_partner', 'Active', 'Expired', 'Revoked'
  const [search, setSearch] = useState("");

  // Modals & Drawers
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const [renewTargetCert, setRenewTargetCert] = useState(null);
  const [revokeTargetCert, setRevokeTargetCert] = useState(null);
  const [printTargetCerts, setPrintTargetCerts] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [pagination.page, activeTab, search]);

  const fetchAnalytics = async () => {
    try {
      const res = await getCertificateAnalyticsApi();
      if (res?.success) {
        setAnalytics(res.data?.metrics);
      }
    } catch (err) {
      console.error("Error loading certificate analytics:", err);
    }
  };

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
      };

      if (activeTab === "employee" || activeTab === "referral_partner") {
        params.entityType = activeTab;
      } else if (["Active", "Expired", "Revoked"].includes(activeTab)) {
        params.status = activeTab;
      }

      const res = await getCertificatesApi(params);
      if (res?.success) {
        setCertificates(res.data.certificates || []);
        if (res.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.data.pagination.total,
            pages: res.data.pagination.pages,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = analytics || {
    totalCertificates: 0,
    activeCertificates: 0,
    employeeCerts: 0,
    partnerCerts: 0,
    expiredCertificates: 0,
    revokedCertificates: 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-2.5 text-white shadow-md shadow-amber-500/20">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Certificate Management
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Issue and manage verified official recognition certificates for Employees & Referral Partners
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition"
          >
            <Plus size={16} />
            <span>Issue Certificate</span>
          </button>
        )}
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Certificates
            </span>
            <Award size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{metrics.totalCertificates}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 mt-1">{metrics.activeCertificates}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Employees
            </span>
            <UserCheck size={16} className="text-blue-500" />
          </div>
          <p className="text-xl font-black text-blue-600 mt-1">{metrics.employeeCerts}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Partners
            </span>
            <Building2 size={16} className="text-indigo-500" />
          </div>
          <p className="text-xl font-black text-indigo-600 mt-1">{metrics.partnerCerts}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Expired
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600 mt-1">{metrics.expiredCertificates}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Revoked
            </span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-1">{metrics.revokedCertificates}</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-xs overflow-hidden space-y-4 p-5">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
            {[
              { id: "all", label: "All Certificates" },
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
                    ? "bg-white text-amber-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

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
                placeholder="Search recipient, cert #, title..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>

            <button
              onClick={() => {
                fetchCertificates();
                fetchAnalytics();
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Refresh Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="animate-spin" size={24} />
              <span className="text-xs font-medium">Loading Certificates...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <Award size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold">No Certificates Found</p>
              <p className="text-xs text-slate-400">
                Issue a new certificate or adjust your filter parameters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Certificate #</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {certificates.map((cert) => {
                  const isEmp = cert.entityType === "employee";
                  const holderName = cert.partnerName || cert.holderName || "—";

                  return (
                    <tr key={cert._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {holderName}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {cert.partnerCode || cert.displayId || "—"}
                        </span>
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

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {cert.certificateNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-700">{cert.certificateType}</td>

                      <td className="py-3 px-4 text-slate-600">
                        {cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {cert.expiryDate
                          ? new Date(cert.expiryDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <CertificateStatusBadge status={cert.status} size="small" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedCertificateId(cert._id);
                              setShowDetailsDrawer(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="View Certificate"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => setPrintTargetCerts([cert])}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Print Certificate"
                          >
                            <Printer size={15} />
                          </button>

                          {isAdmin && cert.status !== "Revoked" && (
                            <button
                              onClick={() => setRevokeTargetCert(cert)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Revoke Certificate"
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
      </div>

      {/* Modals & Drawers */}
      <IssueCertificateModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSuccess={() => {
          fetchCertificates();
          fetchAnalytics();
        }}
      />

      <CertificateDetailsDrawer
        isOpen={showDetailsDrawer}
        certificateId={selectedCertificateId}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedCertificateId(null);
        }}
      />

      {printTargetCerts && (
        <PrintCertificateModal
          isOpen={!!printTargetCerts}
          certificates={printTargetCerts}
          onClose={() => setPrintTargetCerts(null)}
        />
      )}

      {revokeTargetCert && (
        <RevokeCertificateModal
          isOpen={!!revokeTargetCert}
          certificate={revokeTargetCert}
          onClose={() => setRevokeTargetCert(null)}
          onSuccess={() => {
            fetchCertificates();
            fetchAnalytics();
          }}
        />
      )}
    </div>
  );
};

export default CertificateManagementPage;
