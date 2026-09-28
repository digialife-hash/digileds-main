import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Plus,
  Loader2,
  FolderCheck,
  FileCheck,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  RefreshCw,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getPartnerCompanyDocumentsAdminApi,
  uploadPartnerCompanyDocumentsApi,
  updatePartnerCompanyDocumentAdminApi,
  deletePartnerCompanyDocumentAdminApi,
  downloadPartnerCompanyDocumentApi,
} from "../../services/adminPartnerService";

const categories = [
  "Appointment Letter",
  "Agreement",
  "Offer Letter",
  "NDA",
  "Training Manual",
  "Company Policies",
  "Welcome Kit",
  "Commission Policy",
  "Product Brochure",
  "General",
];

const formatFileSize = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const canPreview = (ext = "", mime = "") => {
  const e = ext.toLowerCase().replace(".", "");
  const m = mime.toLowerCase();
  return (
    ["jpg", "jpeg", "png", "webp", "svg"].includes(e) ||
    m.startsWith("image/") ||
    e === "pdf" ||
    m.includes("pdf")
  );
};

const CompanyDocumentsManagerModal = ({ isOpen, onClose, partner }) => {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [actionDocId, setActionDocId] = useState("");

  // Upload Form State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Agreement");
  const [version, setVersion] = useState("1.0");

  // Preview & Edit Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Agreement");
  const [editVersion, setEditVersion] = useState("1.0");
  const [replaceFile, setReplaceFile] = useState(null);

  const partnerId = partner?._id;

  useEffect(() => {
    if (isOpen && partnerId) {
      fetchDocuments();
    }
  }, [isOpen, partnerId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await getPartnerCompanyDocumentsAdminApi(partnerId);
      if (res.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch company documents");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !partner) return null;

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      toast.error("Please select at least one file to upload");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      if (title.trim()) formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("version", version);

      const res = await uploadPartnerCompanyDocumentsApi(partnerId, formData);
      if (res.success) {
        toast.success(res.message || "Company document(s) uploaded successfully");
        setSelectedFiles([]);
        setTitle("");
        setDescription("");
        setCategory("Agreement");
        setVersion("1.0");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchDocuments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setActionDocId(doc._id || doc.id);
      await downloadPartnerCompanyDocumentApi(doc._id || doc.id, doc.original_name || doc.originalName);
      toast.success("Download started");
    } catch (err) {
      toast.error("Download failed");
    } finally {
      setActionDocId("");
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setEditTitle(doc.title || "");
    setEditDescription(doc.description || "");
    setEditCategory(doc.category || "General");
    setEditVersion(doc.version || "1.0");
    setReplaceFile(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;

    try {
      setActionDocId(editingDoc._id || editingDoc.id);
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDescription.trim());
      formData.append("category", editCategory);
      formData.append("version", editVersion);

      if (replaceFile) {
        formData.append("file", replaceFile);
      }

      const res = await updatePartnerCompanyDocumentAdminApi(editingDoc._id || editingDoc.id, formData);
      if (res.success) {
        toast.success("Company document updated successfully");
        setEditingDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update document");
    } finally {
      setActionDocId("");
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this company document?")) return;

    try {
      setActionDocId(docId);
      const res = await deletePartnerCompanyDocumentAdminApi(docId);
      if (res.success) {
        toast.success("Company document deleted");
        fetchDocuments();
      }
    } catch (err) {
      toast.error("Failed to delete company document");
    } finally {
      setActionDocId("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <FolderCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Company Documents — {partner.name || partner.userId?.name}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Partner ID: <span className="font-mono font-bold text-blue-600">{partner.referralCode}</span> • Official Agreements, SOPs & Policies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Form Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              Upload New Official Document
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Document Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Document Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Partner Agreement 2026"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Version No.</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. 1.0"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief note for the referral partner..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition">
                  <Upload className="h-4 w-4" />
                  <span>Choose File(s)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedFiles.length === 0
                      ? "No file chosen"
                      : `${selectedFiles.length} file(s) selected`}
                  </span>

                  <button
                    type="submit"
                    disabled={isUploading || selectedFiles.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span>Upload Document</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Documents List Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Documents ({documents.length})
            </h3>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                <span className="mt-2 block text-xs">Loading company documents...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-600">No Company Documents Uploaded</p>
                <p className="text-[11px] text-slate-400">Upload agreement, appointment letter or policy files above.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc) => {
                  const origName = doc.original_name || doc.originalName || "File";
                  const ext = doc.extension || "";
                  const size = doc.file_size || doc.fileSize || 0;
                  const canPrev = canPreview(ext, doc.mime_type || doc.mimeType);
                  const isBusy = actionDocId === (doc._id || doc.id);

                  return (
                    <div
                      key={doc._id || doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-300 transition"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {doc.title || origName}
                            </h4>
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                              {doc.category || "General"}
                            </span>
                            {doc.version && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                                v{doc.version}
                              </span>
                            )}
                          </div>

                          {doc.description && (
                            <p className="text-[11px] text-slate-500 truncate">{doc.description}</p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <span>{origName}</span>
                            <span>•</span>
                            <span>{formatFileSize(size)}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploaded_at || doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 shrink-0">
                        {canPrev && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => openEditModal(doc)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit Document Info"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(doc._id || doc.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Document Details</h3>
              <button onClick={() => setEditingDoc(null)} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Version</label>
                  <input
                    type="text"
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Replace Physical File (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(actionDocId)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionDocId ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewDoc.title || previewDoc.original_name}</h3>
                <span className="text-xs text-slate-500 font-mono">{previewDoc.original_name || previewDoc.originalName}</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-900 flex items-center justify-center min-h-[400px]">
              {(previewDoc.extension || "").toLowerCase().includes("pdf") ||
              (previewDoc.mime_type || previewDoc.mimeType || "").includes("pdf") ? (
                <iframe
                  src={previewDoc.file_path || previewDoc.filePath}
                  title="PDF Preview"
                  className="h-[600px] w-full rounded-xl border-0"
                />
              ) : (
                <img
                  src={previewDoc.file_path || previewDoc.filePath}
                  alt={previewDoc.title || "Preview"}
                  className="max-h-[600px] max-w-full object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDocumentsManagerModal;
