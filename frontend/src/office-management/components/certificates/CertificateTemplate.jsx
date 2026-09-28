import React from "react";
import { Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import brandLogoAsset from "../../assets/dino_inspired_glossy_da_logo.png";
import BrandLogo from "../common/BrandLogo";
import { resolveFileUrl, resolvePublicUrl } from "../../utils/urlUtils";

const CertificateTemplate = ({
  certificate,
  orientation = "Landscape",
  scale = 1,
}) => {
  if (!certificate) return null;

  const isPortrait = orientation === "Portrait";
  const isEmployee = certificate.entityType === "employee";

  // Public QR verification URL
  const qrVerificationUrl =
    certificate.qrCodeData ||
    (certificate.verificationToken
      ? resolvePublicUrl(`/verify-certificate/${certificate.verificationToken}`)
      : resolvePublicUrl(`/verify-certificate/${certificate.certificateNumber}`));

  const isRevoked = certificate.status === "Revoked";

  // SVG QR Code generator link
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    qrVerificationUrl
  )}`;

  const recipientName =
    certificate.partnerName ||
    certificate.holderName ||
    certificate.employeeId?.name ||
    certificate.partnerId?.userId?.name ||
    "Recipient Name";

  const displayCode =
    certificate.partnerCode ||
    certificate.displayId ||
    certificate.employeeId?.employeeId ||
    certificate.partnerId?.referralCode ||
    "—";

  // Certificate Dimensions
  const certStyle = isPortrait
    ? { width: "565px", height: "800px" }
    : { width: "800px", height: "565px" };

  return (
    <div
      className="flex items-center justify-center font-serif select-none"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      <div
        style={certStyle}
        className="relative overflow-hidden bg-white p-8 text-slate-900 shadow-2xl border-[12px] border-slate-900 flex flex-col justify-between"
      >
        {/* Decorative Inner Golden/Navy Frame */}
        <div className="absolute inset-3 border-2 border-amber-500/80 pointer-events-none z-10" />

        {/* Large Semi-Transparent Centered Company Logo Watermark */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none p-12">
          <img
            src={brandLogoAsset}
            alt="Company Watermark"
            className="h-auto w-3/5 max-w-[420px] object-contain opacity-[0.08] select-none pointer-events-none filter"
          />
        </div>

        {/* Status Watermark Overlay if Revoked */}
        {isRevoked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-rose-950/80 backdrop-blur-xs">
            <span className="rotate-[-25deg] rounded-2xl border-8 border-rose-500 px-10 py-4 text-4xl font-black text-rose-500 uppercase tracking-widest font-sans">
              REVOKED / INVALID
            </span>
          </div>
        )}

        {/* Top Header & Logo */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-4">
          <BrandLogo
            size="large"
            variant="glass-dark"
            companyName={certificate.companyName || "DIGITAL ALIFE"}
            companySubtitle="OFFICIAL CERTIFICATE AUTHORITY"
            textClassName="text-white"
          />
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-700 font-sans block">
              {certificate.certificateNumber}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Issue Date: {new Date(certificate.issueDate || Date.now()).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        {/* Certificate Content Body */}
        <div className="relative z-10 my-auto text-center space-y-4 px-4 py-2">
          {/* Main Title */}
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-300 shadow-xs mb-2">
              <Award className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-slate-900 uppercase font-sans">
              {certificate.certificateType || (isEmployee ? "EMPLOYEE CERTIFICATE OF RECOGNITION" : "AUTHORIZED PARTNER CERTIFICATE")}
            </h1>
            <p className="text-xs italic text-amber-800 mt-1">
              This certificate is proudly presented to
            </p>
          </div>

          {/* Recipient Name */}
          <div className="py-1">
            <h2 className="text-3xl font-extrabold text-slate-900 border-b-2 border-amber-500 inline-block px-8 pb-1 tracking-tight font-sans">
              {recipientName}
            </h2>
            <p className="text-xs font-mono font-bold text-slate-600 mt-1 font-sans">
              {isEmployee ? "Employee ID" : "Partner Code"}: {displayCode}
              {certificate.department ? ` | Dept: ${certificate.department}` : ""}
            </p>
          </div>

          {/* Achievement & Category */}
          <div className="max-w-xl mx-auto space-y-1">
            <p className="text-sm font-bold text-amber-800 uppercase tracking-wide font-sans">
              {certificate.achievement || (isEmployee ? "Excellence in Professional Achievement" : "Authorized Referral Partner")}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {certificate.description ||
                "For outstanding contribution, dedication, and professional excellence in advancing business growth and strategic collaboration."}
            </p>
          </div>
        </div>

        {/* Bottom Footer (Seal, QR Code & Right-Aligned Authorized Signature) */}
        <div className="relative z-10 border-t border-amber-500/30 pt-4 flex items-end justify-between text-xs font-sans">
          {/* Left: Official Seal & QR Verification */}
          <div className="flex items-center gap-4">
            {/* Official Seal Badge */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-extrabold text-[9px] shadow-md border-2 border-white tracking-widest uppercase">
                SEAL
              </div>
              <span className="text-[8px] font-bold text-slate-600 block mt-1">
                OFFICIALLY SEALED
              </span>
            </div>

            {/* QR Code & Verification */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
                <img
                  src={qrCodeImgSrc}
                  alt="QR Verification"
                  className="h-11 w-11"
                />
              </div>
              <div className="text-left">
                <span className="block text-[9px] font-bold text-slate-900 uppercase">
                  VERIFIED CERTIFICATE
                </span>
                <span className="text-[8px] text-slate-500 block">
                  Scan QR code to verify authenticity
                </span>
                {certificate.expiryDate && (
                  <span className="text-[8px] font-bold text-amber-700 block mt-0.5">
                    Valid Till: {new Date(certificate.expiryDate).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Right-Aligned Authorized Signature */}
          <div className="text-right flex flex-col items-end shrink-0">
            {certificate.authorizedSignature ? (
              <img
                src={
                  certificate.authorizedSignature.startsWith("http")
                    ? certificate.authorizedSignature
                    : resolveFileUrl(certificate.authorizedSignature)
                }
                alt="Authorized Signature"
                className="h-10 w-auto max-w-[150px] object-contain mb-1"
              />
            ) : (
              <div className="h-9 w-36 border-b border-slate-700 border-dashed mb-1 flex items-end justify-center italic text-xs text-slate-700 font-serif">
                Digital Signature
              </div>
            )}
            <p className="font-extrabold text-slate-900 text-xs font-sans uppercase tracking-wider">
              {certificate.authorizedSignatory || "Authorized Signatory"}
            </p>
            <p className="text-[10px] font-semibold text-slate-600 font-sans">
              {certificate.companyName || "Digital Alife Pvt Ltd"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
