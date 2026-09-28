import React, { useState } from "react";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  uploadAttachmentsApi,
  deleteAttachmentApi,
} from "../../services/referralClientService";
import { useAuth } from "../../context/authStore";
import { resolveFileUrl } from "../../utils/urlUtils";

const ReferralAttachmentsList = ({
  referralId,
  attachments = [],
  onRefresh,
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      files.forEach((f) => formData.append("attachments", f));

      const res = await uploadAttachmentsApi(referralId, formData);
      if (res.success) {
        toast.success("Attachment(s) uploaded successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload attachment");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm("Delete this attachment?")) return;
    try {
      const res = await deleteAttachmentApi(referralId, attachmentId);
      if (res.success) {
        toast.success("Attachment deleted");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete attachment");
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase();
    if (["jpg", "jpeg", "png"].includes(type)) {
      return <ImageIcon className="h-5 w-5 text-emerald-600" />;
    }
    if (type === "pdf") {
      return <FileText className="h-5 w-5 text-rose-600" />;
    }
    return <FileCode className="h-5 w-5 text-blue-600" />;
  };

  const isImage = (fileType) =>
    ["jpg", "jpeg", "png"].includes(fileType?.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <FileText className="h-4 w-4 text-blue-600" /> Attached Documents & Files ({attachments.length})
        </h3>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700">
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span>Upload Files</span>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {attachments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
          No files attached to this referral yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((file) => {
            const canDelete =
              user?.role === "super_admin" ||
              file.uploadedBy?._id?.toString() === user?._id?.toString();

            const fileSizeFormatted = file.fileSize
              ? (file.fileSize / 1024).toFixed(1) + " KB"
              : "N/A";

            return (
              <div
                key={file._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-bold text-slate-900"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {fileSizeFormatted} • {file.fileType?.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      By {file.uploadedBy?.name || "User"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    {isImage(file.fileType) && (
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3 w-3" /> Preview
                      </button>
                    )}
                    <a
                      href={resolveFileUrl(file.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(file._id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-white p-2 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
              <span className="text-xs font-bold text-slate-900">
                {previewFile.originalName}
              </span>
              <button
                onClick={() => setPreviewFile(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-center p-4">
              <img
                src={resolveFileUrl(previewFile.filePath)}
                alt={previewFile.originalName}
                className="max-h-[75vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralAttachmentsList;
