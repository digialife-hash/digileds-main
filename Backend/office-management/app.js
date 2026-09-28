import express from "express";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import hrManagementRoutes from "./routes/hrManagementRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import superAdminDashboardRoutes from "./routes/superAdminDashboardRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import DocumentEmp from "./routes/EmpDocumentRoutes.js";
import DocumentClient from "./routes/ClientDocumentRoutes.js";
import AdminseeDocument from "./routes/AdminSeeDocumentRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import referralPartnerRoutes from "./routes/referralPartnerRoutes.js";
import referralClientRoutes from "./routes/referralClientRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.js";
import idCardRoutes from "./routes/idCardRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import adminPartnerRoutes from "./routes/adminPartnerRoutes.js";
import taskDocumentRoutes from "./routes/taskDocumentRoutes.js";
import clientServiceDetailRoutes from "./routes/clientServiceDetailRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import followUpRoutes from "./routes/followUpRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import accountsRoutes from "./routes/accountsRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import dailyWorkReportRoutes from "./routes/dailyWorkReportRoutes.js";
import systemUserRoutes from "./routes/systemUserRoutes.js";
import adminManagementRoutes from "./routes/adminManagementRoutes.js";

const officeManagementApp = express.Router();

officeManagementApp.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    data: { module: "office-management" },
    error: null,
  });
});

officeManagementApp.use("/auth", authRoutes);
officeManagementApp.use("/clients", clientRoutes);
officeManagementApp.use("/dashboard", dashboardRoutes);
officeManagementApp.use("/employees", employeeRoutes);
officeManagementApp.use("/hr", hrRoutes);
officeManagementApp.use("/hr-management", hrManagementRoutes);
officeManagementApp.use("/invoices", invoiceRoutes);
officeManagementApp.use("/notifications", notificationRoutes);
officeManagementApp.use("/payroll", payrollRoutes);
officeManagementApp.use("/projects", projectRoutes);
officeManagementApp.use("/service-requests", serviceRequestRoutes);
officeManagementApp.use("/settings", settingsRoutes);
officeManagementApp.use("/super-admin/dashboard", superAdminDashboardRoutes);
officeManagementApp.use("/tasks", taskRoutes);
officeManagementApp.use("/teams", teamRoutes);
officeManagementApp.use("/documentEmp", DocumentEmp);
officeManagementApp.use("/documentClient", DocumentClient);
officeManagementApp.use("/adminDocument", AdminseeDocument);
officeManagementApp.use("/github", githubRoutes);
officeManagementApp.use("/attendance", attendanceRoutes);
officeManagementApp.use("/referral-partner", referralPartnerRoutes);
officeManagementApp.use("/referrals", referralClientRoutes);
officeManagementApp.use("/commissions", commissionRoutes);
officeManagementApp.use("/payments", paymentHistoryRoutes);
officeManagementApp.use("/id-cards", idCardRoutes);
officeManagementApp.use("/certificates", certificateRoutes);
officeManagementApp.use("/reports", reportRoutes);
officeManagementApp.use("/partner-profile", profileRoutes);
officeManagementApp.use("/support", supportRoutes);
officeManagementApp.use("/admin/partner-management", adminPartnerRoutes);
officeManagementApp.use("/documents", taskDocumentRoutes);
officeManagementApp.use("/client-service-details", clientServiceDetailRoutes);
officeManagementApp.use("/leaves", leaveRoutes);
officeManagementApp.use("/leads", leadRoutes);
officeManagementApp.use("/follow-ups", followUpRoutes);
officeManagementApp.use("/quotations", quotationRoutes);
officeManagementApp.use("/accounts", accountsRoutes);
officeManagementApp.use("/announcements", announcementRoutes);
officeManagementApp.use("/meetings", meetingRoutes);
officeManagementApp.use("/daily-work-reports", dailyWorkReportRoutes);
officeManagementApp.use("/v1/daily-work-reports", dailyWorkReportRoutes);
officeManagementApp.use("/system-users", systemUserRoutes);
officeManagementApp.use("/admin-management", adminManagementRoutes);

export default officeManagementApp;
