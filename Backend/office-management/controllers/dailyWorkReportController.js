import mongoose from "mongoose";
import DailyWorkReport from "../models/DailyWorkReport.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Holiday from "../models/Holiday.js";
import Settings from "../models/Settings.js";
import Counter from "../models/Counter.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const adminRoles = ["super_admin", "admin"];
const validObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);
const asObjectId = (id) => (validObjectId(id) ? new mongoose.Types.ObjectId(id) : null);

const dayRange = (dateValue = new Date()) => {
  const source = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(source.getTime())) throw new AppError("Report date is invalid", 400, "INVALID_REPORT_DATE");
  const start = new Date(source.getFullYear(), source.getMonth(), source.getDate(), 0, 0, 0, 0);
  const end = new Date(source.getFullYear(), source.getMonth(), source.getDate(), 23, 59, 59, 999);
  return { start, end };
};

const monthRange = (monthValue, yearValue) => {
  const now = new Date();
  const month = Math.max(1, Math.min(12, parseInt(monthValue || now.getMonth() + 1, 10)));
  const year = parseInt(yearValue || now.getFullYear(), 10);
  return {
    month,
    year,
    start: new Date(year, month - 1, 1, 0, 0, 0, 0),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
};

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const cleanStringArray = (value) =>
  parseMaybeJson(value, [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

const numberValue = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const isAdmin = (user) => adminRoles.includes(user?.role);

const findEmployeeForUser = async (user) => {
  const employee = await Employee.findOne({
    $or: [{ userId: user._id }, { email: user.email }],
  });
  if (!employee) {
    throw new AppError("Employee profile is required before submitting a daily report", 404, "EMPLOYEE_PROFILE_NOT_FOUND");
  }
  return employee;
};

const getEmployee = async (req) => {
  if (isAdmin(req.user) && req.body.employeeId) {
    const employee = await Employee.findById(req.body.employeeId);
    if (!employee) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
    return employee;
  }
  return findEmployeeForUser(req.user);
};

const employeeSnapshot = (employee) => ({
  name: employee.name || "",
  email: employee.email || "",
  employeeCode: employee.employeeId || employee.employeeCode || employee.empId || String(employee._id),
  department: employee.department || "",
  designation: employee.designation || "",
});

const generateReportId = async (date = new Date()) => {
  const year = date.getFullYear();
  const counterId = `dailyWorkReportId-${year}`;
  let counter = await Counter.findOne({ id: counterId });
  if (!counter) {
    try {
      counter = await Counter.create({ id: counterId, seq: 0 });
    } catch (e) {
      counter = await Counter.findOne({ id: counterId });
    }
  }
  const updatedCounter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true }
  );
  return `DWR-${year}-${String(updatedCounter.seq).padStart(5, "0")}`;
};

const filesToAttachments = (files = [], userId) =>
  files.map((file) => ({
    label: file.originalname,
    originalName: file.originalname,
    filename: file.filename,
    path: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
    uploadedBy: userId,
    uploadedAt: new Date(),
  }));

const getAttendanceContext = async (employee, reportDate) => {
  const { start, end } = dayRange(reportDate);
  const attendance = await Attendance.findOne({ employeeId: employee._id, date: { $gte: start, $lte: end } });
  const leave = await Leave.findOne({
    employeeId: employee._id,
    status: "Approved",
    fromDate: { $lte: end },
    toDate: { $gte: start },
  });
  const holiday = await Holiday.findOne({ enabled: { $ne: false }, date: { $gte: start, $lte: end } });

  return {
    attendanceSnapshot: {
      attendanceId: attendance?._id || null,
      checkInTime: attendance?.checkInTime || null,
      checkOutTime: attendance?.checkOutTime || null,
      attendanceStatus: attendance?.attendanceStatus || "",
      totalWorkingHours: attendance?.totalWorkingHours || 0,
      isHoliday: Boolean(attendance?.isHoliday || holiday),
      isWeeklyOff: Boolean(attendance?.isWeeklyOff),
      isPaidLeave: Boolean(attendance?.isPaidLeave || leave?.leaveType === "Paid"),
      isUnpaidLeave: Boolean(attendance?.isUnpaidLeave || leave?.leaveType === "Unpaid"),
    },
    leaveSnapshot: {
      leaveId: leave?._id || null,
      leaveType: leave?.leaveType || "",
      status: leave?.status || "",
    },
    holidaySnapshot: {
      holidayId: holiday?._id || null,
      name: holiday?.name || "",
      type: holiday?.type || "",
    },
  };
};

const validateReportDate = (reportDate, user, backdateReason = "") => {
  const { start } = dayRange(reportDate);
  const today = dayRange().start;
  if (start > today) throw new AppError("Future daily reports are not allowed", 400, "FUTURE_REPORT_NOT_ALLOWED");
  if (!isAdmin(user)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (start < yesterday && !backdateReason?.trim()) {
      throw new AppError("Backdate reason is required for older daily reports", 400, "BACKDATE_REASON_REQUIRED");
    }
  }
};

const normalizeWorkItems = (value) =>
  parseMaybeJson(value, [])
    .map((item) => ({
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      projectId: asObjectId(item.projectId),
      clientId: asObjectId(item.clientId),
      taskId: asObjectId(item.taskId),
      category: item.category || item.workType || "General Work",
      workType: item.category || item.workType || "General Work",
      startTime: String(item.startTime || "").trim(),
      endTime: String(item.endTime || "").trim(),
      durationMinutes: item.durationMinutes !== undefined ? numberValue(item.durationMinutes) : numberValue(item.hours) * 60 + numberValue(item.minutes),
      status: item.status || "In Progress",
      progressPercentage: numberValue(item.progressPercentage),
      priority: item.priority || "Medium",
      remarks: String(item.remarks || "").trim(),
    }))
    .filter((item) => item.title);

const normalizeBlockers = (value) =>
  parseMaybeJson(value, [])
    .map((item) => ({
      hasBlocker: true,
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      projectId: asObjectId(item.projectId),
      taskId: asObjectId(item.taskId),
      blockerType: item.blockerType || "Other",
      helpRequiredFrom: String(item.helpRequiredFrom || "").trim(),
      priority: item.priority || "Medium",
      isResolved: item.isResolved === true || item.isResolved === "true",
    }))
    .filter((item) => item.title || item.description);

const normalizeMeetings = (value) =>
  parseMaybeJson(value, [])
    .map((item) => ({
      title: String(item.title || "").trim(),
      meetingType: item.meetingType || "Internal",
      startTime: String(item.startTime || "").trim(),
      durationMinutes: numberValue(item.durationMinutes),
      participants: String(item.participants || "").trim(),
      purpose: String(item.purpose || "").trim(),
      outcome: String(item.outcome || "").trim(),
    }))
    .filter((item) => item.title || item.purpose);

const normalizeClientCommunications = (value) =>
  parseMaybeJson(value, [])
    .map((item) => ({
      clientId: asObjectId(item.clientId),
      communicationType: item.communicationType || "Call",
      purpose: String(item.purpose || "").trim(),
      outcome: String(item.outcome || "").trim(),
      followUpRequired: item.followUpRequired === true || item.followUpRequired === "true",
      followUpDate: item.followUpDate ? new Date(item.followUpDate) : null,
    }))
    .filter((item) => item.clientId || item.purpose || item.outcome);

const buildPayload = async (req, existingReport = null) => {
  const employee = existingReport ? await Employee.findById(existingReport.employeeId) : await getEmployee(req);
  if (!employee) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");

  const reportDate = req.body.reportDate ? dayRange(req.body.reportDate).start : existingReport?.reportDate || dayRange().start;
  validateReportDate(reportDate, req.user, req.body.backdateReason || existingReport?.backdateReason || "");
  const context = await getAttendanceContext(employee, reportDate);
  const summary = req.body.summary?.trim() ?? req.body.overallSummary?.trim() ?? existingReport?.summary ?? existingReport?.overallSummary ?? "";
  const pendingWork = req.body.pendingWork?.trim() ?? existingReport?.pendingWork ?? "";
  const hasBlocker = req.body.hasBlocker === true || req.body.hasBlocker === "true" || req.body.hasBlocker === "Yes";
  const blockerDetails = req.body.blockerDetails?.trim() ?? existingReport?.blockerDetails ?? "";
  const nextDayPlan = req.body.nextDayPlan?.trim() ?? existingReport?.nextDayPlan ?? "";
  const remarks = req.body.remarks?.trim() ?? req.body.generalRemarks?.trim() ?? existingReport?.remarks ?? existingReport?.generalRemarks ?? "";
  const blockerPayload =
    req.body.blockers !== undefined
      ? normalizeBlockers(req.body.blockers)
      : hasBlocker && blockerDetails
        ? [{ title: "Issue / Blocker", description: blockerDetails, blockerType: "Other", priority: "Medium" }]
        : existingReport?.blockers || [];

  return {
    employeeId: employee._id,
    employeeUserId: employee.userId || req.user._id,
    employeeSnapshot: employeeSnapshot(employee),
    reportDate,
    overallSummary: summary,
    summary,
    mainAchievement: req.body.mainAchievement?.trim() ?? existingReport?.mainAchievement ?? "",
    pendingWork,
    hasBlocker,
    blockerDetails,
    nextDayPlan,
    remarks,
    generalRemarks: remarks,
    workItems: req.body.workItems !== undefined ? normalizeWorkItems(req.body.workItems) : existingReport?.workItems || [],
    blockers: blockerPayload,
    tomorrowPlan: req.body.tomorrowPlan !== undefined ? cleanStringArray(req.body.tomorrowPlan) : nextDayPlan ? [nextDayPlan] : existingReport?.tomorrowPlan || [],
    meetings: req.body.meetings !== undefined ? normalizeMeetings(req.body.meetings) : existingReport?.meetings || [],
    clientCommunications:
      req.body.clientCommunications !== undefined
        ? normalizeClientCommunications(req.body.clientCommunications)
        : existingReport?.clientCommunications || [],
    developmentReferences: existingReport?.developmentReferences || {},
    backdateReason: req.body.backdateReason?.trim() ?? existingReport?.backdateReason ?? "",
    attachments: [...(existingReport?.attachments || []), ...filesToAttachments(req.files || [], req.user._id)],
    ...context,
  };
};

const populateReport = (query) =>
  query
    .populate("employeeId", "name email department designation")
    .populate("workItems.projectId", "projectName projectTitle title")
    .populate("workItems.clientId", "name clientName companyName")
    .populate("workItems.taskId", "taskTitle status priority")
    .populate("managerComments.commentedBy", "name email role")
    .populate("clarifications.requestedBy", "name email role")
    .populate("clarifications.respondedBy", "name email role")
    .populate("reviewedBy", "name email role")
    .populate("acknowledgedBy", "name email role");

const ensureReportAccess = (req, report) => {
  if (isAdmin(req.user)) return;
  if (String(report.employeeUserId) !== String(req.user._id)) {
    throw new AppError("You can access only your own daily reports", 403, "REPORT_ACCESS_DENIED");
  }
};

const ensureEditableByEmployee = (req, report) => {
  if (isAdmin(req.user)) return;
  ensureReportAccess(req, report);
  if (!["Draft", "Needs Clarification"].includes(report.status)) {
    throw new AppError("Submitted reports are locked until manager requests clarification", 400, "REPORT_LOCKED");
  }
};

const hasSubmissionContent = (report) =>
  Boolean(report.summary?.trim() || report.overallSummary?.trim() || report.workItems?.length || report.pendingWork?.trim() || report.blockerDetails?.trim() || report.nextDayPlan?.trim());

const buildListQuery = async (req) => {
  const query = {};
  if (!isAdmin(req.user)) {
    const employee = await findEmployeeForUser(req.user);
    query.employeeId = employee._id;
  } else {
    if (validObjectId(req.query.employeeId)) query.employeeId = req.query.employeeId;
    if (req.query.department) query["employeeSnapshot.department"] = req.query.department;
    if (req.query.designation) query["employeeSnapshot.designation"] = req.query.designation;
  }
  if (req.query.status) query.status = req.query.status;
  if (req.query.hasBlocker === "true") query.$or = [{ hasBlocker: true }, { blockers: { $elemMatch: { isResolved: { $ne: true } } } }];
  if (req.query.late === "true") query.isLate = true;
  if (validObjectId(req.query.projectId)) query["workItems.projectId"] = req.query.projectId;
  if (validObjectId(req.query.clientId)) query["workItems.clientId"] = req.query.clientId;
  if (validObjectId(req.query.taskId)) query["workItems.taskId"] = req.query.taskId;
  if (req.query.workType) query["workItems.workType"] = req.query.workType;
  if (req.query.workStatus) query["workItems.status"] = req.query.workStatus;

  const now = new Date();
  let startDate = req.query.startDate || req.query.date;
  let endDate = req.query.endDate || req.query.date;
  if (req.query.range === "today") startDate = endDate = now;
  if (req.query.range === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    startDate = endDate = yesterday;
  }
  if (req.query.range === "this_week") {
    const start = new Date(now);
    const day = start.getDay();
    start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
    startDate = start;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    endDate = end;
  }
  if (req.query.range === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  if (startDate || endDate) {
    query.reportDate = {};
    if (startDate) query.reportDate.$gte = dayRange(startDate).start;
    if (endDate) query.reportDate.$lte = dayRange(endDate).end;
  }
  return query;
};

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const formatDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");
const formatDisplayDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "-";
const formatDisplayDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";
const formatDuration = (minutes = 0) => {
  const total = Number(minutes || 0);
  if (!total) return "-";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
};
const safeFilename = (value) => String(value || "Daily_Work_Report").replace(/[^a-z0-9_-]+/gi, "_").replace(/_+/g, "_").slice(0, 120);

const addPdfHeader = (doc, company, report) => {
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#0f172a").text(company.companyName || "Office Management System", 50, 44);
  doc.font("Helvetica").fontSize(9).fillColor("#475569");
  if (company.companyAddress) doc.text(company.companyAddress, 50, 64, { width: 330 });
  const contact = [company.companyPhone, company.companyEmail, company.website].filter(Boolean).join(" | ");
  if (contact) doc.text(contact, 50, doc.y + 2, { width: 330 });
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#1d4ed8").text("DAILY WORK REPORT", 360, 44, { width: 185, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor("#475569").text(`Report ID: ${report.reportId || "-"}`, 360, 70, { width: 185, align: "right" });
  doc.text(`Report Date: ${formatDisplayDate(report.reportDate)}`, 360, 84, { width: 185, align: "right" });
  doc.moveTo(50, 116).lineTo(545, 116).strokeColor("#cbd5e1").stroke();
  doc.y = 132;
};

const ensurePdfSpace = (doc, needed = 80) => {
  if (doc.y + needed <= doc.page.height - 72) return;
  doc.addPage();
  doc.y = 54;
};

const addPdfSection = (doc, title, body) => {
  if (!body) return;
  ensurePdfSpace(doc, 70);
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(title.toUpperCase());
  doc.moveDown(0.35);
  doc.font("Helvetica").fontSize(10).fillColor("#334155").text(String(body), { width: 495, lineGap: 3 });
};

const addKeyValueGrid = (doc, rows) => {
  rows.forEach(([label, value], index) => {
    const columnX = index % 2 === 0 ? 50 : 300;
    if (index % 2 === 0) ensurePdfSpace(doc, 38);
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#64748b").text(label.toUpperCase(), columnX, y, { width: 220 });
    doc.font("Helvetica").fontSize(10).fillColor("#0f172a").text(value || "-", columnX, y + 12, { width: 220 });
    if (index % 2 === 1 || index === rows.length - 1) doc.y = y + 36;
  });
};

const addPdfWorkItem = (doc, item, index) => {
  ensurePdfSpace(doc, 120);
  const startY = doc.y;
  doc.roundedRect(50, startY, 495, 1, 1).fill("#e2e8f0");
  doc.y = startY + 12;
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(`${index + 1}. ${item.title || "Work Item"}`, 50, doc.y, { width: 495 });
  if (item.description) {
    doc.moveDown(0.35);
    doc.font("Helvetica").fontSize(10).fillColor("#334155").text(item.description, { width: 495, lineGap: 3 });
  }
  const projectName = item.projectId?.projectName || item.projectId?.projectTitle || item.projectId?.title || "";
  const clientName = item.clientId?.companyName || item.clientId?.clientName || item.clientId?.name || "";
  addKeyValueGrid(doc, [
    ["Category", item.category || item.workType || "General Work"],
    ["Status", item.status || "-"],
    ["Project", projectName || "-"],
    ["Client", clientName || "-"],
    ["Time Spent", formatDuration(item.durationMinutes)],
  ]);
};

export const buildDailyReportPdf = async ({ report, res, company: companyOverride = null }) => {
  let PDFDocument;
  try {
    ({ default: PDFDocument } = await import("pdfkit"));
  } catch (error) {
    throw new AppError(
      "PDF generation dependency is not installed. Please run npm install on the backend.",
      500,
      "PDFKIT_NOT_INSTALLED"
    );
  }

  const settings = companyOverride ? null : await Settings.getSingleton();
  const company = companyOverride || settings?.company || {};
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  const employeeName = report.employeeSnapshot?.name || report.employeeId?.name || "Employee";
  const filename = `${safeFilename(`Daily_Work_Report_${employeeName}_${formatDate(report.reportDate)}`)}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  addPdfHeader(doc, company, report);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text("Employee Information");
  doc.moveDown(0.5);
  addKeyValueGrid(doc, [
    ["Employee Name", employeeName],
    ["Employee ID", report.employeeSnapshot?.employeeCode || report.employeeId?._id || report.employeeId || "-"],
    ["Department", report.employeeSnapshot?.department || report.employeeId?.department || "-"],
    ["Designation", report.employeeSnapshot?.designation || report.employeeId?.designation || "-"],
    ["Report Date", formatDisplayDate(report.reportDate)],
    ["Submission Time", formatDisplayDateTime(report.submittedAt || report.submissionDate)],
    ["Status", report.status],
    ["Total Time", formatDuration(report.totalReportedMinutes)],
  ]);

  ensurePdfSpace(doc, 60);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text("Work Completed / Work Details");
  doc.moveDown(0.4);
  if (report.workItems?.length) {
    report.workItems.forEach((item, index) => addPdfWorkItem(doc, item, index));
  } else {
    doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("No work items added.");
  }

  addPdfSection(doc, "Today's Work Summary", report.summary || report.overallSummary);
  addPdfSection(doc, "Pending Work", report.pendingWork);
  addPdfSection(doc, "Issues / Blockers", report.hasBlocker || report.blockerDetails ? report.blockerDetails || "Yes" : "");
  addPdfSection(doc, "Plan for Next Working Day", report.nextDayPlan || report.tomorrowPlan?.join("\n"));
  addPdfSection(doc, "Remarks", report.remarks || report.generalRemarks);

  if (report.attachments?.length) {
    addPdfSection(doc, "Attachments", report.attachments.map((attachment) => attachment.originalName || attachment.label || attachment.filename).join("\n"));
  }

  if (report.managerComments?.length) {
    addPdfSection(
      doc,
      "Review Information",
      report.managerComments.map((item) => `${item.commentType || "Comment"}: ${item.comment}`).join("\n")
    );
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(8).fillColor("#64748b");
    doc.text("Generated from Office Management System", 50, 790, { width: 250 });
    doc.text(`Generated on: ${formatDisplayDateTime(new Date())}`, 50, 803, { width: 250 });
    doc.text(`Page ${i + 1 - range.start} of ${range.count}`, 430, 803, { width: 115, align: "right" });
  }

  doc.end();
};

export const createDailyWorkReport = asyncHandler(async (req, res) => {
  const payload = await buildPayload(req);
  const existingReport = await DailyWorkReport.findOne({ employeeId: payload.employeeId, reportDate: payload.reportDate });
  if (existingReport) {
    return res.status(409).json({
      success: false,
      message: "A daily report already exists for this employee and date",
      data: { duplicate: true, report: existingReport },
      error: { code: "DUPLICATE_DAILY_REPORT" },
    });
  }

  const action = req.body.action || req.body.status || "Draft";
  const report = new DailyWorkReport({
    ...payload,
    reportId: await generateReportId(payload.reportDate),
    status: action === "Submitted" || action === "submit" ? "Submitted" : "Draft",
    createdBy: req.user._id,
    updatedBy: req.user._id,
    activityTimeline: [{ action: action === "Submitted" || action === "submit" ? "Submitted" : "Draft Saved", performedBy: req.user._id }],
  });

  if (report.status === "Submitted") {
    if (!hasSubmissionContent(report)) throw new AppError("Add work summary or work items before submitting", 400, "EMPTY_REPORT");
    const now = new Date();
    report.submittedAt = now;
    report.submissionDate = now;
    report.submissionTime = now.toTimeString().slice(0, 5);
    const [hour, minute] = (process.env.DAILY_REPORT_DEADLINE || "19:00").split(":").map(Number);
    const deadline = new Date(report.reportDate);
    deadline.setHours(hour || 19, minute || 0, 0, 0);
    report.isLate = now > deadline;
  }

  await report.save();
  const populated = await populateReport(DailyWorkReport.findById(report._id));
  res.status(201).json({ success: true, message: "Daily work report saved successfully", data: { report: populated } });
});

export const updateDailyWorkReport = asyncHandler(async (req, res) => {
  const report = await DailyWorkReport.findById(req.params.id);
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  ensureEditableByEmployee(req, report);
  const payload = await buildPayload(req, report);
  Object.assign(report, payload, { updatedBy: req.user._id });
  report.activityTimeline.push({ action: "Updated", performedBy: req.user._id });
  await report.save();
  const populated = await populateReport(DailyWorkReport.findById(report._id));
  res.json({ success: true, message: "Daily work report updated successfully", data: { report: populated } });
});

export const submitDailyWorkReport = asyncHandler(async (req, res) => {
  const report = await DailyWorkReport.findById(req.params.id);
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  ensureEditableByEmployee(req, report);
  if (!hasSubmissionContent(report)) throw new AppError("Add work summary or work items before submitting", 400, "EMPTY_REPORT");
  const now = new Date();
  report.status = "Submitted";
  report.submittedAt = now;
  report.submissionDate = now;
  report.submissionTime = now.toTimeString().slice(0, 5);
  const [hour, minute] = (process.env.DAILY_REPORT_DEADLINE || "19:00").split(":").map(Number);
  const deadline = new Date(report.reportDate);
  deadline.setHours(hour || 19, minute || 0, 0, 0);
  report.isLate = now > deadline;
  report.updatedBy = req.user._id;
  report.activityTimeline.push({ action: "Submitted", performedBy: req.user._id });
  await report.save();
  const populated = await populateReport(DailyWorkReport.findById(report._id));
  res.json({ success: true, message: "Daily work report submitted successfully", data: { report: populated } });
});

export const getMyTodayReport = asyncHandler(async (req, res) => {
  const employee = await findEmployeeForUser(req.user);
  const { start, end } = dayRange();
  const report = await populateReport(DailyWorkReport.findOne({ employeeId: employee._id, reportDate: { $gte: start, $lte: end } }));
  const context = await getAttendanceContext(employee, start);
  res.json({ success: true, data: { report, employee, context } });
});

export const getDailyWorkReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20, 10)));
  const query = await buildListQuery(req);
  const [reports, total] = await Promise.all([
    populateReport(DailyWorkReport.find(query).sort({ reportDate: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
    DailyWorkReport.countDocuments(query),
  ]);
  res.json({ success: true, data: { reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const getDailyWorkReportById = asyncHandler(async (req, res) => {
  const report = await populateReport(DailyWorkReport.findById(req.params.id));
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  ensureReportAccess(req, report);
  res.json({ success: true, data: { report } });
});

export const downloadDailyWorkReportPdf = asyncHandler(async (req, res) => {
  const report = await populateReport(DailyWorkReport.findById(req.params.id));
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  ensureReportAccess(req, report);
  if (report.status === "Draft") {
    throw new AppError("Submit the daily report before downloading the official PDF", 400, "PDF_AVAILABLE_AFTER_SUBMISSION");
  }
  await buildDailyReportPdf({ report, res });
});

export const reviewDailyWorkReport = asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) throw new AppError("Only admin can review daily reports", 403, "FORBIDDEN");
  const { status, comment = "" } = req.body;
  if (!["Reviewed", "Needs Clarification", "Acknowledged"].includes(status)) {
    throw new AppError("Review status is invalid", 400, "INVALID_REVIEW_STATUS");
  }
  if (status === "Needs Clarification" && !comment.trim()) {
    throw new AppError("Clarification comment is required", 400, "CLARIFICATION_REQUIRED");
  }
  const report = await DailyWorkReport.findById(req.params.id);
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  report.status = status;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  if (status === "Acknowledged") {
    report.acknowledgedBy = req.user._id;
    report.acknowledgedAt = new Date();
  }
  if (comment.trim()) {
    report.managerComments.push({ comment, commentType: status === "Needs Clarification" ? "Clarification Request" : "Review", commentedBy: req.user._id });
    if (status === "Needs Clarification") {
      report.clarifications.push({ question: comment, requestedBy: req.user._id });
    }
  }
  report.activityTimeline.push({ action: status, note: comment, performedBy: req.user._id });
  await report.save();
  const populated = await populateReport(DailyWorkReport.findById(report._id));
  res.json({ success: true, message: "Daily report review updated", data: { report: populated } });
});

export const addDailyWorkReportComment = asyncHandler(async (req, res) => {
  if (isAdmin(req.user) === false) throw new AppError("Only admin can add manager comments", 403, "FORBIDDEN");
  const comment = String(req.body.comment || "").trim();
  if (!comment) throw new AppError("Comment is required", 400, "COMMENT_REQUIRED");
  const report = await DailyWorkReport.findById(req.params.id);
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  report.managerComments.push({ comment, commentedBy: req.user._id });
  report.activityTimeline.push({ action: "Commented", note: comment, performedBy: req.user._id });
  await report.save();
  const populated = await populateReport(DailyWorkReport.findById(report._id));
  res.json({ success: true, message: "Comment added", data: { report: populated } });
});

export const respondToClarification = asyncHandler(async (req, res) => {
  const response = String(req.body.response || "").trim();
  if (!response) throw new AppError("Response is required", 400, "RESPONSE_REQUIRED");
  const report = await DailyWorkReport.findById(req.params.id);
  if (!report) throw new AppError("Daily work report not found", 404, "REPORT_NOT_FOUND");
  ensureReportAccess(req, report);
  const clarification = report.clarifications.id(req.params.clarificationId);
  if (!clarification) throw new AppError("Clarification request not found", 404, "CLARIFICATION_NOT_FOUND");
  clarification.response = response;
  clarification.respondedBy = req.user._id;
  clarification.respondedAt = new Date();
  clarification.status = "Responded";
  report.status = "Submitted";
  report.managerComments.push({ comment: response, commentType: "Employee Response", commentedBy: req.user._id });
  report.activityTimeline.push({ action: "Clarification Responded", note: response, performedBy: req.user._id });
  await report.save();
  const populated = await populateReport(DailyWorkReport.findById(report._id));
  res.json({ success: true, message: "Clarification response submitted", data: { report: populated } });
});

export const getDailyReportAnalytics = asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) throw new AppError("Only admin can access daily report analytics", 403, "FORBIDDEN");
  const { start, end } = dayRange(req.query.date || new Date());
  const [employees, reports, attendance, leaves, holiday] = await Promise.all([
    Employee.find({ status: { $ne: "inactive" } }).select("name email department designation userId"),
    DailyWorkReport.find({ reportDate: { $gte: start, $lte: end } }),
    Attendance.find({ date: { $gte: start, $lte: end } }),
    Leave.find({ status: "Approved", fromDate: { $lte: end }, toDate: { $gte: start } }),
    Holiday.findOne({ enabled: { $ne: false }, date: { $gte: start, $lte: end } }),
  ]);
  const reportMap = new Map(reports.map((report) => [String(report.employeeId), report]));
  const attendanceMap = new Map(attendance.map((item) => [String(item.employeeId), item]));
  const leaveMap = new Map(leaves.map((item) => [String(item.employeeId), item]));
  const rows = employees.map((employee) => {
    const report = reportMap.get(String(employee._id));
    const att = attendanceMap.get(String(employee._id));
    const leave = leaveMap.get(String(employee._id));
    return {
      employee,
      report,
      attendanceStatus: att?.attendanceStatus || (holiday ? "Holiday" : leave ? "On Leave" : "Not Marked"),
      expected: !holiday && !leave,
      submitted: Boolean(report && report.status !== "Draft"),
    };
  });
  const submittedReports = reports.filter((report) => report.status !== "Draft");
  const pendingRows = rows.filter((row) => row.expected && !row.submitted);
  const blockedReports = reports.filter((report) => report.blockers?.some((blocker) => !blocker.isResolved));
  const statusCounts = reports.reduce((acc, report) => ({ ...acc, [report.status]: (acc[report.status] || 0) + 1 }), {});
  const workStatusCounts = {};
  const projectWork = {};
  reports.forEach((report) => {
    report.workItems.forEach((item) => {
      workStatusCounts[item.status] = (workStatusCounts[item.status] || 0) + 1;
      const key = item.projectId ? String(item.projectId) : "No Project";
      projectWork[key] = (projectWork[key] || 0) + item.durationMinutes;
    });
  });

  res.json({
    success: true,
    data: {
      date: formatDate(start),
      holiday,
      summary: {
        totalEmployees: employees.length,
        submitted: submittedReports.length,
        pending: pendingRows.length,
        draft: reports.filter((report) => report.status === "Draft").length,
        reviewed: reports.filter((report) => ["Reviewed", "Acknowledged"].includes(report.status)).length,
        needsClarification: reports.filter((report) => report.status === "Needs Clarification").length,
        blockers: blockedReports.length,
        late: reports.filter((report) => report.isLate).length,
        totalHours: Math.round((reports.reduce((sum, report) => sum + report.totalReportedMinutes, 0) / 60) * 100) / 100,
      },
      rows,
      statusCounts,
      workStatusCounts,
      projectWork,
      blockers: blockedReports.flatMap((report) =>
        report.blockers
          .filter((blocker) => !blocker.isResolved)
          .map((blocker) => ({ reportId: report._id, employee: report.employeeSnapshot, blocker }))
      ),
    },
  });
});

export const getMonthlyReportAnalytics = asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) throw new AppError("Only admin can access monthly report analytics", 403, "FORBIDDEN");
  const { month, year, start, end } = monthRange(req.query.month, req.query.year);
  const [employees, reports, holidays, leaves] = await Promise.all([
    Employee.find({ status: { $ne: "inactive" } }).select("name email department designation"),
    DailyWorkReport.find({ reportDate: { $gte: start, $lte: end } }),
    Holiday.find({ enabled: { $ne: false }, date: { $gte: start, $lte: end } }),
    Leave.find({ status: "Approved", fromDate: { $lte: end }, toDate: { $gte: start } }),
  ]);
  const reportGroups = reports.reduce((acc, report) => {
    const key = String(report.employeeId);
    acc[key] = acc[key] || [];
    acc[key].push(report);
    return acc;
  }, {});
  const holidayDates = new Set(holidays.map((item) => formatDate(item.date)));
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const copy = new Date(d);
    if (copy <= new Date()) days.push(copy);
  }
  const employeeSummaries = employees.map((employee) => {
    const employeeReports = reportGroups[String(employee._id)] || [];
    const employeeLeaves = leaves.filter((leave) => String(leave.employeeId) === String(employee._id));
    const expectedDays = days.filter((date) => {
      const weekend = date.getDay() === 0;
      const holiday = holidayDates.has(formatDate(date));
      const onLeave = employeeLeaves.some((leave) => new Date(leave.fromDate) <= date && new Date(leave.toDate) >= date);
      return !weekend && !holiday && !onLeave;
    }).length;
    const submitted = employeeReports.filter((report) => report.status !== "Draft").length;
    return {
      employee,
      expectedDays,
      submitted,
      missing: Math.max(0, expectedDays - submitted),
      submissionRate: expectedDays ? Math.round((submitted / expectedDays) * 100) : 100,
      hours: Math.round((employeeReports.reduce((sum, report) => sum + report.totalReportedMinutes, 0) / 60) * 100) / 100,
      blockers: employeeReports.reduce((sum, report) => sum + report.blockers.filter((blocker) => !blocker.isResolved).length, 0),
    };
  });
  const trend = days.map((date) => ({
    date: formatDate(date),
    submitted: reports.filter((report) => formatDate(report.reportDate) === formatDate(date) && report.status !== "Draft").length,
  }));
  res.json({
    success: true,
    data: {
      month,
      year,
      summary: {
        employees: employees.length,
        expectedReports: employeeSummaries.reduce((sum, item) => sum + item.expectedDays, 0),
        submittedReports: employeeSummaries.reduce((sum, item) => sum + item.submitted, 0),
        missingReports: employeeSummaries.reduce((sum, item) => sum + item.missing, 0),
        totalHours: Math.round((reports.reduce((sum, report) => sum + report.totalReportedMinutes, 0) / 60) * 100) / 100,
      },
      employeeSummaries,
      trend,
    },
  });
});

export const exportDailyWorkReports = asyncHandler(async (req, res) => {
  const query = await buildListQuery(req);
  const reports = await DailyWorkReport.find(query).sort({ reportDate: -1 }).limit(5000);
  const rows = [
    ["Report ID", "Date", "Employee", "Department", "Status", "Late", "Hours", "Work Items", "Blockers", "Summary"],
    ...reports.map((report) => [
      report.reportId,
      formatDate(report.reportDate),
      report.employeeSnapshot?.name,
      report.employeeSnapshot?.department,
      report.status,
      report.isLate ? "Yes" : "No",
      Math.round((report.totalReportedMinutes / 60) * 100) / 100,
      report.workItems.length,
      report.blockers.filter((blocker) => !blocker.isResolved).length,
      report.overallSummary,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="daily-work-reports-${Date.now()}.csv"`);
  res.send(csv);
});
