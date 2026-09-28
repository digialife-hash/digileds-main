import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  User,
  Building,
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPaymentByIdApi } from "../../services/paymentHistoryService";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentReceiptModal from "./PaymentReceiptModal";
import { resolveFileUrl } from "../../utils/urlUtils";

const PaymentDetailsDrawer = ({ isOpen, onClose, paymentId }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, paymentId]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentByIdApi(paymentId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load payment details");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const payment = data?.payment;
  const proofs = data?.proofs || [];
  const statusHistory = data?.statusHistory || [];

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
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {payment?.paymentId || "Payment Details"}
                  </h2>
                  {payment?.paymentStatus && (
                    <PaymentStatusBadge status={payment.paymentStatus} />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Receipt #: {payment?.receiptNumber || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>View Receipt</span>
              </button>

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
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : payment ? (
              <>
                {/* Financial Summary */}
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                      Amount Paid
                    </span>
                    <p className="mt-1 text-2xl font-black">
                      {formatCurrency(payment.amountPaid)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-100 block">
                      Mode: {payment.paymentMode}
                    </span>
                    <span className="text-[11px] text-emerald-100">
                      Date: {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <User className="h-4 w-4 text-blue-600" /> Partner & Processed By
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Partner Name</span>
                        <span className="font-bold text-slate-900">
                          {payment.partnerId?.userId?.name || "Partner"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Partner Email</span>
                        <span className="font-semibold text-slate-800">
                          {payment.partnerId?.userId?.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Processed By</span>
                        <span className="font-bold text-slate-900">
                          {payment.processedBy?.name || "Admin"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <CreditCard className="h-4 w-4 text-emerald-600" /> Transaction Identifiers
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Transaction #</span>
                        <span className="font-mono font-bold text-slate-900">
                          {payment.transactionNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Reference #</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {payment.referenceNumber || "N/A"}
                        </span>
                      </div>
                      {payment.bankName && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Bank Name</span>
                          <span className="font-semibold text-slate-800">
                            {payment.bankName}
                          </span>
                        </div>
                      )}
                      {payment.upiId && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">UPI ID</span>
                          <span className="font-semibold text-slate-800">
                            {payment.upiId}
                          </span>
                        </div>
                      )}
                      {payment.chequeNumber && (
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Cheque #</span>
                          <span className="font-semibold text-slate-800">
                            {payment.chequeNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {payment.paymentRemarks && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold text-slate-700">Remarks</h4>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {payment.paymentRemarks}
                    </p>
                  </div>
                )}

                {/* Payment Proof Files */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <FileText className="h-4 w-4 text-blue-600" /> Payment Proof Files ({proofs.length})
                  </h3>
                  {proofs.length === 0 ? (
                    <p className="text-xs text-slate-400">No payment proof uploaded.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {proofs.map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {p.originalName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.proofType} • {(p.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <a
                            href={resolveFileUrl(p.filePath)}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            <Download className="h-3 w-3" /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status History */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Clock className="h-4 w-4 text-purple-600" /> Status Change History ({statusHistory.length})
                  </h3>
                  {statusHistory.length === 0 ? (
                    <p className="text-xs text-slate-400">No status updates.</p>
                  ) : (
                    <div className="space-y-2">
                      {statusHistory.map((sh) => (
                        <div
                          key={sh._id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">{sh.previousStatus}</span>
                            <span>→</span>
                            <PaymentStatusBadge status={sh.newStatus} size="small" />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {sh.date} {sh.time} by {sh.updatedBy?.name || "User"}
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

      {/* Receipt Modal */}
      {payment && (
        <PaymentReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          paymentId={payment._id}
        />
      )}
    </>
  );
};

export default PaymentDetailsDrawer;
