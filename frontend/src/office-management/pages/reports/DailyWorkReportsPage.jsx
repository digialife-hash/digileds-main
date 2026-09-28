import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Save,
  Send,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/authStore";
import {
  createDailyWorkReport,
  downloadDailyWorkReportPdf,
  exportDailyWorkReports,
  getDailyReportAnalytics,
  getDailyWorkReports,
  getMonthlyReportAnalytics,
  getMyTodayDailyReport,
  reviewDailyWorkReport,
  submitDailyWorkReport,
  updateDailyWorkReport,
} from "../../services/dailyWorkReportService";
import { getEmployees } from "../../services/employeeService";
import { getProjects, getEmployeeProjects } from "../../services/projectService";
import { getClients, getMyAssignedClients } from "../../services/clientService";

const todayValue = () => new Date().toISOString().slice(0, 10);
const defaultWork = {
  title: "",
  description: "",
  projectId: "",
  clientId: "",
  category: "General Work",
  status: "Completed",
  hours: "",
  minutes: "",
};
const initialForm = {
  reportDate: todayValue(),
  employeeId: "",
  workItems: [{ ...defaultWork }],
  summary: "",
  pendingWork: "",
  hasBlocker: false,
  blockerDetails: "",
  nextDayPlan: "",
  remarks: "",
  backdateReason: "",
  attachments: [],
};
const categories = ["General Work", "Client Work", "Project Work", "Meeting", "Follow-Up", "Documentation", "Planning", "Support", "Administrative", "Research", "Reporting", "Other"];
const workStatuses = ["Completed", "In Progress", "Pending", "Blocked", "On Hold"];
const reportStatuses = ["", "Submitted", "Draft", "Reviewed", "Needs Clarification"];
const ranges = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["this_week", "This Week"],
  ["this_month", "This Month"],
  ["custom", "Custom"],
];

const extractList = (response, keys) => {
  const data = response?.data || response;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  return Array.isArray(data) ? data : [];
};
const getName = (item, fallback = "Untitled") => item?.name || item?.projectName || item?.projectTitle || item?.clientName || item?.companyName || item?.title || fallback;
const getEmployeeCode = (employee) => employee?.employeeId || employee?.employeeCode || employee?.empId || employee?._id || "-";
const toDate = (date) => (date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const toDateTime = (date) => (date ? new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-");
const toHours = (minutes = 0) => {
  const total = Number(minutes || 0);
  if (!total) return "-";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
};
const statusClass = (status) => ({
  Draft: "bg-slate-100 text-slate-700 ring-slate-200",
  Submitted: "bg-blue-50 text-blue-700 ring-blue-200",
  Reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Needs Clarification": "bg-amber-50 text-amber-700 ring-amber-200",
}[status] || "bg-slate-100 text-slate-700 ring-slate-200");
const pdfFilename = (report) => `Daily_Work_Report_${String(report.employeeSnapshot?.name || "Employee").replace(/[^a-z0-9_-]+/gi, "_")}_${(report.reportDate || "").slice(0, 10)}.pdf`;

const buildPayload = (form, action) => {
  const data = new FormData();
  data.append("reportDate", form.reportDate);
  data.append("employeeId", form.employeeId);
  data.append("summary", form.summary);
  data.append("overallSummary", form.summary);
  data.append("pendingWork", form.pendingWork);
  data.append("hasBlocker", String(form.hasBlocker));
  data.append("blockerDetails", form.hasBlocker ? form.blockerDetails : "");
  data.append("nextDayPlan", form.nextDayPlan);
  data.append("tomorrowPlan", JSON.stringify(form.nextDayPlan ? [form.nextDayPlan] : []));
  data.append("remarks", form.remarks);
  data.append("generalRemarks", form.remarks);
  data.append("backdateReason", form.backdateReason);
  data.append("action", action);
  data.append("workItems", JSON.stringify(form.workItems.filter((item) => item.title.trim()).map((item) => ({
    title: item.title,
    description: item.description,
    projectId: item.projectId || null,
    clientId: item.clientId || null,
    category: item.category,
    workType: item.category,
    status: item.status,
    durationMinutes: Number(item.hours || 0) * 60 + Number(item.minutes || 0),
  }))));
  if (form.hasBlocker && form.blockerDetails.trim()) {
    data.append("blockers", JSON.stringify([{ title: "Issue / Blocker", description: form.blockerDetails, blockerType: "Other" }]));
  }
  Array.from(form.attachments || []).forEach((file) => data.append("attachments", file));
  return data;
};

const StatCard = ({ label, value, icon: Icon, tone = "blue" }) => {
  const toneClass = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700", slate: "bg-slate-100 text-slate-700" }[tone];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div>
        <span className={`rounded-lg p-2 ${toneClass}`}><Icon size={20} /></span>
      </div>
    </div>
  );
};

const DailyWorkReportsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "reports" : "submit");
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [todayData, setTodayData] = useState(null);
  const [dailyAnalytics, setDailyAnalytics] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ range: "today", startDate: "", endDate: "", employeeId: "", department: "", designation: "", status: "" });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentEmployee = todayData?.employee;
  const visibleEmployee = isSuperAdmin ? employees.find((employee) => employee._id === form.employeeId) : currentEmployee;
  const totalMinutes = useMemo(() => form.workItems.reduce((sum, item) => sum + Number(item.hours || 0) * 60 + Number(item.minutes || 0), 0), [form.workItems]);

  const loadReferences = useCallback(async () => {
    const [employeeRes, projectRes, clientRes] = await Promise.all([
      isSuperAdmin ? getEmployees({ limit: 500 }) : Promise.resolve(null),
      isSuperAdmin ? getProjects({ limit: 500 }) : getEmployeeProjects({ limit: 500 }),
      isSuperAdmin ? getClients({ limit: 500 }) : getMyAssignedClients({ limit: 500 }),
    ]);
    setEmployees(extractList(employeeRes, ["employees"]));
    setProjects(extractList(projectRes, ["projects"]));
    setClients(extractList(clientRes, ["clients"]));
  }, [isSuperAdmin]);

  const reportParams = useMemo(() => ({
    range: filters.range !== "custom" ? filters.range : undefined,
    startDate: filters.range === "custom" ? filters.startDate : undefined,
    endDate: filters.range === "custom" ? filters.endDate : undefined,
    employeeId: filters.employeeId || undefined,
    department: filters.department || undefined,
    designation: filters.designation || undefined,
    status: filters.status || undefined,
    limit: 50,
  }), [filters]);

  const loadReports = useCallback(async () => {
    const response = await getDailyWorkReports(isSuperAdmin ? reportParams : { limit: 50 });
    setReports(response?.data?.reports || []);
    setPagination(response?.data?.pagination || { total: 0 });
  }, [isSuperAdmin, reportParams]);

  const loadToday = useCallback(async () => {
    if (isSuperAdmin) return;
    const response = await getMyTodayDailyReport();
    setTodayData(response?.data || null);
  }, [isSuperAdmin]);

  const loadAnalytics = useCallback(async () => {
    if (!isSuperAdmin) return;
    const [daily, monthly] = await Promise.all([
      getDailyReportAnalytics({ date: filters.startDate || todayValue() }),
      getMonthlyReportAnalytics({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
    ]);
    setDailyAnalytics(daily?.data || null);
    setMonthlyAnalytics(monthly?.data || null);
  }, [filters.startDate, isSuperAdmin]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadReferences(), loadReports(), loadToday(), loadAnalytics()]);
    } catch (error) {
      toast.error(error.message || "Unable to load daily reports");
    } finally {
      setLoading(false);
    }
  }, [loadAnalytics, loadReferences, loadReports, loadToday]);

  useEffect(() => { refresh(); }, [refresh]);

  const resetForm = () => {
    setEditingId("");
    setForm({ ...initialForm, reportDate: todayValue(), workItems: [{ ...defaultWork }], attachments: [] });
  };

  const openExistingReport = useCallback((report, switchTab = true) => {
    setEditingId(report._id);
    setForm({
      ...initialForm,
      reportDate: (report.reportDate || "").slice(0, 10) || todayValue(),
      employeeId: report.employeeId?._id || report.employeeId || "",
      workItems: report.workItems?.length ? report.workItems.map((item) => ({
        title: item.title || "",
        description: item.description || "",
        projectId: item.projectId?._id || item.projectId || "",
        clientId: item.clientId?._id || item.clientId || "",
        category: item.category || item.workType || "General Work",
        status: item.status === "Not Started" ? "Pending" : item.status || "Completed",
        hours: item.durationMinutes ? String(Math.floor(item.durationMinutes / 60)) : "",
        minutes: item.durationMinutes ? String(item.durationMinutes % 60) : "",
      })) : [{ ...defaultWork }],
      summary: report.summary || report.overallSummary || "",
      pendingWork: report.pendingWork || "",
      hasBlocker: Boolean(report.hasBlocker || report.blockerDetails || report.blockers?.length),
      blockerDetails: report.blockerDetails || report.blockers?.map((item) => item.description || item.title).filter(Boolean).join("\n") || "",
      nextDayPlan: report.nextDayPlan || report.tomorrowPlan?.join("\n") || "",
      remarks: report.remarks || report.generalRemarks || "",
      backdateReason: report.backdateReason || "",
      attachments: [],
    });
    if (switchTab) setActiveTab("submit");
  }, []);

  useEffect(() => {
    if (!isSuperAdmin && todayData?.report && !editingId) {
      openExistingReport(todayData.report, false);
    }
  }, [editingId, isSuperAdmin, openExistingReport, todayData]);

  const updateWork = (index, key, value) => {
    setForm((current) => ({ ...current, workItems: current.workItems.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  };

  const saveReport = async (action) => {
    if (action === "Submitted" && !window.confirm("Submit Daily Work Report?\n\nPlease verify your work details before submitting.")) return;
    setSaving(true);
    try {
      let response = editingId ? await updateDailyWorkReport(editingId, buildPayload(form, action)) : await createDailyWorkReport(buildPayload(form, action));
      let report = response?.data?.report;
      if (editingId && action === "Submitted" && report?._id) {
        response = await submitDailyWorkReport(report._id);
        report = response?.data?.report;
      }
      setEditingId(report?._id || editingId);
      toast.success(action === "Submitted" ? "Daily Work Report submitted successfully." : "Daily Work Report saved as draft.");
      await Promise.all([loadReports(), loadToday(), loadAnalytics()]);
    } catch (error) {
      if (error.code === "DUPLICATE_DAILY_REPORT" && error.data?.report) {
        toast.error("A report already exists for this date. Opening the existing report.");
        openExistingReport(error.data.report);
      } else {
        toast.error(error.message || "Unable to save report");
      }
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async (report) => {
    try {
      await downloadDailyWorkReportPdf(report._id, pdfFilename(report));
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(error.message || "Unable to download PDF");
    }
  };

  const reviewReport = async (status) => {
    setSaving(true);
    try {
      const response = await reviewDailyWorkReport(selectedReport._id, { status, comment: reviewText });
      setSelectedReport(response?.data?.report || null);
      setReviewText("");
      toast.success("Report reviewed");
      await Promise.all([loadReports(), loadAnalytics()]);
    } catch (error) {
      toast.error(error.message || "Unable to review report");
    } finally {
      setSaving(false);
    }
  };

  const dailySummary = dailyAnalytics?.summary || {};
  const monthlySummary = monthlyAnalytics?.summary || {};

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reports</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Daily Work Report</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refresh} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
          {isSuperAdmin ? <button type="button" onClick={() => exportDailyWorkReports(reportParams)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"><Download size={16} /> Export CSV</button> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(isSuperAdmin ? [["reports", "Reports"], ["analytics", "Analytics"]] : [["submit", "Submit Report"], ["my_reports", "My Daily Reports"]]).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === key ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{label}</button>
        ))}
      </div>

      {loading ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">Loading daily reports...</div> : null}

      {isSuperAdmin && activeTab === "analytics" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Submitted Today" value={dailySummary.submitted || 0} icon={Send} tone="blue" />
          <StatCard label="Pending Today" value={dailySummary.pending || 0} icon={AlertTriangle} tone="amber" />
          <StatCard label="Reviewed Today" value={dailySummary.reviewed || 0} icon={CheckCircle2} tone="emerald" />
          <StatCard label="Monthly Missing" value={monthlySummary.missingReports || 0} icon={CalendarDays} tone="red" />
        </div>
      ) : null}

      {isSuperAdmin && activeTab === "reports" ? (
        <div className="space-y-5">
          <AdminFilters filters={filters} setFilters={setFilters} employees={employees} />
          <ReportTable reports={reports} pagination={pagination} isSuperAdmin onView={setSelectedReport} onEdit={openExistingReport} onDownload={downloadPdf} />
        </div>
      ) : null}

      {!isSuperAdmin && activeTab === "my_reports" ? (
        <ReportTable reports={reports} pagination={pagination} onView={setSelectedReport} onEdit={openExistingReport} onDownload={downloadPdf} />
      ) : null}

      {!isSuperAdmin && activeTab === "submit" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <DailyReportForm
            form={form}
            setForm={setForm}
            employee={visibleEmployee}
            projects={projects}
            clients={clients}
            totalMinutes={totalMinutes}
            saving={saving}
            editingId={editingId}
            onSave={saveReport}
            onReset={resetForm}
            updateWork={updateWork}
          />
          <TodayCard todayData={todayData} onOpen={openExistingReport} />
        </div>
      ) : null}

      {selectedReport ? (
        <ReportDrawer
          report={selectedReport}
          isSuperAdmin={isSuperAdmin}
          saving={saving}
          reviewText={reviewText}
          setReviewText={setReviewText}
          onClose={() => setSelectedReport(null)}
          onEdit={() => openExistingReport(selectedReport)}
          onDownload={() => downloadPdf(selectedReport)}
          onReview={reviewReport}
        />
      ) : null}
    </section>
  );
};

const AdminFilters = ({ filters, setFilters, employees }) => (
  <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6">
    <select value={filters.range} onChange={(e) => setFilters((current) => ({ ...current, range: e.target.value }))} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
      {ranges.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    {filters.range === "custom" ? <>
      <input type="date" value={filters.startDate} onChange={(e) => setFilters((current) => ({ ...current, startDate: e.target.value }))} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
      <input type="date" value={filters.endDate} onChange={(e) => setFilters((current) => ({ ...current, endDate: e.target.value }))} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
    </> : null}
    <select value={filters.employeeId} onChange={(e) => setFilters((current) => ({ ...current, employeeId: e.target.value }))} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
      <option value="">All employees</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
    </select>
    <input value={filters.department} onChange={(e) => setFilters((current) => ({ ...current, department: e.target.value }))} placeholder="Department" className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
    <input value={filters.designation} onChange={(e) => setFilters((current) => ({ ...current, designation: e.target.value }))} placeholder="Designation" className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
    <select value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
      {reportStatuses.map((status) => <option key={status || "all"} value={status}>{status || "All statuses"}</option>)}
    </select>
  </div>
);

const DailyReportForm = ({ form, setForm, employee, projects, clients, totalMinutes, saving, editingId, onSave, onReset, updateWork }) => (
  <div className="space-y-5">
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Employee Information</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Employee" value={employee?.name || "-"} />
        <Info label="Employee ID" value={getEmployeeCode(employee)} />
        <Info label="Department" value={employee?.department || "-"} />
        <Info label="Designation" value={employee?.designation || "-"} />
      </div>
      <label className="mt-4 block max-w-xs">
        <span className="text-sm font-bold text-slate-700">Report Date</span>
        <input type="date" max={todayValue()} value={form.reportDate} onChange={(e) => setForm((current) => ({ ...current, reportDate: e.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
      </label>
    </div>

    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black text-slate-950">Today's Work</h2>
        <button type="button" onClick={() => setForm((current) => ({ ...current, workItems: [...current.workItems, { ...defaultWork }] }))} className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"><Plus size={16} /> Add Another Work</button>
      </div>
      <div className="mt-4 space-y-4">
        {form.workItems.map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-900">Work {index + 1}</p>
              {form.workItems.length > 1 ? <button type="button" onClick={() => setForm((current) => ({ ...current, workItems: current.workItems.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Remove work"><X size={16} /></button> : null}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2"><span className="text-sm font-bold text-slate-700">Work / Task Title</span><input value={item.title} onChange={(e) => updateWork(index, "title", e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block md:col-span-2"><span className="text-sm font-bold text-slate-700">Work Description</span><textarea value={item.description} onChange={(e) => updateWork(index, "description", e.target.value)} rows="3" className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /></label>
              <Select label="Project" value={item.projectId} onChange={(value) => updateWork(index, "projectId", value)} options={projects.map((project) => [project._id, getName(project)])} placeholder="Optional" />
              <Select label="Client" value={item.clientId} onChange={(value) => updateWork(index, "clientId", value)} options={clients.map((client) => [client._id, getName(client)])} placeholder="Optional" />
              <Select label="Work Category" value={item.category} onChange={(value) => updateWork(index, "category", value)} options={categories.map((category) => [category, category])} />
              <Select label="Work Status" value={item.status} onChange={(value) => updateWork(index, "status", value)} options={workStatuses.map((status) => [status, status])} />
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-sm font-bold text-slate-700">Hours</span><input type="number" min="0" value={item.hours} onChange={(e) => updateWork(index, "hours", e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="block"><span className="text-sm font-bold text-slate-700">Minutes</span><input type="number" min="0" max="59" value={item.minutes} onChange={(e) => updateWork(index, "minutes", e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /></label>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-slate-600">Total time: {toHours(totalMinutes)}</p>
    </div>

    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4">
        <Textarea label="Today's Work Summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} />
        <Textarea label="Pending Work" value={form.pendingWork} onChange={(value) => setForm((current) => ({ ...current, pendingWork: value }))} />
        <div>
          <span className="text-sm font-bold text-slate-700">Any Issue / Blocker?</span>
          <div className="mt-2 flex gap-2">
            {[false, true].map((value) => <button key={String(value)} type="button" onClick={() => setForm((current) => ({ ...current, hasBlocker: value }))} className={`rounded-lg px-4 py-2 text-sm font-bold ${form.hasBlocker === value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{value ? "Yes" : "No"}</button>)}
          </div>
        </div>
        {form.hasBlocker ? <Textarea label="Issue / Blocker Details" value={form.blockerDetails} onChange={(value) => setForm((current) => ({ ...current, blockerDetails: value }))} /> : null}
        <Textarea label="Plan for Next Working Day" value={form.nextDayPlan} onChange={(value) => setForm((current) => ({ ...current, nextDayPlan: value }))} />
        <Textarea label="Remarks" value={form.remarks} onChange={(value) => setForm((current) => ({ ...current, remarks: value }))} />
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Attachments</span>
          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp" onChange={(e) => setForm((current) => ({ ...current, attachments: e.target.files }))} className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm font-semibold text-slate-600" />
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onReset} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">Reset</button>
        <button type="button" disabled={saving} onClick={() => onSave("Draft")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-60"><Save size={16} /> Save Draft</button>
        <button type="button" disabled={saving} onClick={() => onSave("Submitted")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60"><Send size={16} /> {editingId ? "Submit Report" : "Submit Report"}</button>
      </div>
    </div>
  </div>
);

const TodayCard = ({ todayData, onOpen }) => (
  <aside className="space-y-4">
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Today</h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">Report: {todayData?.report?.status || "Not started"}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">Attendance: {todayData?.context?.attendanceSnapshot?.attendanceStatus || "Not marked"}</p>
      {todayData?.context?.holidaySnapshot?.name ? <p className="mt-1 text-sm font-semibold text-amber-700">Holiday: {todayData.context.holidaySnapshot.name}</p> : null}
      {todayData?.report ? <button type="button" onClick={() => onOpen(todayData.report)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"><FileText size={16} /> Open Existing</button> : null}
    </div>
  </aside>
);

const Info = ({ label, value }) => <div className="rounded-lg bg-slate-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p></div>;
const Select = ({ label, value, onChange, options, placeholder }) => <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">{placeholder ? <option value="">{placeholder}</option> : null}{options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}</select></label>;
const Textarea = ({ label, value, onChange }) => <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows="3" className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /></label>;

const ReportTable = ({ reports, pagination, isSuperAdmin = false, onView, onEdit, onDownload }) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
      <h2 className="text-lg font-black text-slate-950">{isSuperAdmin ? "Employee Reports" : "My Daily Reports"}</h2>
      <p className="text-sm font-semibold text-slate-500">{pagination.total || reports.length} records</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
          <tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Work Items</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Pending</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.length ? reports.map((report) => {
            const completed = report.workItems?.filter((item) => item.status === "Completed").length || 0;
            const pending = report.workItems?.filter((item) => ["Pending", "Blocked", "On Hold", "In Progress", "Not Started"].includes(item.status)).length || 0;
            return (
              <tr key={report._id}>
                <td className="px-4 py-3 font-bold text-slate-900">{toDate(report.reportDate)}<p className="text-xs font-semibold text-slate-500">{report.reportId || "-"}</p></td>
                <td className="px-4 py-3">{report.employeeSnapshot?.name || getName(report.employeeId, "Employee")}<p className="text-xs font-semibold text-slate-500">{getEmployeeCode(report.employeeSnapshot)} | {report.employeeSnapshot?.department || "-"}</p></td>
                <td className="px-4 py-3">{report.workItems?.length || 0}</td>
                <td className="px-4 py-3">{completed}</td>
                <td className="px-4 py-3">{pending}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass(report.status)}`}>{report.status}</span></td>
                <td className="px-4 py-3">{toDateTime(report.submittedAt || report.submissionDate)}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2">
                  <button type="button" onClick={() => onView(report)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="View report"><Eye size={17} /></button>
                  {!isSuperAdmin && ["Draft", "Needs Clarification"].includes(report.status) ? <button type="button" onClick={() => onEdit(report)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit draft"><FileText size={17} /></button> : null}
                  {report.status !== "Draft" ? <button type="button" onClick={() => onDownload(report)} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50" aria-label="Download PDF"><Download size={17} /></button> : null}
                </div></td>
              </tr>
            );
          }) : <tr><td colSpan="8" className="px-4 py-8 text-center text-sm font-semibold text-slate-500">No daily reports found.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportDrawer = ({ report, isSuperAdmin, saving, reviewText, setReviewText, onClose, onEdit, onDownload, onReview }) => (
  <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{report.reportId || "Daily report"}</p><h2 className="mt-1 text-xl font-black text-slate-950">{report.employeeSnapshot?.name || "Employee"} - {toDate(report.reportDate)}</h2></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={20} /></button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="Employee ID" value={getEmployeeCode(report.employeeSnapshot)} />
          <Info label="Department" value={report.employeeSnapshot?.department || "-"} />
          <Info label="Designation" value={report.employeeSnapshot?.designation || "-"} />
          <Info label="Submitted" value={toDateTime(report.submittedAt || report.submissionDate)} />
        </div>
        <div><h3 className="text-lg font-black text-slate-950">Today's Work</h3><div className="mt-3 space-y-3">{report.workItems?.length ? report.workItems.map((item, index) => <div key={item._id || index} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-slate-950">{index + 1}. {item.title}</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{item.status} | {toHours(item.durationMinutes)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description || "No description."}</p><p className="mt-2 text-xs font-bold text-slate-500">{item.category || item.workType || "General Work"}</p></div>) : <p className="text-sm text-slate-500">No work items.</p>}</div></div>
        <PreviewSection title="Today's Work Summary" value={report.summary || report.overallSummary} />
        <PreviewSection title="Pending Work" value={report.pendingWork} />
        <PreviewSection title="Issues / Blockers" value={report.hasBlocker || report.blockerDetails ? report.blockerDetails || "Yes" : "No"} />
        <PreviewSection title="Plan for Next Working Day" value={report.nextDayPlan || report.tomorrowPlan?.join("\n")} />
        <PreviewSection title="Remarks" value={report.remarks || report.generalRemarks} />
        {report.attachments?.length ? <PreviewSection title="Attachments" value={`${report.attachments.length} file(s)\n${report.attachments.map((item) => item.originalName || item.label || item.filename).join("\n")}`} /> : null}
        {report.managerComments?.length ? <PreviewSection title="Review Information" value={report.managerComments.map((item) => `${item.commentType || "Comment"}: ${item.comment}`).join("\n")} /> : null}
        {isSuperAdmin ? <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><Textarea label="Review Comment" value={reviewText} onChange={setReviewText} /><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={() => onReview("Reviewed")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Review</button><button type="button" disabled={saving || !reviewText.trim()} onClick={() => onReview("Needs Clarification")} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white">Needs Clarification</button></div></div> : null}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
        {!isSuperAdmin && ["Draft", "Needs Clarification"].includes(report.status) ? <button type="button" onClick={onEdit} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">Edit Draft</button> : null}
        {report.status !== "Draft" ? <button type="button" onClick={onDownload} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> Download PDF</button> : null}
      </div>
    </div>
  </div>
);

const PreviewSection = ({ title, value }) => value ? <div className="rounded-lg border border-slate-200 p-4"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{value}</p></div> : null;

export default DailyWorkReportsPage;
