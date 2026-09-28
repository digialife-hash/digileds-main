import mongoose from "mongoose";

export const dailyReportStatuses = ["Draft", "Submitted", "Reviewed", "Needs Clarification", "Acknowledged"];
export const workCategories = [
  "General Work",
  "Client Work",
  "Project Work",
  "Meeting",
  "Follow-Up",
  "Documentation",
  "Planning",
  "Support",
  "Administrative",
  "Research",
  "Reporting",
  "Other",
];
export const workTypes = [
  ...workCategories,
  "Development",
  "Bug Fixing",
  "Testing",
  "Deployment",
  "Client Communication",
  "Design",
  "Code Review",
  "Maintenance",
  "Training",
  "Sales",
  "Marketing",
  "HR",
  "Accounts",
];
export const workStatuses = ["Completed", "In Progress", "Pending", "Blocked", "On Hold", "Not Started"];
export const blockerTypes = [
  "Technical",
  "Client Dependency",
  "Approval Required",
  "Access Required",
  "Resource Required",
  "Requirement Clarification",
  "Third-Party Issue",
  "Infrastructure",
  "Other",
];

const attachmentSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Supporting Document" },
    originalName: { type: String, trim: true, default: "" },
    filename: { type: String, trim: true, default: "" },
    path: { type: String, trim: true, default: "" },
    mimetype: { type: String, trim: true, default: "" },
    size: { type: Number, min: 0, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const workItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, default: "", maxlength: 3000 },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    category: { type: String, enum: workCategories, default: "General Work" },
    workType: { type: String, enum: workTypes, default: "Other" },
    startTime: { type: String, trim: true, default: "" },
    endTime: { type: String, trim: true, default: "" },
    durationMinutes: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: workStatuses, default: "In Progress" },
    progressPercentage: { type: Number, min: 0, max: 100, default: 0 },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    remarks: { type: String, trim: true, default: "" },
    managerComments: {
      type: [
        {
          comment: { type: String, trim: true, required: true },
          commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
          commentedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { _id: true }
);

const blockerSchema = new mongoose.Schema(
  {
    hasBlocker: { type: Boolean, default: true },
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    blockerType: { type: String, enum: blockerTypes, default: "Other" },
    helpRequiredFrom: { type: String, trim: true, default: "" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    isResolved: { type: Boolean, default: false },
  },
  { _id: true }
);

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    meetingType: { type: String, enum: ["Internal", "Client", "Project", "Sales", "Review", "Planning", "Other"], default: "Internal" },
    startTime: { type: String, trim: true, default: "" },
    durationMinutes: { type: Number, min: 0, default: 0 },
    participants: { type: String, trim: true, default: "" },
    purpose: { type: String, trim: true, default: "" },
    outcome: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const clientCommunicationSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    communicationType: { type: String, enum: ["Call", "WhatsApp", "Email", "Meeting", "Video Call", "Other"], default: "Call" },
    purpose: { type: String, trim: true, default: "" },
    outcome: { type: String, trim: true, default: "" },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date, default: null },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    comment: { type: String, required: true, trim: true },
    commentType: { type: String, enum: ["Comment", "Review", "Clarification Request", "Acknowledgement", "Employee Response"], default: "Comment" },
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    commentedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const clarificationSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestedAt: { type: Date, default: Date.now },
    response: { type: String, trim: true, default: "" },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    respondedAt: { type: Date, default: null },
    status: { type: String, enum: ["Open", "Responded", "Closed"], default: "Open" },
  },
  { _id: true }
);

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    performedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const dailyWorkReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true, sparse: true, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeSnapshot: {
      name: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      employeeCode: { type: String, trim: true, default: "" },
      department: { type: String, trim: true, default: "" },
      designation: { type: String, trim: true, default: "" },
    },
    reportDate: { type: Date, required: true },
    submissionDate: { type: Date, default: null },
    submissionTime: { type: String, trim: true, default: "" },
    overallSummary: { type: String, trim: true, default: "", maxlength: 5000 },
    summary: { type: String, trim: true, default: "", maxlength: 5000 },
    mainAchievement: { type: String, trim: true, default: "", maxlength: 2000 },
    pendingWork: { type: String, trim: true, default: "", maxlength: 5000 },
    hasBlocker: { type: Boolean, default: false },
    blockerDetails: { type: String, trim: true, default: "", maxlength: 5000 },
    nextDayPlan: { type: String, trim: true, default: "", maxlength: 5000 },
    remarks: { type: String, trim: true, default: "", maxlength: 5000 },
    generalRemarks: { type: String, trim: true, default: "", maxlength: 3000 },
    workItems: { type: [workItemSchema], default: [] },
    blockers: { type: [blockerSchema], default: [] },
    tomorrowPlan: { type: [String], default: [] },
    meetings: { type: [meetingSchema], default: [] },
    clientCommunications: { type: [clientCommunicationSchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },
    developmentReferences: {
      repository: { type: String, trim: true, default: "" },
      branch: { type: String, trim: true, default: "" },
      commitReference: { type: String, trim: true, default: "" },
      deploymentLink: { type: String, trim: true, default: "" },
    },
    totalReportedMinutes: { type: Number, min: 0, default: 0 },
    attendanceSnapshot: {
      attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", default: null },
      checkInTime: { type: Date, default: null },
      checkOutTime: { type: Date, default: null },
      attendanceStatus: { type: String, trim: true, default: "" },
      totalWorkingHours: { type: Number, min: 0, default: 0 },
      isHoliday: { type: Boolean, default: false },
      isWeeklyOff: { type: Boolean, default: false },
      isPaidLeave: { type: Boolean, default: false },
      isUnpaidLeave: { type: Boolean, default: false },
    },
    leaveSnapshot: {
      leaveId: { type: mongoose.Schema.Types.ObjectId, ref: "Leave", default: null },
      leaveType: { type: String, trim: true, default: "" },
      status: { type: String, trim: true, default: "" },
    },
    holidaySnapshot: {
      holidayId: { type: mongoose.Schema.Types.ObjectId, ref: "Holiday", default: null },
      name: { type: String, trim: true, default: "" },
      type: { type: String, trim: true, default: "" },
    },
    status: { type: String, enum: dailyReportStatuses, default: "Draft" },
    submittedAt: { type: Date, default: null },
    isLate: { type: Boolean, default: false },
    backdateReason: { type: String, trim: true, default: "" },
    managerComments: { type: [commentSchema], default: [] },
    clarifications: { type: [clarificationSchema], default: [] },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acknowledgedAt: { type: Date, default: null },
    activityTimeline: { type: [activitySchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

dailyWorkReportSchema.pre("validate", function (next) {
  const reportDate = this.reportDate || new Date();
  this.reportDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate(), 0, 0, 0, 0);
  this.totalReportedMinutes = this.workItems.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
  if (this.summary && !this.overallSummary) this.overallSummary = this.summary;
  if (this.overallSummary && !this.summary) this.summary = this.overallSummary;
  if (this.remarks && !this.generalRemarks) this.generalRemarks = this.remarks;
  if (this.generalRemarks && !this.remarks) this.remarks = this.generalRemarks;
  if (this.nextDayPlan && (!this.tomorrowPlan || this.tomorrowPlan.length === 0)) this.tomorrowPlan = [this.nextDayPlan];
  if (this.hasBlocker && this.blockerDetails && (!this.blockers || this.blockers.length === 0)) {
    this.blockers = [{ title: "Issue / Blocker", description: this.blockerDetails, blockerType: "Other" }];
  }
  this.workItems.forEach((item) => {
    if (item.status === "Completed" && item.progressPercentage < 100) item.progressPercentage = 100;
  });
  next();
});

dailyWorkReportSchema.index({ employeeId: 1, reportDate: 1 }, { unique: true });
dailyWorkReportSchema.index({ employeeUserId: 1 });
dailyWorkReportSchema.index({ reportDate: 1 });
dailyWorkReportSchema.index({ status: 1 });
dailyWorkReportSchema.index({ "employeeSnapshot.department": 1 });
dailyWorkReportSchema.index({ submittedAt: -1 });
dailyWorkReportSchema.index({ totalReportedMinutes: 1 });
dailyWorkReportSchema.index({ "workItems.projectId": 1 });
dailyWorkReportSchema.index({ "workItems.taskId": 1 });
dailyWorkReportSchema.index({ "blockers.priority": 1 });

const DailyWorkReport = mongoose.model("DailyWorkReport", dailyWorkReportSchema);
export default DailyWorkReport;
