import React, { useState, useEffect } from "react";
import {
  X,
  IdCard,
  User,
  Calendar,
  Printer,
  RefreshCw,
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getIDCardByIdApi } from "../../services/idCardService";
import IDCardStatusBadge from "./IDCardStatusBadge";
import IDCardTemplate from "./IDCardTemplate";
import RenewIDCardModal from "./RenewIDCardModal";
import RevokeIDCardModal from "./RevokeIDCardModal";
import PrintIDCardModal from "./PrintIDCardModal";
import { useAuth } from "../../context/authStore";

const IDCardDetailsDrawer = ({
  isOpen,
  onClose,
  idCardId,
  idCard: propIdCard,
  onRefreshParent,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const activeId = idCardId || propIdCard?._id;

  useEffect(() => {
    if (isOpen) {
      if (activeId) {
        fetchDetails(activeId);
      } else if (propIdCard) {
        setData({ idCard: propIdCard });
      }
    } else {
      setData(null);
    }
  }, [isOpen, activeId, propIdCard]);

  const fetchDetails = async (targetId) => {
    try {
      setIsLoading(true);
      const res = await getIDCardByIdApi(targetId);
      if (res?.success) {
        setData(res.data);
      } else if (propIdCard) {
        setData({ idCard: propIdCard });
      }
    } catch (err) {
      console.error("Error fetching ID card details:", err);
      if (propIdCard) {
        setData({ idCard: propIdCard });
      } else {
        toast.error(err.response?.data?.message || "Failed to load ID card details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const idCard = data?.idCard || propIdCard;
  const history = data?.history || [];
  const renewals = data?.renewals || [];
  const revocations = data?.revocations || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
        <div className="relative flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <IdCard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {idCard?.cardNumber || "ID Card Details"}
                  </h2>
                  {idCard?.status && (
                    <IDCardStatusBadge status={idCard.status} />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {idCard?.partnerName || idCard?.holderName} ({idCard?.partnerCode || idCard?.displayId || "—"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {idCard && (
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4 text-emerald-600" /> Print / Export
                </button>
              )}

              {idCard && isAdmin && idCard.status !== "Revoked" && (
                <>
                  <button
                    onClick={() => setShowRenewModal(true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Renew
                  </button>

                  <button
                    onClick={() => setShowRevokeModal(true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Revoke
                  </button>
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
            {isLoading && !idCard ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : idCard ? (
              <>
                {/* Live Card Preview */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Digital ID Card Preview
                  </h3>
                  <div className="overflow-x-auto py-2 flex items-center justify-center bg-slate-100/70 rounded-2xl p-4">
                    <IDCardTemplate
                      idCard={idCard}
                      entityType={idCard.entityType}
                      orientation={idCard.cardOrientation || idCard.orientation || "Portrait"}
                    />
                  </div>
                </div>

                {/* Revocation Banner if Revoked */}
                {revocations.length > 0 && idCard.status === "Revoked" && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-1 text-xs text-rose-900">
                    <div className="flex items-center gap-2 font-extrabold text-rose-700">
                      <XCircle className="h-4 w-4" /> Revocation Summary
                    </div>
                    <p>
                      <strong>Reason:</strong> {revocations[0].reason}
                    </p>
                    <p>
                      <strong>Remarks:</strong> {revocations[0].remarks}
                    </p>
                    <p className="text-[10px] text-rose-600">
                      Revoked on {revocations[0].date} at {revocations[0].time} by {revocations[0].revokedBy?.name || "Admin"}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <User className="h-4 w-4 text-blue-600" /> Identity Information
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Full Name</span>
                        <span className="font-bold text-slate-900">{idCard.partnerName || idCard.holderName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">{idCard.entityType === "employee" ? "Employee ID" : "Partner Code"}</span>
                        <span className="font-mono font-bold text-blue-600">{idCard.partnerCode || idCard.displayId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Designation</span>
                        <span className="font-semibold text-slate-800">{idCard.designation}</span>
                      </div>
                      {idCard.department && (
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Department</span>
                          <span className="font-bold text-slate-900">{idCard.department}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Calendar className="h-4 w-4 text-purple-600" /> Validity & Specifications
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Joining Date</span>
                        <span className="font-semibold text-slate-800">
                          {idCard.joiningDate ? new Date(idCard.joiningDate).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Issue Date</span>
                        <span className="font-semibold text-slate-800">
                          {idCard.issueDate ? new Date(idCard.issueDate).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Expiry Date</span>
                        <span className="font-bold text-blue-700">
                          {idCard.expiryDate ? new Date(idCard.expiryDate).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Card Format</span>
                        <span className="font-bold text-slate-900">{idCard.cardSize || "PVC Card"} ({idCard.cardOrientation || idCard.orientation || "Portrait"})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <IdCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold">No ID Card Details Available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRenewModal && idCard && (
        <RenewIDCardModal
          isOpen={showRenewModal}
          idCard={idCard}
          onClose={() => setShowRenewModal(false)}
          onSuccess={() => {
            fetchDetails(activeId);
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {showRevokeModal && idCard && (
        <RevokeIDCardModal
          isOpen={showRevokeModal}
          idCard={idCard}
          onClose={() => setShowRevokeModal(false)}
          onSuccess={() => {
            fetchDetails(activeId);
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {showPrintModal && idCard && (
        <PrintIDCardModal
          isOpen={showPrintModal}
          idCards={[idCard]}
          idCard={idCard}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  );
};

export default IDCardDetailsDrawer;
