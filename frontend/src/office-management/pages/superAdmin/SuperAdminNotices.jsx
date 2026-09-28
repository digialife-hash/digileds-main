import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bell,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Megaphone,
  Plus,
  Search,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { getEmployees } from "../../services/employeeService";
import {
  createAnnouncementApi,
  createMeetingApi,
  deleteAnnouncementApi,
  deleteMeetingApi,
  getAllAnnouncementsApi,
  getAllMeetingsApi,
  updateMeetingApi,
} from "../../services/noticeService";

const priorityBadges = {
  Normal: "bg-slate-100 text-slate-700 ring-slate-200",
  Important: "bg-amber-50 text-amber-700 ring-amber-100",
  Urgent: "bg-rose-50 text-rose-700 ring-rose-100",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const SuperAdminNotices = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "announcements",
  );

  useEffect(() => {
    const nextTab = searchParams.get("tab") || "announcements";
    setActiveTab((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab,
    );
  }, [searchParams]);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementModal, setAnnouncementModal] = useState({ isOpen: false });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
    announcementType: "General",
    priority: "Normal",
    targetAudience: "All Employees",
    status: "Published",
  });

  // Meetings State
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [meetingModal, setMeetingModal] = useState({ isOpen: false });
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    meetingDate: new Date().toISOString().split("T")[0],
    startTime: "10:30 AM",
    endTime: "11:30 AM",
    location: "Main Conference Room / Google Meet",
    meetingType: "Online",
    targetDepartment: "All Departments",
    attendees: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await getAllAnnouncementsApi();
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const res = await getAllMeetingsApi();
      setMeetings(res.data.meetings || []);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesData = async () => {
    try {
      const res = await getEmployees({ limit: 100 });
      setEmployees(res.data.employees || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (activeTab === "announcements") {
      fetchAnnouncements();
    } else {
      fetchMeetings();
      fetchEmployeesData();
    }
  }, [activeTab]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.description.trim()) {
      setErrorMessage("Title and description are required");
      return;
    }
    try {
      setIsSubmitting(true);
      await createAnnouncementApi(announcementForm);
      setSuccessMessage("Announcement published successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setAnnouncementModal({ isOpen: false });
      setAnnouncementForm({ title: "", description: "", announcementType: "General", priority: "Normal", targetAudience: "All Employees", status: "Published" });
      fetchAnnouncements();
    } catch (err) {
      setErrorMessage(err.message || "Failed to publish announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncementApi(id);
      setSuccessMessage("Announcement deleted");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchAnnouncements();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete announcement");
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim() || !meetingForm.meetingDate) {
      setErrorMessage("Title and date are required");
      return;
    }
    try {
      setIsSubmitting(true);
      await createMeetingApi(meetingForm);
      setSuccessMessage("Meeting scheduled successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setMeetingModal({ isOpen: false });
      fetchMeetings();
    } catch (err) {
      setErrorMessage(err.message || "Failed to schedule meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm("Delete this meeting schedule?")) return;
    try {
      await deleteMeetingApi(id);
      setSuccessMessage("Meeting deleted");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchMeetings();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete meeting");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <PageBackButton />
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Notices & Meeting Management
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Publish office announcements, policy updates, and schedule internal team meetings.
          </p>
        </div>

        {activeTab === "announcements" ? (
          <button
            type="button"
            onClick={() => setAnnouncementModal({ isOpen: true })}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={16} /> Create Announcement
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMeetingModal({ isOpen: true })}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={16} /> Schedule Meeting
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Module Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "announcements" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Megaphone size={16} /> Office Announcements
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("meetings")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
            activeTab === "meetings" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CalendarCheck size={16} /> Meeting Schedule
        </button>
      </div>

      {/* TAB CONTENT: Announcements */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
          ) : announcements.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-500">
              No office announcements published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {announcements.map((item) => (
                <div key={item._id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ring-1 ${priorityBadges[item.priority] || "bg-slate-100"}`}>
                        {item.priority} Priority
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400">{formatDate(item.publishDate)}</span>
                    </div>
                    <h3 className="mt-3 text-base font-black text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-xs font-semibold text-slate-600 whitespace-pre-line">{item.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Target: {item.targetAudience}</span>
                    <button type="button" onClick={() => handleDeleteAnnouncement(item._id)} className="text-xs font-bold text-rose-600 hover:text-rose-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Meetings */}
      {activeTab === "meetings" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
          ) : meetings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-500">
              No meetings scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {meetings.map((item) => (
                <div key={item._id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase">
                        {item.meetingType}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400">{formatDate(item.meetingDate)} • {item.startTime}</span>
                    </div>
                    <h3 className="mt-3 text-base font-black text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{item.location}</p>
                    {item.description && <p className="mt-2 text-xs text-slate-500">{item.description}</p>}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400">{item.attendees?.length || 0} Attendees</span>
                    <button type="button" onClick={() => handleDeleteMeeting(item._id)} className="text-xs font-bold text-rose-600 hover:text-rose-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      {announcementModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">Create Announcement</h3>
              <button type="button" onClick={() => setAnnouncementModal({ isOpen: false })} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Title *</label>
                <input type="text" required value={announcementForm.title} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Type</label>
                  <select value={announcementForm.announcementType} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, announcementType: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900">
                    <option value="General">General</option>
                    <option value="Policy">Policy</option>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Urgent Notice">Urgent Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Priority</label>
                  <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, priority: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900">
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Target Audience</label>
                <select value={announcementForm.targetAudience} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, targetAudience: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900">
                  <option value="All Employees">All Employees</option>
                  <option value="Management">Management</option>
                  <option value="Developers">Developers</option>
                  <option value="Designers">Designers</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Announcement Details *</label>
                <textarea rows={4} required value={announcementForm.description} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, description: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setAnnouncementModal({ isOpen: false })} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {meetingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">Schedule Meeting</h3>
              <button type="button" onClick={() => setMeetingModal({ isOpen: false })} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateMeeting} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Meeting Title *</label>
                <input type="text" required value={meetingForm.title} onChange={(e) => setMeetingForm((prev) => ({ ...prev, title: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Date *</label>
                  <input type="date" required value={meetingForm.meetingDate} onChange={(e) => setMeetingForm((prev) => ({ ...prev, meetingDate: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Start Time</label>
                  <input type="text" value={meetingForm.startTime} onChange={(e) => setMeetingForm((prev) => ({ ...prev, startTime: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Location / Meeting Link</label>
                <input type="text" value={meetingForm.location} onChange={(e) => setMeetingForm((prev) => ({ ...prev, location: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Agenda / Description</label>
                <textarea rows={3} value={meetingForm.description} onChange={(e) => setMeetingForm((prev) => ({ ...prev, description: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setMeetingModal({ isOpen: false })} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminNotices;
