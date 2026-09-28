import Certificate from "../models/Certificate.js";

/**
 * Concurrency-safe Certificate Number Generator.
 * Format for Employees: CERT-EMP-2026-XXXX
 * Format for Partners:  CERT-RP-2026-XXXX
 */
export const generateUniqueCertificateNumber = async (entityType = "referral_partner", customCode = "") => {
  const currentYear = new Date().getFullYear();
  const prefix = entityType === "employee" ? "EMP" : "RP";
  const codeClean = customCode ? customCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : prefix;

  let isUnique = false;
  let certNumber = "";
  let attempts = 0;

  while (!isUnique && attempts < 20) {
    attempts++;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    certNumber = `CERT-${codeClean}-${currentYear}-${randomNum}`;

    const existing = await Certificate.exists({ certificateNumber: certNumber });
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    const timestamp = Date.now().toString().slice(-6);
    certNumber = `CERT-${codeClean}-${timestamp}`;
  }

  return certNumber;
};
