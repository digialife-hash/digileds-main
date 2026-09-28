import { useEffect, useState } from "react";
import {
  Building2,
  FileCheck,
  FilePlus,
  FileText,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { getClients } from "../../services/clientService";
import { getAllLeadsApi } from "../../services/leadService";
import {
  convertQuotationApi,
  createQuotationApi,
  deleteQuotationApi,
  getAllQuotationsApi,
  updateQuotationApi,
} from "../../services/quotationService";

const quotationStatusBadges = {
  Draft: "bg-slate-100 text-slate-700 ring-slate-200",
  Sent: "bg-blue-50 text-blue-700 ring-blue-100",
  Accepted: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-100",
  Expired: "bg-amber-50 text-amber-700 ring-amber-100",
  Converted: "bg-purple-50 text-purple-700 ring-purple-100",
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const SuperAdminQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [createModal, setCreateModal] = useState({ isOpen: false });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, quotation: null });

  const [formData, setFormData] = useState({
    targetType: "client",
    clientId: "",
    leadId: "",
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    tax: 18,
    discount: 0,
    termsAndConditions: "1. 50% Advance Payment on order confirmation.\n2. Balance 50% on project completion.\n3. Taxes as applicable.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await getAllQuotationsApi({
        page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });

      setQuotations(res.data.quotations || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load quotations");
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
    fetchQuotations();
  }, [page, filters]);

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleAddItemLine = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    }));
  };

  const handleRemoveItemLine = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, val) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index], [field]: val };
      if (field === "quantity" || field === "rate") {
        const qty = Math.max(1, Number(item.quantity || 1));
        const rate = Math.max(0, Number(item.rate || 0));
        item.amount = Number((qty * rate).toFixed(2));
      }
      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  const subtotal = formData.items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxableAmount = Math.max(0, subtotal - Number(formData.discount || 0));
  const taxAmount = (taxableAmount * Number(formData.tax || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.validUntil) {
      setErrorMessage("Valid until date is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        clientId: formData.targetType === "client" ? formData.clientId : undefined,
        leadId: formData.targetType === "lead" ? formData.leadId : undefined,
        validUntil: formData.validUntil,
        items: formData.items,
        tax: Number(formData.tax || 0),
        discount: Number(formData.discount || 0),
        termsAndConditions: formData.termsAndConditions,
        status: "Draft",
      };

      await createQuotationApi(payload);
      setSuccessMessage("Quotation created successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setCreateModal({ isOpen: false });
      fetchQuotations();
    } catch (err) {
      setErrorMessage(err.message || "Failed to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateQuotationApi(id, { status });
      setSuccessMessage(`Quotation status updated to ${status}`);
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchQuotations();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update status");
    }
  };

  const handleConvertQuotation = async (id) => {
    if (!window.confirm("Convert this Quotation into a Project & Invoice?")) return;
    try {
      await convertQuotationApi(id, { createProject: true, createInvoice: true });
      setSuccessMessage("Quotation successfully converted to Project & Invoice!");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchQuotations();
    } catch (err) {
      setErrorMessage(err.message || "Failed to convert quotation");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    try {
      await deleteQuotationApi(id);
      setSuccessMessage("Quotation deleted");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchQuotations();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete quotation");
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
              Quotation Management
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Generate formal price estimates, track acceptance, and convert to projects & invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModal({ isOpen: true })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Quotation
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
            placeholder="Search quotation number or client..."
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
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Converted">Converted</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-base font-extrabold text-slate-700">
              No quotations found
            </p>
            <p className="text-xs font-semibold text-slate-400">
              Click "Create Quotation" above to draft a new price estimate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Quotation #</th>
                  <th className="px-5 py-4">Client / Lead</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Valid Until</th>
                  <th className="px-5 py-4">Total Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotations.map((qt) => {
                  const clientName = qt.clientSnapshot?.companyName || qt.clientSnapshot?.clientName || qt.clientId?.companyName || qt.leadId?.leadName || "Client";

                  return (
                    <tr key={qt._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-black text-slate-900">
                        {qt.quotationNumber}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-slate-900">{clientName}</p>
                        <p className="text-[10px] text-slate-400">{qt.clientSnapshot?.phone || ""}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {formatDate(qt.quotationDate)}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {formatDate(qt.validUntil)}
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900">
                        {formatCurrency(qt.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ring-1 ${
                            quotationStatusBadges[qt.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {qt.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ isOpen: true, quotation: qt })}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                          >
                            Print/View
                          </button>
                          {qt.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(qt._id, "Sent")}
                              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-blue-700"
                            >
                              Send
                            </button>
                          )}
                          {qt.status === "Sent" && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(qt._id, "Accepted")}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-emerald-700"
                            >
                              Mark Accepted
                            </button>
                          )}
                          {(qt.status === "Accepted" || qt.status === "Sent") && (
                            <button
                              type="button"
                              onClick={() => handleConvertQuotation(qt._id)}
                              className="rounded-lg bg-purple-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-purple-700"
                            >
                              Convert to Project/Invoice
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(qt._id)}
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

      {/* Create Quotation Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">Create New Quotation</h3>
              <button
                type="button"
                onClick={() => setCreateModal({ isOpen: false })}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">Target Type</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, targetType: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="client">Client</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>

                {formData.targetType === "client" ? (
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
                ) : (
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
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Valid Until *</label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Item Details</h4>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={14} /> Add Line Item
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Service or Item Description"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        placeholder="Rate (₹)"
                        min={0}
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="w-28 text-right font-black text-slate-900">
                      {formatCurrency(item.amount)}
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemLine(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Calculation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>GST / Tax Rate (%):</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.tax}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tax: e.target.value }))}
                    className="w-20 rounded-lg border border-slate-200 bg-white p-1 text-center font-bold text-slate-900"
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Tax Amount:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-950">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, termsAndConditions: e.target.value }))}
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
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700"
                >
                  {isSubmitting ? "Generating..." : "Generate Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print / View Modal */}
      {previewModal.isOpen && previewModal.quotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <h3 className="text-lg font-black text-slate-900">Quotation Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ isOpen: false, quotation: null })}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-blue-600">Digital Alife</h2>
                  <p className="text-xs font-bold text-slate-500">Official Quotation</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-slate-900">{previewModal.quotation.quotationNumber}</p>
                  <p className="text-xs font-semibold text-slate-500">Date: {formatDate(previewModal.quotation.quotationDate)}</p>
                  <p className="text-xs font-semibold text-slate-500">Valid Until: {formatDate(previewModal.quotation.validUntil)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase">Prepared For:</p>
                  <p className="mt-1 font-black text-slate-900">{previewModal.quotation.clientSnapshot?.companyName || previewModal.quotation.clientSnapshot?.clientName}</p>
                  <p className="text-xs font-medium text-slate-600">{previewModal.quotation.clientSnapshot?.phone}</p>
                  <p className="text-xs font-medium text-slate-600">{previewModal.quotation.clientSnapshot?.email}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs font-semibold text-slate-700 border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewModal.quotation.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-slate-900">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">{formatCurrency(previewModal.quotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({previewModal.quotation.tax}%):</span>
                    <span className="font-bold">{formatCurrency(previewModal.quotation.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-950">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">{formatCurrency(previewModal.quotation.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-extrabold text-slate-500 uppercase">Terms & Conditions:</p>
                <p className="mt-1 text-xs font-medium text-slate-600 whitespace-pre-line">
                  {previewModal.quotation.termsAndConditions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminQuotations;
