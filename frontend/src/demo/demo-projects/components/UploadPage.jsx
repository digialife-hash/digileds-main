import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FolderOpen,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { PROJECT_TYPES, formatBytes, getUploadRelativePath } from "../utils.js";
import InlineMessage from "./InlineMessage.jsx";

function formatDuration(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

export default function UploadPage({
  uploading,
  uploadProgress,
  uploadFiles,
  projectVideo,
  setProjectVideo,
  videoStorage,
  setVideoStorage,
  uploadType,
  setUploadType,
  selectedFolderName,
  selectedFolderSize,
  uploadMessage,
  setUploadMessage,
  uploadStage,
  uploadElapsed,
  dragActive,
  setDragActive,
  fileInputRef,
  handleFileSelect,
  handleDrop,
  clearUpload,
  uploadProject,
}) {
  const statusVisible = [
    "preparing",
    "uploading",
    "processing",
    "complete",
    "error",
  ].includes(uploadStage);
  const stageTitle = {
    preparing: "Preparing your project",
    uploading: "Uploading project files",
    processing: "Processing project",
    complete: "Upload complete",
    error: "Upload needs attention",
  };
  const stageDescription = {
    preparing: "Packaging the selected files securely...",
    uploading: "Transferring files to the protected project store.",
    processing:
      "The server is indexing your project and refreshing the library.",
    complete: "Your project is now available in the project library.",
    error: "Review the error below and try again.",
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Upload a project
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Bring in a complete project folder. Generated files and secrets are
            filtered before transfer.
          </p>
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
        <div
          className={`relative overflow-hidden rounded-[24px] border-2 border-dashed p-8 text-center transition sm:p-12 ${
            dragActive
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5"
              : uploadFiles.length
                ? "border-blue-300 bg-blue-50/60 dark:border-blue-500/30 dark:bg-blue-500/5"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!uploading) setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploading) setDragActive(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setDragActive(false);
          }}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && !uploading) {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={uploading ? -1 : 0}
          aria-disabled={uploading}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-700 shadow-lg dark:bg-slate-950 dark:text-white">
            <UploadCloud size={28} />
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">
            {uploadFiles.length
              ? "Project folder selected"
              : "Drop your project folder here"}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {uploadFiles.length
              ? "You can replace the selected folder anytime before uploading."
              : "Drag and drop a complete project folder, or browse your computer."}
          </p>
          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
            <FolderOpen size={15} />
            Choose folder
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              hidden
              disabled={uploading}
              onChange={handleFileSelect}
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={12} />
              Generated files filtered
            </span>
            <span>•</span>
            <span>node_modules skipped</span>
            <span>•</span>
            <span>secrets skipped</span>
          </div>
        </div>

        {uploadFiles.length > 0 && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <FolderOpen size={19} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Ready to upload
                  </span>
                  <h3 className="mt-0.5 truncate text-base font-black text-slate-950 dark:text-white">
                    {selectedFolderName}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Everything looks good. Choose the project options below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearUpload}
                disabled={uploading}
                className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <X size={13} />
                Clear
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-950">
                <FileCheck2
                  size={17}
                  className="text-blue-600 dark:text-blue-400"
                />
                <div>
                  <strong className="block text-sm text-slate-950 dark:text-white">
                    {uploadFiles.length}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Files selected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-950">
                <FolderOpen
                  size={17}
                  className="text-violet-600 dark:text-violet-400"
                />
                <div>
                  <strong className="block text-sm text-slate-950 dark:text-white">
                    {formatBytes(selectedFolderSize)}
                  </strong>
                  <span className="text-[10px] text-slate-400">Total size</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-950">
                <ShieldCheck
                  size={17}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <div>
                  <strong className="block text-sm text-slate-950 dark:text-white">
                    Protected
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Secure transfer
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {uploadFiles.slice(0, 5).map((file) => (
                <span
                  key={`${getUploadRelativePath(file, selectedFolderName)}-${file.size}`}
                  title={getUploadRelativePath(file, selectedFolderName)}
                  className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300"
                >
                  <FileCheck2 size={11} />
                  <span className="truncate">{file.name}</span>
                </span>
              ))}
              {uploadFiles.length > 5 && (
                <span className="inline-flex items-center rounded-lg bg-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  +{uploadFiles.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            uploadProject();
          }}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                Project type
              </span>
              <select
                value={uploadType}
                onChange={(event) => setUploadType(event.target.value)}
                disabled={uploading}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                Project video
              </span>
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950">
                <input
                  type="file"
                  accept="video/*"
                  disabled={uploading}
                  onChange={(event) =>
                    setProjectVideo(event.target.files?.[0] || null)
                  }
                  className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-700 dark:file:bg-slate-900 dark:file:text-slate-300"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                Video storage
              </span>
              <select
                value={videoStorage}
                onChange={(event) => setVideoStorage(event.target.value)}
                disabled={uploading}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="local">Local folder</option>
                <option value="cloudinary">Cloudinary</option>
              </select>
            </label>
          </div>
          {projectVideo && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                  <Video size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                    {projectVideo.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatBytes(projectVideo.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProjectVideo(null)}
                disabled={uploading}
                className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600 dark:hover:bg-slate-950"
              >
                <X size={15} />
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={uploading || !uploadFiles.length}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {uploading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Uploading {uploadProgress}%
              </>
            ) : (
              <>
                <UploadCloud size={17} />
                Upload project
              </>
            )}
          </button>
        </form>

        {statusVisible && (
          <div
            className={`mt-5 rounded-3xl border p-4 ${uploadStage === "error" ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5" : uploadStage === "complete" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${uploadStage === "error" ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400" : uploadStage === "complete" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-white text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200"}`}
              >
                {uploadStage === "complete" ? (
                  <CheckCircle2 size={19} />
                ) : uploadStage === "error" ? (
                  <AlertCircle size={19} />
                ) : (
                  <LoaderCircle size={19} className="animate-spin" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">
                      {stageTitle[uploadStage]}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {stageDescription[uploadStage]}
                    </p>
                  </div>
                  <strong className="text-sm font-black text-slate-950 dark:text-white">
                    {uploadProgress}%
                  </strong>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${uploadStage === "error" ? "bg-red-500" : uploadStage === "complete" ? "bg-emerald-500" : "bg-slate-950 dark:bg-white"}`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] font-medium text-slate-400">
                  <span>{formatDuration(uploadElapsed)} elapsed</span>
                  {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                    <span>
                      Estimated{" "}
                      {formatDuration(
                        (uploadElapsed / uploadProgress) *
                          (100 - uploadProgress),
                      )}{" "}
                      remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadMessage.text && (
          <div className="mt-4">
            <InlineMessage
              variant={uploadMessage.type || "info"}
              onClose={() => setUploadMessage({ type: "", text: "" })}
            >
              {uploadMessage.text}
            </InlineMessage>
          </div>
        )}
      </div>
    </section>
  );
}
