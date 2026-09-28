import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  UserCheck,
  CircleDollarSign,
  History,
  IdCard,
  Award,
  Bell,
  BarChart3,
  FilePlus,
  BriefcaseBusiness,
  FileText,
  CheckSquare,
  Wallet,
  Receipt,
  CalendarCheck,
  UserRound,
  HelpCircle,
  FolderOpen,
  Sparkles,
  TrendingUp,
  Calendar,
  FileArchive,
  Megaphone,
  NotebookTabs,
  UserCog,
} from "lucide-react";
import { ROUTES } from "../routes/routeConstants";

export const sidebarCategories = {
  super_admin: [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      headerPath: ROUTES.SUPER_ADMIN_DASHBOARD,
      items: [
        { label: "Dashboard", path: ROUTES.SUPER_ADMIN_DASHBOARD, icon: LayoutDashboard },
        { label: "Pending Tasks", path: `${ROUTES.SUPER_ADMIN_TASKS}?status=pending`, icon: CheckSquare },
        { label: "Main Admin Management", path: ROUTES.SUPER_ADMIN_ADMIN_MANAGEMENT, icon: UserCog },
        { label: "Users, Roles & Permissions", path: ROUTES.SUPER_ADMIN_USERS, icon: UserCog },
        { label: "Tenants & domains", path: ROUTES.SUPER_ADMIN_TENANTS, icon: Building2 },
      ],
    },
    {
      id: "employee_mgmt",
      title: "Employee Management",
      icon: Users,
      items: [
        { label: "Employee List", path: ROUTES.SUPER_ADMIN_EMPLOYEES, icon: Users },
        // { label: "HR Account Management", path: ROUTES.SUPER_ADMIN_HR_MANAGEMENT, icon: UserCog },
        { label: "ID Card", path: ROUTES.SUPER_ADMIN_ID_CARDS, icon: IdCard },
        { label: "Certificates", path: ROUTES.SUPER_ADMIN_CERTIFICATES, icon: Award },
        { label: "upload Documents", path: ROUTES.SUPER_ADMIN_Document_Uploads, icon: FilePlus },
        { label: "Salary Details", path: ROUTES.SUPER_ADMIN_PAYROLL, icon: Wallet },
        // { label: "Leave Management", path: ROUTES.SUPER_ADMIN_LEAVES, icon: CalendarCheck },
        { label: "Attendance", path: ROUTES.SUPER_ADMIN_ATTENDANCE, icon: CalendarCheck },
      ],
    },
    {
      id: "project_mgmt",
      title: "Project Management",
      icon: BriefcaseBusiness,
      items: [
        { label: "Active Projects", path: `${ROUTES.SUPER_ADMIN_PROJECTS}?status=active`, icon: BriefcaseBusiness },
        // { label: "Project Status", path: ROUTES.SUPER_ADMIN_PROJECTS, icon: BriefcaseBusiness },
        // { label: "Deadlines", path: `${ROUTES.SUPER_ADMIN_PROJECTS}?sort=deadline`, icon: Clock },
      ],
    },
    {
      id: "client_crm",
      title: "Client Management (CRM)",
      icon: Building2,
      items: [
        { label: "Client Lists & Details", path: ROUTES.SUPER_ADMIN_CLIENTS, icon: Building2 },
        { label: "Client Documents", path: ROUTES.SUPER_ADMIN_CLIENT_DOCUMENTS, icon: FolderOpen },
        { label: "New Leads", path: ROUTES.SUPER_ADMIN_LEADS, icon: UserCheck },
        { label: "Follow-up", path: ROUTES.SUPER_ADMIN_FOLLOWUPS, icon: CalendarCheck },
        { label: "Quotation", path: ROUTES.SUPER_ADMIN_QUOTATIONS, icon: FileText },
        { label: "Service Requests", path: ROUTES.SUPER_ADMIN_SERVICE_REQUESTS, icon: FilePlus },
        { label: "Invoice", path: ROUTES.SUPER_ADMIN_INVOICES, icon: Receipt },
        { label: "Payment Status", path: `${ROUTES.SUPER_ADMIN_INVOICES_Status}?tab=payments`, icon: CircleDollarSign },
      ],
    },
    // {
    //   id: "accounts",
    //   title: "Accounts",  
    //   icon: Wallet,
    //   items: [
    //     { label: "Total Work Amount", path: `${ROUTES.SUPER_ADMIN_ACCOUNTS}?tab=work`, icon: Wallet },
    //     { label: "Pending Amount", path: `${ROUTES.SUPER_ADMIN_ACCOUNTS}?tab=pending`, icon: Clock },
    //     { label: "Income", path: `${ROUTES.SUPER_ADMIN_ACCOUNTS}?tab=income`, icon: TrendingUp },
    //     { label: "Expenses", path: `${ROUTES.SUPER_ADMIN_ACCOUNTS}?tab=expenses`, icon: Receipt },
    //     { label: "GST Bill", path: `${ROUTES.SUPER_ADMIN_INVOICES}?type=gst`, icon: FileText },
    //     { label: "Without GST", path: `${ROUTES.SUPER_ADMIN_INVOICES}?type=non_gst`, icon: FileText },
    //     { label: "Profit/Loss", path: `${ROUTES.SUPER_ADMIN_ACCOUNTS}?tab=profit_loss`, icon: CircleDollarSign },
    //   ],
    // },

    {
      id: "hr_attendance",
      title: "HR & Attendance",
      icon: CalendarCheck,
      items: [
        { label: "Daily Attendance", path: ROUTES.SUPER_ADMIN_ATTENDANCE, icon: CalendarCheck },
        { label: "Leave Requests", path: ROUTES.SUPER_ADMIN_LEAVES, icon: CalendarCheck },
        { label: "Holidays", path: `${ROUTES.SUPER_ADMIN_ATTENDANCE}?tab=holidays`, icon: Calendar },
        { label: "Payroll", path: ROUTES.SUPER_ADMIN_PAYROLL, icon: Wallet },
      ],
    },
    {
      id: "notices",
      title: "Notices",
      icon: Bell,
      items: [
        { label: "Office Announcements", path: `${ROUTES.SUPER_ADMIN_NOTICES}?tab=announcements`, icon: Bell },
        { label: "Meeting Schedule", path: `${ROUTES.SUPER_ADMIN_NOTICES}?tab=meetings`, icon: CalendarCheck },
      ],
    },
    {
      id: "reports",
      title: "Reports",
      icon: BarChart3,
      items: [
        { label: "Employee Report", path: `${ROUTES.SUPER_ADMIN_REPORTS_ANALYTICS}?tab=emp_report`, icon: Users },
        { label: "Daily Work Reports", path: ROUTES.SUPER_ADMIN_DAILY_WORK_REPORTS, icon: FileText },
        { label: "Sales Report", path: `${ROUTES.SUPER_ADMIN_REPORTS_ANALYTICS}?tab=sales_report`, icon: TrendingUp },
        { label: "Client Report", path: `${ROUTES.SUPER_ADMIN_REPORTS_ANALYTICS}?tab=client_report`, icon: Building2 },
        { label: "Revenue Report", path: `${ROUTES.SUPER_ADMIN_REPORTS_ANALYTICS}?tab=monthly`, icon: BarChart3 },
      ],
    },
    {
      id: "business_partner",
      title: "Business Partner",
      icon: Handshake,
      items: [
        { label: "Partner Account", path: ROUTES.SUPER_ADMIN_PARTNER_MANAGEMENT, icon: Users },
        { label: "Referral Client", path: ROUTES.SUPER_ADMIN_REFERRALS, icon: UserCheck },
        { label: "Total Work", path: `${ROUTES.SUPER_ADMIN_REFERRALS}?tab=work`, icon: BriefcaseBusiness },
        { label: "Total Amount", path: `${ROUTES.SUPER_ADMIN_PAYMENTS}?tab=total`, icon: CircleDollarSign },
        { label: "Commission", path: ROUTES.SUPER_ADMIN_COMMISSIONS, icon: CircleDollarSign },
      ],
    },
  ],

  employee: [
    {
      id: "main",
      title: "Employee Portal",
      icon: LayoutDashboard,
      items: [
        { label: "Dashboard", path: ROUTES.EMPLOYEE_DASHBOARD, icon: LayoutDashboard },
        { label: "Assigned Referrals", path: ROUTES.EMPLOYEE_REFERRALS, icon: UserCheck },
        { label: "Client Service Details", path: ROUTES.EMPLOYEE_SERVICE_DETAILS, icon: FileText },
        { label: "My Tasks", path: ROUTES.EMPLOYEE_TASKS, icon: CheckSquare },
        { label: "Submit Daily Report", path: ROUTES.EMPLOYEE_DAILY_WORK_REPORTS, icon: FileText },
        { label: "My Projects", path: ROUTES.EMPLOYEE_PROJECTS, icon: BriefcaseBusiness },
        { label: "Attendance", path: ROUTES.EMPLOYEE_ATTENDANCE, icon: CalendarCheck },
        { label: "My Leaves", path: ROUTES.EMPLOYEE_LEAVES, icon: CalendarCheck },
        { label: "Upload Documents", path: ROUTES.EMPLOYEE_Document, icon: FilePlus },
        { label: "Notices & Meetings", path: ROUTES.EMPLOYEE_NOTICES, icon: Bell },
        { label: "My ID Card", path: ROUTES.EMPLOYEE_ID_CARD, icon: IdCard },
        { label: "My Certificates", path: ROUTES.EMPLOYEE_CERTIFICATES, icon: Award },
        { label: "Bills", path: ROUTES.EMPLOYEE_BILLS, icon: Receipt },
        { label: "My Profile", path: ROUTES.EMPLOYEE_PROFILE, icon: UserRound },
      ],
    },
  ],

  client: [
    {
      id: "main",
      title: "Client Portal",
      icon: LayoutDashboard,
      items: [
        { label: "Dashboard", path: ROUTES.CLIENT_DASHBOARD, icon: LayoutDashboard },
        { label: "Service Details", path: ROUTES.CLIENT_SERVICE_DETAILS, icon: FileText },
        { label: "Social Media Packages", path: ROUTES.CLIENT_SOCIAL_MEDIA_PACKAGES, icon: Sparkles },
        { label: "Submit Service Request", path: ROUTES.CLIENT_SUBMIT_SERVICE, icon: BriefcaseBusiness },
        { label: "My Requests", path: ROUTES.CLIENT_REQUESTS, icon: FileText },
        { label: "My Projects", path: ROUTES.CLIENT_PROJECTS, icon: BriefcaseBusiness },
        { label: "Upload Documents", path: ROUTES.CLIENT_Document, icon: FilePlus },
        { label: "Payment Status", path: ROUTES.CLIENT_INVOICES, icon: Receipt },
        { label: "My Profile", path: ROUTES.CLIENT_PROFILE, icon: UserRound },
      ],
    },
  ],

  referral_partner: [
    {
      id: "partner_hub",
      title: "Partner Workspace",
      icon: Handshake,
      items: [
        { label: "Partner Dashboard", path: ROUTES.REFERRAL_PARTNER_DASHBOARD, icon: LayoutDashboard },
        { label: "My Referrals", path: ROUTES.REFERRAL_PARTNER_REFERRALS, icon: UserCheck },
        { label: "Commission Earnings", path: ROUTES.REFERRAL_PARTNER_COMMISSIONS, icon: CircleDollarSign },
        { label: "Payment History", path: ROUTES.REFERRAL_PARTNER_PAYMENTS, icon: History },
        { label: "Digital ID Card", path: ROUTES.REFERRAL_PARTNER_ID_CARD, icon: IdCard },
        { label: "Certificates", path: ROUTES.REFERRAL_PARTNER_CERTIFICATES, icon: Award },
        { label: "Notifications", path: ROUTES.REFERRAL_PARTNER_NOTIFICATIONS, icon: Bell },
        { label: "Analytics & Reports", path: ROUTES.REFERRAL_PARTNER_REPORTS, icon: BarChart3 },
        { label: "My Profile", path: ROUTES.REFERRAL_PARTNER_PROFILE, icon: UserRound },
        { label: "Help & Support", path: ROUTES.REFERRAL_PARTNER_SUPPORT, icon: HelpCircle },
      ],
    },
  ],

  hr: [
    {
      id: "hr_workspace",
      title: "HR Workspace",
      icon: LayoutDashboard,
      headerPath: ROUTES.HR_DASHBOARD,
      items: [
        { label: "HR Dashboard", path: ROUTES.HR_DASHBOARD, icon: LayoutDashboard },
        { label: "Employee Directory", path: ROUTES.HR_EMPLOYEES, icon: Users, module: "employees" },
        { label: "Onboard Employee", path: ROUTES.HR_EMPLOYEE_CREATE, icon: UserCheck, module: "employees" },
        { label: "Attendance", path: ROUTES.HR_ATTENDANCE, icon: CalendarCheck, module: "attendance" },
        { label: "Leave Management", path: ROUTES.HR_LEAVES, icon: Calendar, module: "leaves" },
        { label: "Holiday Calendar", path: ROUTES.HR_HOLIDAYS, icon: Calendar, module: "holidays" },
        { label: "Payroll & Salary", path: ROUTES.HR_PAYROLL, icon: Wallet, module: "payroll" },
        { label: "Employee Documents", path: ROUTES.HR_DOCUMENTS, icon: FileArchive, module: "documents" },
        { label: "HR Reports", path: ROUTES.HR_REPORTS, icon: BarChart3, module: "reports" },
        { label: "Announcements", path: ROUTES.HR_NOTICES, icon: Megaphone, module: "announcements" },
        { label: "Meetings", path: ROUTES.HR_MEETINGS, icon: NotebookTabs, module: "meetings" },
        { label: "My Profile", path: ROUTES.HR_PROFILE, icon: UserCog },
      ],
    },
  ],
};

const adminCategoryIds = new Set([
  "employee_mgmt",
  "project_mgmt",
  "client_crm",
  "hr_attendance",
  "notices",
  "reports",
  "business_partner",
]);

sidebarCategories.admin = sidebarCategories.super_admin
  .filter((category) => adminCategoryIds.has(category.id))
  .map((category) => ({
    ...category,
    headerPath: undefined,
    items: category.items.filter(
      (item) =>
        item.path !== ROUTES.SUPER_ADMIN_ADMIN_MANAGEMENT &&
        item.path !== ROUTES.SUPER_ADMIN_USERS
    ),
  }));

sidebarCategories.admin.unshift({
  id: "admin_dashboard",
  title: "Admin Dashboard",
  icon: LayoutDashboard,
  headerPath: ROUTES.ADMIN_DASHBOARD,
  items: [
    { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: "Users, Roles & Permissions", path: ROUTES.SUPER_ADMIN_USERS, icon: UserCog },
  ],
});

// Legacy fallback export
export const sidebarLinks = {
  super_admin: sidebarCategories.super_admin.flatMap((cat) => cat.items),
  admin: sidebarCategories.admin.flatMap((cat) => cat.items),
  employee: sidebarCategories.employee.flatMap((cat) => cat.items),
  client: sidebarCategories.client.flatMap((cat) => cat.items),
  referral_partner: sidebarCategories.referral_partner.flatMap((cat) => cat.items),
  hr: sidebarCategories.hr.flatMap((cat) => cat.items),
};

export default sidebarLinks;
