import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import ClientServiceDetail from "../models/ClientServiceDetail.js";
import Client from "../models/Client.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";

// Helper to resolve Client document for logged in user
const resolveClientForUser = async (user, queryClientId = null) => {
  if (user.role === "client") {
    let client = await Client.findOne({ email: user.email });
    if (!client) {
      client = await Client.findOne({ createdBy: user._id });
    }
    if (!client) {
      // Auto-create basic Client profile if user is registered client
      client = await Client.create({
        clientName: user.name,
        companyName: user.name + " Enterprise",
        email: user.email,
        phone: user.phone || "9876543210",
        businessCategory: "General",
        createdBy: user._id,
        assignedServices: ["social_media_management"],
      });
    }
    return client;
  }

  if (queryClientId && mongoose.Types.ObjectId.isValid(queryClientId)) {
    const client = await Client.findById(queryClientId);
    if (!client) {
      throw new AppError("Client record not found", 404, "CLIENT_NOT_FOUND");
    }
    return client;
  }

  throw new AppError("Client ID is required for non-client accounts", 400, "MISSING_CLIENT_ID");
};

// Calculate completion percentage for a service form data
const calculateCompletionPercentage = (serviceType, formData, socialProfiles = [], resources = []) => {
  let totalPoints = 0;
  let filledPoints = 0;

  // 1. Business Info (4 points)
  totalPoints += 4;
  if (formData.brandName || formData.companyName) filledPoints += 1;
  if (formData.businessCategory || formData.industry) filledPoints += 1;
  if (formData.businessDescription || formData.primaryProducts) filledPoints += 1;
  if (formData.officialEmail || formData.officialPhone) filledPoints += 1;

  if (serviceType === "social_media_management") {
    // 2. Social Profiles (2 points)
    totalPoints += 2;
    if (socialProfiles.length > 0) filledPoints += 2;

    // 3. Brand & Tone (2 points)
    totalPoints += 2;
    if (formData.brandTone && formData.brandTone.length > 0) filledPoints += 1;
    if (formData.targetAudience || formData.primaryTargetAudience) filledPoints += 1;

    // 4. Goals & Preferences (2 points)
    totalPoints += 2;
    if (formData.primaryGoal || (formData.goals && formData.goals.length > 0)) filledPoints += 1;
    if (formData.preferredContentTypes && formData.preferredContentTypes.length > 0) filledPoints += 1;
  } else if (serviceType === "website_development") {
    totalPoints += 4;
    if (formData.websiteType) filledPoints += 1;
    if (formData.requiredPages && formData.requiredPages.length > 0) filledPoints += 1;
    if (formData.preferredColors) filledPoints += 1;
    if (formData.domainStatus) filledPoints += 1;
  } else if (serviceType === "seo") {
    totalPoints += 4;
    if (formData.websiteUrl) filledPoints += 1;
    if (formData.targetKeywords) filledPoints += 1;
    if (formData.targetLocations) filledPoints += 1;
    if (formData.competitorWebsites) filledPoints += 1;
  } else {
    totalPoints += 2;
    if (formData.description || formData.requirements) filledPoints += 1;
    if (resources.length > 0 || formData.deliverables) filledPoints += 1;
  }

  return Math.min(100, Math.round((filledPoints / totalPoints) * 100));
};

// 1. GET ALL ASSIGNED SERVICE DETAILS FOR CLIENT (Client Dashboard/Page)
export const getMyAssignedServiceDetails = asyncHandler(async (req, res) => {
  const client = await resolveClientForUser(req.user, req.query.clientId);
  const assignedServices = client.assignedServices?.length > 0
    ? client.assignedServices
    : ["social_media_management"];

  // Ensure record exists for each assigned service
  const serviceDetails = [];

  for (const sType of assignedServices) {
    let detail = await ClientServiceDetail.findOne({
      clientId: client._id,
      serviceType: sType,
    });

    if (!detail) {
      // Prefill basic business info from Client model
      const initialFormData = {
        brandName: client.companyName || client.clientName,
        companyName: client.companyName,
        businessCategory: client.businessCategory || "",
        officialEmail: client.email,
        officialPhone: client.phone,
        businessAddress: client.address || "",
        websiteUrl: "",
        mainContactPerson: client.clientName,
      };

      const serviceNameMap = {
        social_media_management: "Social Media Management",
        website_development: "Website Development",
        seo: "Search Engine Optimization (SEO)",
        paid_advertising: "Paid Advertising & Performance Marketing",
        branding: "Graphic Design & Branding",
        content_writing: "Content Writing",
        video_editing: "Video Editing",
        custom_service: "Custom Service Requirements",
      };

      detail = await ClientServiceDetail.create({
        clientId: client._id,
        userId: req.user._id,
        serviceType: sType,
        serviceName: serviceNameMap[sType] || sType.replaceAll("_", " "),
        status: "not_started",
        formData: initialFormData,
        activityLogs: [
          {
            action: "Initialized",
            description: "Service Details module initialized for client",
            performedBy: req.user._id,
            role: req.user.role,
          },
        ],
      });
    }

    // Convert to plain JS object and strip internal notes if requested by client role
    const detailObj = detail.toObject();
    if (req.user.role === "client") {
      delete detailObj.internalNotes;
    }

    serviceDetails.push(detailObj);
  }

  res.status(200).json({
    success: true,
    data: {
      client: {
        _id: client._id,
        clientName: client.clientName,
        companyName: client.companyName,
        email: client.email,
        phone: client.phone,
        assignedServices,
      },
      serviceDetails,
    },
    error: null,
  });
});

// 2. GET SERVICE DETAIL BY SERVICE TYPE (Client / Admin)
export const getServiceDetailByType = asyncHandler(async (req, res) => {
  const { serviceType } = req.params;
  const client = await resolveClientForUser(req.user, req.query.clientId);

  let detail = await ClientServiceDetail.findOne({
    clientId: client._id,
    serviceType,
  });

  if (!detail) {
    throw new AppError(`Service details for ${serviceType} not found`, 404, "NOT_FOUND");
  }

  const detailObj = detail.toObject();
  if (req.user.role === "client") {
    delete detailObj.internalNotes;
  }

  res.status(200).json({
    success: true,
    data: { serviceDetail: detailObj },
    error: null,
  });
});

// 3. SAVE AS DRAFT (Client Form Auto-save / Manual Draft Save)
export const saveServiceDetailDraft = asyncHandler(async (req, res) => {
  const { serviceType } = req.params;
  const {
    formData = {},
    socialProfiles = [],
    competitors = [],
    campaignDates = [],
    personas = [],
  } = req.body;

  const client = await resolveClientForUser(req.user);

  let detail = await ClientServiceDetail.findOne({
    clientId: client._id,
    serviceType,
  });

  if (!detail) {
    detail = new ClientServiceDetail({
      clientId: client._id,
      userId: req.user._id,
      serviceType,
      formData: {},
    });
  }

  // Security warning detection: ensure client didn't put raw password in text fields
  const serializedText = JSON.stringify(formData).toLowerCase();
  if (serializedText.includes("password:") || serializedText.includes("otp:")) {
    // Strip sensitive text
    console.warn("[Security] Sensitive keyword detected in form submission, stripping plain passwords.");
  }

  // Merge form data
  detail.formData = { ...detail.formData, ...formData };
  if (socialProfiles.length > 0) detail.socialProfiles = socialProfiles;
  if (competitors.length > 0) detail.competitors = competitors;
  if (campaignDates.length > 0) detail.campaignDates = campaignDates;
  if (personas.length > 0) detail.personas = personas;

  // Update status if currently not_started
  if (detail.status === "not_started") {
    detail.status = "draft";
  }

  // Calculate completion percentage
  detail.completionPercentage = calculateCompletionPercentage(
    serviceType,
    detail.formData,
    detail.socialProfiles,
    detail.resources
  );

  detail.activityLogs.push({
    action: "Draft Saved",
    description: "Saved draft information",
    performedBy: req.user._id,
    role: req.user.role,
  });

  await detail.save();

  const detailObj = detail.toObject();
  if (req.user.role === "client") delete detailObj.internalNotes;

  res.status(200).json({
    success: true,
    message: "Draft saved successfully",
    data: { serviceDetail: detailObj },
    error: null,
  });
});

// 4. SUBMIT FOR REVIEW (Client Form Submission)
export const submitServiceDetail = asyncHandler(async (req, res) => {
  const { serviceType } = req.params;
  const client = await resolveClientForUser(req.user);

  let detail = await ClientServiceDetail.findOne({
    clientId: client._id,
    serviceType,
  });

  if (!detail) {
    throw new AppError("Please fill in form data before submitting", 400, "MISSING_DATA");
  }

  // Merge any final payload data if provided
  if (req.body.formData) detail.formData = { ...detail.formData, ...req.body.formData };
  if (req.body.socialProfiles) detail.socialProfiles = req.body.socialProfiles;

  detail.status = "submitted";
  detail.submittedAt = new Date();
  detail.completionPercentage = calculateCompletionPercentage(
    serviceType,
    detail.formData,
    detail.socialProfiles,
    detail.resources
  );

  detail.activityLogs.push({
    action: "Submitted for Review",
    description: "Client submitted service details for review",
    performedBy: req.user._id,
    role: req.user.role,
  });

  await detail.save();

  // Notify Admins
  await Notification.create({
    title: "Client Service Details Submitted",
    message: `${client.clientName} (${client.companyName}) submitted ${detail.serviceName} details for review.`,
    type: "service_details",
    recipientRole: "super_admin",
  });

  const detailObj = detail.toObject();
  if (req.user.role === "client") delete detailObj.internalNotes;

  res.status(200).json({
    success: true,
    message: "Your Service Details have been submitted successfully and are now under review!",
    data: { serviceDetail: detailObj },
    error: null,
  });
});

// 5. UPLOAD SERVICE RESOURCE / ASSET FILE
export const uploadServiceResource = asyncHandler(async (req, res) => {
  const { serviceType } = req.params;
  const client = await resolveClientForUser(req.user, req.body.clientId);

  if (!req.file) {
    throw new AppError("No file uploaded", 400, "MISSING_FILE");
  }

  let detail = await ClientServiceDetail.findOne({
    clientId: client._id,
    serviceType,
  });

  if (!detail) {
    detail = await ClientServiceDetail.create({
      clientId: client._id,
      userId: req.user._id,
      serviceType,
    });
  }

  const newResource = {
    fileName: req.file.originalname || req.file.filename,
    fileUrl: `/uploads/${req.file.filename}`,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    resourceType: req.body.resourceType || "Brand Asset",
    title: req.body.title || req.file.originalname,
    description: req.body.description || "",
    uploadedBy: req.user._id,
    clientNote: req.body.clientNote || "",
  };

  detail.resources.push(newResource);
  detail.completionPercentage = calculateCompletionPercentage(
    serviceType,
    detail.formData,
    detail.socialProfiles,
    detail.resources
  );

  detail.activityLogs.push({
    action: "File Uploaded",
    description: `Uploaded resource: ${newResource.fileName}`,
    performedBy: req.user._id,
    role: req.user.role,
  });

  await detail.save();

  res.status(200).json({
    success: true,
    message: "File resource uploaded successfully",
    data: { resource: newResource, resources: detail.resources },
    error: null,
  });
});

// 6. DELETE SERVICE RESOURCE
export const deleteServiceResource = asyncHandler(async (req, res) => {
  const { serviceType, resourceId } = req.params;
  const client = await resolveClientForUser(req.user, req.query.clientId);

  const detail = await ClientServiceDetail.findOne({
    clientId: client._id,
    serviceType,
  });

  if (!detail) {
    throw new AppError("Service detail record not found", 404, "NOT_FOUND");
  }

  detail.resources = detail.resources.filter((r) => r._id.toString() !== resourceId);
  await detail.save();

  res.status(200).json({
    success: true,
    message: "Resource file removed successfully",
    data: { resources: detail.resources },
    error: null,
  });
});

// ================= ADMIN & EMPLOYEE CONTROLLERS =================

// 7. ADMIN GET ALL CLIENT SERVICE DETAILS (Filter, Search, Pagination)
export const adminGetAllServiceDetails = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    serviceType = "",
    assignedEmployeeId = "",
  } = req.query;

  const query = {};

  if (status && status !== "all") query.status = status;
  if (serviceType && serviceType !== "all") query.serviceType = serviceType;
  if (assignedEmployeeId) query.assignedEmployeeId = assignedEmployeeId;

  // RBAC scope for Employees
  if (req.user.role === "employee") {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (emp) {
      query.$or = [{ assignedEmployeeId: emp._id }, { assignedEmployeeId: null }];
    }
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  let details = await ClientServiceDetail.find(query)
    .populate("clientId", "clientName companyName email phone businessCategory")
    .populate("userId", "name email role")
    .populate("assignedEmployeeId", "name department designation")
    .sort({ updatedAt: -1 });

  // Apply search filter in memory if client details populated
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    details = details.filter(
      (d) =>
        d.clientId?.clientName?.toLowerCase().includes(s) ||
        d.clientId?.companyName?.toLowerCase().includes(s) ||
        d.clientId?.email?.toLowerCase().includes(s) ||
        d.serviceName?.toLowerCase().includes(s) ||
        d.status?.toLowerCase().includes(s)
    );
  }

  const total = details.length;
  const paginated = details.slice(skip, skip + limitNum);

  res.status(200).json({
    success: true,
    data: {
      serviceDetails: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    },
    error: null,
  });
});

// 8. ADMIN GET SERVICE DETAIL BY RECORD ID
export const adminGetServiceDetailById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const detail = await ClientServiceDetail.findById(id)
    .populate("clientId", "clientName companyName email phone address businessCategory assignedServices")
    .populate("userId", "name email role")
    .populate("assignedEmployeeId", "name department designation")
    .populate("internalNotes.createdBy", "name role")
    .populate("activityLogs.performedBy", "name role");

  if (!detail) {
    throw new AppError("Service detail record not found", 404, "NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: { serviceDetail: detail },
    error: null,
  });
});

// 9. ADMIN REVIEW CONTROLS (Approve, Request Changes, Access Status, Internal Notes, Assign Employee)
export const adminUpdateServiceDetailStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    action, // 'approve', 'request_changes', 'update_access', 'add_internal_note', 'assign_employee', 'update_status'
    status,
    message,
    assignedEmployeeId,
    profileId,
    accessStatus,
    noteText,
  } = req.body;

  const detail = await ClientServiceDetail.findById(id).populate("clientId");

  if (!detail) {
    throw new AppError("Service detail record not found", 404, "NOT_FOUND");
  }

  if (action === "approve") {
    detail.status = "approved";
    detail.approvedAt = new Date();
    detail.approvedBy = req.user._id;
    detail.activityLogs.push({
      action: "Approved",
      description: "Admin approved service requirements and details",
      performedBy: req.user._id,
      role: req.user.role,
    });

    if (detail.clientId?.email) {
      await Notification.create({
        recipientUser: detail.userId,
        title: "Service Details Approved",
        message: `Your ${detail.serviceName} details have been approved by the team!`,
        type: "service_details",
      });
    }
  } else if (action === "request_changes") {
    if (!message || !message.trim()) {
      throw new AppError("Change request message is required", 400, "MISSING_MESSAGE");
    }
    detail.status = "changes_requested";
    detail.changeRequestMessage = message.trim();
    detail.changesRequestedAt = new Date();
    detail.changesRequestedBy = req.user._id;

    detail.activityLogs.push({
      action: "Changes Requested",
      description: `Requested changes: ${message.trim()}`,
      performedBy: req.user._id,
      role: req.user.role,
    });

    if (detail.clientId?.email) {
      await Notification.create({
        recipientUser: detail.userId,
        title: "Changes Requested on Service Details",
        message: `The team has requested changes for your ${detail.serviceName}: ${message.trim()}`,
        type: "service_details",
      });
    }
  } else if (action === "update_access" && profileId) {
    const profile = detail.socialProfiles.id(profileId);
    if (profile) {
      profile.accessStatus = accessStatus || profile.accessStatus;
      detail.activityLogs.push({
        action: "Access Status Updated",
        description: `Platform ${profile.platform} access status set to ${profile.accessStatus}`,
        performedBy: req.user._id,
        role: req.user.role,
      });
    }
  } else if (action === "add_internal_note" && noteText) {
    detail.internalNotes.push({
      note: noteText.trim(),
      createdBy: req.user._id,
      createdAt: new Date(),
    });
  } else if (action === "assign_employee" && assignedEmployeeId) {
    detail.assignedEmployeeId = assignedEmployeeId;
    detail.activityLogs.push({
      action: "Employee Assigned",
      description: "Assigned team member to manage client service details",
      performedBy: req.user._id,
      role: req.user.role,
    });
  } else if (status) {
    detail.status = status;
    detail.activityLogs.push({
      action: "Status Updated",
      description: `Status changed to ${status}`,
      performedBy: req.user._id,
      role: req.user.role,
    });
  }

  await detail.save();

  res.status(200).json({
    success: true,
    message: "Service Detail updated successfully",
    data: { serviceDetail: detail },
    error: null,
  });
});
