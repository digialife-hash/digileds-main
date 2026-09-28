import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Archive,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCode,
  FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  History,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  deleteTaskDocument,
  downloadTaskDocument,
  getTaskDocuments,
  getTaskTimeline,
  updateTaskDocument,
  uploadTaskDocuments,
} from "../../services/taskService";

const formatDateTime = (value) => {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatFileSize = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileMeta = (extension = "", mimeType = "") => {
  const ext = extension.toLowerCase().replace(".", "");
  const mime = mimeType.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext) || mime.startsWith("image/")) {
    return {
      type: "image",
      label: "IMAGE",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon: FileImage,
    };
  }

  if (ext === "pdf" || mime.includes("pdf")) {
    return {
      type: "pdf",
      label: "PDF",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: FileText,
    };
  }

  if (["doc", "docx"].includes(ext) || mime.includes("word")) {
    return {
      type: "doc",
      label: "DOC",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: FileText,
    };
  }

  if (["xls", "xlsx", "csv"].includes(ext) || mime.includes("excel") || mime.includes("csv") || mime.includes("spreadsheet")) {
    return {
      type: "spreadsheet",
      label: ext.toUpperCase(),
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: FileSpreadsheet,
    };
  }

  if (["ppt", "pptx"].includes(ext) || mime.includes("presentation") || mime.includes("powerpoint")) {
    return {
      type: "presentation",
      label: "PPT",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: FileCode,
    };
  }

  if (["zip", "rar"].includes(ext) || mime.includes("zip") || mime.includes("rar") || mime.includes("compressed")) {
    return {
      type: "archive",
      label: ext.toUpperCase(),
      color: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Archive,
    };
  }

  return {
    type: "document",
    label: ext.toUpperCase() || "FILE",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: FileIcon,
  };
};

const canPreviewFile = (extension = "", mimeType = "") => {
  const ext = extension.toLowerCase().replace(".", "");
  const mime = mimeType.toLowerCase();
  return (
    ["jpg", "jpeg", "png", "webp", "svg"].includes(ext) ||
    mime.startsWith("image/") ||
    ext === "pdf" ||
    mime.includes("pdf")
  );
};

const TaskDocumentManager = ({ taskId, taskStatus, user, onDocumentChange }) => {
  const fileInputRef = useRef(null);

  const [adminDocuments, setAdminDocuments] = useState([]);
  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadComment, setUploadComment] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [actionDocId, setActionDocId] = useState("");

  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [replaceFile, setReplaceFile] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const [activeTab, setActiveTab] = useState("documents");

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const isEmployee = user?.role === "employee";
  const isTaskCompleted = taskStatus === "completed";

  const fetchDocumentsAndTimeline = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      const [docRes, timeRes] = await Promise.all([
        getTaskDocuments(taskId),
        getTaskTimeline(taskId).catch(() => ({ data: { timeline: [] } })),
      ]);

      if (docRes?.data) {
        setAdminDocuments(docRes.data.adminAttachments || []);
        setEmployeeDocuments(docRes.data.employeeSubmissions || []);
      }

      if (timeRes?.data?.timeline) {
        setTimeline(timeRes.data.timeline);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void fetchDocumentsAndTimeline();
  }, [fetchDocumentsAndTimeline]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("Please select at least one file to upload");
      return;
    }

    if (isEmployee && isTaskCompleted) {
      toast.error("Cannot upload documents after task is marked completed");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (uploadComment.trim()) {
        formData.append("comment", uploadComment.trim());
      }

      formData.append(
        "document_type",
        isSuperAdmin ? "Admin Attachment" : "Employee Submission"
      );

      const res = await uploadTaskDocuments(taskId, formData);

      toast.success(res?.message || "Document(s) uploaded successfully");

      setSelectedFiles([]);
      setUploadComment("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      await fetchDocumentsAndTimeline();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setActionDocId(doc._id || doc.id);
      await downloadTaskDocument(doc._id || doc.id, doc.original_name || doc.originalName);
      toast.success("Download started");
    } catch (error) {
      toast.error(error.message || "Download failed");
    } finally {
      setActionDocId("");
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setEditComment(doc.comment || "");
    setReplaceFile(null);
  };

  const handleUpdateDocument = async () => {
    if (!editingDoc) return;

    try {
      setActionDocId(editingDoc._id || editingDoc.id);

      const formData = new FormData();
      formData.append("comment", editComment.trim());
      if (replaceFile) {
        formData.append("file", replaceFile);
      }

      await updateTaskDocument(editingDoc._id || editingDoc.id, formData);
      toast.success("Document updated successfully");

      setEditingDoc(null);
      setEditComment("");
      setReplaceFile(null);

      await fetchDocumentsAndTimeline();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      toast.error(error.message || "Failed to update document");
    } finally {
      setActionDocId("");
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;

    try {
      setActionDocId(deletingDoc._id || deletingDoc.id);
      await deleteTaskDocument(deletingDoc._id || deletingDoc.id);
      toast.success("Document deleted successfully");

      setDeletingDoc(null);
      await fetchDocumentsAndTimeline();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      toast.error(error.message || "Failed to delete document");
    } finally {
      setActionDocId("");
    }
  };

  const canManageDoc = (doc) => {
    if (isSuperAdmin) return true;
    if (isEmployee) {
      const uploaderId = doc.uploaded_by?._id || doc.uploaded_by || doc.uploadedBy;
      const isOwner = String(uploaderId) === String(user?._id);
      return isOwner && !isTaskCompleted;
    }
    return false;
  };

  const renderDocumentCard = (doc) => {
    const originalName = doc.original_name || doc.originalName || "File";
    const extension = doc.extension || "";
    const mimeType = doc.mime_type || doc.mimeType || "";
    const fileSize = doc.file_size || doc.fileSize || 0;
    const createdAt = doc.created_at || doc.createdAt;
    const uploader = doc.uploaded_by?.name || doc.uploaded_by?.email || "User";
    const uploaderRole = doc.user_role || doc.userRole || "User";
    const comment = doc.comment || "";
    const filePath = doc.file_path || doc.filePath;

    const meta = getFileMeta(extension, mimeType);
    const IconComp = meta.icon;
    const showPreview = canPreviewFile(extension, mimeType);
    const docId = doc._id || doc.id;
    const isBusy = actionDocId === docId;

    return (
      <div
        key={docId}
        className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-bold ${meta.color}`}
              >
                <IconComp size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h4
                  className="truncate text-sm font-bold text-slate-900"
                  title={originalName}
                >
                  {originalName}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 uppercase">
                    {meta.label}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(fileSize)}</span>
                  <span>•</span>
                  <span>{formatDateTime(createdAt)}</span>
                </div>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                ["Admin", "super_admin", "admin"].includes(uploaderRole)
                  ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                  : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
              }`}
            >
              {uploaderRole}
            </span>
          </div>

          {comment && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
              <MessageSquare size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="whitespace-pre-wrap leading-relaxed font-medium">"{comment}"</p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-100 pt-2.5">
            <span className="inline-flex items-center gap-1">
              <User size={13} className="text-slate-400" />
              {uploader}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {showPreview && (
            <button
              type="button"
              onClick={() => setPreviewDoc(doc)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={14} />
              Preview
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDownload(doc)}
            disabled={isBusy}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <Download size={14} />
            Download
          </button>

          {canManageDoc(doc) && (
            <>
              <button
                type="button"
                onClick={() => openEditModal(doc)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                title="Edit comment or replace file"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                onClick={() => setDeletingDoc(doc)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                title="Delete document"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <Paperclip className="text-blue-600" size={22} />
            Document Management & Timeline
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Two-way attachment sharing and progress deliverable submissions
          </p>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "documents"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Paperclip size={15} />
            Task Documents ({adminDocuments.length + employeeDocuments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "timeline"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <History size={15} />
            Activity Timeline ({timeline.length})
          </button>
        </div>
      </div>

      {activeTab === "documents" && (
        <>
          {/* Upload Area */}
          {(!isEmployee || !isTaskCompleted) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                <Upload size={16} className="text-blue-600" />
                Upload New {isSuperAdmin ? "Admin Attachment" : "Work Submission / Deliverable"}
              </h3>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-300 bg-slate-50/50 hover:border-slate-400"
                }`}
              >
                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <Upload size={24} />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800">
                  Drag and drop files here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 underline font-extrabold hover:text-blue-700"
                  >
                    browse files
                  </button>
                </p>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, WEBP, ZIP, RAR (Max 25MB)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.svg,.zip,.rar"
                />
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700">Selected Files ({selectedFiles.length}):</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold">{file.name}</span>
                          <span className="text-slate-500 font-mono">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Optional Comment / Remarks</span>
                      <textarea
                        value={uploadComment}
                        onChange={(e) => setUploadComment(e.target.value)}
                        rows={2}
                        placeholder="e.g., Updated sales report till July / Completed revision files"
                        className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);
                        setUploadComment("");
                      }}
                      disabled={isUploading}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Upload size={14} />
                      {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Admin Attachments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                Admin Attachments ({adminDocuments.length})
              </h3>
              <span className="text-xs font-medium text-slate-500">Requirements, SOPs, Design & Reference Files</span>
            </div>

            {adminDocuments.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {adminDocuments.map((doc) => renderDocumentCard(doc))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
                <Paperclip size={28} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-bold text-slate-700">No Admin Attachments</p>
                <p className="mt-1 text-xs text-slate-500">Requirements and reference documents uploaded by Admin will appear here.</p>
              </div>
            )}
          </div>

          {/* Section 2: Employee Submissions */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Employee Submissions & Deliverables ({employeeDocuments.length})
              </h3>
              <span className="text-xs font-medium text-slate-500">Completed Work, Progress Reports & Revision Files</span>
            </div>

            {employeeDocuments.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {employeeDocuments.map((doc) => renderDocumentCard(doc))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
                <FileCheck size={28} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-bold text-slate-700">No Submissions Yet</p>
                <p className="mt-1 text-xs text-slate-500">Work updates and deliverables submitted by employee will appear here.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Activity Timeline View */}
      {activeTab === "timeline" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-black text-slate-950 flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <Clock size={18} className="text-blue-600" />
            Task Activity & Document Timeline
          </h3>

          {timeline.length > 0 ? (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6">
              {timeline.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm">
                    {event.type === "document_upload" ? (
                      <Paperclip size={12} />
                    ) : event.type === "progress_update" ? (
                      <RefreshCw size={12} />
                    ) : event.type === "task_completed" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{event.userName}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ["Admin", "super_admin", "admin"].includes(event.userRole)
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {event.userRole}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-bold text-slate-800">{event.action}</p>

                    {event.details?.text && (
                      <p className="mt-2 text-xs font-medium text-slate-600 bg-white p-2 rounded border border-slate-200">
                        "{event.details.text}"
                      </p>
                    )}

                    {event.details?.comment && (
                      <p className="mt-2 text-xs font-medium text-slate-600 bg-white p-2 rounded border border-slate-200">
                        Comment: "{event.details.comment}"
                      </p>
                    )}

                    {event.details?.originalName && (
                      <div className="mt-2.5 flex items-center justify-between rounded border border-blue-200 bg-blue-50/60 px-2.5 py-1.5 text-xs text-blue-800">
                        <span className="font-bold truncate">{event.details.originalName}</span>
                        {event.details.documentId && (
                          <button
                            type="button"
                            onClick={() => downloadTaskDocument(event.details.documentId, event.details.originalName)}
                            className="inline-flex items-center gap-1 font-bold underline hover:text-blue-950 shrink-0"
                          >
                            <Download size={12} /> Download
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-6 text-center">No timeline activity recorded yet.</p>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-slate-500">Document Preview</p>
                <h3 className="text-lg font-black text-slate-950 truncate">
                  {previewDoc.original_name || previewDoc.originalName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-900 flex items-center justify-center min-h-[400px]">
              {(previewDoc.extension || "").toLowerCase().includes("pdf") ||
              (previewDoc.mime_type || previewDoc.mimeType || "").includes("pdf") ? (
                <iframe
                  src={previewDoc.file_path || previewDoc.filePath}
                  title="PDF Preview"
                  className="h-[600px] w-full rounded border-0"
                />
              ) : (
                <img
                  src={previewDoc.file_path || previewDoc.filePath}
                  alt={previewDoc.original_name || previewDoc.originalName}
                  className="max-h-[600px] max-w-full object-contain rounded"
                />
              )}
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 bg-slate-50 px-5 py-3">
              <span className="text-xs text-slate-500 font-medium">
                {formatFileSize(previewDoc.file_size || previewDoc.fileSize)} • Uploaded by {previewDoc.uploaded_by?.name || "User"}
              </span>
              <button
                type="button"
                onClick={() => handleDownload(previewDoc)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Replace Document Modal */}
      {editingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-950">Update Document</h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-700">Current File:</span>
                <p className="text-sm font-black text-slate-900 truncate mt-1">
                  {editingDoc.original_name || editingDoc.originalName}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Comment / Remarks</span>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Replace File (Optional)</span>
                <input
                  type="file"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.svg,.zip,.rar"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateDocument}
                disabled={Boolean(actionDocId)}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionDocId ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-950">Delete Document</h3>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 font-bold">
                {deletingDoc.original_name || deletingDoc.originalName}
              </strong>
              ? This action will permanently remove the record and the physical file.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                disabled={Boolean(actionDocId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionDocId ? "Deleting..." : "Delete File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileCheck = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

export default TaskDocumentManager;
