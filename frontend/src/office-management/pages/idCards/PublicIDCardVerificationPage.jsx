import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ShieldCheck,
  XCircle,
  Loader2,
  Building2,
  Phone,
  Mail,
  Globe,
  Calendar,
  BadgeCheck,
  IdCard,
  User,
  AlertTriangle,
} from "lucide-react";
import { verifyQRCodePublicApi } from "../../services/idCardService";
import BrandLogo from "../../components/common/BrandLogo";
import { resolveFileUrl } from "../../utils/urlUtils";

const PublicIDCardVerificationPage = () => {
  const { cardNumber, token } = useParams();
  const lookupKey = token || cardNumber;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lookupKey) verifyCard();
  }, [lookupKey]);

  const verifyCard = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await verifyQRCodePublicApi(lookupKey);

      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to verify this ID Card."
      );

      if (err.response?.data?.data) {
        setData(err.response.data.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const holder = data?.holderDetails || data?.partnerDetails;
  const company = data?.companyDetails;
  const revocation = data?.revocationDetails;
  const entityType = data?.entityType || holder?.entityType || "referral_partner";
  const isEmployee = entityType === "employee";

  const isValid = data?.isValid;
  const status = data?.verificationStatus || "INVALID";

  const photo =
    holder?.photo
      ? holder.photo.startsWith("http")
        ? holder.photo
        : resolveFileUrl(holder.photo)
      : "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-[380px] rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-b from-sky-200 via-blue-200 to-indigo-200 border-b border-blue-300/60 text-slate-900 text-center px-6 pt-8 pb-14 relative flex justify-center shadow-xs">
          <BrandLogo
            size="large"
            variant="glass"
            companyName={company?.name || "DIGITAL ALIFE"}
            companySubtitle={isEmployee ? "OFFICIAL EMPLOYEE VERIFICATION" : "OFFICIAL PARTNER VERIFICATION"}
            textClassName="text-slate-900 font-sans"
          />
        </div>

        {/* ================= PHOTO ================= */}
        <div className="-mt-12 flex justify-center">
          <img
            src={photo}
            alt={holder?.name}
            className="w-28 h-28 rounded-2xl border-[6px] border-white object-cover shadow-xl"
          />
        </div>

        {/* ================= STATUS & DETAILS ================= */}
        <div className="px-6 mt-5 space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-sm text-slate-500 font-medium">Verifying ID Card...</p>
            </div>
          ) : isValid ? (
            <>
              <div className="rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center gap-2 py-3 border border-emerald-200 shadow-2xs">
                <ShieldCheck size={20} className="text-emerald-600" />
                <span>OFFICIALLY VERIFIED ACTIVE</span>
              </div>

              {/* Entity Type Pill */}
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider border border-blue-200">
                  {isEmployee ? "EMPLOYEE CREDENTIAL" : "REFERRAL PARTNER CREDENTIAL"}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {holder?.name}
                  </h2>
                  <p className="text-blue-600 font-bold text-sm mt-0.5">
                    {holder?.designation}
                  </p>
                  {holder?.department && (
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Department: <span className="text-slate-800">{holder.department}</span>
                    </p>
                  )}
                </div>

                <div className="border border-slate-200/80 rounded-2xl p-4 space-y-3 text-sm bg-slate-50/50">
                  <InfoRow
                    icon={<User size={16} />}
                    label={isEmployee ? "Employee ID" : "Partner ID"}
                    value={holder?.displayId || holder?.partnerCode}
                  />

                  <InfoRow
                    icon={<BadgeCheck size={16} />}
                    label="Card Number"
                    value={data?.cardNumber || cardNumber}
                  />

                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="Date of Joining"
                    value={
                      holder?.joiningDate
                        ? new Date(holder.joiningDate).toLocaleDateString("en-IN")
                        : "—"
                    }
                  />

                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="Valid Until"
                    value={
                      holder?.expiryDate
                        ? new Date(holder.expiryDate).toLocaleDateString("en-IN")
                        : "—"
                    }
                  />
                </div>

                {/* Company Details */}
                <div className="border border-slate-200/80 rounded-2xl p-4 space-y-3 text-sm bg-white shadow-2xs">
                  <InfoRow
                    icon={<Building2 size={16} />}
                    label="Address"
                    value={company?.address}
                  />

                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Official Contact Phone"
                    value={company?.phone}
                  />

                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Official Contact Email"
                    value={company?.email}
                  />

                  <InfoRow
                    icon={<Globe size={16} />}
                    label="Website"
                    value={company?.website}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className={`rounded-2xl font-black flex items-center justify-center gap-2 py-3 border ${
                  status === "Revoked"
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : status === "Expired"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-slate-100 text-slate-800 border-slate-300"
                }`}
              >
                {status === "Revoked" ? (
                  <XCircle size={20} className="text-rose-600" />
                ) : (
                  <AlertTriangle size={20} className="text-amber-600" />
                )}
                <span>
                  {status === "Expired"
                    ? "EXPIRED CARD"
                    : status === "Revoked"
                    ? "REVOKED CARD"
                    : status === "Suspended"
                    ? "SUSPENDED CARD"
                    : "INVALID ID CARD"}
                </span>
              </div>

              <div className="text-center space-y-2">
                {holder && (
                  <>
                    <h2 className="font-extrabold text-xl text-slate-900">
                      {holder.name}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500">
                      {holder.displayId || holder.partnerCode}
                    </p>
                  </>
                )}

                <p className="text-xs font-semibold text-slate-600 bg-slate-100 p-3 rounded-xl border border-slate-200">
                  {status === "Revoked"
                    ? "This ID Card has been revoked by administration and is no longer valid."
                    : status === "Expired"
                    ? "This ID Card has expired and requires renewal."
                    : status === "Suspended"
                    ? "This ID Card is temporarily suspended."
                    : error || "This ID Card could not be verified in company records."}
                </p>

                {revocation && (
                  <div className="border rounded-2xl bg-rose-50 p-4 text-left text-xs space-y-1.5 border-rose-200">
                    <p className="font-bold text-rose-900">Revocation Details:</p>
                    <p className="text-slate-800">
                      <strong>Reason:</strong> {revocation.reason}
                    </p>
                    {revocation.remarks && (
                      <p className="text-slate-800">
                        <strong>Remarks:</strong> {revocation.remarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="bg-slate-50 border-t border-slate-100 mt-8 px-6 py-5 text-center">
          <p className="font-bold text-slate-800 text-xs">
            {company?.name || "Digital Alife Pvt Ltd"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Official Corporate Identity Verification Portal
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-blue-600 mt-0.5 shrink-0">{icon}</div>

    <div className="flex-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-bold text-slate-900 break-words text-xs">{value || "—"}</p>
    </div>
  </div>
);

export default PublicIDCardVerificationPage;
