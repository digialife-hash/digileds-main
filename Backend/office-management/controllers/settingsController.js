import Settings, { sidebarThemes } from "../models/Settings.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import { hasPermission } from "../utils/permissions.js";

const companyFields = [
  "companyName",
  "companyEmail",
  "companyPhone",
  "companyAddress",
  "website",
  "gstNumber",
  "companyLogo",
];

const bankFields = [
  "bankName",
  "accountNumber",
  "branchName",
  "ifscCode",
  "accountHolderName",
  "upiId",
];

const brandingFields = [
  "primaryColor",
  "secondaryColor",
  "sidebarTheme",
  "logo",
  "favicon",
];

const requireSettingsPermission = (user, action) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!hasPermission(user, "settings", action)) {
    throw new AppError(
      `You do not have permission to ${action} settings`,
      403,
      "PERMISSION_DENIED"
    );
  }
};

const pickFields = (body = {}, fields = []) => {
  return fields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }

    return payload;
  }, {});
};

const normalizeCompanyPayload = (payload) => {
  if (payload.companyEmail) payload.companyEmail = payload.companyEmail.toLowerCase();
  if (payload.gstNumber) payload.gstNumber = payload.gstNumber.toUpperCase();
  return payload;
};

const normalizeBankPayload = (payload) => {
  if (payload.ifscCode) payload.ifscCode = payload.ifscCode.toUpperCase();
  return payload;
};

const normalizeBrandingPayload = (payload) => {
  if (payload.sidebarTheme && !sidebarThemes.includes(payload.sidebarTheme)) {
    throw new AppError("Sidebar theme is invalid", 400, "INVALID_SIDEBAR_THEME");
  }

  return payload;
};

export const getCompanySettings = asyncHandler(async (req, res) => {
  requireSettingsPermission(req.user, "view");

  const settings = await Settings.getSingleton();

  return res.status(200).json({
    success: true,
    message: "Company settings fetched successfully",
    data: {
      company: settings.company,
    },
    error: null,
  });
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
  requireSettingsPermission(req.user, "edit");

  const payload = normalizeCompanyPayload(pickFields(req.body, companyFields));

  const update = Object.entries(payload).reduce((changes, [key, value]) => {
    changes[`company.${key}`] = value;
    return changes;
  }, {});

  const settings = await Settings.findOneAndUpdate(
    { singletonKey: "office_settings" },
    {
      $set: {
        ...update,
        updatedBy: req.user._id,
      },
      $setOnInsert: { singletonKey: "office_settings" },
    },
    { new: true, upsert: true, runValidators: true }
  );

  await logActivity({
    req,
    action: "update",
    module: "settings",
    targetId: settings._id,
    targetModel: "Settings",
    description: "Company profile settings updated",
    metadata: {
      changedFields: Object.keys(payload),
    },
  });

  return res.status(200).json({
    success: true,
    message: "Company settings updated successfully",
    data: {
      company: settings.company,
    },
    error: null,
  });
});

export const getBankSettings = asyncHandler(async (req, res) => {
  requireSettingsPermission(req.user, "view");

  const settings = await Settings.getSingleton();

  return res.status(200).json({
    success: true,
    message: "Bank settings fetched successfully",
    data: {
      bank: settings.bank,
    },
    error: null,
  });
});

export const updateBankSettings = asyncHandler(async (req, res) => {
  requireSettingsPermission(req.user, "edit");

  const payload = normalizeBankPayload(pickFields(req.body, bankFields));

  const update = Object.entries(payload).reduce((changes, [key, value]) => {
    changes[`bank.${key}`] = value;
    return changes;
  }, {});

  const settings = await Settings.findOneAndUpdate(
    { singletonKey: "office_settings" },
    {
      $set: {
        ...update,
        updatedBy: req.user._id,
      },
      $setOnInsert: { singletonKey: "office_settings" },
    },
    { new: true, upsert: true, runValidators: true }
  );

  await logActivity({
    req,
    action: "update",
    module: "settings",
    targetId: settings._id,
    targetModel: "Settings",
    description: "Invoice bank settings updated",
    metadata: {
      changedFields: Object.keys(payload),
    },
  });

  return res.status(200).json({
    success: true,
    message: "Bank settings updated successfully",
    data: {
      bank: settings.bank,
    },
    error: null,
  });
});

export const getBrandingSettings = asyncHandler(async (req, res) => {
  requireSettingsPermission(req.user, "view");

  const settings = await Settings.getSingleton();

  return res.status(200).json({
    success: true,
    message: "Branding settings fetched successfully",
    data: {
      branding: settings.branding,
    },
    error: null,
  });
});

export const updateBrandingSettings = asyncHandler(async (req, res) => {
  requireSettingsPermission(req.user, "edit");

  const payload = normalizeBrandingPayload(pickFields(req.body, brandingFields));

  const update = Object.entries(payload).reduce((changes, [key, value]) => {
    changes[`branding.${key}`] = value;
    return changes;
  }, {});

  const settings = await Settings.findOneAndUpdate(
    { singletonKey: "office_settings" },
    {
      $set: {
        ...update,
        updatedBy: req.user._id,
      },
      $setOnInsert: { singletonKey: "office_settings" },
    },
    { new: true, upsert: true, runValidators: true }
  );

  await logActivity({
    req,
    action: "update",
    module: "settings",
    targetId: settings._id,
    targetModel: "Settings",
    description: "Branding settings updated",
    metadata: {
      changedFields: Object.keys(payload),
    },
  });

  return res.status(200).json({
    success: true,
    message: "Branding settings updated successfully",
    data: {
      branding: settings.branding,
    },
    error: null,
  });
});
