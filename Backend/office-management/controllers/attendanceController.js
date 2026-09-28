import mongoose from "mongoose";
import Attendance, { attendanceStatuses } from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";
import AttendanceSettings from "../models/AttendanceSettings.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import axios from "axios";

const ATTENDANCE_LIST_FIELDS =
  "employeeId employeeName employeeEmail date checkInTime checkOutTime totalWorkingHours attendanceStatus employeeStatus lateMinutes earlyLeavingMinutes isHoliday holidayType isWeeklyOff isPaidLeave isUnpaidLeave remarks adminRemarks overtimeHours salaryEligible salaryDeduction salaryAddition payableHours payableDays createdAt updatedAt ipAddress location latitude longitude userAgent browser operatingSystem deviceType checkInLocation checkOutLocation checkInIP checkOutIP checkInLatitude checkInLongitude checkOutLatitude checkOutLongitude checkInBrowser checkOutBrowser checkInOS checkOutOS checkInDevice checkOutDevice";

const ATTENDANCE_DETAIL_FIELDS = ATTENDANCE_LIST_FIELDS;
const EMPLOYEE_BASIC_FIELDS = "name email phone department designation status";

const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "";
};

const parseUserAgent = (uaString = "") => {
  let browser = "Unknown Browser";
  let operatingSystem = "Unknown OS";
  let deviceType = "Desktop";

  const ua = uaString.toLowerCase();

  // Browser
  if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  } else if (ua.includes("chrome")) {
    browser = "Chrome";
  } else if (ua.includes("safari")) {
    browser = "Safari";
  } else if (ua.includes("msie") || ua.includes("trident")) {
    browser = "Internet Explorer";
  }

  // OS
  if (ua.includes("windows")) {
    operatingSystem = "Windows";
  } else if (ua.includes("mac os") || ua.includes("macintosh")) {
    operatingSystem = "macOS";
  } else if (ua.includes("linux")) {
    operatingSystem = "Linux";
  } else if (ua.includes("android")) {
    operatingSystem = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    operatingSystem = "iOS";
  }

  // Device
  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) {
    deviceType = "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    deviceType = "Tablet";
  }

  return { browser, operatingSystem, deviceType };
};

const getGeographicLocation = async (ip, lat, lng) => {
  if (lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`, {
        headers: { "User-Agent": "OfficeManagementApp/1.0" },
        timeout: 3000
      });
      if (res.data && res.data.display_name) {
        return res.data.display_name;
      }
    } catch (e) {
      // ignore
    }
    return `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.")) {
    return "Location Unavailable";
  }

  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 3000 });
    if (res.data && res.data.status === "success") {
      const city = res.data.city || "";
      const regionName = res.data.regionName || "";
      const country = res.data.country || "";
      return [city, regionName, country].filter(Boolean).join(", ");
    }
  } catch (e) {
    // ignore
  }

  return "Location Unavailable";
};

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const requireAuthenticatedUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);
  if (!["super_admin", "admin", "hr"].includes(user.role)) {
    throw new AppError(
      "Only administrator can access this resource",
      403,
      "FORBIDDEN"
    );
  }
};

const requireEmployee = (user) => {
  requireAuthenticatedUser(user);
  if (user.role !== "employee") {
    throw new AppError(
      "Only employees can perform this action",
      403,
      "FORBIDDEN"
    );
  }
};

const getPagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 10, 1),
    100
  );
  return { page, limit, skip: (page - 1) * limit };
};

const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
};

const determineAttendanceStatus = (checkIn, checkOut, settings) => {
  if (!checkIn) return "absent";
  if (!checkOut) return "present";
  const hours = calculateWorkingHours(checkIn, checkOut);
  if (hours < (settings?.halfDayHours || 4)) return "half_day";
  return "present";
};

const findEmployeeRecord = async (userId) => {
  const employee = await Employee.findOne({ userId }).select("_id").lean();
  if (!employee) {
    throw new AppError("Employee record not found", 404, "EMPLOYEE_NOT_FOUND");
  }
  return employee;
};

const validateEmployeeObjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid employee id", 400, "INVALID_EMPLOYEE_ID");
  }
};

// Calculate monthly breakdown for salary and dashboards
export const calculateMonthlyBreakdown = async (employeeId, month, year) => {
  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  const totalDays = endDate.getDate();

  const records = await Attendance.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  const holidays = await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
    enabled: true,
  }).lean();

  const recordMap = new Map();
  records.forEach((r) => {
    const key = new Date(r.date).toDateString();
    recordMap.set(key, r);
  });

  const holidayMap = new Map();
  holidays.forEach((h) => {
    const key = new Date(h.date).toDateString();
    holidayMap.set(key, h);
  });

  let present = 0;
  let absent = 0;
  let halfDays = 0;
  let paidLeave = 0;
  let unpaidLeave = 0;
  let publicHolidays = 0;
  let festivalHolidays = 0;
  let weeklyOff = 0;
  let lateArrivals = 0;
  let earlyCheckouts = 0;
  let totalOvertimeHours = 0;
  let totalWorkingHours = 0;

  for (let d = 1; d <= totalDays; d++) {
    const currentDate = new Date(year, month - 1, d);
    const dateKey = currentDate.toDateString();
    const dayOfWeek = currentDate.getDay();

    const record = recordMap.get(dateKey);
    const holiday = holidayMap.get(dateKey);
    const isOff = dayOfWeek === 0; // Strictly Sunday (0 = Sunday)

    // Evaluate day status based on strict Priority Rules:
    // 1. Approved Leave
    // 2. Public / Festival Holiday
    // 3. Sunday Weekly Holiday
    // 4. Present
    // 5. Half Day
    // 6. Absent
    let dayStatus = "absent";
    if (record && (record.isPaidLeave || record.isUnpaidLeave)) {
      dayStatus = "leave";
    } else if (holiday) {
      dayStatus = "holiday";
    } else if (isOff) {
      dayStatus = "weekly_off";
    } else if (record && record.attendanceStatus === "present") {
      dayStatus = "present";
    } else if (record && record.attendanceStatus === "half_day") {
      dayStatus = "half_day";
    }

    // Increment corresponding metrics based on unique day status
    if (dayStatus === "leave") {
      if (record?.isPaidLeave) paidLeave++;
      if (record?.isUnpaidLeave) unpaidLeave++;
    } else if (dayStatus === "holiday") {
      if (holiday.type === "festival") festivalHolidays++;
      else publicHolidays++;
    } else if (dayStatus === "weekly_off") {
      weeklyOff++;
    } else if (dayStatus === "present") {
      present++;
    } else if (dayStatus === "half_day") {
      halfDays++;
    } else if (dayStatus === "absent") {
      absent++;
    }

    if (record) {
      if (record.lateMinutes > 0) lateArrivals++;
      if (record.earlyLeavingMinutes > 0) earlyCheckouts++;
      totalOvertimeHours += record.overtimeHours || 0;
      totalWorkingHours += record.totalWorkingHours || 0;
    }
  }

  const workingDays = totalDays - weeklyOff - publicHolidays - festivalHolidays;
  const paidHolidays = publicHolidays + festivalHolidays;
  
  // expected salary days = Present + HalfDays*0.5 + PaidLeaves + PaidHolidays + WeeklyOffs
  const expectedSalaryDays = present + halfDays * 0.5 + paidLeave + paidHolidays + weeklyOff;

  const attendancePercentage = totalDays > 0
    ? Math.round(((present + halfDays + paidLeave + paidHolidays + weeklyOff) / totalDays) * 100)
    : 0;

  return {
    totalDays,
    workingDays,
    present,
    absent,
    halfDays,
    paidLeave,
    unpaidLeave,
    publicHolidays,
    festivalHolidays,
    weeklyOff,
    lateArrivals,
    earlyCheckouts,
    overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
    totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
    attendancePercentage,
    salaryEligibleDays: Math.min(expectedSalaryDays, totalDays),
  };
};

// --- Employee Handlers ---

export const employeeCheckIn = asyncHandler(async (req, res) => {
  requireEmployee(req.user);

  const employee = await findEmployeeRecord(req.user._id);
  const today = getTodayDate();

  const existingAttendance = await Attendance.findOne({
    employeeId: employee._id,
    date: today,
  }).lean();

  if (existingAttendance) {
    throw new AppError(
      "You have already checked in today",
      409,
      "ALREADY_CHECKED_IN"
    );
  }

  const employeeRecord = await Employee.findById(employee._id)
    .select("name email status")
    .lean();

  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));
  const holiday = await Holiday.findOne({ date: today, enabled: true }).lean();
  const dayOfWeek = today.getDay();
  const isOff = dayOfWeek === 0;

  const [startHour, startMin] = settings.officeStartTime.split(":").map(Number);
  const startTimeToday = new Date();
  startTimeToday.setHours(startHour, startMin, 0, 0);

  const now = new Date();
  let lateMinutes = 0;
  if (now > startTimeToday) {
    const diffMs = now.getTime() - startTimeToday.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins > settings.gracePeriod) {
      lateMinutes = diffMins;
    }
  }

  let ip = getClientIp(req);
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  const { latitude, longitude } = req.body;
  const lat = latitude !== undefined && latitude !== null && !Number.isNaN(Number(latitude)) ? Number(latitude) : null;
  const lng = longitude !== undefined && longitude !== null && !Number.isNaN(Number(longitude)) ? Number(longitude) : null;

  const userAgentStr = req.headers["user-agent"] || "";
  const { browser, operatingSystem, deviceType } = parseUserAgent(userAgentStr);
  const loc = await getGeographicLocation(ip, lat, lng);

  const attendance = await Attendance.create({
    employeeId: employee._id,
    employeeName: employeeRecord.name,
    employeeEmail: employeeRecord.email,
    date: today,
    checkInTime: now,
    attendanceStatus: "present",
    employeeStatus: employeeRecord.status === "active" ? "active" : "inactive",
    lateMinutes,
    isHoliday: !!holiday,
    holidayId: holiday ? holiday._id : null,
    holidayType: holiday ? holiday.type : "",
    isWeeklyOff: isOff,
    
    ipAddress: ip,
    location: loc,
    latitude: lat,
    longitude: lng,
    userAgent: userAgentStr,
    browser,
    operatingSystem,
    deviceType,
    
    checkInLocation: loc,
    checkInIP: ip,
    checkInLatitude: lat,
    checkInLongitude: lng,
    checkInBrowser: browser,
    checkInOS: operatingSystem,
    checkInDevice: deviceType,
  });

  const populated = await Attendance.findById(attendance._id)
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Checked in successfully",
    data: { attendance: populated },
    error: null,
  });
});

export const employeeCheckOut = asyncHandler(async (req, res) => {
  requireEmployee(req.user);

  const employee = await findEmployeeRecord(req.user._id);
  const today = getTodayDate();

  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    date: today,
  });

  if (!attendance) {
    throw new AppError(
      "No attendance record found for today. Please check in first.",
      404,
      "NO_ATTENDANCE_TODAY"
    );
  }

  if (attendance.checkOutTime) {
    throw new AppError(
      "You have already checked out today",
      409,
      "ALREADY_CHECKED_OUT"
    );
  }

  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));

  const now = new Date();
  attendance.checkOutTime = now;
  
  const workingHours = calculateWorkingHours(attendance.checkInTime, now);
  attendance.totalWorkingHours = workingHours;
  attendance.attendanceStatus = determineAttendanceStatus(
    attendance.checkInTime,
    now,
    settings
  );

  const [endHour, endMin] = settings.officeEndTime.split(":").map(Number);
  const endTimeToday = new Date();
  endTimeToday.setHours(endHour, endMin, 0, 0);

  if (now < endTimeToday) {
    const diffMs = endTimeToday.getTime() - now.getTime();
    attendance.earlyLeavingMinutes = Math.floor(diffMs / (1000 * 60));
  } else {
    attendance.earlyLeavingMinutes = 0;
  }

  if (workingHours > settings.overtimeThreshold) {
    attendance.overtimeHours = Math.round((workingHours - settings.overtimeThreshold) * 100) / 100;
  } else {
    attendance.overtimeHours = 0;
  }

  let ip = getClientIp(req);
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  const { latitude, longitude } = req.body;
  const lat = latitude !== undefined && latitude !== null && !Number.isNaN(Number(latitude)) ? Number(latitude) : null;
  const lng = longitude !== undefined && longitude !== null && !Number.isNaN(Number(longitude)) ? Number(longitude) : null;

  const userAgentStr = req.headers["user-agent"] || "";
  const { browser, operatingSystem, deviceType } = parseUserAgent(userAgentStr);
  const loc = await getGeographicLocation(ip, lat, lng);

  attendance.checkOutLocation = loc;
  attendance.checkOutIP = ip;
  attendance.checkOutLatitude = lat;
  attendance.checkOutLongitude = lng;
  attendance.checkOutBrowser = browser;
  attendance.checkOutOS = operatingSystem;
  attendance.checkOutDevice = deviceType;

  // For checkouts, update primary coordinates if checkout coordinates are valid
  if (lat !== null && lng !== null) {
    attendance.latitude = lat;
    attendance.longitude = lng;
    attendance.ipAddress = ip;
    attendance.location = loc;
  }

  await attendance.save();

  const populated = await Attendance.findById(attendance._id)
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Checked out successfully",
    data: { attendance: populated },
    error: null,
  });
});

export const getTodayAttendance = asyncHandler(async (req, res) => {
  requireEmployee(req.user);

  const employee = await findEmployeeRecord(req.user._id);
  const today = getTodayDate();

  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    date: today,
  })
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    data: { attendance },
    error: null,
  });
});

export const getMyAttendanceHistory = asyncHandler(async (req, res) => {
  requireEmployee(req.user);

  const employee = await findEmployeeRecord(req.user._id);
  const filter = { employeeId: employee._id };

  const { page, limit, skip } = getPagination(req.query);

  if (req.query.startDate && req.query.endDate) {
    filter.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  if (req.query.attendanceStatus) {
    filter.attendanceStatus = req.query.attendanceStatus;
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
      .lean(),
    Attendance.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// --- Admin Handlers ---

export const getAllAttendance = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    const searchRegex = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [
      { employeeName: searchRegex },
      { employeeEmail: searchRegex },
    ];
  }

  if (req.query.attendanceStatus) {
    filter.attendanceStatus = req.query.attendanceStatus;
  }

  if (req.query.startDate && req.query.endDate) {
    filter.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  } else {
    let targetDateStr = req.query.date;
    if (!targetDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      targetDateStr = `${y}-${m}-${d}`;
    }

    const [year, month, day] = targetDateStr.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    filter.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
      .lean(),
    Attendance.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAttendanceByDate = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const targetDate = req.query.date ? new Date(req.query.date) : getTodayDate();
  const records = await Attendance.find({ date: targetDate })
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    data: records,
  });
});

export const getAttendanceByEmployee = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { employeeId } = req.params;
  validateEmployeeObjectId(employeeId);

  const records = await Attendance.find({ employeeId })
    .sort({ date: -1 })
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    data: records,
  });
});

// Update remarks/description (for self comments or admin edits)
export const updateRemarksApi = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks, adminRemarks, isPaidLeave, isUnpaidLeave } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid attendance record id", 400, "BAD_REQUEST");
  }

  let attendance = await Attendance.findById(id);
  if (!attendance) {
    throw new AppError("Attendance record not found", 404, "NOT_FOUND");
  }

  // Employee can only edit remarks of their own attendance
  if (req.user.role === "employee") {
    const employee = await Employee.findOne({ userId: req.user._id }).lean();
    if (!employee || String(attendance.employeeId) !== String(employee._id)) {
      throw new AppError("You are not authorized to edit this record", 403, "FORBIDDEN");
    }
    if (remarks !== undefined) attendance.remarks = remarks;
  } else if (["super_admin", "admin", "hr"].includes(req.user.role)) {
    if (remarks !== undefined) attendance.remarks = remarks;
    if (adminRemarks !== undefined) attendance.adminRemarks = adminRemarks;
    if (isPaidLeave !== undefined) attendance.isPaidLeave = isPaidLeave;
    if (isUnpaidLeave !== undefined) attendance.isUnpaidLeave = isUnpaidLeave;
  } else {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  await attendance.save();

  return res.status(200).json({
    success: true,
    message: "Attendance remarks updated successfully",
    data: attendance,
  });
});

// Get dynamic monthly breakdown summary API
export const getMonthlySummaryApi = asyncHandler(async (req, res) => {
  let { employeeId, month, year } = req.query;
  const current = new Date();
  
  month = Number.parseInt(month || current.getMonth() + 1, 10);
  year = Number.parseInt(year || current.getFullYear(), 10);

  let targetEmployeeId = employeeId;
  if (req.user.role === "employee") {
    const employee = await Employee.findOne({ userId: req.user._id }).lean();
    if (!employee) {
      throw new AppError("Employee record not found.", 404, "NOT_FOUND");
    }
    targetEmployeeId = employee._id;
  } else {
    if (!targetEmployeeId) {
      throw new AppError("Employee ID is required.", 400, "BAD_REQUEST");
    }
    validateEmployeeObjectId(targetEmployeeId);
  }

  const summary = await calculateMonthlyBreakdown(targetEmployeeId, month, year);

  return res.status(200).json({
    success: true,
    data: summary,
  });
});

// Fetch calendar data
export const getAttendanceCalendarApi = asyncHandler(async (req, res) => {
  let { employeeId, month, year } = req.query;
  const current = new Date();

  month = Number.parseInt(month || current.getMonth() + 1, 10);
  year = Number.parseInt(year || current.getFullYear(), 10);

  let targetEmployeeId = employeeId;
  if (req.user.role === "employee") {
    const employee = await Employee.findOne({ userId: req.user._id }).lean();
    if (!employee) {
      throw new AppError("Employee record not found.", 404, "NOT_FOUND");
    }
    targetEmployeeId = employee._id;
  } else {
    if (!targetEmployeeId) {
      throw new AppError("Employee ID is required.", 400, "BAD_REQUEST");
    }
    validateEmployeeObjectId(targetEmployeeId);
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const records = await Attendance.find({
    employeeId: targetEmployeeId,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  const holidays = await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
    enabled: true,
  }).lean();

  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));

  // Build full grid
  const calendarDays = [];
  const daysInMonth = endDate.getDate();

  const recordMap = new Map();
  records.forEach((r) => recordMap.set(new Date(r.date).toDateString(), r));

  const holidayMap = new Map();
  holidays.forEach((h) => holidayMap.set(new Date(h.date).toDateString(), h));

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = date.toDateString();
    const dayOfWeek = date.getDay();

    const record = recordMap.get(dateStr);
    const holiday = holidayMap.get(dateStr);
    const isOff = dayOfWeek === 0; // Strictly Sunday (0 = Sunday)

    // Strict Priority Rules evaluation:
    // 1. Approved Leave
    // 2. Public / Festival Holiday
    // 3. Sunday Weekly Holiday
    // 4. Present
    // 5. Half Day
    // 6. Absent
    let status = "absent";
    if (record && (record.isPaidLeave || record.isUnpaidLeave)) {
      status = "leave";
    } else if (holiday) {
      status = "holiday";
    } else if (isOff) {
      status = "weekly_off";
    } else if (record && record.attendanceStatus === "present") {
      status = "present";
    } else if (record && record.attendanceStatus === "half_day") {
      status = "half_day";
    }

    calendarDays.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      status,
      record: record || null,
      holiday: holiday || null,
      isWeeklyOff: isOff,
      isWeeklyHoliday: isOff,
      holidayType: isOff ? "Weekly Holiday" : "",
      holidayName: isOff ? "Sunday" : "",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      days: calendarDays,
      month,
      year,
    },
  });
});

// Attendance Analytics dashboard
export const getAttendanceAnalyticsApi = asyncHandler(async (req, res) => {
  const current = new Date();
  const month = current.getMonth() + 1;
  const year = current.getFullYear();

  // Basic aggregation
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  const totalEmployees = await Employee.countDocuments({ status: "active" });

  const totalWorkingDays = await Attendance.aggregate([
    { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
    {
      $group: {
        _id: "$attendanceStatus",
        count: { $sum: 1 },
        avgHours: { $avg: "$totalWorkingHours" },
      },
    },
  ]);

  const monthlyRecords = await Attendance.find({
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).lean();

  const lateCount = monthlyRecords.filter((r) => r.lateMinutes > 0).length;
  const overtimeEmployees = monthlyRecords.filter((r) => r.overtimeHours > 0).length;

  // Let's compute average check-in and checkout times
  let checkInMinutesSum = 0;
  let checkInCount = 0;
  let checkOutMinutesSum = 0;
  let checkOutCount = 0;

  monthlyRecords.forEach((r) => {
    if (r.checkInTime) {
      const d = new Date(r.checkInTime);
      checkInMinutesSum += d.getHours() * 60 + d.getMinutes();
      checkInCount++;
    }
    if (r.checkOutTime) {
      const d = new Date(r.checkOutTime);
      checkOutMinutesSum += d.getHours() * 60 + d.getMinutes();
      checkOutCount++;
    }
  });

  const formatMinutes = (minutes) => {
    if (!minutes) return "N/A";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const avgCheckIn = checkInCount > 0 ? formatMinutes(checkInMinutesSum / checkInCount) : "09:00";
  const avgCheckOut = checkOutCount > 0 ? formatMinutes(checkOutMinutesSum / checkOutCount) : "18:00";

  return res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      summary: totalWorkingDays,
      lateArrivals: lateCount,
      overtimeCount: overtimeEmployees,
      avgCheckInTime: avgCheckIn,
      avgCheckOutTime: avgCheckOut,
    },
  });
});

// Admin-facing upsert of daily attendance details (for custom weekly offs or leaves)
export const upsertAttendanceApi = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Access denied. Admin privileges required.", 403, "FORBIDDEN");
  }

  const { employeeId, date, isWeeklyOff, isPaidLeave, isUnpaidLeave, remarks, adminRemarks, attendanceStatus } = req.body;

  if (!employeeId || !date) {
    throw new AppError("Employee ID and Date are required.", 400, "BAD_REQUEST");
  }

  const parsedDate = new Date(date);
  // Strip time parts to stay date-only
  parsedDate.setHours(0, 0, 0, 0);

  const employee = await Employee.findById(employeeId).select("name email status").lean();
  if (!employee) {
    throw new AppError("Employee record not found.", 404, "NOT_FOUND");
  }

  let attendance = await Attendance.findOne({ employeeId, date: parsedDate });

  if (attendance) {
    if (isWeeklyOff !== undefined) attendance.isWeeklyOff = isWeeklyOff;
    if (isPaidLeave !== undefined) attendance.isPaidLeave = isPaidLeave;
    if (isUnpaidLeave !== undefined) attendance.isUnpaidLeave = isUnpaidLeave;
    if (remarks !== undefined) attendance.remarks = remarks;
    if (adminRemarks !== undefined) attendance.adminRemarks = adminRemarks;
    if (attendanceStatus !== undefined) attendance.attendanceStatus = attendanceStatus;
    
    // Auto status alignment
    if (isWeeklyOff) {
      attendance.attendanceStatus = "absent";
    }
    
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      employeeId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      date: parsedDate,
      attendanceStatus: isWeeklyOff ? "absent" : (attendanceStatus || "absent"),
      employeeStatus: employee.status === "active" ? "active" : "inactive",
      isWeeklyOff: !!isWeeklyOff,
      isPaidLeave: !!isPaidLeave,
      isUnpaidLeave: !!isUnpaidLeave,
      remarks: remarks || "",
      adminRemarks: adminRemarks || "",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Attendance day updated successfully",
    data: attendance,
  });
});
