import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  Settings,
  Calendar,
  Plus,
  Trash2,
  Clock,
  Printer,
  FileText,
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import {
  getAllAttendance,
  getAttendanceByEmployee,
  getAttendanceSettings,
  updateAttendanceSettings,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getMonthlyAttendanceSummary,
  getAttendanceCalendar,
  getAttendanceAnalytics,
  upsertAttendance,
} from "../../services/attendanceService";
import { getEmployees } from "../../services/employeeService";
import { ROUTES } from "../../routes/routeConstants";
import DocumentUploads from "./DocumentUploads";


const statusBadgeClass = {
  present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  absent: "bg-red-50 text-red-700 ring-red-200",
  half_day: "bg-amber-50 text-amber-700 ring-amber-200",
  leave: "bg-blue-50 text-blue-700 ring-blue-200",
  holiday: "bg-purple-50 text-purple-700 ring-purple-200",
  weekly_off: "bg-slate-50 text-slate-700 ring-slate-200",
};



const attendanceStatusOptions = [
  ["", "All statuses"],
  ["present", "Present"],
  ["absent", "Absent"],
  ["half_day", "Half Day"],
];

const formatLabel = (value = "") => value.replaceAll("_", " ");

const parseLocalDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === "string") {
    const cleanStr = dateVal.split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
  }
  return new Date(dateVal);
};

const formatTime = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseLocalDate(value));
};



const getTodayDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SuperAdminAttendance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("logs");

  // Shared States
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Logs Tab States
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    date: getTodayDateStr(),
    employeeId: "",
    attendanceStatus: "",
  });
  const [page, setPage] = useState(1);
  const [selectedRecordForAudit, setSelectedRecordForAudit] = useState(null);

  // Settings Tab States
  const [settings, setSettings] = useState({
    officeStartTime: "09:00",
    officeEndTime: "18:00",
    gracePeriod: 15,
    halfDayHours: 4,
    minWorkingHours: 8,
    overtimeThreshold: 9,
    overtimeRate: 1.5,
    weeklyOffDays: [0],
    salaryCalculationMethod: "monthly_fixed",
    defaultWorkingDaysPerMonth: 26,
    autoMarkAbsent: true,
    maxAllowedLateEntries: 3,
    lateEntryDeductionRate: 0.5,
    lateEntryDeductionAfter: 3,
  });

  // Holidays Tab States
  const [holidaysList, setHolidaysList] = useState([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayFormData, setHolidayFormData] = useState({
    name: "",
    date: "",
    type: "public",
    description: "",
    isPaid: true,
    enabled: true,
  });

  // Monthly Breakdown Tab States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [breakdownEmployeeId, setBreakdownEmployeeId] = useState("");
  const [monthlyBreakdown, setMonthlyBreakdown] = useState(null);

  // Calendar Tab States
  const [calendarEmployeeId, setCalendarEmployeeId] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarGrid, setCalendarGrid] = useState([]);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [remarksForm, setRemarksForm] = useState({
    remarks: "",
    adminRemarks: "",
    isPaidLeave: false,
    isUnpaidLeave: false,
    isWeeklyOff: false,
  });

  // Analytics Tab States
  const [analyticsData, setAnalyticsData] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const result = await getEmployees({ limit: 100 });
      setEmployees(result.data?.employees || []);
      if (result.data?.employees?.length > 0) {
        setBreakdownEmployeeId(result.data.employees[0]._id);
        setCalendarEmployeeId(result.data.employees[0]._id);
      }
    } catch {
      setEmployees([]);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await getAttendanceSettings();
      if (res?.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      const res = await updateAttendanceSettings(settings);
      if (res?.success) {
        setSuccessMessage("Settings saved successfully.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Holidays
  const fetchHolidaysData = async () => {
    try {
      setIsLoading(true);
      const res = await getHolidays();
      if (res?.success) {
        setHolidaysList(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Holiday
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await createHoliday(holidayFormData);
      if (res?.success) {
        setSuccessMessage("Holiday added successfully.");
        setShowHolidayModal(false);
        setHolidayFormData({
          name: "",
          date: "",
          type: "public",
          description: "",
          isPaid: true,
          enabled: true,
        });
        void fetchHolidaysData();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Holiday
  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    try {
      setIsLoading(true);
      const res = await deleteHoliday(id);
      if (res?.success) {
        setSuccessMessage("Holiday deleted.");
        void fetchHolidaysData();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Monthly summary
  const fetchMonthlyReport = async () => {
    if (!breakdownEmployeeId) return;
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await getMonthlyAttendanceSummary({
        employeeId: breakdownEmployeeId,
        month: selectedMonth,
        year: selectedYear,
      });
      if (res?.success) {
        setMonthlyBreakdown(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message);
      setMonthlyBreakdown(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Calendar grid
  const fetchCalendarGrid = async () => {
    if (!calendarEmployeeId) return;
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await getAttendanceCalendar({
        employeeId: calendarEmployeeId,
        month: calendarMonth,
        year: calendarYear,
      });
      if (res?.success) {
        setCalendarGrid(res.data.days);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Remarks
  const handleSaveRemarks = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage("");
      const payload = {
        employeeId: calendarEmployeeId,
        date: selectedDayDetail.date,
        remarks: remarksForm.remarks,
        adminRemarks: remarksForm.adminRemarks,
        isPaidLeave: !!remarksForm.isPaidLeave,
        isUnpaidLeave: !!remarksForm.isUnpaidLeave,
        isWeeklyOff: !!remarksForm.isWeeklyOff,
      };
      const res = await upsertAttendance(payload);
      if (res?.success) {
        setSuccessMessage("Attendance updated successfully.");
        setSelectedDayDetail(null);
        void fetchCalendarGrid();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Analytics
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const res = await getAttendanceAnalytics();
      if (res?.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logs filters memo
  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      date: filters.date || undefined,
      employeeId: filters.employeeId || undefined,
      attendanceStatus: filters.attendanceStatus || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      let result;
      if (filters.employeeId) {
        result = await getAttendanceByEmployee(filters.employeeId, requestParams);
        setRecords(result.data || []);
        setPagination({
          page: 1,
          limit: 10,
          total: (result.data || []).length,
          totalPages: 1,
        });
      } else {
        result = await getAllAttendance(requestParams);
        setRecords(result.data.records || []);
        setPagination(result.data.pagination || pagination);
      }
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") {
      const timeoutId = window.setTimeout(() => {
        void fetchAttendance();
      }, 300);
      return () => window.clearTimeout(timeoutId);
    } else if (activeTab === "settings") {
      void fetchSettings();
    } else if (activeTab === "holidays") {
      void fetchHolidaysData();
    } else if (activeTab === "monthly") {
      void fetchMonthlyReport();
    } else if (activeTab === "calendar") {
      void fetchCalendarGrid();
    } else if (activeTab === "analytics") {
      void fetchAnalyticsData();
    }
  }, [activeTab, requestParams, breakdownEmployeeId, selectedMonth, selectedYear, calendarEmployeeId, calendarMonth, calendarYear]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const employeeOptions = [
    ["", "All employees"],
    ...employees.map((emp) => [emp._id, `${emp.name} (${emp.email})`]),
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8 px-4">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Attendance & Calendar
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto shrink-0 pb-1">
        {[
          { id: "logs", label: "Attendance Logs" },
          { id: "calendar", label: "Calendar View" },
          { id: "holidays", label: "Holiday Manager" },
          { id: "monthly", label: "Monthly Breakdown" },
          { id: "analytics", label: "Analytics" },
          { id: "documents", label: "Documents" },
          { id: "settings", label: "Rule Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`pb-3 text-sm font-bold whitespace-nowrap transition border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: Attendance Logs */}
      {activeTab === "logs" && (
        <>
          <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="filter-control relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search by name or email..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="filter-control">
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={(event) => updateFilter("date", event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <SelectDropdown
              name="employeeId"
              value={filters.employeeId}
              options={employeeOptions}
              onChange={(event) => updateFilter("employeeId", event.target.value)}
              wrapperClassName="filter-control"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <SelectDropdown
              name="attendanceStatus"
              value={filters.attendanceStatus}
              options={attendanceStatusOptions}
              onChange={(event) => updateFilter("attendanceStatus", event.target.value)}
              wrapperClassName="filter-control"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {isLoading ? (
            <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <LoadingSpinner />
            </div>
          ) : records.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <CalendarCheck size={25} />
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-950">No attendance records</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">No attendance records found matching filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full table-fixed min-w-[900px]">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="w-2/12 px-6 py-4">Employee</th>
                      <th className="w-1.5/12 px-6 py-4">Date</th>
                      <th className="w-1.5/12 px-6 py-4">Check-In</th>
                      <th className="w-1.5/12 px-6 py-4">Check-Out</th>
                      <th className="w-1/12 px-6 py-4">Hours</th>
                      <th className="w-1/12 px-6 py-4">Late Mins</th>
                      <th className="w-1.5/12 px-6 py-4">Status</th>
                      <th className="w-2/12 px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {records.map((record) => (
                      <tr key={record._id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-slate-950">{record.employeeName}</p>
                            <p className="truncate text-xs text-slate-400 font-medium">{record.employeeEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(record.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">{formatTime(record.checkInTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">{formatTime(record.checkOutTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">{record.totalWorkingHours} hrs</td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600">{record.lateMinutes || 0}m</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${statusBadgeClass[record.attendanceStatus] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                            {formatLabel(record.attendanceStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedRecordForAudit(record)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            Audit Info
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <span className="text-sm font-bold text-slate-600">
                  Page {page} of {pagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pagination.totalPages || pagination.totalPages === 0}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 2: Calendar View */}
      {activeTab === "calendar" && (
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1 space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Users size={16} /> Select Profile</h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Employee</label>
              <select
                value={calendarEmployeeId}
                onChange={(e) => setCalendarEmployeeId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Month</label>
              <select
                value={calendarMonth}
                onChange={(e) => setCalendarMonth(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Year</label>
              <select
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar size={18} /> Monthly Grid</h3>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-slate-400 py-1">{day}</div>
                ))}
                
                {/* Leading empty cells for correct first day alignment */}
                {Array.from({ length: calendarGrid.length > 0 ? parseLocalDate(calendarGrid[0].date).getDay() : 0 }).map((_, i) => (
                  <div key={`empty-lead-${i}`} className="h-16 rounded-lg bg-transparent border border-transparent"></div>
                ))}
                
                {calendarGrid.map((dayItem, idx) => {
                  const statusColors = {
                    present: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100",
                    absent: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100",
                    half_day: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
                    leave: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100",
                    holiday: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
                    weekly_off: "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100",
                  };
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDayDetail(dayItem);
                        setRemarksForm({
                          remarks: dayItem.record?.remarks || "",
                          adminRemarks: dayItem.record?.adminRemarks || "",
                          isPaidLeave: dayItem.record?.isPaidLeave || false,
                          isUnpaidLeave: dayItem.record?.isUnpaidLeave || false,
                          isWeeklyOff: dayItem.record?.isWeeklyOff || false,
                        });
                      }}
                      className={`h-16 rounded-lg border flex flex-col items-center justify-between p-1.5 transition text-left cursor-pointer ${statusColors[dayItem.status] || "bg-white border-slate-100"}`}
                    >
                      <span className="text-xs font-bold">{dayItem.day}</span>
                      <span className="text-[10px] uppercase font-black tracking-tighter truncate max-w-full">{formatLabel(dayItem.status)}</span>
                    </button>
                  );
                })}
                 {/* Trailing empty cells to complete the week row */}
{Array.from({ 
length: calendarGrid.length > 0 
? (7 - ((parseLocalDate(calendarGrid[0].date).getDay() + calendarGrid.length) % 7)) % 7 
: 0 
}).map((_, i) => (
<div key={`empty-trail-${i}`} className="h-16 rounded-lg bg-transparent border border-transparent"></div>
))}
</div>
            )}
          </div>

          {/* Details Modal / Sidebar when a day is selected */}
          {selectedDayDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-lg font-black text-slate-900">Attendance Details - Day {selectedDayDetail.day}</h4>
                  <button onClick={() => setSelectedDayDetail(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="py-4 space-y-3 text-sm">
                  <p><strong>Status:</strong> <span className="capitalize">{formatLabel(selectedDayDetail.status)}</span></p>
                  {selectedDayDetail.holiday && <p><strong>Holiday:</strong> {selectedDayDetail.holiday.name} ({selectedDayDetail.holiday.type})</p>}
                  
                  {selectedDayDetail.record ? (
                    <>
                      <p><strong>Check In:</strong> {formatTime(selectedDayDetail.record.checkInTime)}</p>
                      <p><strong>Check Out:</strong> {formatTime(selectedDayDetail.record.checkOutTime)}</p>
                      <p><strong>Working Hours:</strong> {selectedDayDetail.record.totalWorkingHours} hrs</p>
                      <p><strong>Overtime:</strong> {selectedDayDetail.record.overtimeHours || 0} hrs</p>
                      
                      <p><strong>Check-In IP:</strong> {selectedDayDetail.record.checkInIP || selectedDayDetail.record.ipAddress || "—"}</p>
                      <p><strong>Check-Out IP:</strong> {selectedDayDetail.record.checkOutIP || "—"}</p>
                      <p><strong>Check-In Location:</strong> {selectedDayDetail.record.checkInLocation || selectedDayDetail.record.location || "—"}</p>
                      <p><strong>Check-Out Location:</strong> {selectedDayDetail.record.checkOutLocation || "—"}</p>
                      <p><strong>Browser/Device:</strong> {selectedDayDetail.record.checkInBrowser || selectedDayDetail.record.browser || "—"} ({selectedDayDetail.record.checkInDevice || selectedDayDetail.record.deviceType || "—"})</p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm">No active check-in record for this day.</p>
                  )}

                  <form onSubmit={handleSaveRemarks} className="space-y-3 pt-3 border-t">
                    {selectedDayDetail.record && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Employee remarks</label>
                        <textarea
                          disabled
                          value={remarksForm.remarks}
                          className="w-full rounded border p-2 text-xs bg-slate-50"
                          rows="2"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Admin remarks</label>
                      <textarea
                        value={remarksForm.adminRemarks}
                        onChange={(e) => setRemarksForm(prev => ({ ...prev, adminRemarks: e.target.value }))}
                        className="w-full rounded border p-2 text-xs"
                        rows="2"
                        placeholder="Add administrative notes..."
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={remarksForm.isPaidLeave}
                          onChange={(e) => setRemarksForm(prev => ({ 
                            ...prev, 
                            isPaidLeave: e.target.checked, 
                            isUnpaidLeave: e.target.checked ? false : prev.isUnpaidLeave,
                            isWeeklyOff: e.target.checked ? false : prev.isWeeklyOff 
                          }))}
                        />
                        Paid Leave
                      </label>
                      
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={remarksForm.isUnpaidLeave}
                          onChange={(e) => setRemarksForm(prev => ({ 
                            ...prev, 
                            isUnpaidLeave: e.target.checked, 
                            isPaidLeave: e.target.checked ? false : prev.isPaidLeave,
                            isWeeklyOff: e.target.checked ? false : prev.isWeeklyOff 
                          }))}
                        />
                        Unpaid Leave
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={remarksForm.isWeeklyOff}
                          onChange={(e) => setRemarksForm(prev => ({ 
                            ...prev, 
                            isWeeklyOff: e.target.checked, 
                            isPaidLeave: e.target.checked ? false : prev.isPaidLeave,
                            isUnpaidLeave: e.target.checked ? false : prev.isUnpaidLeave 
                          }))}
                        />
                        Weekly Off
                      </label>
                    </div>

                    <button type="submit" className="w-full h-9 rounded bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">
                      Save Day Details
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Holiday Manager */}
      {activeTab === "holidays" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Calendar size={18} /> Public & Festival Holidays</h3>
            <button
              onClick={() => setShowHolidayModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
            >
              <Plus size={14} /> Add Holiday
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full table-fixed min-w-[700px]">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Holiday Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {holidaysList.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/50">
                     <td className="px-6 py-4 font-bold text-slate-950">{h.name}</td>
                    <td className="px-6 py-4">{parseLocalDate(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-4"><span className="capitalize">{h.type}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${h.isPaid ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {h.isPaid ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${h.enabled ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                        {h.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteHoliday(h._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Holiday Modal */}
          {showHolidayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-lg font-black text-slate-900">Add New Holiday</h4>
                  <button onClick={() => setShowHolidayModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddHoliday} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Name</label>
                    <input
                      type="text"
                      required
                      value={holidayFormData.name}
                      onChange={(e) => setHolidayFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 rounded border px-3 text-sm"
                      placeholder="New Year, Independence Day..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={holidayFormData.date}
                      onChange={(e) => setHolidayFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full h-10 rounded border px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Type</label>
                    <select
                      value={holidayFormData.type}
                      onChange={(e) => setHolidayFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full h-10 rounded border px-3 text-sm"
                    >
                      <option value="public">Public Holiday</option>
                      <option value="festival">Festival Holiday</option>
                      <option value="company">Company Holiday</option>
                      <option value="optional">Optional Holiday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      value={holidayFormData.description}
                      onChange={(e) => setHolidayFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full rounded border p-2 text-sm"
                      rows="2"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={holidayFormData.isPaid}
                        onChange={(e) => setHolidayFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                      />
                      Paid Holiday
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={holidayFormData.enabled}
                        onChange={(e) => setHolidayFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      />
                      Active
                    </label>
                  </div>
                  <button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
                    Create Holiday
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Monthly Breakdown Report */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="w-48">
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Employee</label>
              <select
                value={breakdownEmployeeId}
                onChange={(e) => setBreakdownEmployeeId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm font-medium outline-none bg-slate-50"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-slate-500 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm font-medium outline-none bg-slate-50"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-slate-500 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm font-medium outline-none bg-slate-50"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow hover:bg-slate-50 ml-auto"
            >
              <Printer size={14} /> Print Report / PDF
            </button>
          </div>

          {monthlyBreakdown ? (
            <div id="printable-report" className="bg-white rounded-lg border p-6 shadow-sm space-y-6">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monthly Attendance Report</h2>
                  <p className="text-sm text-slate-500">
                    Period: {new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {employees.find(e => e._id === breakdownEmployeeId)?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {employees.find(e => e._id === breakdownEmployeeId)?.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                  { label: "Total Days", value: monthlyBreakdown.totalDays, color: "text-slate-800 bg-slate-50" },
                  { label: "Working Days", value: monthlyBreakdown.workingDays, color: "text-blue-800 bg-blue-50" },
                  { label: "Present Days", value: monthlyBreakdown.present, color: "text-emerald-800 bg-emerald-50" },
                  { label: "Absent Days", value: monthlyBreakdown.absent, color: "text-red-800 bg-red-50" },
                  { label: "Half Days", value: monthlyBreakdown.halfDays, color: "text-amber-800 bg-amber-50" },
                  { label: "Paid Leaves", value: monthlyBreakdown.paidLeave, color: "text-indigo-800 bg-indigo-50" },
                  { label: "Unpaid Leaves", value: monthlyBreakdown.unpaidLeave, color: "text-orange-800 bg-orange-50" },
                  { label: "Public Holidays", value: monthlyBreakdown.publicHolidays, color: "text-purple-800 bg-purple-50" },
                  { label: "Festival Holidays", value: monthlyBreakdown.festivalHolidays, color: "text-pink-800 bg-pink-50" },
                  { label: "Weekly Off", value: monthlyBreakdown.weeklyOff, color: "text-neutral-800 bg-neutral-50" },
                  { label: "Late Arrivals", value: monthlyBreakdown.lateArrivals, color: "text-rose-800 bg-rose-50" },
                  { label: "Early Checkout", value: monthlyBreakdown.earlyCheckouts, color: "text-cyan-800 bg-cyan-50" },
                  { label: "Overtime Hours", value: `${monthlyBreakdown.overtimeHours} hrs`, color: "text-violet-800 bg-violet-50" },
                  { label: "Total Hours", value: `${monthlyBreakdown.totalWorkingHours} hrs`, color: "text-teal-800 bg-teal-50" },
                  { label: "Attendance %", value: `${monthlyBreakdown.attendancePercentage}%`, color: "text-teal-800 bg-emerald-50" },
                  { label: "Salary Payable Days", value: monthlyBreakdown.salaryEligibleDays, color: "text-green-800 bg-green-50" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border border-slate-100 ${item.color}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className="text-2xl font-black mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading breakdown data...</div>
          )}
        </div>
      )}

      {/* TAB 5: Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {analyticsData ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {[
                  { label: "Active Staff", value: analyticsData.totalEmployees, icon: Users, color: "text-blue-600 bg-blue-50" },
                  { label: "Late Check-Ins Today", value: analyticsData.lateArrivals, icon: Clock, color: "text-amber-600 bg-amber-50" },
                  { label: "Staff on Overtime", value: analyticsData.overtimeCount, icon: Award, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Average Check-In", value: analyticsData.avgCheckInTime, icon: Calendar, color: "text-slate-600 bg-slate-50" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white p-5 rounded-lg border shadow-sm">
                    <div className={`p-3 rounded-lg ${item.color}`}>{<item.icon size={24} />}</div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{item.label}</p>
                      <p className="text-xl font-black text-slate-900 mt-1">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar Visualisations */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800">Attendance Distribution Statuses</h3>
                  <div className="space-y-2">
                    {analyticsData.summary?.map((group) => {
                      const percentage = Math.round((group.count / (analyticsData.totalEmployees || 1)) * 100);
                      return (
                        <div key={group._id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span className="capitalize">{formatLabel(group._id)}</span>
                            <span>{group.count} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading analytics...</div>
          )}
        </div>
      )}

      {/* TAB 6: Settings */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Settings className="text-blue-600" />
            <h3 className="font-black text-lg text-slate-900">Attendance Rules & Calculation Policy</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Office Start Time</label>
              <input
                type="text"
                required
                value={settings.officeStartTime}
                onChange={(e) => setSettings(prev => ({ ...prev, officeStartTime: e.target.value }))}
                className="w-full h-10 rounded border px-3 text-sm"
                placeholder="09:00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Office End Time</label>
              <input
                type="text"
                required
                value={settings.officeEndTime}
                onChange={(e) => setSettings(prev => ({ ...prev, officeEndTime: e.target.value }))}
                className="w-full h-10 rounded border px-3 text-sm"
                placeholder="18:00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                required
                value={settings.gracePeriod}
                onChange={(e) => setSettings(prev => ({ ...prev, gracePeriod: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Min Hours for Half Day</label>
              <input
                type="number"
                required
                value={settings.halfDayHours}
                onChange={(e) => setSettings(prev => ({ ...prev, halfDayHours: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Min Hours for Full Day</label>
              <input
                type="number"
                required
                value={settings.minWorkingHours}
                onChange={(e) => setSettings(prev => ({ ...prev, minWorkingHours: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Overtime Threshold (Hours)</label>
              <input
                type="number"
                required
                value={settings.overtimeThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, overtimeThreshold: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Overtime Rate Multiplier</label>
              <input
                type="number"
                step="0.1"
                required
                value={settings.overtimeRate}
                onChange={(e) => setSettings(prev => ({ ...prev, overtimeRate: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Default Salary Month Days</label>
              <input
                type="number"
                required
                value={settings.defaultWorkingDaysPerMonth}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultWorkingDaysPerMonth: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Deduct Rate After Late Limit</label>
              <input
                type="number"
                step="0.1"
                required
                value={settings.lateEntryDeductionRate}
                onChange={(e) => setSettings(prev => ({ ...prev, lateEntryDeductionRate: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Late Entries Limit</label>
              <input
                type="number"
                required
                value={settings.lateEntryDeductionAfter}
                onChange={(e) => setSettings(prev => ({ ...prev, lateEntryDeductionAfter: Number(e.target.value) }))}
                className="w-full h-10 rounded border px-3 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700"
            >
              <Check size={16} /> Save settings Changes
            </button>
          </div>
        </form>
      )}

      {activeTab === "documents" && (
        <DocumentUploads />
      )}


      {selectedRecordForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-black text-slate-900">Attendance Audit Details</h4>
              <button onClick={() => setSelectedRecordForAudit(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="py-4 space-y-4 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Employee</p>
                  <p className="font-bold text-slate-900">{selectedRecordForAudit.employeeName}</p>
                  <p className="text-xs text-slate-500">{selectedRecordForAudit.employeeEmail}</p>
                  {selectedRecordForAudit.employeeId && (
                    <div className="mt-1.5 text-xs text-slate-500 space-y-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                      <p><strong>Dept:</strong> {selectedRecordForAudit.employeeId.department || "—"}</p>
                      <p><strong>Desig:</strong> {selectedRecordForAudit.employeeId.designation || "—"}</p>
                      <p><strong>Phone:</strong> {selectedRecordForAudit.employeeId.phone || "—"}</p>
                      <p>
                        <strong>Status: </strong>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1 ring-inset ${selectedRecordForAudit.employeeId.status === "active" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                          {selectedRecordForAudit.employeeId.status || "—"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Date</p>
                  <p className="font-bold text-slate-900">{formatDate(selectedRecordForAudit.date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Check In Time</p>
                  <p className="font-semibold text-slate-900">{formatTime(selectedRecordForAudit.checkInTime)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Check Out Time</p>
                  <p className="font-semibold text-slate-900">{formatTime(selectedRecordForAudit.checkOutTime)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Check In IP</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkInIP || selectedRecordForAudit.ipAddress || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Check Out IP</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkOutIP || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Check In Location</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkInLocation || selectedRecordForAudit.location || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Check Out Location</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkOutLocation || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Latitude</p>
                  <p className="font-medium text-slate-900">
                    {selectedRecordForAudit.checkInLatitude !== null && selectedRecordForAudit.checkInLatitude !== undefined 
                      ? selectedRecordForAudit.checkInLatitude 
                      : selectedRecordForAudit.latitude !== null && selectedRecordForAudit.latitude !== undefined 
                        ? selectedRecordForAudit.latitude 
                        : "—"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Longitude</p>
                  <p className="font-medium text-slate-900">
                    {selectedRecordForAudit.checkInLongitude !== null && selectedRecordForAudit.checkInLongitude !== undefined 
                      ? selectedRecordForAudit.checkInLongitude 
                      : selectedRecordForAudit.longitude !== null && selectedRecordForAudit.longitude !== undefined 
                        ? selectedRecordForAudit.longitude 
                        : "—"
                    }
                  </p>
                </div>
              </div>

              {selectedRecordForAudit.checkOutLatitude !== null && selectedRecordForAudit.checkOutLatitude !== undefined && (
                <div className="grid grid-cols-2 gap-4 border-b pb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Check Out Latitude</p>
                    <p className="font-medium text-slate-900">{selectedRecordForAudit.checkOutLatitude}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Check Out Longitude</p>
                    <p className="font-medium text-slate-900">{selectedRecordForAudit.checkOutLongitude}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Device Type</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkInDevice || selectedRecordForAudit.deviceType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Browser</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkInBrowser || selectedRecordForAudit.browser || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">OS</p>
                  <p className="font-medium text-slate-900">{selectedRecordForAudit.checkInOS || selectedRecordForAudit.operatingSystem || "—"}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedRecordForAudit(null)}
                className="h-9 px-4 rounded bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminAttendance;
