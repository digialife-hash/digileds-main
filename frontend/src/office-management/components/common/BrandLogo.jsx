import React from "react";
import brandLogoAsset from "../../assets/dino_inspired_glossy_da_logo.png";

/**
 * Reusable Brand Logo Component
 * Accepts size, variant, showName, showSubtitle, and custom styling props.
 */
const BrandLogo = ({
  size = "medium",
  variant = "plain",
  showName = true,
  companyName = "DIGITAL ALIFE",
  companySubtitle = "PVT LTD",
  showSubtitle = true,
  showTagline = false,
  tagline = "Official Identity & Management System",
  className = "",
  imageClassName = "",
  textClassName = "",
  onClick,
}) => {
  // Size-specific dimensions and text scaling
  const sizeMap = {
    small: {
      container: "gap-2",
      img: "h-7 w-auto max-h-7",
      title: "text-xs font-black tracking-wide",
      subtitle: "text-[8px] font-extrabold tracking-widest",
      glass: "p-1.5 rounded-xl",
    },
    medium: {
      container: "gap-2.5",
      img: "h-9 w-auto max-h-9 sm:h-10 sm:max-h-10",
      title: "text-sm font-black tracking-wide",
      subtitle: "text-[9px] font-extrabold tracking-widest",
      glass: "p-2 rounded-2xl",
    },
    navbar: {
      container: "gap-2.5",
      img: "h-9 w-auto max-h-9 sm:h-10 sm:max-h-10",
      title: "text-sm font-black tracking-wide",
      subtitle: "text-[8.5px] font-extrabold tracking-widest",
      glass: "px-3 py-1.5 rounded-2xl",
    },
    sidebar: {
      container: "gap-2.5",
      img: "h-8 w-auto max-h-8 sm:h-9 sm:max-h-9",
      title: "text-xs sm:text-sm font-black tracking-wide",
      subtitle: "text-[8px] sm:text-[8.5px] font-extrabold tracking-widest",
      glass: "p-2 rounded-2xl",
    },
    large: {
      container: "gap-3",
      img: "h-14 w-auto max-h-14 sm:h-16 sm:max-h-16",
      title: "text-lg sm:text-xl font-black tracking-wide",
      subtitle: "text-xs font-extrabold tracking-widest",
      glass: "p-3 rounded-2xl",
    },
    auth: {
      container: "gap-3",
      img: "h-16 w-auto max-h-16 sm:h-20 sm:max-h-20",
      title: "text-xl sm:text-2xl font-black tracking-tight",
      subtitle: "text-xs font-extrabold tracking-widest",
      glass: "p-4 rounded-3xl",
    },
    xlarge: {
      container: "gap-4",
      img: "h-20 w-auto max-h-20 sm:h-24 sm:max-h-24",
      title: "text-2xl sm:text-3xl font-black tracking-tight",
      subtitle: "text-xs sm:text-sm font-extrabold tracking-widest",
      glass: "p-5 rounded-3xl",
    },
    document: {
      container: "gap-3",
      img: "h-14 w-auto max-h-14",
      title: "text-base font-black tracking-wide",
      subtitle: "text-[10px] font-extrabold tracking-widest",
      glass: "p-2.5 rounded-2xl",
    },
    print: {
      container: "gap-2.5",
      img: "h-12 w-auto max-h-12",
      title: "text-sm font-black tracking-wide",
      subtitle: "text-[9px] font-extrabold tracking-widest",
      glass: "p-2 rounded-xl",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  // Glassmorphism variant classes
  const variantMap = {
    plain: "",
    glass: "brand-logo-glass",
    "glass-dark": "brand-logo-glass--dark",
    "light-backdrop": "bg-white/95 border border-white/40 shadow-xs rounded-2xl p-1.5",
  };

  const currentVariant = variantMap[variant] || "";

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${currentSize.container} ${currentVariant} ${
        onClick ? "cursor-pointer transition-transform hover:scale-[1.01]" : ""
      } ${className}`}
    >
      {/* Transparent Brand Logo Image */}
      <img
        src={brandLogoAsset}
        alt={companyName || "Digital Alife"}
        className={`brand-logo-image object-contain shrink-0 ${currentSize.img} ${imageClassName}`}
        draggable="false"
      />

      {/* Optional Company Name & Subtitle Typography */}
      {showName && (
        <div className={`flex flex-col text-left leading-tight ${textClassName}`}>
          <span className={`font-black text-slate-900 ${currentSize.title} uppercase`}>
            {companyName}
          </span>
          {showSubtitle && companySubtitle && (
            <span className={`text-blue-600 font-extrabold uppercase ${currentSize.subtitle}`}>
              {companySubtitle}
            </span>
          )}
          {showTagline && tagline && (
            <span className="text-[9px] text-slate-500 font-medium mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
