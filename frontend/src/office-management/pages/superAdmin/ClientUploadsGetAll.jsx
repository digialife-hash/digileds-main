import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  FileSpreadsheet,
  File,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  HardDrive,
  FolderOpen,
  X,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Copy,
  Check,
  Trash2,
  Eye,
  AlertTriangle,
  Play,
  Info,
} from "lucide-react";
import { getOfficeApiBaseUrl } from "../../utils/urlUtils";

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/
// fileUrl 
const API_BASE_URL = getOfficeApiBaseUrl();

const ADMIN_DOCUMENT_API = `${API_BASE_URL}/adminDocument`;
const UPLOADS_API = `${ADMIN_DOCUMENT_API}/All_Client/uploads`;
const CLIENT_DOCUMENT_API = `${ADMIN_DOCUMENT_API}/All_Client`;

/*
|--------------------------------------------------------------------------
| Helpers (unchanged logic)
|--------------------------------------------------------------------------
*/

const formatBytes = (bytes = 0) => {
  const value = Number(bytes) || 0;
  if (value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getFileType = (file = {}) => {
  const format = String(file.format || file.fileType || "").toLowerCase().replace(".", "");
  const resourceType = String(file.resourceType || "").toLowerCase();
  const mimeType = String(file.mimeType || file.mimetype || "").toLowerCase();

  if (
    resourceType === "image" ||
    mimeType.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "bmp", "ico", "tiff"].includes(format)
  )
    return "image";

  if (
    resourceType === "video" ||
    mimeType.startsWith("video/") ||
    ["mp4", "mov", "avi", "webm", "mkv", "m4v", "3gp"].includes(format)
  )
    return "video";

  if (format === "pdf" || mimeType === "application/pdf") return "pdf";

  if (
    ["doc", "docx", "txt", "rtf", "odt"].includes(format) ||
    mimeType.includes("word") ||
    mimeType.startsWith("text/")
  )
    return "document";

  if (
    ["xls", "xlsx", "csv", "ods"].includes(format) ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  )
    return "spreadsheet";

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(format)) return "archive";

  return "file";
};

// NEW: centralised type -> visual tokens (icon, color) so every card/badge stays consistent
const typeStyles = {
  image: { icon: ImageIcon, tint: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
  video: { icon: Video, tint: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-100" },
  pdf: { icon: FileText, tint: "text-red-600", bg: "bg-red-50", ring: "ring-red-100" },
  document: { icon: FileText, tint: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
  spreadsheet: { icon: FileSpreadsheet, tint: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  archive: { icon: FileArchive, tint: "text-violet-600", bg: "bg-violet-50", ring: "ring-violet-100" },
  file: { icon: File, tint: "text-slate-500", bg: "bg-slate-100", ring: "ring-slate-200" },
};

const getFileIcon = (type, size = 20) => {
  const Icon = (typeStyles[type] || typeStyles.file).icon;
  return <Icon size={size} />;
};

const getInitials = (name = "Unknown Client") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CL";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
};

const getFileUrl = (file = {}) =>
  file.secureUrl || file.secure_url || file.fileUrl || file.fileURL || file.url || file.path || "";

const getFileName = (file = {}) =>
  file.fileName || file.originalName || file.originalname || file.name || file.filename || "Untitled file";

const getFileBytes = (file = {}) => Number(file.bytes ?? file.fileSize ?? file.size ?? 0);

const getFileDate = (file = {}) =>
  file.createdAt || file.uploadedAt || file.created_at || file.updatedAt || null;

const getClientId = (client = {}) => client.id || client._id || client.clientId || "";

const getDocumentId = (file = {}) => file.id || file._id || file.documentId || file.document_id || "";

const getFileFormat = (file = {}) => {
  const value = file.format || file.fileType || file.extension || "";
  if (!value) return getFileType(file);
  return String(value).replace(".", "").toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Copy Button
|--------------------------------------------------------------------------
*/

const CopyButton = ({ value, className = "" }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      className={`inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 ${className}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| Download Helper (unchanged logic)
|--------------------------------------------------------------------------
*/

const downloadFile = async (file) => {
  const fileUrl = getFileUrl(file);
  const fileName = getFileName(file);
  if (!fileUrl) throw new Error("File URL is unavailable.");

  try {
    const response = await fetch(fileUrl, { credentials: "include" });
    if (!response.ok) throw new Error(`Download failed with status ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
};

/*
|--------------------------------------------------------------------------
| Delete Confirmation Modal
|--------------------------------------------------------------------------
*/

const DeleteConfirmModal = ({ file, loading, onCancel, onConfirm }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete document</h3>
            <p className="text-xs text-slate-500">This can't be undone</p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-600">You're about to permanently delete:</p>
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <p title={getFileName(file)} className="truncate text-sm font-bold text-red-800">
              {getFileName(file)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| File Preview Modal
|--------------------------------------------------------------------------
*/

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const type = getFileType(file);
  const fileUrl = getFileUrl(file);
  const fileName = getFileName(file);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              {getFileIcon(type, 20)}
            </div>
            <div className="min-w-0">
              <h3 title={fileName} className="truncate text-sm font-bold text-slate-900">
                {fileName}
              </h3>
              <p className="text-xs text-slate-500">
                {getFileFormat(file)} · {formatBytes(getFileBytes(file))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                <ExternalLink size={14} />
                Open
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-950 p-3 sm:min-h-[400px] sm:p-4">
          {!fileUrl ? (
            <div className="text-center text-white">
              <File size={44} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold">File URL unavailable</p>
            </div>
          ) : type === "image" ? (
            <img src={fileUrl} alt={fileName} className="max-h-[70vh] max-w-full rounded-lg object-contain sm:max-h-[78vh]" />
          ) : type === "video" ? (
            <video src={fileUrl} controls className="max-h-[70vh] max-w-full rounded-lg sm:max-h-[78vh]">
              Your browser does not support video playback.
            </video>
          ) : type === "pdf" ? (
            <iframe src={fileUrl} title={fileName} className="h-[70vh] w-full rounded-lg bg-white sm:h-[78vh]" />
          ) : (
            <div className="max-w-md text-center text-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 sm:h-20 sm:w-20">
                {getFileIcon(type, 34)}
              </div>
              <h3 className="mt-5 text-base font-bold sm:text-lg">Preview unavailable</h3>
              <p className="mt-2 text-sm text-slate-300">This file type can't be previewed directly.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900"
              >
                <ExternalLink size={16} />
                Open file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| File Card
|--------------------------------------------------------------------------
*/

const FileCard = ({ file = {}, onDelete, deletingId, onPreview, onDownload }) => {
  const type = getFileType(file);
  const style = typeStyles[type] || typeStyles.file;
  const fileUrl = getFileUrl(file);
  const fileName = getFileName(file);
  const bytes = getFileBytes(file);
  const createdAt = getFileDate(file);
  const documentId = getDocumentId(file);

  const isImage = type === "image";
  const isVideo = type === "video";
  const isPdf = type === "pdf";
  const isDeleting = deletingId && documentId && String(deletingId) === String(documentId);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
      {/* Preview */}
      <div className="relative flex h-36 shrink-0 items-center justify-center overflow-hidden bg-slate-100 sm:h-40">
        {isImage && fileUrl ? (
          <button type="button" onClick={() => onPreview(file)} className="h-full w-full" title="Preview image">
            <img
              src={fileUrl}
              alt={fileName}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          </button>
        ) : isVideo && fileUrl ? (
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="relative flex h-full w-full items-center justify-center bg-slate-900"
            title="Preview video"
          >
            <Video size={40} className="absolute text-white/15" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition group-hover:scale-110">
              <Play size={19} fill="currentColor" />
            </div>
          </button>
        ) : isPdf && fileUrl ? (
          <button
            type="button"
            onClick={() => onPreview(file)}
            className={`flex h-full w-full flex-col items-center justify-center gap-2.5 ${style.bg} ${style.tint}`}
            title="Preview PDF"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
              <FileText size={28} />
            </div>
            <span className="text-[11px] font-bold">PDF document</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => (fileUrl ? onPreview(file) : undefined)}
            disabled={!fileUrl}
            className="flex h-full w-full items-center justify-center disabled:cursor-default"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ${style.tint}`}>
              {getFileIcon(type, 26)}
            </div>
          </button>
        )}

        <div className="absolute left-2.5 top-2.5 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          {getFileFormat(file)}
        </div>

        {fileUrl && (
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="absolute right-2.5 top-2.5 rounded-md bg-white/95 p-1.5 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-white"
            title="Preview"
          >
            <Eye size={14} />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex min-w-0 items-start gap-1">
          <p title={fileName} className="min-w-0 flex-1 truncate text-sm font-bold leading-tight text-slate-900">
            {fileName}
          </p>
          <CopyButton value={fileName} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{formatBytes(bytes)}</span>
          <span className="text-slate-300">·</span>
          <span title={formatDate(createdAt)} className="truncate">{formatDate(createdAt)}</span>
        </div>

        {file.documentType && (
          <span className={`mt-2 inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${style.bg} ${style.tint}`}>
            {file.documentType}
          </span>
        )}

        {/* Actions */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-1">
          {fileUrl ? (
            <>
              <button
                type="button"
                onClick={() => onPreview(file)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <Eye size={13} />
                View
              </button>
              <button
                type="button"
                onClick={() => onDownload(file)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={13} />
                Save
              </button>
            </>
          ) : (
            <div className="col-span-2 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-400">
              File URL unavailable
            </div>
          )}

          {documentId ? (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(file)}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  Delete
                </>
              )}
            </button>
          ) : (
            <div className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-400">
              <Info size={12} />
              No document ID
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Client Section
|--------------------------------------------------------------------------
*/

const ClientSection = ({ client, onOpen, onDelete, deletingId, onPreview, onDownload }) => {
  const [expanded, setExpanded] = useState(false);
  const files = Array.isArray(client.files) ? client.files : [];
  const visibleFiles = expanded ? files : files.slice(0, 4);
  const totalFiles = Number(client.totalFiles) || files.length;
  const totalBytes =
    Number(client.totalBytes) || files.reduce((total, file) => total + getFileBytes(file), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Client Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
            {getInitials(client.clientName)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">
              {client.clientName || "Unknown client"}
            </h2>
            <p className="truncate text-sm text-slate-500">
              {client.clientEmail || "Email not available"}
            </p>
            {client.companyName && (
              <p className="truncate text-xs font-medium text-slate-400">{client.companyName}</p>
            )}
            {client.clientId && (
              <div className="mt-0.5 flex items-center gap-1">
                <p className="truncate text-[11px] text-slate-400">ID: {client.clientId}</p>
                <CopyButton value={client.clientId} />
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-bold text-slate-900">{totalFiles}</p>
              <p className="text-[11px] font-medium text-slate-400">files</p>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-center">
              <p className="font-bold text-slate-900">{formatBytes(totalBytes)}</p>
              <p className="text-[11px] font-medium text-slate-400">storage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpen(client)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Details
          </button>
        </div>
      </div>

      {/* Files */}
      {files.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 p-4 xs:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
            {visibleFiles.map((file, index) => (
              <FileCard
                key={getDocumentId(file) || file.publicId || `${getFileName(file)}-${index}`}
                file={file}
                onDelete={onDelete}
                deletingId={deletingId}
                onPreview={onPreview}
                onDownload={onDownload}
              />
            ))}
          </div>

          {files.length > 4 && (
            <div className="border-t border-slate-100 p-3 text-center">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                {expanded ? "Show less" : `Show all ${files.length} files`}
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-sm text-slate-400">No files found.</div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Client Details Modal
|--------------------------------------------------------------------------
*/

const ClientModal = ({ client, onClose, onDelete, deletingId, onPreview, onDownload }) => {
  if (!client) return null;

  const files = Array.isArray(client.files) ? client.files : [];
  const totalFiles = Number(client.totalFiles) || files.length;
  const totalBytes =
    Number(client.totalBytes) || files.reduce((total, file) => total + getFileBytes(file), 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex h-full w-full max-w-7xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700">
              {getInitials(client.clientName)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">
                {client.clientName || "Unknown client"}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {client.clientEmail || "Email not available"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Client information */}
        <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl bg-white p-3">
              <Users size={17} className="shrink-0 text-indigo-600" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Files</p>
                <p className="font-bold text-slate-900">{totalFiles}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-3">
              <HardDrive size={17} className="shrink-0 text-violet-600" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Storage</p>
                <p className="font-bold text-slate-900">{formatBytes(totalBytes)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-3">
              <Building2 size={17} className="shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Company</p>
                <p className="truncate font-bold text-slate-900">{client.companyName || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-3">
              <CalendarDays size={17} className="shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Latest upload</p>
                <p className="truncate font-bold text-slate-900">{formatDate(client.latestUpload)}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {client.clientEmail && (
              <a
                href={`mailto:${client.clientEmail}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Mail size={13} />
                {client.clientEmail}
              </a>
            )}
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Phone size={13} />
                {client.phone}
              </a>
            )}
            {client.clientId && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700">
                Client ID:
                <span className="max-w-[220px] truncate">{client.clientId}</span>
                <CopyButton value={client.clientId} />
              </div>
            )}
          </div>
        </div>

        {/* Files */}
        <div className="overflow-y-auto p-4 sm:p-5">
          {files.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {files.map((file, index) => (
                <FileCard
                  key={getDocumentId(file) || file.publicId || `${getFileName(file)}-${index}`}
                  file={file}
                  onDelete={onDelete}
                  deletingId={deletingId}
                  onPreview={onPreview}
                  onDownload={onDownload}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              No files found for this client.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function ClientUploadsGetAll() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [selectedClient, setSelectedClient] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [, setDownloadingId] = useState(null);

  const loadUploads = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(UPLOADS_API, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }
      if (data?.success === false) {
        throw new Error(data?.message || "Unable to load client uploads");
      }

      const clientList = Array.isArray(data?.clients) ? data.clients : [];

      const normalizedClients = clientList.map((client) => {
        const files = Array.isArray(client.files) ? client.files : [];
        const calculatedBytes = files.reduce((total, file) => total + getFileBytes(file), 0);
        const latestFromFiles = files.reduce((latest, file) => {
          const current = getFileDate(file);
          if (!current) return latest;
          if (!latest) return current;
          return new Date(current).getTime() > new Date(latest).getTime() ? current : latest;
        }, null);

        return {
          ...client,
          id: client.id || client._id || client.clientId,
          clientId: client.clientId || client.id || client._id || "",
          files,
          totalFiles: Number(client.totalFiles) || files.length,
          totalBytes: Number(client.totalBytes) || calculatedBytes,
          latestUpload: client.latestUpload || latestFromFiles || null,
        };
      });

      setClients(normalizedClients);
    } catch (err) {
      console.error("Client uploads error:", err);
      setError(err?.message || "Unable to load client uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const handleDeleteDocument = async () => {
    if (!deleteFile) return;

    const documentId = getDocumentId(deleteFile);
    if (!documentId) {
      setError("Document ID is missing. Cannot delete this document.");
      setDeleteFile(null);
      return;
    }

    try {
      setDeletingId(String(documentId));
      setError("");

      const response = await fetch(`${CLIENT_DOCUMENT_API}/${documentId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Delete failed with status ${response.status}`);
      }
      if (data?.success === false) {
        throw new Error(data?.message || "Unable to delete document");
      }

      setDeleteFile(null);

      if (previewFile && String(getDocumentId(previewFile)) === String(documentId)) {
        setPreviewFile(null);
      }

      await loadUploads();
      setSelectedClient(null);
    } catch (err) {
      console.error("Delete document error:", err);
      setError(err?.message || "Unable to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (file) => {
    const documentId = getDocumentId(file);
    try {
      setDownloadingId(documentId ? String(documentId) : getFileName(file));
      await downloadFile(file);
    } catch (err) {
      console.error("Download error:", err);
      setError(err?.message || "Unable to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  const allFiles = useMemo(
    () => clients.flatMap((client) => (Array.isArray(client.files) ? client.files : [])),
    [clients]
  );

  const stats = useMemo(() => {
    const totalStorage = allFiles.reduce((total, file) => total + getFileBytes(file), 0);
    return {
      clients: clients.length,
      files: allFiles.length,
      storage: totalStorage,
      images: allFiles.filter((file) => getFileType(file) === "image").length,
      videos: allFiles.filter((file) => getFileType(file) === "video").length,
      pdfs: allFiles.filter((file) => getFileType(file) === "pdf").length,
    };
  }, [clients, allFiles]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = clients.filter((client) => {
      if (!query) return true;

      const clientName = String(client.clientName || "").toLowerCase();
      const clientEmail = String(client.clientEmail || "").toLowerCase();
      const clientId = String(client.clientId || "").toLowerCase();
      const companyName = String(client.companyName || "").toLowerCase();
      const files = Array.isArray(client.files) ? client.files : [];

      const fileMatch = files.some(
        (file) =>
          getFileName(file).toLowerCase().includes(query) ||
          String(file.documentType || "").toLowerCase().includes(query) ||
          String(file.format || "").toLowerCase().includes(query)
      );

      return (
        clientName.includes(query) ||
        clientEmail.includes(query) ||
        clientId.includes(query) ||
        companyName.includes(query) ||
        fileMatch
      );
    });

    if (filter !== "all") {
      result = result.filter((client) => client.files?.some((file) => getFileType(file) === filter));
    }

    result = [...result];

    result.sort((a, b) => {
      if (sort === "files") return Number(b.totalFiles) - Number(a.totalFiles);
      if (sort === "storage") return Number(b.totalBytes) - Number(a.totalBytes);
      if (sort === "name")
        return String(a.clientName || "").localeCompare(String(b.clientName || ""));
      return new Date(b.latestUpload || 0).getTime() - new Date(a.latestUpload || 0).getTime();
    });

    return result;
  }, [clients, search, filter, sort]);

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSort("latest");
  };

  const statItems = [
    { key: "clients", label: "Clients", value: stats.clients, icon: Users, tint: "text-indigo-600", bg: "bg-indigo-50" },
    { key: "files", label: "Files", value: stats.files, icon: FolderOpen, tint: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "storage", label: "Storage", value: formatBytes(stats.storage), icon: HardDrive, tint: "text-violet-600", bg: "bg-violet-50" },
    { key: "images", label: "Images", value: stats.images, icon: ImageIcon, tint: "text-amber-600", bg: "bg-amber-50" },
    { key: "videos", label: "Videos", value: stats.videos, icon: Video, tint: "text-rose-600", bg: "bg-rose-50" },
    { key: "pdfs", label: "PDFs", value: stats.pdfs, icon: FileText, tint: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Client uploads
              </h1>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                Admin
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              View, download and manage every document your clients have uploaded.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUploads}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadUploads}
              className="self-start rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm hover:bg-red-100 sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stat rail — single strip instead of 6 duplicate cards, scrolls on mobile */}
        <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex min-w-max gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm sm:min-w-0 sm:grid sm:grid-cols-3 lg:grid-cols-6">
            {statItems.map(({ key, label, value, icon: Icon, tint, bg }) => (
              <div key={key} className="min-w-[140px] flex-1 bg-white px-4 py-4 sm:min-w-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${tint}`}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-400">{label}</p>
                    <p className="truncate text-lg font-bold text-slate-950">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search / Filter */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search client, email, company, ID or file name..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 xl:flex xl:shrink-0">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All files</option>
                <option value="image">Images</option>
                <option value="pdf">PDF</option>
                <option value="document">Documents</option>
                <option value="spreadsheet">Spreadsheets</option>
                <option value="video">Videos</option>
                <option value="archive">Archives</option>
              </select>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="latest">Latest upload</option>
                <option value="files">Most files</option>
                <option value="storage">Largest storage</option>
                <option value="name">Client name</option>
              </select>

              {(search || filter !== "all" || sort !== "latest") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 xl:col-span-1"
                >
                  <X size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredClients.length}</span>{" "}
              client{filteredClients.length === 1 ? "" : "s"}
            </p>
            <p className="text-xs font-medium text-slate-400">
              {stats.files} total files · {formatBytes(stats.storage)} total storage
            </p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-xl bg-slate-200/70" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:py-20">
            <FolderOpen size={38} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">No uploads found</h2>
            <p className="mt-1 text-sm text-slate-500">
              {search || filter !== "all"
                ? "Try another search or filter."
                : "No client uploads are available yet."}
            </p>
            {(search || filter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredClients.map((client, index) => (
              <ClientSection
                key={getClientId(client) || index}
                client={client}
                onOpen={setSelectedClient}
                onDelete={setDeleteFile}
                deletingId={deletingId}
                onPreview={setPreviewFile}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onDelete={setDeleteFile}
          deletingId={deletingId}
          onPreview={setPreviewFile}
          onDownload={handleDownload}
        />

        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

        <DeleteConfirmModal
          file={deleteFile}
          loading={deletingId !== null}
          onCancel={() => setDeleteFile(null)}
          onConfirm={handleDeleteDocument}
        />
      </div>
    </div>
  );
}