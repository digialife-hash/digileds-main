import React from "react";
import { CheckCircle2, Phone, Mail, Globe } from "lucide-react";
import brandLogoAsset from "../../assets/dino_inspired_glossy_da_logo.png";
import BrandLogo from "../common/BrandLogo";
import { idCardConfig, ID_CARD_ENTITY_TYPES } from "../../config/idCardConfig";
import { resolveFileUrl, resolvePublicUrl } from "../../utils/urlUtils";

const IDCardTemplate = ({
  idCard,
  entityType: explicitEntityType,
  side = "both",
  orientation = "Portrait",
  scale = 1,
}) => {
  if (!idCard) return null;

  const isPortrait = orientation !== "Landscape";

  // Entity Type Resolution & Config
  const resolvedEntityType =
    explicitEntityType ||
    idCard.entityType ||
    (idCard.employeeId ? ID_CARD_ENTITY_TYPES.EMPLOYEE : ID_CARD_ENTITY_TYPES.REFERRAL_PARTNER);

  const config = idCardConfig[resolvedEntityType] || idCardConfig.referral_partner;
  const isEmployee = resolvedEntityType === ID_CARD_ENTITY_TYPES.EMPLOYEE;

  // Public QR verification URL
  const qrVerificationUrl =
    idCard.qrCodeData ||
    idCard.qrCode ||
    (idCard.verificationToken
      ? resolvePublicUrl(`/verify-id-card/${idCard.verificationToken}`)
      : resolvePublicUrl(`/verify-id/${idCard.cardNumber}`));

  const isRevoked = idCard.status === "Revoked";
  const isExpired = idCard.expiryDate && new Date() > new Date(idCard.expiryDate);
  const isSuspended = idCard.status === "Suspended";

  // SVG QR Code generator link
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    qrVerificationUrl
  )}`;

  // Official Company Information
  const companyName =
    idCard.companyName ||
    idCard.company?.companyName ||
    idCard.company?.name ||
    "DIGITAL ALIFE PVT LTD";

  const companyEmail =
    idCard.companyEmail ||
    idCard.company?.companyEmail ||
    idCard.company?.email ||
    "info@digitalalife.com";

  const companyPhone =
    idCard.companyPhone ||
    idCard.company?.companyPhone ||
    idCard.company?.phone ||
    "+91 9876543210";

  const companyWebsite =
    idCard.companyWebsite ||
    idCard.website ||
    idCard.company?.website ||
    "www.digitalalife.com";

  const rawLogo =
    idCard.companyLogo ||
    idCard.company?.companyLogo ||
    idCard.company?.logo;

  let logoSrc = brandLogoAsset;
  if (rawLogo && typeof rawLogo === "string" && rawLogo.trim()) {
    const val = rawLogo.trim();
    if (
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("blob:") ||
      val.startsWith("data:")
    ) {
      logoSrc = val;
    } else {
      logoSrc = resolveFileUrl(val);
    }
  }

  // Identification Data
  const holderName =
    idCard.partnerName ||
    idCard.holderName ||
    idCard.fullName ||
    idCard.name ||
    idCard.employeeId?.name ||
    idCard.partnerId?.userId?.name ||
    (isEmployee ? "Employee Name" : "Referral Partner");

  const designation =
    idCard.designation ||
    (isEmployee ? "Employee" : "Authorized Referral Partner");

  const department =
    idCard.department ||
    idCard.employeeId?.department ||
    (isEmployee ? "" : "");

  const displayCode =
    idCard.partnerCode ||
    idCard.displayId ||
    idCard.partnerId?.referralCode ||
    idCard.employeeId?.employeeId ||
    "—";

  const cardNumber =
    idCard.cardNumber || (isEmployee ? "IDC-EMP-2026-0001" : "IDC-RP-2026-0001");

  const joiningDateRaw =
    idCard.joiningDate ||
    idCard.dateOfJoining ||
    idCard.employeeId?.joiningDate ||
    idCard.partnerId?.createdAt;

  const issueDateRaw = idCard.issueDate || idCard.createdAt || new Date();
  const expiryDateRaw = idCard.expiryDate || idCard.validUntil || idCard.validTill;

  // Formatting (e.g. 29 July 2026)
  const formatDate = (dateVal) => {
    if (!dateVal) return "—";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "—";
    const day = date.getDate();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formattedJoiningDate = formatDate(joiningDateRaw);
  const formattedIssueDate = formatDate(issueDateRaw);
  const formattedExpiryDate = formatDate(expiryDateRaw);

  // Photo Resolution
  const rawPhoto =
    idCard.partnerPhoto ||
    idCard.photo ||
    idCard.profilePicture ||
    idCard.employeeId?.photo ||
    idCard.partnerId?.profilePicture ||
    idCard.partnerId?.userId?.profilePicture;

  let photoSrc =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";

  if (rawPhoto && typeof rawPhoto === "string" && rawPhoto.trim()) {
    const val = rawPhoto.trim();
    if (
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("blob:") ||
      val.startsWith("data:")
    ) {
      photoSrc = val;
    } else {
      photoSrc = resolveFileUrl(val);
    }
  }

  // Standard CR80 Plastic ID Card Dimensions
  const cardStyle = isPortrait
    ? { width: "340px", height: "540px" }
    : { width: "540px", height: "340px" };

  return (
    <div
      className="flex items-center justify-center font-sans select-none print:flex-row print:gap-4"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      {/* CORPORATE ID CARD CONTAINER */}
      <div
        style={cardStyle}
        className="relative overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 flex flex-col justify-between print:[color-adjust:exact] [-webkit-print-color-adjust:exact]"
      >
        {/* Top Lanyard Hole Punch Slot */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 h-1.5 w-8 rounded-full bg-slate-200 border border-slate-300/80 shadow-inner"></div>

        {/* Background Semi-Transparent Brand Logo Watermark */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none p-6">
          <img
            src={logoSrc}
            alt="Watermark"
            className="h-auto w-3/4 max-w-[240px] object-contain opacity-[0.06] select-none pointer-events-none filter"
          />
        </div>

        {/* 1. Centered Company Branding Header Band */}
        <div className="relative z-10 bg-gradient-to-r from-sky-200 via-blue-200 to-indigo-200 px-4 pt-3.5 pb-2 text-slate-900 text-center flex flex-col items-center justify-center border-b border-blue-300/60 shrink-0 shadow-xs">
          <BrandLogo
            size="small"
            variant="glass"
            companyName={companyName}
            companySubtitle={config.title}
            textClassName="text-slate-900 font-sans"
          />

          {/* Badge */}
          <div className="mt-1">
            <span className="rounded-md bg-blue-600/15 px-2.5 py-0.5 text-[7px] font-black text-blue-900 uppercase tracking-widest border border-blue-300 shadow-xs">
              {config.badge}
            </span>
          </div>
        </div>

        {/* Status Watermark Overlay if Revoked/Expired/Suspended */}
        {isRevoked && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-rose-950/80 backdrop-blur-xs">
            <span className="rotate-[-25deg] rounded-xl border-4 border-rose-500 px-6 py-2 text-2xl font-black text-rose-500 uppercase tracking-widest bg-white/90 shadow-2xl">
              REVOKED
            </span>
          </div>
        )}

        {isExpired && !isRevoked && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-amber-950/75 backdrop-blur-xs">
            <span className="rotate-[-25deg] rounded-xl border-4 border-amber-500 px-6 py-2 text-2xl font-black text-amber-500 uppercase tracking-widest bg-white/90 shadow-2xl">
              EXPIRED
            </span>
          </div>
        )}

        {isSuspended && !isRevoked && !isExpired && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs">
            <span className="rotate-[-25deg] rounded-xl border-4 border-slate-500 px-6 py-2 text-2xl font-black text-slate-400 uppercase tracking-widest bg-white/90 shadow-2xl">
              SUSPENDED
            </span>
          </div>
        )}

        {/* 2. CARD CONTENT BODY */}
        {isPortrait ? (
          /* Portrait Card Content */
          <div className="relative z-10 flex-1 px-4 py-2.5 flex flex-col justify-between overflow-hidden">
            {/* Upper Profile Section */}
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-blue-600 shadow-md bg-slate-100 p-0.5">
                  <img
                    src={photoSrc}
                    alt={holderName}
                    className="h-full w-full object-cover object-top rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white shadow-xs border border-white">
                  <CheckCircle2 size={10} strokeWidth={3} />
                </div>
              </div>

              <div>
                <h2 className="text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                  {holderName}
                </h2>
                <p className="text-[9px] font-bold text-blue-700 mt-0.5">
                  {designation}
                </p>

                {department && (
                  <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    Dept: <span className="text-slate-800 font-bold">{department}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Middle Grid: Key Card Specifications */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2 text-[8px] space-y-1">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block">
                    {config.identifierLabel}:
                  </span>
                  <span className="font-extrabold text-slate-900 truncate block">
                    {displayCode}
                  </span>
                </div>
                <div>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-slate-600 block">
                    Card Number:
                  </span>
                  <span className="font-extrabold text-slate-900 truncate block font-mono">
                    {cardNumber}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-1 grid grid-cols-3 gap-1 text-[7px] text-center">
                <div>
                  <span className="font-bold text-slate-600 block">Joining Date</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {formattedJoiningDate}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block">Issue Date</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {formattedIssueDate}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block">Valid Till</span>
                  <span className="font-bold text-blue-700 block mt-0.5">
                    {formattedExpiryDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Lower Section: Verification QR & Authorized Signatory */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-1.5">
                <div className="h-11 w-11 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0">
                  <img
                    src={qrCodeImgSrc}
                    alt="QR Verification"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-[6.5px] text-slate-600 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block">Scan to Verify</span>
                  <span>Official Record</span>
                </div>
              </div>

              <div className="text-center">
                {idCard.authorizedSignature ? (
                  <img
                    src={idCard.authorizedSignature}
                    alt="Sign"
                    className="h-5 w-auto max-w-[70px] object-contain mx-auto"
                  />
                ) : (
                  <div className="h-3.5 w-16 border-b border-slate-400 border-dashed mb-0.5 mx-auto font-serif text-[7px] italic text-slate-700 flex items-center justify-center">
                    Digital Sign
                  </div>
                )}
                <span className="text-[6.5px] font-black text-slate-700 block uppercase tracking-wider mt-0.5">
                  Auth Signatory
                </span>
              </div>
            </div>

            {/* Official Company Contact Details Footer */}
            <div className="rounded-lg bg-gradient-to-r from-sky-200 via-blue-200 to-indigo-200 py-1.5 px-2 text-[7px] text-slate-900 border border-blue-300/60 shrink-0 shadow-2xs">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center font-bold">
                <span className="inline-flex items-center gap-0.5">
                  <Mail size={8} className="text-blue-800 shrink-0" />
                  <span className="truncate max-w-[100px]">{companyEmail}</span>
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Phone size={8} className="text-blue-800 shrink-0" />
                  <span>{companyPhone}</span>
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Globe size={8} className="text-blue-800 shrink-0" />
                  <span className="truncate max-w-[100px]">{companyWebsite}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Landscape Card Content */
          <div className="relative z-10 flex-1 px-4 py-2.5 flex flex-col justify-between overflow-hidden">
            <div className="grid grid-cols-12 gap-3 items-center flex-1">
              {/* Left Column: Photo & QR */}
              <div className="col-span-5 flex flex-col items-center text-center space-y-1.5">
                <div className="relative">
                  <div className="h-20 w-16 overflow-hidden rounded-xl border-2 border-blue-600 shadow-md bg-slate-100 p-0.5">
                    <img
                      src={photoSrc}
                      alt={holderName}
                      className="h-full w-full object-cover object-top rounded-lg"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 text-white shadow-xs border border-white">
                    <CheckCircle2 size={8} strokeWidth={3} />
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <img
                    src={qrCodeImgSrc}
                    alt="QR"
                    className="h-8 w-8 rounded border border-slate-200 bg-white p-0.5 shrink-0"
                  />
                  <div className="text-[6px] text-slate-600 font-medium text-left">
                    <span className="font-bold text-slate-800 block">Scan to Verify</span>
                    <span>Official ID</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Identity Details */}
              <div className="col-span-7 space-y-1.5">
                <div>
                  <h2 className="text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                    {holderName}
                  </h2>
                  <p className="text-[9px] font-bold text-blue-700 mt-0.5">
                    {designation}
                  </p>
                  {department && (
                    <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      Dept: <span className="text-slate-800 font-bold">{department}</span>
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-1.5 text-[7.5px] space-y-1">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <span className="text-[6.5px] font-bold uppercase text-slate-600 block">
                        {config.identifierLabel}:
                      </span>
                      <span className="font-extrabold text-slate-900 truncate block">
                        {displayCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[6.5px] font-bold uppercase text-slate-600 block">
                        Card Number:
                      </span>
                      <span className="font-extrabold text-slate-900 truncate block font-mono">
                        {cardNumber}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-1 grid grid-cols-3 gap-0.5 text-[6.5px]">
                    <div>
                      <span className="font-bold text-slate-600 block">Joining Date</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {formattedJoiningDate}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">Issue Date</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {formattedIssueDate}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">Valid Till</span>
                      <span className="font-bold text-blue-700 block mt-0.5">
                        {formattedExpiryDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[6px] text-slate-600 italic">Official Record</span>
                  <div className="text-center">
                    {idCard.authorizedSignature ? (
                      <img
                        src={idCard.authorizedSignature}
                        alt="Sign"
                        className="h-4 w-auto max-w-[60px] object-contain mx-auto"
                      />
                    ) : (
                      <div className="h-3 w-14 border-b border-slate-400 border-dashed mb-0.5 mx-auto text-[6px] italic text-slate-700 flex items-center justify-center">
                        Digital Sign
                      </div>
                    )}
                    <span className="text-[6px] font-black text-slate-700 block uppercase tracking-wider">
                      Auth Signatory
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer in Landscape */}
            <div className="rounded-lg bg-gradient-to-r from-sky-200 via-blue-200 to-indigo-200 py-1.5 px-2 text-[7px] text-slate-900 border border-blue-300/60 mt-1 shadow-2xs">
              <div className="flex items-center justify-around text-center font-bold">
                <span className="inline-flex items-center gap-0.5">
                  <Mail size={8} className="text-blue-800 shrink-0" />
                  <span className="truncate max-w-[130px]">{companyEmail}</span>
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Phone size={8} className="text-blue-800 shrink-0" />
                  <span>{companyPhone}</span>
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Globe size={8} className="text-blue-800 shrink-0" />
                  <span className="truncate max-w-[130px]">{companyWebsite}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Corporate Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300 shrink-0"></div>
      </div>
    </div>
  );
};

export default IDCardTemplate;
