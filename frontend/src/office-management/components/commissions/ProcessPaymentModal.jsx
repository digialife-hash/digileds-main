import React, { useState } from "react";
import {
  X,
  CreditCard,
  Building2,
  QrCode,
  FileCheck,
  Banknote,
  Loader2,
  CheckCircle2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  processPaymentApi,
  uploadPaymentProofApi,
} from "../../services/commissionService";

const PAYMENT_MODES = ["Bank Transfer", "UPI", "Cash", "Cheque"];

const ProcessPaymentModal = ({
  isOpen,
  onClose,
  selectedCommissions = [],
  onSuccess,
}) => {
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [proofFiles, setProofFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || selectedCommissions.length === 0) return null;

  // Calculate totals
  const totalAmount = selectedCommissions.reduce(
    (acc, c) => acc + (c.netCommission || 0),
    0
  );
  const partnerId = selectedCommissions[0]?.partnerId?._id || selectedCommissions[0]?.partnerId;
  const partnerName =
    selectedCommissions[0]?.partnerId?.userId?.name || "Referral Partner";

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProofFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const commIds = selectedCommissions.map((c) => c._id);
      const res = await processPaymentApi({
        commissionIds: commIds,
        partnerId,
        amountPaid: totalAmount,
        paymentMode,
        transactionNumber,
        referenceNumber,
        bankName,
        upiId,
        chequeNumber,
        paymentRemarks,
      });

      if (res.success && res.data?.payment) {
        const paymentId = res.data.payment._id;

        // Upload proof files if any selected
        if (proofFiles.length > 0) {
          const body = new FormData();
          proofFiles.forEach((f) => body.append("proofs", f));
          await uploadPaymentProofApi(paymentId, body);
        }

        toast.success(`Payment of ₹${totalAmount} processed successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to process payment");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Process Commission Payment
              </h2>
              <p className="text-xs text-slate-500">
                {selectedCommissions.length} commission(s) for {partnerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {/* Summary Box */}
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200">
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Total Payable Amount
              </p>
              <p className="text-2xl font-black text-emerald-700">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-emerald-200/60 px-3 py-1 text-xs font-bold text-emerald-800">
              {selectedCommissions.length} Item(s)
            </span>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Payment Mode <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                    paymentMode === mode
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {mode === "Bank Transfer" && <Building2 className="h-4 w-4" />}
                  {mode === "UPI" && <QrCode className="h-4 w-4" />}
                  {mode === "Cash" && <Banknote className="h-4 w-4" />}
                  {mode === "Cheque" && <FileCheck className="h-4 w-4" />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Mode Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paymentMode === "Bank Transfer" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Transaction / NEFT Number
                  </label>
                  <input
                    type="text"
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="e.g. UTR123456789"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            {paymentMode === "UPI" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    UPI Transaction ID / Ref
                  </label>
                  <input
                    type="text"
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="e.g. 3214569870"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. partner@upi"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            {paymentMode === "Cheque" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="e.g. 000123"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. ICICI Bank"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Payment Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Internal ref / voucher #"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Payment Remarks
            </label>
            <textarea
              rows="2"
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
              placeholder="Notes regarding this payout..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Payment Proof Upload (Section 9) */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-bold text-slate-700">
              Payment Proof / Receipt Upload (PDF, JPG, PNG)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <Upload className="h-4 w-4 text-emerald-600" />
                <span>Select Proof Files</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500">
                {proofFiles.length} file(s) chosen
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Payout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessPaymentModal;
