import React, { useState, useEffect } from "react";
import { X, Printer, Download, Receipt, Building, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getPaymentReceiptApi } from "../../services/paymentHistoryService";

const PaymentReceiptModal = ({ isOpen, onClose, paymentId }) => {
  const [receiptData, setReceiptData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchReceipt();
    } else {
      setReceiptData(null);
    }
  }, [isOpen, paymentId]);

  const fetchReceipt = async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentReceiptApi(paymentId);
      if (res.success) {
        setReceiptData(res.data?.receipt);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Payment Receipt
              </h2>
              <p className="text-xs text-slate-500">
                Downloadable & printable payment voucher
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 text-blue-600" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div className="p-8 print:p-0 space-y-6" id="printable-receipt">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : receiptData ? (
            <>
              {/* Receipt Header & Company Logo */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {receiptData.company?.name || "Digital Alife Pvt Ltd"}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                    {receiptData.company?.address || "Tech Park, India"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Phone: {receiptData.company?.phone} • Email: {receiptData.company?.email}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    PAYMENT RECEIPT
                  </span>
                  <p className="mt-2 text-xs font-mono font-extrabold text-slate-800">
                    {receiptData.receiptNumber}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Date: {new Date(receiptData.paymentDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Partner Details */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Paid To Partner
                  </span>
                  <p className="mt-1 font-extrabold text-slate-900 text-sm">
                    {receiptData.partnerName}
                  </p>
                  <p className="text-slate-500">{receiptData.partnerEmail}</p>
                  <p className="text-slate-500">Phone: {receiptData.partnerPhone}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payment Information
                  </span>
                  <p className="mt-1 font-bold text-slate-900">
                    Payment ID: {receiptData.paymentId}
                  </p>
                  <p className="text-slate-600 font-semibold">
                    Payment Mode: {receiptData.paymentMode}
                  </p>
                  <p className="text-slate-500">
                    Txn #: {receiptData.transactionNumber}
                  </p>
                </div>
              </div>

              {/* Linked Commissions Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Commission Breakdown
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5">Commission ID</th>
                        <th className="px-4 py-2.5">Referral ID</th>
                        <th className="px-4 py-2.5">Client Name</th>
                        <th className="px-4 py-2.5 text-right">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {receiptData.linkedCommissions?.map((c, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 font-bold text-blue-600">
                            {c.commissionId}
                          </td>
                          <td className="px-4 py-2.5">{c.referralId || "N/A"}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">
                            {c.clientName || "N/A"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                            {formatCurrency(c.netCommission)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Paid Summary */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-600 p-5 text-white shadow-md">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Total Amount Paid
                  </span>
                  <p className="mt-0.5 text-xs text-emerald-100">
                    Status: {receiptData.paymentStatus}
                  </p>
                </div>
                <div className="text-2xl font-black">
                  {formatCurrency(receiptData.amountPaid)}
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="flex items-end justify-between pt-6 text-[11px] text-slate-400">
                <div>
                  <p className="font-semibold text-slate-600">
                    Processed by: {receiptData.processedBy}
                  </p>
                  <p className="text-[10px]">Computer generated digital receipt</p>
                </div>
                <div className="text-right">
                  <div className="mb-1 h-8 w-32 border-b border-slate-300 border-dashed" />
                  <p className="font-bold text-slate-700">Authorized Signature</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
