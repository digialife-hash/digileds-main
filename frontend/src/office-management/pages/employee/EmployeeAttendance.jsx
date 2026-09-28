import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  X,
  FileText,
  Briefcase,
  AlertTriangle,
  Award,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import {
  employeeCheckIn,
  employeeCheckOut,
  getMyAttendanceHistory,
  getTodayAttendance,
  getAttendanceCalendar,
  updateAttendanceRemarks,
  getMonthlyAttendanceSummary,
  getHolidays,
} from "../../services/attendanceService";
import { ROUTES } from "../../routes/routeConstants";
import EmployeeDocument from "./EmployeeDocument";


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

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const EmployeeAttendance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("punch");

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({ attendanceStatus: "" });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRecordForAudit, setSelectedRecordForAudit] = useState(null);

  // Calendar States
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarGrid, setCalendarGrid] = useState([]);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [remarksInput, setRemarksInput] = useState("");

  // Summary States
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
  const [monthlySummaryData, setMonthlySummaryData] = useState(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      attendanceStatus: filters.attendanceStatus || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchTodayAttendance = async () => {
    try {
      const result = await getTodayAttendance();
      setTodayAttendance(result.data.attendance);
    } catch {
      setTodayAttendance(null);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const result = await getMyAttendanceHistory(requestParams);
      setRecords(result.data.records || []);
      setPagination(result.data.pagination || pagination);
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

  // Fetch Calendar
  const fetchCalendar = async () => {
    try {
      setIsLoading(true);
      const res = await getAttendanceCalendar({
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
    if (!selectedDayDetail?.record?._id) return;
    try {
      setIsActionLoading(true);
      setErrorMessage("");
      const res = await updateAttendanceRemarks(selectedDayDetail.record._id, {
        remarks: remarksInput,
      });
      if (res?.success) {
        setSuccessMessage("Remarks updated.");
        setSelectedDayDetail(null);
        void fetchCalendar();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fetch Summary
  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const [sumRes, holRes] = await Promise.all([
        getMonthlyAttendanceSummary({
          month: summaryMonth,
          year: summaryYear,
        }),
        getHolidays(),
      ]);
      if (sumRes?.success) {
        setMonthlySummaryData(sumRes.data);
      }
      if (holRes?.success) {
        setUpcomingHolidays(holRes.data.filter(h => new Date(h.date) >= new Date()).slice(0, 3));
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTodayAttendance();
  }, []);

  useEffect(() => {
    if (activeTab === "punch") {
      void fetchHistory();
    } else if (activeTab === "calendar") {
      void fetchCalendar();
    } else if (activeTab === "summary") {
      void fetchSummary();
    }
  }, [activeTab, requestParams, calendarMonth, calendarYear, summaryMonth, summaryYear]);

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve({ latitude: null, longitude: null });
      }

      if (sessionStorage.getItem("geolocationDenied") === "true") {
        return resolve({ latitude: null, longitude: null });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            sessionStorage.setItem("geolocationDenied", "true");
          }
          resolve({ latitude: null, longitude: null });
        },
        { timeout: 5000 }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      setIsActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const locationData = await getBrowserLocation();
      const result = await employeeCheckIn(locationData);
      setTodayAttendance(result.data.attendance);
      setSuccessMessage("Check-in successful.");
      void fetchTodayAttendance();
      void fetchHistory();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const locationData = await getBrowserLocation();
      const result = await employeeCheckOut(locationData);
      setTodayAttendance(result.data.attendance);
      setSuccessMessage("Check-out successful.");
      void fetchTodayAttendance();
      void fetchHistory();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8 px-4">
      <PageBackButton fallbackPath={ROUTES.EMPLOYEE_DASHBOARD} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            My Work
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            My Attendance
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => {
            setActiveTab("punch");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === "punch"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Check In & History
        </button>
        <button
          onClick={() => {
            setActiveTab("calendar");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === "calendar"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          My Calendar Grid
        </button>
        <button
          onClick={() => {
            setActiveTab("summary");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === "summary"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          expected Salary & Breakdown
        </button>
        <button
          onClick={() => {
            setActiveTab("documents");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === "documents"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          My Documents
        </button>
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

      {activeTab === "punch" && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Today&apos;s Status</h2>
                <p className="mt-1 text-sm text-slate-500">{formatDate(new Date())}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {todayAttendance?.checkInTime && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <LogIn size={14} className="text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">
                      {formatTime(todayAttendance.checkInTime)}
                    </span>
                  </div>
                )}

                {todayAttendance?.checkOutTime && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <LogOut size={14} className="text-red-600" />
                    <span className="text-sm font-bold text-slate-700">
                      {formatTime(todayAttendance.checkOutTime)}
                    </span>
                  </div>
                )}

                {todayAttendance?.totalWorkingHours > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <Clock size={14} className="text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">
                      {todayAttendance.totalWorkingHours}h
                    </span>
                  </div>
                )}

                {todayAttendance?.attendanceStatus && (
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ${statusBadgeClass[todayAttendance.attendanceStatus] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                    {formatLabel(todayAttendance.attendanceStatus)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {!todayAttendance ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={isActionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogIn size={16} />
                  {isActionLoading ? "Processing..." : "Check In"}
                </button>
              ) : !todayAttendance.checkOutTime ? (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={isActionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {isActionLoading ? "Processing..." : "Check Out"}
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-500">
                  <CalendarCheck size={16} />
                  Attendance completed for today
                </span>
              )}
            </div>
          </div>

          <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
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
            <div className="flex min-h-64 items-center justify-center bg-white border rounded-lg">
              <LoadingSpinner />
            </div>
          ) : records.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <CalendarCheck size={25} />
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-950">No attendance records</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500 font-semibold">Your attendance history will appear here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full table-fixed min-w-[800px]">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 border-b">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Check-In</th>
                      <th className="px-6 py-4">Check-Out</th>
                      <th className="px-6 py-4">Hours</th>
                      <th className="px-6 py-4">Late Minutes</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {records.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">{formatDate(record.date)}</td>
                        <td className="px-6 py-4">{formatTime(record.checkInTime)}</td>
                        <td className="px-6 py-4">{formatTime(record.checkOutTime)}</td>
                        <td className="px-6 py-4">{record.totalWorkingHours} hrs</td>
                        <td className="px-6 py-4 text-red-600">{record.lateMinutes || 0}m</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${statusBadgeClass[record.attendanceStatus] || "bg-slate-100 text-slate-600"}`}>
                            {formatLabel(record.attendanceStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
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

      {/* TAB 2: Calendar Grid */}
      {activeTab === "calendar" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded border">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Month</label>
              <select
                value={calendarMonth}
                onChange={(e) => setCalendarMonth(Number(e.target.value))}
                className="h-9 rounded border px-3 text-sm"
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
                className="h-9 rounded border px-3 text-sm"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                    setRemarksInput(dayItem.record?.remarks || "");
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

          {selectedDayDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-lg font-black text-slate-900">Attendance Day {selectedDayDetail.day}</h4>
                  <button onClick={() => setSelectedDayDetail(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="py-4 space-y-3 text-sm">
                  <p><strong>Status:</strong> <span className="capitalize">{formatLabel(selectedDayDetail.status)}</span></p>
                  {selectedDayDetail.holiday && <p><strong>Holiday:</strong> {selectedDayDetail.holiday.name}</p>}
                  {selectedDayDetail.record ? (
                    <div className="space-y-2 text-xs font-medium text-slate-600">
                      <p><strong>Check In:</strong> {formatTime(selectedDayDetail.record.checkInTime)}</p>
                      <p><strong>Check Out:</strong> {formatTime(selectedDayDetail.record.checkOutTime)}</p>
                      <p><strong>Working Hours:</strong> {selectedDayDetail.record.totalWorkingHours} hrs</p>
                      <p><strong>Check-In IP:</strong> {selectedDayDetail.record.checkInIP || selectedDayDetail.record.ipAddress || "—"}</p>
                      <p><strong>Check-Out IP:</strong> {selectedDayDetail.record.checkOutIP || "—"}</p>
                      <p><strong>Check-In Location:</strong> {selectedDayDetail.record.checkInLocation || selectedDayDetail.record.location || "—"}</p>
                      <p><strong>Check-Out Location:</strong> {selectedDayDetail.record.checkOutLocation || "—"}</p>
                      <p><strong>Browser/Device:</strong> {selectedDayDetail.record.checkInBrowser || selectedDayDetail.record.browser || "—"} ({selectedDayDetail.record.checkInDevice || selectedDayDetail.record.deviceType || "—"})</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No active check-in record for this day.</p>
                  )}
                  
                  <form onSubmit={handleSaveRemarks} className="space-y-3 pt-3 border-t">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">My Remarks / Description</label>
                      <textarea
                        value={remarksInput}
                        onChange={(e) => setRemarksInput(e.target.value)}
                        className="w-full rounded border p-2 text-xs"
                        rows="2"
                        placeholder="Add reason, meeting detail, or client site details..."
                      />
                    </div>
                    <button type="submit" className="w-full h-9 rounded bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">
                      Submit Remarks
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Expected Salary & Breakdown */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          <div className="flex items-end gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Month</label>
              <select
                value={summaryMonth}
                onChange={(e) => setSummaryMonth(Number(e.target.value))}
                className="h-10 rounded border px-3 text-sm"
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
                value={summaryYear}
                onChange={(e) => setSummaryYear(Number(e.target.value))}
                className="h-10 rounded border px-3 text-sm"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {monthlySummaryData ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                  <h3 className="font-black text-slate-900 border-b pb-2 flex items-center gap-2"><Briefcase size={18} /> Expected payable summaries</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded border">
                      <p className="text-xs font-bold text-slate-400 uppercase">Presents</p>
                      <p className="text-xl font-black mt-1 text-slate-900">{monthlySummaryData.present} Days</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border">
                      <p className="text-xs font-bold text-slate-400 uppercase">Half Days</p>
                      <p className="text-xl font-black mt-1 text-slate-900">{monthlySummaryData.halfDays} Days</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border">
                      <p className="text-xs font-bold text-slate-400 uppercase">Paid Leaves</p>
                      <p className="text-xl font-black mt-1 text-slate-900">{monthlySummaryData.paidLeave} Days</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border">
                      <p className="text-xs font-bold text-slate-400 uppercase">Late check-ins</p>
                      <p className="text-xl font-black mt-1 text-red-600">{monthlySummaryData.lateArrivals}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border">
                      <p className="text-xs font-bold text-slate-400 uppercase">Overtime hours</p>
                      <p className="text-xl font-black mt-1 text-emerald-600">+{monthlySummaryData.overtimeHours} hrs</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-600 uppercase">Salary Eligible Days</p>
                      <p className="text-xl font-black mt-1 text-emerald-800">{monthlySummaryData.salaryEligibleDays} Days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-black text-slate-900 border-b pb-2 mb-4 flex items-center gap-2"><Award size={18} /> Upcoming Holidays</h3>
                  {upcomingHolidays.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingHolidays.map((h) => (
                        <div key={h._id} className="flex justify-between items-center p-3 bg-purple-50 border border-purple-100 rounded">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{h.name}</p>
                            <p className="text-xs text-slate-400">{formatDate(h.date)}</p>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">{h.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">No upcoming public holidays.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading summary data...</div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <EmployeeDocument />
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

export default EmployeeAttendance;
