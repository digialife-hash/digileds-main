import { Navigate } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import ComingSoon from "../pages/ComingSoon";
import LegalPage from "../pages/legal/LegalPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import DashboardRedirect from "./DashboardRedirect";
import { ROUTES } from "./routeConstants";

import ProtectedLayout from "../components/layout/ProtectedLayout";

import AdminDashboard from "../pages/dashboards/AdminDashboard";
import SystemSuperAdminDashboard from "../pages/dashboards/SystemSuperAdminDashboard";
import CreateEmployee from "../pages/superAdmin/CreateEmployee";
import EditEmployee from "../pages/superAdmin/EditEmployee";
import EmployeePayrollDetails from "../pages/superAdmin/EmployeePayrollDetails";
import EmployeeDetails from "../pages/superAdmin/EmployeeDetails";
import PayrollForm from "../pages/superAdmin/PayrollForm";
import SuperAdminEmployees from "../pages/superAdmin/SuperAdminEmployees";
import SuperAdminPayroll from "../pages/superAdmin/SuperAdminPayroll";
import SuperAdminInvoices from "../pages/superAdmin/SuperAdminInvoices";
import SuperAdminProjects from "../pages/superAdmin/SuperAdminProjects";
import CreateProject from "../pages/superAdmin/CreateProject";
import ProjectDetails from "../pages/superAdmin/ProjectDetails";
import SuperAdminServiceRequests from "../pages/superAdmin/SuperAdminServiceRequests";
import SuperAdminServiceRequestDetails from "../pages/superAdmin/SuperAdminServiceRequestDetails";
import SuperAdminTasks from "../pages/superAdmin/SuperAdminTasks";
import CreateTask from "../pages/superAdmin/CreateTask";
import SuperAdminTeams from "../pages/superAdmin/SuperAdminTeams";
import CreateTeam from "../pages/superAdmin/CreateTeam";
import EditTeam from "../pages/superAdmin/EditTeam";
import TeamDetails from "../pages/superAdmin/TeamDetails";
import SettingsHome from "../pages/superAdmin/SettingsHome";
import CompanyProfileSettings from "../pages/superAdmin/CompanyProfileSettings";
import SuperAdminAttendance from "../pages/superAdmin/SuperAdminAttendance";
import SuperAdminLeaves from "../pages/superAdmin/SuperAdminLeaves";
import EmployeeLeaves from "../pages/employee/EmployeeLeaves";
import SuperAdminLeads from "../pages/superAdmin/SuperAdminLeads";
import SuperAdminFollowUps from "../pages/superAdmin/SuperAdminFollowUps";
import SuperAdminQuotations from "../pages/superAdmin/SuperAdminQuotations";
import SuperAdminAccounts from "../pages/superAdmin/SuperAdminAccounts";
import SuperAdminNotices from "../pages/superAdmin/SuperAdminNotices";

import ClientServiceDetails from "../pages/client/ClientServiceDetails";
import SocialMediaPackagesPage from "../pages/client/SocialMediaPackagesPage";
import AdminServiceDetails from "../pages/superAdmin/AdminServiceDetails";
import EmployeeMyTasks from "../pages/employee/EmployeeMyTasks";
import EmployeeBills from "../pages/employee/EmployeeBills";
import EmployeeProfile from "../pages/employee/EmployeeProfile";
import EmployeeProjects from "../pages/employee/EmployeeProjects";
import EmployeeProjectDetails from "../pages/employee/EmployeeProjectDetails";
import EmployeeAttendance from "../pages/employee/EmployeeAttendance";
import EmployeeDashboard from "../pages/dashboards/EmployeeDashboard";
import ClientDashboard from "../pages/dashboards/ClientDashboard";
import ClientList from "../pages/clients/ClientList";
import ClientDetails from "../pages/clients/ClientDetails";
import ClientSubmitService from "../pages/client/ClientSubmitService";
import ReferralPartnerDashboard from "../pages/dashboards/ReferralPartnerDashboard/pages/Dashboard";
import ClientMyRequests from "../pages/client/ClientMyRequests";
import ClientRequestDetails from "../pages/client/ClientRequestDetails";
import ClientProjects from "../pages/client/ClientProjects";
import ClientProjectDetails from "../pages/client/ClientProjectDetails";
import ClientInvoices from "../pages/client/ClientInvoices";
import TaskDetails from "../pages/tasks/TaskDetails";
import DocumentUploads from "../pages/superAdmin/DocumentUploads";
import EmployeeDocument from "../pages/employee/EmployeeDocument";
import { useAuth } from "../context/authStore";
import { AuthProvider } from "../context/AuthContext";
import ClientDocument from "../pages/clients/ClientDocument";
import ReferralClientManagementPage from "../pages/referrals/ReferralClientManagementPage";
import CommissionManagementPage from "../pages/commissions/CommissionManagementPage";
import PaymentHistoryPage from "../pages/payments/PaymentHistoryPage";
import IDCardManagementPage from "../pages/idCards/IDCardManagementPage";
import IDCardManagement from "../pages/superAdmin/IDCardManagement";
import MyIDCard from "../pages/employee/MyIDCard";
import MyCertificates from "../pages/employee/MyCertificates";
import PublicIDCardVerificationPage from "../pages/idCards/PublicIDCardVerificationPage";
import CertificateManagementPage from "../pages/certificates/CertificateManagementPage";
import PublicCertificateVerificationPage from "../pages/certificates/PublicCertificateVerificationPage";
import NotificationCenterPage from "../pages/notifications/NotificationCenterPage";
import ReportsAnalyticsPage from "../pages/reports/ReportsAnalyticsPage";
import DailyWorkReportsPage from "../pages/reports/DailyWorkReportsPage";
import PartnerProfilePage from "../pages/profile/PartnerProfilePage";
import HelpSupportPage from "../pages/support/HelpSupportPage";
import AdminPartnerManagementPage from "../pages/admin/AdminPartnerManagementPage";
import ClientUploadsGetAll from "../pages/superAdmin/ClientUploadsGetAll";
import InvoiceStatus from "../pages/superAdmin/InvoiceStatus";
import SystemUserManagement from "../pages/superAdmin/SystemUserManagement";
import AdminManagement from "../pages/superAdmin/AdminManagement";
import AuthPage from "../../components/auth/AuthPage";
import TenantManagementPage from "../../demo/demo-projects/components/TenantManagementPage";

import HRDashboard from "../pages/HR/HRDashboard";
import HREmployees from "../pages/HR/HREmployees";
import HREmployeeForm from "../pages/HR/HREmployeeForm";
import HRLeaves from "../pages/HR/HRLeaves";
import HRAttendance from "../pages/HR/HRAttendance";
import HRPayroll from "../pages/HR/HRPayroll";
import HRActivityPage from "../pages/HR/HRActivityPage";
import SuperAdminHRManagement from "../pages/superAdmin/SuperAdminHRManagement";

const OfficeProtectedRoute = () => (
  <AuthProvider>
    <ProtectedRoute />
  </AuthProvider>
);

const OfficeEmployeeDocument = () => {
  const { user } = useAuth();
  return (
    <EmployeeDocument
      employeeId={user?._id}
      employeeName={user?.name}
      employeeEmail={user?.email}
    />
  );
};

const OfficeClientDocument = () => {
  const { user } = useAuth();
  return (
    <ClientDocument
      clientId={user?._id}
      clientName={user?.name}
      clientEmail={user?.email}
    />
  );
};

// Office Management route configuration.
// This module only exports route objects; the application router is created
// centrally in src/routs/Routers.jsx.
export const officeRouteObjects = [
  { path: ROUTES.LOGIN, element: <AuthPage mode="office" /> },
  { path: ROUTES.HOME, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  { path: ROUTES.TERMS_AND_CONDITIONS, element: <LegalPage type="terms" /> },
  { path: ROUTES.PRIVACY_POLICY, element: <LegalPage type="privacy" /> },
  { path: ROUTES.UNAUTHORIZED, element: <Unauthorized /> },
  { path: ROUTES.PUBLIC_VERIFY_ID, element: <PublicIDCardVerificationPage /> },
  {
    path: ROUTES.PUBLIC_VERIFY_ID_TOKEN,
    element: <PublicIDCardVerificationPage />,
  },
  {
    path: ROUTES.PUBLIC_VERIFY_CERTIFICATE,
    element: <PublicCertificateVerificationPage />,
  },
  {
    path: ROUTES.PUBLIC_VERIFY_CERTIFICATE_TOKEN,
    element: <PublicCertificateVerificationPage />,
  },
  {
    element: <OfficeProtectedRoute />,
    children: [
      { path: ROUTES.DASHBOARD, element: <DashboardRedirect /> },
      {
        element: <ProtectedLayout />,
        children: [
          {
            element: <RoleProtectedRoute allowedRoles={["admin"]} />,
            children: [
              { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboard /> },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["super_admin"]} />,
            children: [
              {
                path: ROUTES.SUPER_ADMIN_DASHBOARD,
                element: <SystemSuperAdminDashboard />,
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]} />
            ),
            children: [
              {
                path: ROUTES.SUPER_ADMIN_CLIENT_DOCUMENTS,
                element: <ClientUploadsGetAll />,
              },
              {
                path: ROUTES.SUPER_ADMIN_REFERRALS,
                element: <ReferralClientManagementPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_COMMISSIONS,
                element: <CommissionManagementPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_PAYMENTS,
                element: <PaymentHistoryPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_ID_CARDS,
                element: <IDCardManagement />,
              },
              {
                path: ROUTES.SUPER_ADMIN_CERTIFICATES,
                element: <CertificateManagementPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
                element: <NotificationCenterPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_REPORTS_ANALYTICS,
                element: <ReportsAnalyticsPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_DAILY_WORK_REPORTS,
                element: <DailyWorkReportsPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_PARTNER_MANAGEMENT,
                element: <AdminPartnerManagementPage />,
              },
              {
                path: ROUTES.SUPER_ADMIN_EMPLOYEE_CREATE,
                element: <CreateEmployee />,
              },
              {
                path: ROUTES.SUPER_ADMIN_PAYROLL_CREATE,
                element: <PayrollForm />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_PAYROLL}/:id/edit`,
                element: <PayrollForm />,
              },
              {
                path: ROUTES.SUPER_ADMIN_PROJECTS,
                element: <SuperAdminProjects />,
              },
              {
                path: ROUTES.SUPER_ADMIN_PROJECT_CREATE,
                element: <CreateProject />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_PROJECTS}/:id/edit`,
                element: <CreateProject />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_PROJECTS}/:id`,
                element: <ProjectDetails />,
              },
              { path: ROUTES.SUPER_ADMIN_TASK_CREATE, element: <CreateTask /> },
              { path: ROUTES.SUPER_ADMIN_TASKS, element: <SuperAdminTasks /> },
              {
                path: `${ROUTES.SUPER_ADMIN_TASKS}/:id`,
                element: <TaskDetails />,
              },
              {
                path: ROUTES.SUPER_ADMIN_INVOICES,
                element: <SuperAdminInvoices />,
              },
              {
                path: ROUTES.SUPER_ADMIN_INVOICES_Status,
                element: <InvoiceStatus />,
              },
              {
                path: ROUTES.SUPER_ADMIN_ATTENDANCE,
                element: <SuperAdminAttendance />,
              },
              {
                path: ROUTES.SUPER_ADMIN_LEAVES,
                element: <SuperAdminLeaves />,
              },
              { path: ROUTES.SUPER_ADMIN_LEADS, element: <SuperAdminLeads /> },
              {
                path: ROUTES.SUPER_ADMIN_FOLLOWUPS,
                element: <SuperAdminFollowUps />,
              },
              {
                path: ROUTES.SUPER_ADMIN_QUOTATIONS,
                element: <SuperAdminQuotations />,
              },
              {
                path: ROUTES.SUPER_ADMIN_ACCOUNTS,
                element: <SuperAdminAccounts />,
              },
              {
                path: ROUTES.SUPER_ADMIN_NOTICES,
                element: <SuperAdminNotices />,
              },
              {
                path: ROUTES.SUPER_ADMIN_SERVICE_DETAILS,
                element: <AdminServiceDetails />,
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["super_admin"]} />,
            children: [
              {
                path: ROUTES.SUPER_ADMIN_ADMIN_MANAGEMENT,
                element: <AdminManagement />,
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["admin", "super_admin"]} />,
            children: [
              {
                path: ROUTES.SUPER_ADMIN_USERS,
                element: <SystemUserManagement />,
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["super_admin"]} />,
            children: [
              {
                path: ROUTES.SUPER_ADMIN_TENANTS,
                element: <TenantManagementPage />,
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]} />
            ),
            children: [
              {
                path: ROUTES.SUPER_ADMIN_EMPLOYEES,
                element: <SuperAdminEmployees />,
              },
              {
                path: ROUTES.SUPER_ADMIN_HR_MANAGEMENT,
                element: <SuperAdminHRManagement />,
              },
              {
                path: ROUTES.SUPER_ADMIN_Document_Uploads,
                element: <DocumentUploads />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_EMPLOYEES}/:id`,
                element: <EmployeeDetails />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_EMPLOYEES}/:id/edit`,
                element: <EditEmployee />,
              },
              {
                path: ROUTES.SUPER_ADMIN_PAYROLL,
                element: <SuperAdminPayroll />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_PAYROLL}/:employeeId`,
                element: <EmployeePayrollDetails />,
              },
              { path: ROUTES.SUPER_ADMIN_TEAM_CREATE, element: <CreateTeam /> },
              { path: ROUTES.SUPER_ADMIN_TEAMS, element: <SuperAdminTeams /> },
              {
                path: `${ROUTES.SUPER_ADMIN_TEAMS}/:id/edit`,
                element: <EditTeam />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_TEAMS}/:id`,
                element: <TeamDetails />,
              },
              {
                path: ROUTES.SUPER_ADMIN_SERVICE_REQUESTS,
                element: <SuperAdminServiceRequests />,
              },
              {
                path: `${ROUTES.SUPER_ADMIN_SERVICE_REQUESTS}/:id`,
                element: <SuperAdminServiceRequestDetails />,
              },
              { path: ROUTES.SUPER_ADMIN_SETTINGS, element: <SettingsHome /> },
              {
                path: ROUTES.SUPER_ADMIN_SETTINGS_COMPANY_PROFILE,
                element: <CompanyProfileSettings />,
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "super_admin"]} />
            ),
            children: [
              { path: ROUTES.SUPER_ADMIN_CLIENTS, element: <ClientList /> },
              {
                path: `${ROUTES.SUPER_ADMIN_CLIENTS}/:id`,
                element: <ClientDetails />,
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["employee"]} />,
            children: [
              {
                path: ROUTES.EMPLOYEE_DASHBOARD,
                element: <EmployeeDashboard />,
              },
              {
                path: ROUTES.EMPLOYEE_Document,
                element: <OfficeEmployeeDocument />,
              },
              { path: ROUTES.EMPLOYEE_TASKS, element: <EmployeeMyTasks /> },
              {
                path: `${ROUTES.EMPLOYEE_TASKS}/:id`,
                element: <TaskDetails />,
              },
              { path: ROUTES.EMPLOYEE_BILLS, element: <EmployeeBills /> },
              { path: ROUTES.EMPLOYEE_PROJECTS, element: <EmployeeProjects /> },
              {
                path: `${ROUTES.EMPLOYEE_PROJECTS}/:id`,
                element: <EmployeeProjectDetails />,
              },
              {
                path: ROUTES.EMPLOYEE_ATTENDANCE,
                element: <EmployeeAttendance />,
              },
              { path: ROUTES.EMPLOYEE_LEAVES, element: <EmployeeLeaves /> },
              { path: ROUTES.EMPLOYEE_NOTICES, element: <SuperAdminNotices /> },
              {
                path: ROUTES.EMPLOYEE_DAILY_WORK_REPORTS,
                element: <DailyWorkReportsPage />,
              },
              { path: ROUTES.EMPLOYEE_PROFILE, element: <EmployeeProfile /> },
              { path: ROUTES.EMPLOYEE_ID_CARD, element: <MyIDCard /> },
              {
                path: ROUTES.EMPLOYEE_CERTIFICATES,
                element: <MyCertificates />,
              },
              {
                path: ROUTES.EMPLOYEE_REFERRALS,
                element: <ReferralClientManagementPage />,
              },
              {
                path: ROUTES.EMPLOYEE_SERVICE_DETAILS,
                element: <AdminServiceDetails />,
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["client"]} />,
            children: [
              { path: ROUTES.CLIENT_DASHBOARD, element: <ClientDashboard /> },
              {
                path: ROUTES.CLIENT_SERVICE_DETAILS,
                element: <ClientServiceDetails />,
              },
              {
                path: ROUTES.CLIENT_SOCIAL_MEDIA_PACKAGES,
                element: <SocialMediaPackagesPage />,
              },
              {
                path: ROUTES.CLIENT_Document,
                element: <OfficeClientDocument />,
              },
              {
                path: ROUTES.CLIENT_SUBMIT_SERVICE,
                element: <ClientSubmitService />,
              },
              { path: ROUTES.CLIENT_REQUESTS, element: <ClientMyRequests /> },
              {
                path: `${ROUTES.CLIENT_REQUEST_DETAILS}/:id`,
                element: <ClientRequestDetails />,
              },
              { path: ROUTES.CLIENT_PROJECTS, element: <ClientProjects /> },
              { path: ROUTES.CLIENT_INVOICES, element: <ClientInvoices /> },
              {
                path: `${ROUTES.CLIENT_PROJECTS}/:id`,
                element: <ClientProjectDetails />,
              },
              {
                path: ROUTES.CLIENT_PROFILE,
                element: (
                  <ComingSoon
                    title="Client Profile"
                    description="Client profile and account settings are planned for a future version."
                  />
                ),
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute
                allowedRoles={[
                  "referral_partner",
                  "admin",
                  "super_admin",
                  "employee",
                ]}
              />
            ),
            children: [
              {
                path: ROUTES.REFERRAL_PARTNER_DASHBOARD,
                element: <ReferralPartnerDashboard />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_REFERRALS,
                element: <ReferralClientManagementPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_COMMISSIONS,
                element: <CommissionManagementPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_PAYMENTS,
                element: <PaymentHistoryPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_ID_CARD,
                element: <IDCardManagementPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_CERTIFICATES,
                element: <CertificateManagementPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_NOTIFICATIONS,
                element: <NotificationCenterPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_REPORTS,
                element: <ReportsAnalyticsPage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_PROFILE,
                element: <PartnerProfilePage />,
              },
              {
                path: ROUTES.REFERRAL_PARTNER_SUPPORT,
                element: <HelpSupportPage />,
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute
                allowedRoles={["hr", "admin", "super_admin"]}
              />
            ),
            children: [
              { path: ROUTES.HR_DASHBOARD, element: <HRDashboard /> },
              { path: ROUTES.HR_EMPLOYEES, element: <HREmployees /> },
              { path: ROUTES.HR_EMPLOYEE_CREATE, element: <HREmployeeForm /> },
              { path: ROUTES.HR_LEAVES, element: <HRLeaves /> },
              { path: ROUTES.HR_ATTENDANCE, element: <HRAttendance /> },
              { path: ROUTES.HR_PAYROLL, element: <HRPayroll /> },
              {
                path: ROUTES.HR_HOLIDAYS,
                element: <HRActivityPage type="holidays" />,
              },
              {
                path: ROUTES.HR_DOCUMENTS,
                element: <HRActivityPage type="documents" />,
              },
              {
                path: ROUTES.HR_REPORTS,
                element: <HRActivityPage type="reports" />,
              },
              {
                path: ROUTES.HR_NOTICES,
                element: <HRActivityPage type="notices" />,
              },
              {
                path: ROUTES.HR_MEETINGS,
                element: <HRActivityPage type="meetings" />,
              },
              {
                path: ROUTES.HR_PROFILE,
                element: <HRActivityPage type="profile" />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];
