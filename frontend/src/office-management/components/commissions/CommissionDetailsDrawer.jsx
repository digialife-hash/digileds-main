import React, { useState, useEffect } from "react";
import {
  X,
  Wallet,
  User,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  CreditCard,
  Loader2,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { getCommissionByIdApi } from "../../services/commissionService";
import CommissionStatusBadge from "./CommissionStatusBadge";
import CommissionAdjustmentModal from "./CommissionAdjustmentModal";
import CommissionApprovalModal from "./CommissionApprovalModal";
import ProcessPaymentModal from "./ProcessPaymentModal";
import { useAuth } from "../../context/authStore";

const CommissionDetailsDrawer = ({
  isOpen,
  onClose,
  commissionId,
  onRefreshParent,
}) => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (isOpen && commissionId) {
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, commissionId]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await getCommissionByIdApi(commissionId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load commission details");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const commission = data?.commission;
  const adjustments = data?.adjustments || [];
  const approvals = data?.approvals || [];
  const logs = data?.logs || [];

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
        <div className="relative flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {commission?.commissionId || "Commission Details"}
                  </h2>
                  {commission?.status && (
                    <CommissionStatusBadge status={commission.status} />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Referral: {commission?.referralId?.referralId || "N/A"} – Client: {commission?.referralId?.clientName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {commission && isAdmin && (
                <>
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>

                  <button
                    onClick={() => setShowAdjustmentModal(true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
                  </button>

                  {commission.status !== "Paid" && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Pay
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : commission ? (
              <>
                {/* Financial Summary Card */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-md sm:grid-cols-4">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Project Value
                    </span>
                    <p className="mt-1 text-base font-extrabold">
                      {formatCurrency(commission.projectValue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Gross Commission
                    </span>
                    <p className="mt-1 text-base font-extrabold text-blue-400">
                      {formatCurrency(commission.grossCommission)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Deductions
                    </span>
                    <p className="mt-1 text-base font-extrabold text-rose-400">
                      {formatCurrency(commission.deductions)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Net Payable Amount
                    </span>
                    <p className="mt-1 text-xl font-black text-emerald-400">
                      {formatCurrency(commission.netCommission)}
                    </p>
                  </div>
                </div>

                {/* Information Details Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <User className="h-4 w-4 text-blue-600" /> Partner & Referral Details
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Partner Name</span>
                        <span className="font-bold text-slate-900">
                          {commission.partnerId?.userId?.name || "Partner"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Partner Phone</span>
                        <span className="font-semibold text-slate-800">
                          {commission.partnerId?.userId?.phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Client Name</span>
                        <span className="font-bold text-slate-900">
                          {commission.referralId?.clientName || "Client"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Referral ID</span>
                        <span className="font-semibold text-blue-600">
                          {commission.referralId?.referralId || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <TrendingUp className="h-4 w-4 text-emerald-600" /> Commission Rules & Dates
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Commission Type</span>
                        <span className="font-bold text-slate-900">
                          {commission.commissionType}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Commission Rate</span>
                        <span className="font-bold text-indigo-600">
                          {commission.commissionPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Generated Date</span>
                        <span className="font-medium text-slate-700">
                          {new Date(commission.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Payment Due Date</span>
                        <span className="font-bold text-amber-600">
                          {commission.dueDate
                            ? new Date(commission.dueDate).toLocaleDateString("en-IN")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjustments History */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <SlidersHorizontal className="h-4 w-4 text-orange-600" /> Manual Adjustments History ({adjustments.length})
                  </h3>
                  {adjustments.length === 0 ? (
                    <p className="text-xs text-slate-400">No adjustments applied.</p>
                  ) : (
                    <div className="space-y-2">
                      {adjustments.map((adj) => (
                        <div
                          key={adj._id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-orange-700">
                              {adj.adjustmentType}: ₹{adj.amount}
                            </span>
                            <p className="text-[11px] text-slate-600">{adj.reason}</p>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            By {adj.adjustedBy?.name || "Admin"} on{" "}
                            {new Date(adj.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approvals History */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" /> Approval Workflow History ({approvals.length})
                  </h3>
                  {approvals.length === 0 ? (
                    <p className="text-xs text-slate-400">No approval history.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvals.map((app) => (
                        <div
                          key={app._id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">{app.previousStatus}</span>
                            <span>→</span>
                            <CommissionStatusBadge status={app.newStatus} size="small" />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {app.date} {app.time} by {app.approvedBy?.name || "Admin"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      {commission && (
        <CommissionApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          commission={commission}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {commission && (
        <CommissionAdjustmentModal
          isOpen={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          commission={commission}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {commission && (
        <ProcessPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedCommissions={[commission]}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}
    </>
  );
};

export default CommissionDetailsDrawer;
