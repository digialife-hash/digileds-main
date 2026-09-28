import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  Loader2,
  FolderCheck,
  ShieldCheck,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyCompanyDocumentsApi,
  downloadMyCompanyDocumentApi,
} from "../../services/referralPartnerService";

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

const PartnerCompanyDocumentsModal = ({ isOpen, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionDocId, setActionDocId] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMyDocuments();
    }
  }, [isOpen]);

  const fetchMyDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await getMyCompanyDocumentsApi();
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

  if (!isOpen) return null;

  const handleDownload = async (doc) => {
    try {
      setActionDocId(doc._id || doc.id);
      await downloadMyCompanyDocumentApi(doc._id || doc.id, doc.original_name || doc.originalName);
      toast.success("Download started");
    } catch (err) {
      toast.error("Download failed");
    } finally {
      setActionDocId("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <FolderCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Company Documents</h2>
              <p className="text-xs font-semibold text-slate-500">
                Official agreements, appointment letters, policies and guidelines assigned to you
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Official Documents ({documents.length})
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Official & Verified
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
              <span className="mt-2 block text-xs font-semibold">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-400">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-700">No Company Documents Assigned</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Your assigned company documents (Agreement, Appointment Letter, Policy) will appear here once uploaded by Admin.
              </p>
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
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
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
                          <p className="text-[11px] text-slate-500">{doc.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span>{origName}</span>
                          <span>•</span>
                          <span>{formatFileSize(size)}</span>
                          <span>•</span>
                          <span>Uploaded: {new Date(doc.uploaded_at || doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      {canPrev && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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

export default PartnerCompanyDocumentsModal;
