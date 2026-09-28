import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ShieldCheck,
  XCircle,
  Award,
  Building2,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { verifyCertificatePublicApi } from "../../services/certificateService";

const PublicCertificateVerificationPage = () => {
  const { certificateNumber } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateNumber) {
      verifyCert();
    }
  }, [certificateNumber]);

  const verifyCert = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await verifyCertificatePublicApi(certificateNumber);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid or unverified Certificate");
      if (err.response?.data?.data) {
        setData(err.response.data.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const status = data?.verificationStatus || "INVALID";
  const isValid = data?.isValid;
  const cert = data?.certificateDetails;
  const company = data?.companyDetails;
  const revocation = data?.revocationDetails;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-serif select-none">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Company Header */}
        <div className="border-b border-slate-800 bg-slate-900/80 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 font-extrabold text-white text-xl shadow-lg shadow-amber-500/20 mb-2 font-sans">
            DA
          </div>
          <h1 className="text-lg font-black text-white tracking-tight uppercase font-sans">
            {company?.name || "Digital Alife Pvt Ltd"}
          </h1>
          <p className="text-xs font-semibold text-amber-400 font-sans">
            Official Certificate Verification Registry
          </p>
        </div>

        {/* Verification Status Banner */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 font-sans">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <span className="text-xs font-semibold">Verifying certificate authenticity...</span>
            </div>
          ) : isValid ? (
            <>
              {/* Active Verification Card */}
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-950/60 p-4 border border-emerald-500/40 text-emerald-400 font-sans">
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                <span className="text-sm font-extrabold tracking-wide uppercase">
                  VERIFIED OFFICIAL CERTIFICATE
                </span>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                  <Award className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {cert?.partnerName}
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-1 font-sans">
                    Partner Code: {cert?.partnerCode}
                  </p>
                </div>

                <div className="py-2 space-y-1">
                  <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 font-sans">
                    {cert?.certificateType}
                  </span>
                  <p className="text-xs text-slate-300 italic pt-1 font-sans">
                    "{cert?.achievement}"
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-left font-sans">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Certificate #:
                    </span>
                    <span className="font-mono font-bold text-white">
                      {cert?.certificateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Signatory:
                    </span>
                    <span className="font-bold text-slate-200">
                      {cert?.authorizedSignatory}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Issue Date:
                    </span>
                    <span className="text-slate-300">
                      {new Date(cert?.issueDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Expiry Date:
                    </span>
                    <span className="font-bold text-amber-400">
                      {new Date(cert?.expiryDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Invalid / Revoked / Expired Banner */
            <div className="space-y-4 text-center font-sans">
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-rose-950/80 p-4 border border-rose-500/50 text-rose-400">
                <XCircle className="h-6 w-6 text-rose-500 shrink-0" />
                <span className="text-sm font-extrabold tracking-wide uppercase">
                  {status === "Revoked"
                    ? "REVOKED / INVALID CERTIFICATE"
                    : status === "Expired"
                    ? "EXPIRED CERTIFICATE"
                    : "UNVERIFIED CERTIFICATE"}
                </span>
              </div>

              {cert && (
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <p className="text-base font-bold text-white">{cert.partnerName}</p>
                  <p className="font-mono text-slate-400">Cert #: {cert.certificateNumber}</p>
                  {revocation && (
                    <div className="text-rose-400 text-left pt-2 border-t border-slate-700/60 text-[11px] space-y-0.5">
                      <p><strong>Revocation Reason:</strong> {revocation.reason}</p>
                      <p><strong>Remarks:</strong> {revocation.remarks}</p>
                      <p className="text-[10px] text-slate-400">Date: {revocation.date} {revocation.time}</p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-400">
                If you believe this is an error, please contact company support at support@digitalalife.com.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/80 p-4 text-center text-[10px] text-slate-500 font-sans">
          Digital Alife Public Certificate Registry Protocol • Digitally Verified
        </div>
      </div>
    </div>
  );
};

export default PublicCertificateVerificationPage;
