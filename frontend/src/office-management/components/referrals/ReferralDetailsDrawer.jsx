import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Clock,
  UserPlus,
  RefreshCw,
  FileText,
  MessageSquare,
  Lock,
  ShieldCheck,
  Download,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getReferralByIdApi } from "../../services/referralClientService";
import ReferralStatusBadge from "./ReferralStatusBadge";
import ReferralCommentsSection from "./ReferralCommentsSection";
import ReferralInternalNotesSection from "./ReferralInternalNotesSection";
import ReferralAttachmentsList from "./ReferralAttachmentsList";
import ReferralTimelineView from "./ReferralTimelineView";
import ReferralActivityLogTable from "./ReferralActivityLogTable";
import ReferralStatusChangeModal from "./ReferralStatusChangeModal";
import AssignEmployeeModal from "./AssignEmployeeModal";
import { useAuth } from "../../context/authStore";

const ReferralDetailsDrawer = ({
  isOpen,
  onClose,
  referralId,
  onRefreshParent,
}) => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (isOpen && referralId) {
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, referralId]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await getReferralByIdApi(referralId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load details");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const referral = data?.referral;
  const statusHistory = data?.statusHistory || [];
  const assignmentHistory = data?.assignmentHistory || [];
  const comments = data?.comments || [];
  const attachments = data?.attachments || [];
  const activityLogs = data?.activityLogs || [];
  const internalNotes = data?.internalNotes || [];

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
        <div className="relative flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {referral?.clientName || "Loading Details..."}
                  </h2>
                  {referral?.status && (
                    <ReferralStatusBadge status={referral.status} />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {referral?.referralId} • {referral?.companyName || "No Company"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {referral && (
                <>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Status
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Assign
                    </button>
                  )}
                </>
              )}

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "comments", label: `Comments (${comments.length})` },
              { id: "attachments", label: `Attachments (${attachments.length})` },
              { id: "timeline", label: "Timeline" },
              { id: "activity", label: "Activity Logs" },
              ...(isAdmin
                ? [{ id: "notes", label: `Internal Notes (${internalNotes.length})` }]
                : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-3 px-4 text-xs font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : referral ? (
              <>
                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Information Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Client Info Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <User className="h-4 w-4 text-blue-600" /> Client Information
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Client Name</span>
                            <span className="font-bold text-slate-900">
                              {referral.clientName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Company Name</span>
                            <span className="font-semibold text-slate-800">
                              {referral.companyName || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Mobile Number</span>
                            <span className="font-semibold text-blue-600">
                              {referral.mobileNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Email Address</span>
                            <span className="font-semibold text-slate-900">
                              {referral.email}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500">Address</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                              {referral.address || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Business & Assignment Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <Briefcase className="h-4 w-4 text-emerald-600" /> Business Details
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Service Required</span>
                            <span className="font-bold text-slate-900">
                              {referral.serviceRequired}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Estimated Budget</span>
                            <span className="font-extrabold text-emerald-600">
                              {formatCurrency(referral.estimatedBudget)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Assigned Employee</span>
                            <span className="font-bold text-indigo-600">
                              {referral.assignedEmployee
                                ? referral.assignedEmployee.name
                                : "Unassigned"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Referral Partner</span>
                            <span className="font-semibold text-slate-800">
                              {referral.partnerId?.userId?.name || "Partner"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500">Submitted Date</span>
                            <span className="font-medium text-slate-600">
                              {new Date(referral.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {referral.notes && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <h4 className="text-xs font-bold text-slate-700">Notes / Remarks</h4>
                        <p className="mt-1 text-xs font-medium text-slate-600 whitespace-pre-wrap">
                          {referral.notes}
                        </p>
                      </div>
                    )}

                    {/* Status History */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Clock className="h-4 w-4 text-purple-600" /> Status Change History
                      </h3>
                      {statusHistory.length === 0 ? (
                        <p className="text-xs text-slate-400">No status history records.</p>
                      ) : (
                        <div className="space-y-2">
                          {statusHistory.map((sh) => (
                            <div
                              key={sh._id}
                              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">
                                  {sh.previousStatus}
                                </span>
                                <span>→</span>
                                <ReferralStatusBadge status={sh.currentStatus} size="small" />
                              </div>
                              <div className="text-right text-[11px]">
                                <p className="font-semibold text-slate-700">
                                  {sh.remarks}
                                </p>
                                <p className="text-slate-400">
                                  {sh.date} {sh.time} by {sh.changedBy?.name || "User"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: COMMENTS */}
                {activeTab === "comments" && (
                  <ReferralCommentsSection
                    referralId={referral._id}
                    comments={comments}
                    onRefresh={fetchDetails}
                  />
                )}

                {/* TAB 3: ATTACHMENTS */}
                {activeTab === "attachments" && (
                  <ReferralAttachmentsList
                    referralId={referral._id}
                    attachments={attachments}
                    onRefresh={fetchDetails}
                  />
                )}

                {/* TAB 4: TIMELINE */}
                {activeTab === "timeline" && (
                  <ReferralTimelineView timeline={data?.activityLogs ? data.activityLogs.map(a => ({
                    id: a._id,
                    date: new Date(a.createdAt).toISOString().split('T')[0],
                    time: new Date(a.createdAt).toTimeString().split(' ')[0],
                    user: a.user?.name || "System",
                    role: a.role || a.user?.role,
                    activity: a.action,
                    description: a.description
                  })) : []} />
                )}

                {/* TAB 5: ACTIVITY LOGS */}
                {activeTab === "activity" && (
                  <ReferralActivityLogTable activityLogs={activityLogs} />
                )}

                {/* TAB 6: INTERNAL NOTES (ADMIN ONLY) */}
                {activeTab === "notes" && isAdmin && (
                  <ReferralInternalNotesSection
                    referralId={referral._id}
                    internalNotes={internalNotes}
                    onRefresh={fetchDetails}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {referral && (
        <ReferralStatusChangeModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          referral={referral}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {/* Assign Employee Modal */}
      {referral && (
        <AssignEmployeeModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          referral={referral}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}
    </>
  );
};

export default ReferralDetailsDrawer;
