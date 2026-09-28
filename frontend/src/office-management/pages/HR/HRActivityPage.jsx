import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Eye, FileArchive, FileBarChart, FileText, Megaphone, NotebookTabs, Plus, UserRound, X } from "lucide-react";
import API from "../../api/axiosInstance";
import { useAuth } from "../../context/authStore";
import { hasHRPermission } from "../../utils/canShowMenu";
import {
  Cell,
  EmptyState,
  ErrorState,
  formatDate,
  LoadingState,
  PageHeader,
  Panel,
  StatusBadge,
  Table,
} from "./HRUi";

const config = {
  holidays: { title: "Holiday Calendar", description: "Plan office holidays and keep the annual calendar visible to every team.", icon: CalendarDays, endpoint: "/attendance/holidays" },
  documents: { title: "Employee Documents", description: "Review employee uploads and keep HR records easy to find.", icon: FileArchive, endpoint: "/adminDocument/All_Employee", errorMessage: "Employee documents are unavailable right now. Please try again." },
  reports: { title: "HR Reports", description: "Review workforce, attendance and operational reporting in one place.", icon: FileBarChart, endpoint: "/reports/employee" },
  notices: { title: "Announcements", description: "Publish and review internal communication for the office.", icon: Megaphone, endpoint: "/announcements" },
  meetings: { title: "Meetings", description: "Coordinate interviews, reviews and HR meetings with the team.", icon: NotebookTabs, endpoint: "/meetings" },
  profile: { title: "My HR Profile", description: "Review your account and HR access details.", icon: UserRound },
};

const getRows = (payload) => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.announcements)) return data.announcements;
  if (Array.isArray(data?.meetings)) return data.meetings;
  return [];
};

const isImageDocument = (document) =>
  document?.resourceType === "image" ||
  document?.fileType?.startsWith("image/");

const HRActivityPage = ({ type }) => {
  const { user } = useAuth();
  const current = config[type];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(Boolean(current.endpoint));
  const [error, setError] = useState("");
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holiday, setHoliday] = useState({ name: "", date: "", description: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", meetingDate: "", meetingType: "Online", location: "" });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const canCreate = hasHRPermission(user, type === "holidays" ? "holidays" : type === "notices" ? "announcements" : "meetings", "create");

  const fetchRows = useCallback(async () => {
    if (!current.endpoint) return;
    try {
      setLoading(true);
      setError("");
      const response = await API.get(current.endpoint);
      setRows(getRows(response.data));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          current.errorMessage ||
          "The requested data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, [current.endpoint, current.errorMessage]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const createHoliday = async (event) => {
    event.preventDefault();
    try {
      await API.post("/attendance/holidays", holiday);
      setHoliday({ name: "", date: "", description: "" });
      setShowHolidayForm(false);
      await fetchRows();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Holiday could not be created.");
    }
  };

  const createActivity = async (event) => {
    event.preventDefault();
    const endpoint = type === "notices" ? "/announcements" : "/meetings";
    const payload = type === "notices"
      ? { title: form.title, description: form.description, status: "Published", targetAudience: "All Employees" }
      : { title: form.title, description: form.description, meetingDate: form.meetingDate, meetingType: form.meetingType, location: form.location };
    try {
      await API.post(endpoint, payload);
      setForm({ title: "", description: "", meetingDate: "", meetingType: "Online", location: "" });
      setShowCreateForm(false);
      await fetchRows();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The activity could not be created.");
    }
  };

  if (type === "profile") {
    return (
      <section className="space-y-6">
        <PageHeader title={current.title} description={current.description} />
        <Panel title="Account details" description="Your signed-in HR account and access level.">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Full name", user?.name], ["Email address", user?.email], ["Role", "HR Manager"], ["Account status", user?.status || "active"]].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-bold capitalize text-slate-900">{value || "—"}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    );
  }

  const Icon = current.icon;
  if (type === "documents") {
    return (
      <section className="space-y-6">
        <PageHeader title={current.title} description={current.description} />
        {loading && <LoadingState label="Loading employee documents..." />}
        {!loading && error && <ErrorState message={error} onRetry={fetchRows} />}
        {!loading && !error && (
          <Panel
            title={`${rows.length} employee document${rows.length === 1 ? "" : "s"}`}
            description="Click any image to view it clearly. PDF and other files open in a new tab."
            action={<FileArchive size={19} className="text-blue-600" />}
          >
            {!rows.length ? (
              <EmptyState label="No employee documents have been uploaded yet." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((document) => {
                  const imageDocument = isImageDocument(document);
                  return (
                    <article key={document._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => imageDocument && setSelectedDocument(document)}
                        className={`relative flex h-44 w-full items-center justify-center bg-slate-100 ${imageDocument ? "cursor-zoom-in" : "cursor-default"}`}
                        title={imageDocument ? "Click to view image" : "Open file below"}
                      >
                        {imageDocument ? (
                          <>
                            <img src={document.fileUrl} alt={document.title || document.fileName || "Employee document"} className="h-full w-full object-cover" loading="lazy" />
                            <span className="absolute right-3 top-3 rounded-lg bg-slate-950/70 p-2 text-white"><Eye size={16} /></span>
                          </>
                        ) : (
                          <FileText size={42} className="text-slate-400" />
                        )}
                      </button>
                      <div className="space-y-3 p-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-slate-950">{document.title || document.fileName || "Untitled document"}</h3>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{document.name || "Employee"} {document.email ? `· ${document.email}` : ""}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <StatusBadge value={document.documentType || document.fileType || "document"} />
                          <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">
                            <Eye size={14} /> View file
                          </a>
                        </div>
                        {document.backFileUrl && (
                          <button type="button" onClick={() => setSelectedDocument({ ...document, fileUrl: document.backFileUrl, title: `${document.title || "Document"} - Back side` })} className="text-xs font-bold text-indigo-700 hover:underline">
                            View back side
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>
        )}
        {selectedDocument && (
          <div role="dialog" aria-modal="true" aria-label="Document preview" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setSelectedDocument(null)}>
            <div className="relative max-h-[92vh] max-w-5xl overflow-auto rounded-2xl bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={() => setSelectedDocument(null)} className="absolute right-4 top-4 z-10 rounded-full bg-slate-950/75 p-2 text-white hover:bg-slate-950" aria-label="Close preview"><X size={18} /></button>
              <img src={selectedDocument.fileUrl} alt={selectedDocument.title || "Document preview"} className="max-h-[84vh] max-w-full rounded-xl object-contain" />
              <p className="px-2 pb-1 pt-3 text-sm font-bold text-slate-800">{selectedDocument.title || selectedDocument.fileName || "Document preview"}</p>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={current.title}
        description={current.description}
        action={["holidays", "notices", "meetings"].includes(type) && canCreate ? (
          <button type="button" onClick={() => type === "holidays" ? setShowHolidayForm((value) => !value) : setShowCreateForm((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
            <Plus size={17} /> {type === "holidays" ? "Add holiday" : type === "notices" ? "Publish announcement" : "Schedule meeting"}
          </button>
        ) : null}
      />
      {showHolidayForm && (
        <Panel title="Add office holiday" description="Use a clear name and date so everyone can plan ahead.">
          <form onSubmit={createHoliday} className="grid gap-4 sm:grid-cols-3">
            <input required value={holiday.name} onChange={(event) => setHoliday({ ...holiday, name: event.target.value })} placeholder="Holiday name" className="field-input" />
            <input required type="date" value={holiday.date} onChange={(event) => setHoliday({ ...holiday, date: event.target.value })} className="field-input" />
            <input value={holiday.description} onChange={(event) => setHoliday({ ...holiday, description: event.target.value })} placeholder="Description (optional)" className="field-input" />
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white sm:col-span-3 sm:w-fit">Save holiday</button>
          </form>
        </Panel>
      )}
      {showCreateForm && (
        <Panel title={type === "notices" ? "Publish announcement" : "Schedule HR meeting"}>
          <form onSubmit={createActivity} className="grid gap-4 sm:grid-cols-2">
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={type === "notices" ? "Announcement title" : "Meeting title"} className="field-input" />
            {type === "meetings" && <input required type="date" value={form.meetingDate} onChange={(event) => setForm({ ...form, meetingDate: event.target.value })} className="field-input" />}
            {type === "meetings" && <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Location or meeting link" className="field-input" />}
            {type === "meetings" && <select value={form.meetingType} onChange={(event) => setForm({ ...form, meetingType: event.target.value })} className="field-input"><option>Online</option><option>In-Person</option><option>Hybrid</option></select>}
            <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="field-input min-h-28 sm:col-span-2" />
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white sm:w-fit">Save</button>
          </form>
        </Panel>
      )}
      {loading && <LoadingState label={`Loading ${current.title.toLowerCase()}...`} />}
      {!loading && error && <ErrorState message={error} onRetry={fetchRows} />}
      {!loading && !error && (
        <Panel title={`Recent ${current.title.toLowerCase()}`} action={<Icon size={19} className="text-blue-600" />}>
          {!rows.length && <EmptyState label={`No ${type} records available yet.`} />}
          {!!rows.length && (
            <Table headers={type === "holidays" ? ["Holiday", "Date", "Description", "Status"] : ["Title", "Date", "Details", "Status"]}>
              {rows.map((row, index) => (
                <tr key={row._id || row.id || index} className="transition hover:bg-slate-50">
                  <Cell>{row.name || row.title || row.originalName || row.fileName || row.employeeName || "Untitled"}</Cell>
                  <Cell>{formatDate(row.date || row.publishDate || row.meetingDate || row.createdAt || row.createdDate || row.startDate)}</Cell>
                  <Cell className="max-w-md truncate">{row.description || row.message || row.reason || row.email || row.department || "—"}</Cell>
                  <Cell><StatusBadge value={row.status || row.fileType || "active"} /></Cell>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}
    </section>
  );
};

export default HRActivityPage;
