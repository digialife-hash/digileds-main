import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { getClients } from "../../services/clientService";
import {
  createFollowUpApi,
  deleteFollowUpApi,
  getAllFollowUpsApi,
  getFollowUpStatsApi,
  updateFollowUpApi,
} from "../../services/followUpService";
import { getAllLeadsApi } from "../../services/leadService";

const typeBadges = {
  Call: "bg-blue-50 text-blue-700 ring-blue-100",
  Email: "bg-purple-50 text-purple-700 ring-purple-100",
  WhatsApp: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Meeting: "bg-amber-50 text-amber-700 ring-amber-100",
  Visit: "bg-teal-50 text-teal-700 ring-teal-100",
  Other: "bg-slate-100 text-slate-700 ring-slate-200",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const SuperAdminFollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [stats, setStats] = useState({ today: 0, upcoming: 0, overdue: 0, pending: 0 });
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterDate, setFilterDate] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [createModal, setCreateModal] = useState({ isOpen: false });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, followUp: null, outcome: "", nextDate: "" });

  const [formData, setFormData] = useState({
    targetType: "lead",
    leadId: "",
    clientId: "",
    followUpDate: new Date().toISOString().split("T")[0],
    followUpTime: "10:30 AM",
    type: "Call",
    notes: "",
  });

  const fetchFollowUps = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const [listRes, statsRes] = await Promise.all([
        getAllFollowUpsApi({ filterDate: filterDate === "all" ? undefined : filterDate }),
        getFollowUpStatsApi(),
      ]);

      setFollowUps(listRes.data.followUps || []);
      setStats(statsRes.data || { today: 0, upcoming: 0, overdue: 0, pending: 0 });
    } catch (err) {
      setErrorMessage(err.message || "Failed to load follow-ups");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const [leadsRes, clientsRes] = await Promise.all([
        getAllLeadsApi({ limit: 100 }),
        getClients({ limit: 100 }),
      ]);
      setLeads(leadsRes.data.leads || []);
      setClients(clientsRes.data.clients || []);
    } catch (e) {
      // optional
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [filterDate]);

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.followUpDate) {
      setErrorMessage("Follow-up date is required");
      return;
    }

    try {
      const payload = {
        leadId: formData.targetType === "lead" ? formData.leadId : undefined,
        clientId: formData.targetType === "client" ? formData.clientId : undefined,
        followUpDate: formData.followUpDate,
        followUpTime: formData.followUpTime,
        type: formData.type,
        notes: formData.notes,
      };

      await createFollowUpApi(payload);
      setSuccessMessage("Follow-up scheduled successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setCreateModal({ isOpen: false });
      fetchFollowUps();
    } catch (err) {
      setErrorMessage(err.message || "Failed to schedule follow-up");
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeModal.followUp) return;

    try {
      await updateFollowUpApi(completeModal.followUp._id, {
        status: "Completed",
        outcome: completeModal.outcome,
        createNextFollowUp: !!completeModal.nextDate,
        nextFollowUpDate: completeModal.nextDate || undefined,
      });

      setSuccessMessage("Follow-up marked as Completed!");
      setTimeout(() => setSuccessMessage(""), 4000);
      setCompleteModal({ isOpen: false, followUp: null, outcome: "", nextDate: "" });
      fetchFollowUps();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update follow-up");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this follow-up?")) return;
    try {
      await deleteFollowUpApi(id);
      setSuccessMessage("Follow-up deleted");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchFollowUps();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete follow-up");
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
              Follow-ups Management
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Schedule calls, meetings, and updates for prospective leads and active clients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModal({ isOpen: true })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          Schedule Follow-up
        </button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilterDate("today")}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition shadow-xs ${
            filterDate === "today" ? "border-blue-600 bg-blue-50/70" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Today's Follow-ups</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{stats.today}</h3>
          </div>
          <CalendarCheck className="h-8 w-8 text-blue-600" />
        </button>

        <button
          type="button"
          onClick={() => setFilterDate("upcoming")}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition shadow-xs ${
            filterDate === "upcoming" ? "border-teal-600 bg-teal-50/70" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Upcoming</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{stats.upcoming}</h3>
          </div>
          <CalendarDays className="h-8 w-8 text-teal-600" />
        </button>

        <button
          type="button"
          onClick={() => setFilterDate("overdue")}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition shadow-xs ${
            filterDate === "overdue" ? "border-rose-600 bg-rose-50/70" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-extrabold text-rose-700 uppercase">Overdue</p>
            <h3 className="mt-1 text-2xl font-black text-rose-950">{stats.overdue}</h3>
          </div>
          <Clock className="h-8 w-8 text-rose-600" />
        </button>

        <button
          type="button"
          onClick={() => setFilterDate("all")}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition shadow-xs ${
            filterDate === "all" ? "border-purple-600 bg-purple-50/70" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Total Pending</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{stats.pending}</h3>
          </div>
          <CheckCircle2 className="h-8 w-8 text-purple-600" />
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : followUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarCheck className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-base font-extrabold text-slate-700">
              No follow-ups found
            </p>
            <p className="text-xs font-semibold text-slate-400">
              Click "Schedule Follow-up" above to create an appointment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Target (Lead/Client)</th>
                  <th className="px-5 py-4">Scheduled Date & Time</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Notes</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followUps.map((item) => {
                  const targetName = item.leadId?.leadName || item.clientId?.clientName || item.clientId?.companyName || "N/A";
                  const targetSub = item.leadId ? `Lead (${item.leadId.companyName || "Personal"})` : `Client (${item.clientId?.companyName || "Client"})`;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-extrabold text-slate-900">{targetName}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{targetSub}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {formatDate(item.followUpDate)} • {item.followUpTime}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ring-1 ${
                            typeBadges[item.type] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate" title={item.notes}>
                        {item.notes || "No notes"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ${
                            item.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.status !== "Completed" && (
                            <button
                              type="button"
                              onClick={() => setCompleteModal({ isOpen: true, followUp: item, outcome: "", nextDate: "" })}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-emerald-700"
                            >
                              Mark Completed
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg border border-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">Schedule Follow-up</h3>
              <button
                type="button"
                onClick={() => setCreateModal({ isOpen: false })}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Target Type</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetType: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="lead">Lead</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {formData.targetType === "lead" ? (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Select Lead *</label>
                  <select
                    required
                    value={formData.leadId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leadId: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="">Select a Lead...</option>
                    {leads.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.leadName} ({l.companyName || l.phone})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Select Client *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="">Select a Client...</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.companyName || c.clientName} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.followUpDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={formData.followUpTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, followUpTime: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Visit">Visit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Purpose or agenda for the follow-up..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModal({ isOpen: false })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Completed Modal */}
      {completeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">Complete Follow-up</h3>
              <button
                type="button"
                onClick={() => setCompleteModal({ isOpen: false, followUp: null, outcome: "", nextDate: "" })}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700">Follow-up Outcome / Remarks *</label>
                <textarea
                  rows={3}
                  required
                  value={completeModal.outcome}
                  onChange={(e) => setCompleteModal((prev) => ({ ...prev, outcome: e.target.value }))}
                  placeholder="Record call summary, client feedback, or next step agreement..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Schedule Next Follow-up (Optional)</label>
                <input
                  type="date"
                  value={completeModal.nextDate}
                  onChange={(e) => setCompleteModal((prev) => ({ ...prev, nextDate: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCompleteModal({ isOpen: false, followUp: null, outcome: "", nextDate: "" })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminFollowUps;
