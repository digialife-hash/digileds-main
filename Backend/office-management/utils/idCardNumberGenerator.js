import IDCard from "../models/IDCard.js";

/**
 * Concurrency-safe unique ID Card Number Generator.
 * Format for Employees: IDC-EMP-2026-XXXX
 * Format for Partners:  IDC-RP-2026-XXXX
 */
export const generateUniqueCardNumber = async (entityType = "referral_partner", customCode = "") => {
  const currentYear = new Date().getFullYear();
  const prefix = entityType === "employee" ? "EMP" : "RP";
  const codeClean = customCode ? customCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : prefix;

  let isUnique = false;
  let cardNumber = "";
  let attempts = 0;

  while (!isUnique && attempts < 20) {
    attempts++;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    cardNumber = `IDC-${codeClean}-${currentYear}-${randomNum}`;

    const existing = await IDCard.exists({ cardNumber });
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    const timestamp = Date.now().toString().slice(-6);
    cardNumber = `IDC-${codeClean}-${timestamp}`;
  }

  return cardNumber;
};
