import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  adminGetAllServiceDetailsApi,
  adminGetServiceDetailByIdApi,
  adminUpdateServiceDetailStatusApi,
} from "../../services/clientServiceDetailService";
import { getEmployees } from "../../services/employeeService";
import { getInvoices } from "../../services/invoiceService";
import BillingInvoicesSection from "../../components/serviceDetails/BillingInvoicesSection";
import { ROUTES } from "../../routes/routeConstants";
import SocialMediaManagementForm from "../../components/serviceDetails/SocialMediaManagementForm";
import WebsiteDevelopmentForm from "../../components/serviceDetails/WebsiteDevelopmentForm";
import SeoDetailsForm from "../../components/serviceDetails/SeoDetailsForm";
import BrandingDetailsForm from "../../components/serviceDetails/BrandingDetailsForm";
import ContentWritingForm from "../../components/serviceDetails/ContentWritingForm";
import VideoEditingForm from "../../components/serviceDetails/VideoEditingForm";
import CustomServiceDetailsForm from "../../components/serviceDetails/CustomServiceDetailsForm";

const STATUS_BADGE_CLASS = {
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-purple-50 text-purple-700 border-purple-200",
  changes_requested: "bg-rose-50 text-rose-700 border-rose-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const STATUS_LABEL = {
  not_started: "Not Started",
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

const AdminServiceDetails = () => {
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");

  // Review Drawer State
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [billingInvoices, setBillingInvoices] = useState([]);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  // Review Actions Form
  const [changeMsg, setChangeMsg] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [assignEmpId, setAssignEmpId] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchServiceDetails();
  }, [pagination.page, selectedStatus, selectedServiceType, search]);

  async function fetchEmployees() {
    try {
      const empRes = await getEmployees({ limit: 100 });
      if (empRes?.data?.employees) {
        setEmployees(empRes.data.employees);
      }
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  }

  async function fetchServiceDetails() {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        serviceType: selectedServiceType,
      };

      const res = await adminGetAllServiceDetailsApi(params);
      if (res?.success) {
        setServiceDetails(res.data.serviceDetails || []);
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
      toast.error("Failed to load client service details");
    } finally {
      setIsLoading(false);
    }
  }

  const openReviewDrawer = async (id) => {
    setSelectedDetailId(id);
    setChangeMsg("");
    setInternalNote("");
    try {
      setIsLoadingDetail(true);
      const res = await adminGetServiceDetailByIdApi(id);
      if (res?.success) {
        const serviceDetail = res.data.serviceDetail;
        setDetailData(serviceDetail);
        setAssignEmpId(serviceDetail?.assignedEmployeeId?._id || "");
        void fetchBillingInvoices(serviceDetail);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load submission details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || "";
  };

  const getServiceInvoices = (invoiceList, serviceDetail) =>
    invoiceList.filter((invoice) => {
      const invoiceServiceDetailId = getId(invoice.serviceDetailId);
      if (invoiceServiceDetailId) return invoiceServiceDetailId === serviceDetail._id;
      if (invoice.serviceType) return invoice.serviceType === serviceDetail.serviceType;
      return getId(invoice.clientId) === getId(serviceDetail.clientId);
    });

  async function fetchBillingInvoices(serviceDetail = detailData) {
    if (!serviceDetail) return;

    try {
      setIsBillingLoading(true);
      setBillingError("");
      const res = await getInvoices({
        clientId: getId(serviceDetail.clientId),
        limit: 100,
      });
      setBillingInvoices(getServiceInvoices(res?.data?.invoices || [], serviceDetail));
    } catch (err) {
      console.error(err);
      setBillingError(err.message || "Unable to load invoices for this service.");
    } finally {
      setIsBillingLoading(false);
    }
  }

  const handleReviewAction = async (action, extraPayload = {}) => {
    if (!selectedDetailId) return;

    try {
      setIsSubmittingAction(true);
      const payload = { action, ...extraPayload };

      if (action === "request_changes") {
        if (!changeMsg.trim()) {
          toast.error("Please provide a message explaining requested changes");
          return;
        }
        payload.message = changeMsg;
      }

      if (action === "add_internal_note") {
        if (!internalNote.trim()) {
          toast.error("Please enter internal note text");
          return;
        }
        payload.noteText = internalNote;
      }

      if (action === "assign_employee") {
        payload.assignedEmployeeId = assignEmpId;
      }

      const res = await adminUpdateServiceDetailStatusApi(selectedDetailId, payload);
      if (res?.success) {
        toast.success("Service Detail updated successfully!");
        setDetailData(res.data.serviceDetail);
        setChangeMsg("");
        setInternalNote("");
        fetchServiceDetails();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const renderFormReadOnly = () => {
    if (!detailData) return null;
    const sType = detailData.serviceType;
    const props = { serviceDetail: detailData, isReadOnly: true };

    if (sType === "social_media_management") return <SocialMediaManagementForm {...props} />;
    if (sType === "website_development") return <WebsiteDevelopmentForm {...props} />;
    if (sType === "seo") return <SeoDetailsForm {...props} />;
    if (sType === "branding") return <BrandingDetailsForm {...props} />;
    if (sType === "content_writing") return <ContentWritingForm {...props} />;
    if (sType === "video_editing") return <VideoEditingForm {...props} />;
    return <CustomServiceDetailsForm {...props} />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Client Service Details Submissions
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Review, approve, request changes, and manage service requirements submitted by clients
            </p>
          </div>
        </div>

        <button
          onClick={fetchServiceDetails}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-xs p-5 space-y-4">
        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, company, service..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50 font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-white"
            >
              <option value="">All Services</option>
              <option value="social_media_management">Social Media Management</option>
              <option value="website_development">Website Development</option>
              <option value="seo">SEO</option>
              <option value="branding">Branding & Design</option>
              <option value="content_writing">Content Writing</option>
              <option value="video_editing">Video Editing</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-white"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="animate-spin" size={24} />
              <span className="text-xs font-medium">Loading Submissions...</span>
            </div>
          ) : serviceDetails.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <FileText size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold">No Service Details Submissions Found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Assigned Member</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {serviceDetails.map((detail) => {
                  const client = detail.clientId;
                  const status = detail.status || "not_started";
                  const pct = detail.completionPercentage || 0;

                  return (
                    <tr key={detail._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {client?.companyName || client?.clientName || "Client"}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-normal">
                          {client?.email || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-blue-700">
                        {detail.serviceName}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">{pct}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {detail.assignedEmployeeId?.name || "Unassigned"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                            STATUS_BADGE_CLASS[status] || STATUS_BADGE_CLASS.not_started
                          }`}
                        >
                          {STATUS_LABEL[status] || status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString("en-IN") : "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openReviewDrawer(detail._id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition inline-flex items-center space-x-1"
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Slide-over Drawer */}
      {selectedDetailId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="relative flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 text-white px-6 py-4">
              <div>
                <h2 className="text-base font-bold">
                  {detailData?.clientId?.companyName} — {detailData?.serviceName}
                </h2>
                <p className="text-xs text-slate-300">
                  Client: {detailData?.clientId?.clientName} ({detailData?.clientId?.email})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDetailId(null);
                  setDetailData(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingDetail ? (
                <div className="py-20 flex justify-center">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
              ) : detailData ? (
                <>
                  {/* Status & Review Controls Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-600">Current Status:</span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                          STATUS_BADGE_CLASS[detailData.status] || STATUS_BADGE_CLASS.not_started
                        }`}
                      >
                        {STATUS_LABEL[detailData.status]}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReviewAction("approve")}
                        disabled={isSubmittingAction}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs inline-flex items-center space-x-1"
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Request Changes Form */}
                  <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2">
                    <label className="block text-xs font-bold text-rose-900">Request Changes from Client</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={changeMsg}
                        onChange={(e) => setChangeMsg(e.target.value)}
                        placeholder="Explain missing information or required changes..."
                        className="flex-1 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold focus:outline-none"
                      />
                      <button
                        onClick={() => handleReviewAction("request_changes")}
                        disabled={isSubmittingAction}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shrink-0"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>

                  {/* Assign Team Member */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Assign Employee / Manager</label>
                    <div className="flex gap-2">
                      <select
                        value={assignEmpId}
                        onChange={(e) => setAssignEmpId(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold"
                      >
                        <option value="">-- Unassigned --</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({emp.department || emp.designation})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleReviewAction("assign_employee")}
                        disabled={isSubmittingAction}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shrink-0"
                      >
                        Assign Member
                      </button>
                    </div>
                  </div>

                  {/* Client Form Data Readonly Renderer */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Submitted Form Data & Assets
                    </h3>
                    {renderFormReadOnly()}
                  </div>

                  <BillingInvoicesSection
                    invoices={billingInvoices}
                    isLoading={isBillingLoading}
                    errorMessage={billingError}
                    onRetry={() => fetchBillingInvoices(detailData)}
                    onCreateInvoice={() =>
                      navigate(
                        `${ROUTES.SUPER_ADMIN_INVOICES}?clientId=${getId(detailData.clientId)}&serviceDetailId=${detailData._id}`
                      )
                    }
                    onViewInvoice={(invoice) =>
                      navigate(`${ROUTES.SUPER_ADMIN_INVOICES}?invoiceId=${invoice._id}`)
                    }
                    serviceName={detailData.serviceName}
                    canCreate
                  />

                  {/* Internal Notes Section (Hidden from Client) */}
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                      <MessageSquare size={14} />
                      <span>Internal Team Notes (Hidden from Client)</span>
                    </h4>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(detailData.internalNotes || []).map((n, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs">
                          <p className="font-semibold text-slate-900">{n.note}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            By {n.createdBy?.name || "Admin"} on {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Add internal note..."
                        className="flex-1 rounded-xl border border-amber-200 bg-white px-3.5 py-1.5 text-xs font-semibold focus:outline-none"
                      />
                      <button
                        onClick={() => handleReviewAction("add_internal_note")}
                        disabled={isSubmittingAction}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceDetails;
