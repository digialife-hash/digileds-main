import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Calendar,
  History,
  Users,
  Building2,
  TrendingUp,
  CircleDollarSign,
  Receipt,
  MapPin,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PieChart,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getReportsDashboardAnalyticsApi,
  getReferralReportApi,
  getPartnerPerformanceReportApi,
  getMonthlyReferralReportApi,
  getClientConversionReportApi,
  getCommissionReportApi,
  getPaymentReportApi,
  getTerritoryReportApi,
  getScheduledReportsApi,
  getReportHistoryApi,
  getEmployeeReportApi,
  getSalesReportApi,
  getClientReportApi,
} from "../../services/reportService";
import { useAuth } from "../../context/authStore";


import ReportsAnalyticsDashboard from "../../components/reports/ReportsAnalyticsDashboard";
import ScheduledReportModal from "../../components/reports/ScheduledReportModal";
import PrintReportModal from "../../components/reports/PrintReportModal";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

const ReportsAnalyticsPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "overview",
  ); // 'overview', 'referrals', 'partners', 'monthly', 'conversion', 'commissions', 'payments', 'territory', 'schedules', 'history'

  const [analytics, setAnalytics] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [partnerData, setPartnerData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [conversionData, setConversionData] = useState(null);
  const [commissionData, setCommissionData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [territoryData, setTerritoryData] = useState([]);
  const [scheduledData, setScheduledData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [employeeReportData, setEmployeeReportData] = useState([]);
  const [salesReportData, setSalesReportData] = useState(null);
  const [clientReportData, setClientReportData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Print & Schedule Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTitle, setPrintTitle] = useState("Business Intelligence Report");
  const [printHeaders, setPrintHeaders] = useState([]);
  const [printRows, setPrintRows] = useState([]);

  useEffect(() => {
    const nextTab = searchParams.get("tab") || "overview";
    setActiveTab((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab,
    );
  }, [searchParams]);

  useEffect(() => {
    fetchActiveTabData();
  }, [activeTab, search]);

  const fetchActiveTabData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === "overview") {
        const res = await getReportsDashboardAnalyticsApi();
        if (res.success) setAnalytics(res.data);
      } else if (activeTab === "referrals") {
        const res = await getReferralReportApi({ search });
        if (res.success) setReferralData(res.data);
      } else if (activeTab === "partners") {
        const res = await getPartnerPerformanceReportApi({ search });
        if (res.success) setPartnerData(res.data.partners || []);
      } else if (activeTab === "monthly") {
        const res = await getMonthlyReferralReportApi();
        if (res.success) setMonthlyData(res.data.monthlyData || []);
      } else if (activeTab === "conversion") {
        const res = await getClientConversionReportApi();
        if (res.success) setConversionData(res.data);
      } else if (activeTab === "commissions") {
        const res = await getCommissionReportApi();
        if (res.success) setCommissionData(res.data.commissions || []);
      } else if (activeTab === "payments") {
        const res = await getPaymentReportApi();
        if (res.success) setPaymentData(res.data.payments || []);
      } else if (activeTab === "territory") {
        const res = await getTerritoryReportApi();
        if (res.success) setTerritoryData(res.data.territories || []);
      } else if (activeTab === "emp_report") {
        const res = await getEmployeeReportApi();
        if (res.success) setEmployeeReportData(res.data.employees || []);
      } else if (activeTab === "sales_report") {
        const res = await getSalesReportApi();
        if (res.success) setSalesReportData(res.data.metrics);
      } else if (activeTab === "client_report") {
        const res = await getClientReportApi();
        if (res.success) setClientReportData(res.data.clients || []);
      } else if (activeTab === "schedules" && isAdmin) {
        const res = await getScheduledReportsApi();
        if (res.success) setScheduledData(res.data.scheduled || []);
      } else if (activeTab === "history") {
        const res = await getReportHistoryApi();
        if (res.success) setHistoryData(res.data.history || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = (filename, headers, rows) => {
    try {
      const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report CSV exported successfully!");
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  const handleOpenPrint = (title, headers, rows) => {
    setPrintTitle(title);
    setPrintHeaders(headers);
    setPrintRows(rows);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Reports & Analytics Hub
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Real-time business intelligence, conversion funnels & partner analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { key: "overview", label: "Overview Dashboard", icon: BarChart3 },
          { key: "emp_report", label: "Employee Report", icon: Users },
          { key: "sales_report", label: "Sales Report", icon: TrendingUp },
          { key: "client_report", label: "Client Report", icon: Building2 },
          { key: "referrals", label: "Referral Report", icon: Users },
          { key: "partners", label: "Partner Performance", icon: TrendingUp },
          { key: "monthly", label: "Monthly Trends", icon: Calendar },
          { key: "conversion", label: "Client Conversion", icon: PieChart },
          { key: "commissions", label: "Commission Report", icon: CircleDollarSign },
          { key: "payments", label: "Payment Report", icon: Receipt },
          { key: "territory", label: "Territory Report", icon: MapPin },
          ...(isAdmin ? [{ key: "schedules", label: "Schedules", icon: Calendar }] : []),
          { key: "history", label: "Report History", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-2 transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === "overview" && (
        <ReportsAnalyticsDashboard analytics={analytics} isLoading={isLoading} />
      )}

      {/* EMPLOYEE REPORT */}
      {activeTab === "emp_report" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">Employee Performance & Attendance Report</h3>
              <p className="text-xs font-semibold text-slate-500">Aggregated attendance percentages, leave days, and task completion metrics.</p>
            </div>
            <button
              onClick={() =>
                handleOpenPrint(
                  "Employee Performance Report",
                  ["Employee", "Department", "Attendance %", "Present Days", "Leave Days", "Task Completion"],
                  employeeReportData.map((e) => [e.name, e.department, `${e.attendancePercentage}%`, e.presentDays, e.leaveDays, `${e.taskCompletionRate}%`])
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" /> Print / Export
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : employeeReportData.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-500">No employee report data found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Employee</th>
                      <th className="px-5 py-4">Department</th>
                      <th className="px-5 py-4">Base Salary</th>
                      <th className="px-5 py-4">Attendance %</th>
                      <th className="px-5 py-4">Present / Leaves</th>
                      <th className="px-5 py-4">Task Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {employeeReportData.map((emp) => (
                      <tr key={emp._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">{emp.department}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(emp.salary)}</td>
                        <td className="px-5 py-4 font-black text-emerald-600">{emp.attendancePercentage}%</td>
                        <td className="px-5 py-4 text-slate-700">{emp.presentDays} Days / {emp.leaveDays} Leaves</td>
                        <td className="px-5 py-4 font-extrabold text-blue-600">{emp.completedTasks} / {emp.totalTasks} ({emp.taskCompletionRate}%)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SALES REPORT */}
      {activeTab === "sales_report" && salesReportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Total Leads</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{salesReportData.totalLeads}</h3>
              <p className="mt-1 text-[10px] font-bold text-emerald-600">{salesReportData.convertedLeads} Converted ({salesReportData.leadConversionRate}%)</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Quotations Issued</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{salesReportData.totalQuotations}</h3>
              <p className="mt-1 text-[10px] font-bold text-blue-600">{salesReportData.acceptedQuotations} Accepted ({salesReportData.quotationAcceptanceRate}%)</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Invoices Created</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{salesReportData.totalInvoices}</h3>
              <p className="mt-1 text-[10px] font-bold text-slate-400">Total Billed</p>
            </div>
            <div className="rounded-2xl border border-emerald-300 bg-emerald-600 p-5 shadow-xs text-white">
              <p className="text-[11px] font-extrabold uppercase opacity-90">Total Sales Revenue</p>
              <h3 className="mt-2 text-2xl font-black">{formatCurrency(salesReportData.totalSalesRevenue)}</h3>
              <p className="mt-1 text-[10px] font-bold opacity-80">Realized Collections</p>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT REPORT */}
      {activeTab === "client_report" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">Client Portfolio & Revenue Report</h3>
              <p className="text-xs font-semibold text-slate-500">Summary of total billed, realized collections, and pending balances per client.</p>
            </div>
            <button
              onClick={() =>
                handleOpenPrint(
                  "Client Portfolio Report",
                  ["Company", "Category", "Projects", "Total Invoiced", "Total Paid", "Pending Balance"],
                  clientReportData.map((c) => [c.companyName, c.businessCategory, c.totalProjects, formatCurrency(c.totalInvoiced), formatCurrency(c.totalPaid), formatCurrency(c.pendingBalance)])
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" /> Print / Export
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : clientReportData.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-500">No client portfolio data found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Client Company</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Projects</th>
                      <th className="px-5 py-4">Total Invoiced</th>
                      <th className="px-5 py-4">Total Paid</th>
                      <th className="px-5 py-4">Pending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {clientReportData.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-black text-slate-900">{c.companyName}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{c.businessCategory}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{c.totalProjects}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(c.totalInvoiced)}</td>
                        <td className="px-5 py-4 font-black text-emerald-600">{formatCurrency(c.totalPaid)}</td>
                        <td className="px-5 py-4 font-black text-amber-600">{formatCurrency(c.pendingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {/* TAB 2: REFERRAL REPORT */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Referral Code, Client Name..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const headers = ["Referral Code", "Client Name", "Company", "Service Required", "Fee", "Status", "Date"];
                  const rows = (referralData?.referrals || []).map((r) => [
                    r.referralCode,
                    r.clientName,
                    r.companyName || "-",
                    r.serviceRequired,
                    `₹${r.actualFee || 0}`,
                    r.status,
                    new Date(r.createdAt).toLocaleDateString("en-IN"),
                  ]);
                  handleExportCSV("referral-report", headers, rows);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
              </button>

              <button
                onClick={() => {
                  const headers = ["Referral Code", "Client Name", "Company", "Service Required", "Fee", "Status", "Date"];
                  const rows = (referralData?.referrals || []).map((r) => [
                    r.referralCode,
                    r.clientName,
                    r.companyName || "-",
                    r.serviceRequired,
                    `₹${r.actualFee || 0}`,
                    r.status,
                    new Date(r.createdAt).toLocaleDateString("en-IN"),
                  ]);
                  handleOpenPrint("Referral Report", headers, rows);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <Printer className="h-4 w-4 text-blue-600" /> Print Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Referral ID</th>
                  <th className="px-4 py-3.5">Client Name</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Service Required</th>
                  <th className="px-4 py-3.5">Estimated Fee</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Referral Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">Loading referral report...</td>
                  </tr>
                ) : (referralData?.referrals || []).map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{r.referralCode}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{r.clientName}</td>
                    <td className="px-4 py-3.5">{r.companyName || "-"}</td>
                    <td className="px-4 py-3.5">{r.serviceRequired}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{formatCurrency(r.actualFee)}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">{r.status}</td>
                    <td className="px-4 py-3.5 text-slate-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNER PERFORMANCE REPORT */}
      {activeTab === "partners" && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Partner Name</th>
                <th className="px-4 py-3.5">Partner Code</th>
                <th className="px-4 py-3.5">Total Referrals</th>
                <th className="px-4 py-3.5">Converted</th>
                <th className="px-4 py-3.5">Conversion Rate</th>
                <th className="px-4 py-3.5">Revenue Generated</th>
                <th className="px-4 py-3.5">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">Loading partner performance report...</td>
                </tr>
              ) : partnerData.map((p) => (
                <tr key={p.partnerId} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-bold text-amber-600">#{p.ranking}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{p.partnerName}</td>
                  <td className="px-4 py-3.5 font-mono text-blue-600 font-bold">{p.partnerCode}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{p.totalReferrals}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{p.convertedReferrals}</td>
                  <td className="px-4 py-3.5 font-bold text-teal-600">{p.conversionRate}%</td>
                  <td className="px-4 py-3.5 font-bold text-indigo-600">{formatCurrency(p.revenueGenerated)}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{formatCurrency(p.commissionEarned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: MONTHLY TRENDS REPORT */}
      {activeTab === "monthly" && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Month / Year</th>
                <th className="px-4 py-3.5">Total Referrals</th>
                <th className="px-4 py-3.5">Conversions</th>
                <th className="px-4 py-3.5">Conversion Rate</th>
                <th className="px-4 py-3.5">Monthly Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">Loading monthly report...</td>
                </tr>
              ) : monthlyData.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{m.monthYear}</td>
                  <td className="px-4 py-3.5 font-bold text-blue-600">{m.totalReferrals}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{m.totalConversions}</td>
                  <td className="px-4 py-3.5 font-bold text-teal-600">{m.conversionRate}%</td>
                  <td className="px-4 py-3.5 font-bold text-indigo-600">{formatCurrency(m.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: CLIENT CONVERSION FUNNEL */}
      {activeTab === "conversion" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900">Lead Conversion Funnel Stages</h2>
          <div className="space-y-4">
            {(conversionData?.funnel || []).map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{stage.stage}</span>
                  <span>{stage.count} Leads</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stage.count * 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SCHEDULES (Admin Only) */}
      {activeTab === "schedules" && isAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scheduledData.map((s) => (
            <div key={s._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600 text-xs">{s.reportType} Report</span>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-extrabold">{s.frequency}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{s.reportName}</h3>
              <p className="text-xs text-slate-500">Recipients: {s.recipients?.join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: REPORT HISTORY */}
      {activeTab === "history" && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Report Name</th>
                <th className="px-4 py-3.5">Report Type</th>
                <th className="px-4 py-3.5">Generated By</th>
                <th className="px-4 py-3.5">Format</th>
                <th className="px-4 py-3.5">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">Loading report history...</td>
                </tr>
              ) : historyData.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{h.reportName}</td>
                  <td className="px-4 py-3.5 font-bold text-blue-600">{h.reportType}</td>
                  <td className="px-4 py-3.5">{h.generatedBy?.name || "User"}</td>
                  <td className="px-4 py-3.5 font-mono text-purple-600 font-bold">{h.format}</td>
                  <td className="px-4 py-3.5 text-slate-500">{new Date(h.createdAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ScheduledReportModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => fetchActiveTabData()}
      />

      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        reportTitle={printTitle}
        headers={printHeaders}
        data={printRows}
      />
    </div>
  );
};

export default ReportsAnalyticsPage;
