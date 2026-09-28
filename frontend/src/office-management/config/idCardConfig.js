export const ID_CARD_ENTITY_TYPES = {
  EMPLOYEE: "employee",
  REFERRAL_PARTNER: "referral_partner",
};

export const idCardConfig = {
  employee: {
    title: "OFFICIAL EMPLOYEE IDENTITY CARD",
    badge: "EMPLOYEE",
    identifierLabel: "Employee ID",
    holderLabel: "Employee",
    defaultDesignation: "Employee",
    badgeBg: "bg-blue-600/15 text-blue-900 border-blue-300",
  },

  referral_partner: {
    title: "OFFICIAL PARTNER IDENTITY CARD",
    badge: "PARTNER",
    identifierLabel: "Partner ID",
    holderLabel: "Referral Partner",
    defaultDesignation: "Authorized Referral Partner",
    badgeBg: "bg-blue-600/15 text-blue-900 border-blue-300",
  },
};

/**
 * Mapper for Employee to ID Card Data
 */
export const mapEmployeeToIdCardData = (employee) => {
  if (!employee) return {};
  return {
    entityType: ID_CARD_ENTITY_TYPES.EMPLOYEE,
    entityId: employee._id || employee.id,
    holderName: employee.name || employee.fullName || "—",
    displayId: employee.employeeId || employee.email?.split("@")[0]?.toUpperCase() || "—",
    photo: employee.userId?.profilePicture || employee.photo || employee.profilePicture || "",
    designation: employee.designation || "Employee",
    department: employee.department || "General",
    joiningDate: employee.joiningDate || employee.createdAt,
    email: employee.email,
  };
};

/**
 * Mapper for Referral Partner to ID Card Data
 */
export const mapPartnerToIdCardData = (partner) => {
  if (!partner) return {};
  return {
    entityType: ID_CARD_ENTITY_TYPES.REFERRAL_PARTNER,
    entityId: partner._id || partner.id,
    holderName: partner.userId?.name || partner.partnerName || partner.name || "—",
    displayId: partner.referralCode || partner.partnerCode || "—",
    photo: partner.profilePicture || partner.userId?.profilePicture || "",
    designation: "Authorized Referral Partner",
    department: partner.territory || "Referral",
    joiningDate: partner.createdAt,
    email: partner.userId?.email || partner.email,
  };
};
