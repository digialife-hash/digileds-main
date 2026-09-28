import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { getEmployees } from "../../services/employeeService";
import {
  convertLeadToClientApi,
  createLeadApi,
  deleteLeadApi,
  getAllLeadsApi,
  updateLeadApi,
} from "../../services/leadService";

const leadStatusBadges = {
  New: "bg-blue-50 text-blue-700 ring-blue-100",
  Contacted: "bg-sky-50 text-sky-700 ring-sky-100",
  "Follow-up": "bg-amber-50 text-amber-700 ring-amber-100",
  Interested: "bg-purple-50 text-purple-700 ring-purple-100",
  Qualified: "bg-teal-50 text-teal-700 ring-teal-100",
  Converted: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Lost: "bg-rose-50 text-rose-700 ring-rose-100",
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
};

const SuperAdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", source: "" });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modal, setModal] = useState({ isOpen: false, mode: "create", lead: null });
  const [formData, setFormData] = useState({
    leadName: "",
    companyName: "",
    phone: "",
    email: "",
    serviceInterested: "",
    leadSource: "Direct",
    assignedEmployee: "",
    leadStatus: "New",
    expectedValue: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await getAllLeadsApi({
        page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        source: filters.source || undefined,
      });

      setLeads(res.data.leads || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesData = async () => {
    try {
      const res = await getEmployees({ limit: 100 });
      setEmployees(res.data.employees || []);
    } catch (err) {
      // optional
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, filters]);

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      leadName: "",
      companyName: "",
      phone: "",
      email: "",
      serviceInterested: "",
      leadSource: "Direct",
      assignedEmployee: "",
      leadStatus: "New",
      expectedValue: "",
      notes: "",
    });
    setModal({ isOpen: true, mode: "create", lead: null });
  };

  const handleOpenEditModal = (lead) => {
    setFormData({
      leadName: lead.leadName || "",
      companyName: lead.companyName || "",
      phone: lead.phone || "",
      email: lead.email || "",
      serviceInterested: lead.serviceInterested || "",
      leadSource: lead.leadSource || "Direct",
      assignedEmployee: lead.assignedEmployee?._id || "",
      leadStatus: lead.leadStatus || "New",
      expectedValue: lead.expectedValue || "",
      notes: lead.notes || "",
    });
    setModal({ isOpen: true, mode: "edit", lead });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leadName.trim() || !formData.phone.trim()) {
      setErrorMessage("Lead name and phone number are required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (modal.mode === "create") {
        await createLeadApi(formData);
        setSuccessMessage("Lead created successfully");
      } else {
        await updateLeadApi(modal.lead._id, formData);
        setSuccessMessage("Lead updated successfully");
      }

      setTimeout(() => setSuccessMessage(""), 4000);
      setModal({ isOpen: false, mode: "create", lead: null });
      fetchLeads();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertLead = async (leadId) => {
    if (!window.confirm("Convert this qualified lead to an active Client?")) return;
    try {
      await convertLeadToClientApi(leadId);
      setSuccessMessage("Lead successfully converted to Client!");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchLeads();
    } catch (err) {
      setErrorMessage(err.message || "Failed to convert lead");
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLeadApi(leadId);
      setSuccessMessage("Lead deleted successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchLeads();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete lead");
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
              Lead Management (CRM)
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Track inquiries, manage follow-ups, and convert leads into clients.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
        >
          <UserPlus size={16} />
          Add New Lead
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

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead name, company, phone..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
        >
          <option value="">All Lead Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Interested">Interested</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-base font-extrabold text-slate-700">
              No leads found
            </p>
            <p className="text-xs font-semibold text-slate-400">
              Click "Add New Lead" above to register a prospective client.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Lead Name</th>
                  <th className="px-5 py-4">Contact Details</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Expected Value</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Assigned To</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900">{lead.leadName}</p>
                        <p className="text-[10px] text-slate-400">{lead.companyName || "Personal"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{lead.phone}</p>
                      <p className="text-[10px] text-slate-500">{lead.email || "No email"}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {lead.serviceInterested || "General"}
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">
                      {formatCurrency(lead.expectedValue)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ring-1 ${
                          leadStatusBadges[lead.leadStatus] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {lead.leadStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {lead.assignedEmployee?.name || "Unassigned"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.leadStatus !== "Converted" && (
                          <button
                            type="button"
                            onClick={() => handleConvertLead(lead._id)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-emerald-700"
                          >
                            Convert to Client
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(lead)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead._id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Lead Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {modal.mode === "create" ? "Add New Lead" : "Edit Lead Details"}
              </h3>
              <button
                type="button"
                onClick={() => setModal({ isOpen: false, mode: "create", lead: null })}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.leadName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leadName: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Service Interested</label>
                  <input
                    type="text"
                    placeholder="e.g. Web Dev, SEO, Branding"
                    value={formData.serviceInterested}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceInterested: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Lead Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leadSource: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Direct">Direct</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Lead Status</label>
                  <select
                    value={formData.leadStatus}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leadStatus: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Interested">Interested</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Expected Value (₹)</label>
                  <input
                    type="number"
                    value={formData.expectedValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expectedValue: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Assigned Employee</label>
                <select
                  value={formData.assignedEmployee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assignedEmployee: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.department || "Employee"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Notes / Remarks</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: false, mode: "create", lead: null })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700"
                >
                  {isSubmitting ? "Saving..." : modal.mode === "create" ? "Create Lead" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLeads;
