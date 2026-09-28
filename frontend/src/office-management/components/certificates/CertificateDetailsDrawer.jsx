import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  User,
  Building,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  XCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getCertificateByIdApi } from "../../services/certificateService";
import CertificateStatusBadge from "./CertificateStatusBadge";
import CertificateTemplate from "./CertificateTemplate";
import RenewCertificateModal from "./RenewCertificateModal";
import RevokeCertificateModal from "./RevokeCertificateModal";
import PrintCertificateModal from "./PrintCertificateModal";
import { useAuth } from "../../context/authStore";

const CertificateDetailsDrawer = ({
  isOpen,
  onClose,
  certificateId,
  onRefreshParent,
}) => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (isOpen && certificateId) {
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, certificateId]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await getCertificateByIdApi(certificateId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load certificate details");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const certificate = data?.certificate;
  const history = data?.history || [];
  const renewals = data?.renewals || [];
  const revocations = data?.revocations || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
        <div className="relative flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {certificate?.certificateNumber || "Certificate Details"}
                  </h2>
                  {certificate?.status && (
                    <CertificateStatusBadge status={certificate.status} />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {certificate?.partnerName} ({certificate?.partnerCode})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {certificate && (
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4 text-amber-600" /> Print / Export
                </button>
              )}

              {certificate && isAdmin && certificate.status !== "Revoked" && (
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
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : certificate ? (
              <>
                {/* Live Certificate Preview */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Official Certificate Preview
                  </h3>
                  <div className="overflow-x-auto py-2 flex justify-center">
                    <CertificateTemplate certificate={certificate} scale={0.7} />
                  </div>
                </div>

                {/* Revocation Summary if Revoked */}
                {revocations.length > 0 && certificate.status === "Revoked" && (
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

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <User className="h-4 w-4 text-blue-600" /> Partner Info
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Full Name</span>
                        <span className="font-bold text-slate-900">{certificate.partnerName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Partner Code</span>
                        <span className="font-mono font-bold text-blue-600">{certificate.partnerCode}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Category Type</span>
                        <span className="font-bold text-amber-700">{certificate.certificateType}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Signatory</span>
                        <span className="font-bold text-slate-900">{certificate.authorizedSignatory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Calendar className="h-4 w-4 text-purple-600" /> Dates & Validity
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Issue Date</span>
                        <span className="font-medium text-slate-700">
                          {new Date(certificate.issueDate).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Expiry Date</span>
                        <span className="font-bold text-amber-600">
                          {new Date(certificate.expiryDate).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Orientation</span>
                        <span className="font-semibold text-slate-800">{certificate.orientation} ({certificate.paperSize})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renewal History */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <RefreshCw className="h-4 w-4 text-purple-600" /> Renewal History ({renewals.length})
                  </h3>
                  {renewals.length === 0 ? (
                    <p className="text-xs text-slate-400">No renewals recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {renewals.map((ren) => (
                        <div
                          key={ren._id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-purple-700">
                              Extended to {new Date(ren.newExpiryDate).toLocaleDateString("en-IN")}
                            </span>
                            <p className="text-[11px] text-slate-600">{ren.remarks}</p>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            By {ren.renewedBy?.name || "Admin"} on{" "}
                            {new Date(ren.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Log */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Clock className="h-4 w-4 text-blue-600" /> Activity Log ({history.length})
                  </h3>
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400">No activity history.</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((h) => (
                        <div
                          key={h._id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{h.action}</span>
                            <p className="text-[11px] text-slate-600">{h.description}</p>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(h.createdAt).toLocaleDateString("en-IN")} by {h.performedBy?.name || "User"}
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
      {certificate && (
        <RenewCertificateModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          certificate={certificate}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {certificate && (
        <RevokeCertificateModal
          isOpen={showRevokeModal}
          onClose={() => setShowRevokeModal(false)}
          certificate={certificate}
          onSuccess={() => {
            fetchDetails();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}

      {certificate && (
        <PrintCertificateModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          certificates={[certificate]}
        />
      )}
    </>
  );
};

export default CertificateDetailsDrawer;
