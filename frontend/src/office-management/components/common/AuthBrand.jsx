import React from "react";
import BrandLogo from "./BrandLogo";

const AuthBrand = ({ tone = "light", size = "md", align = "left" }) => {
  const isDark = tone === "dark";

  return (
    <div className={`auth-logo-float ${align === "center" ? "text-center flex justify-center" : ""}`}>
      <BrandLogo
        size={size === "sm" ? "medium" : "auth"}
        variant={isDark ? "glass-dark" : "glass"}
        companyName="DIGITAL ALIFE"
        companySubtitle="PVT LTD"
        showTagline={true}
        tagline="Secure Identity & Management System"
        textClassName={isDark ? "text-white" : ""}
      />
    </div>
  );
};

export default AuthBrand;
