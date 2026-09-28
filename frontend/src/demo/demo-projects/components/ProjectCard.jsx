import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  FileArchive,
  Info,
  LoaderCircle,
  MoreHorizontal,
  Play,
  Settings2,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

import { PROJECT_TYPES, SITE_API, getProjectType } from "../utils.js";
import InlineMessage from "./InlineMessage.jsx";

/* =========================================================
   HELPERS
========================================================= */

function normaliseVideoPath(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function buildVideoCandidates(project) {
  if (!project?.id) return [];

  const video = project.video || {};
  const candidates = [];

  const possibleValues = [
    video.url,
    video.videoUrl,
    video.publicUrl,
    video.path,
    video.filePath,
    video.location,
    video.src,
  ];

  for (const rawValue of possibleValues) {
    const value = normaliseVideoPath(rawValue);

    if (!value) continue;

    if (/^https?:\/\//i.test(value)) {
      candidates.push(value);
    } else if (value.startsWith("/")) {
      candidates.push(`${SITE_API}${value}`);
    } else {
      candidates.push(`${SITE_API}/${value.replace(/^\/+/, "")}`);
    }
  }

  candidates.push(
    `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(
      project.id,
    )}/video`,
  );

  return [...new Set(candidates.filter(Boolean))];
}

/* =========================================================
   VIDEO PLAYER
========================================================= */

function ProjectVideo({ project, projectVideoUrl }) {
  const candidates = useMemo(() => {
    const all = buildVideoCandidates(project);

    if (projectVideoUrl && !all.includes(projectVideoUrl)) {
      return [projectVideoUrl, ...all];
    }

    return all;
  }, [project, projectVideoUrl]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setLoaded(false);
    setFailed(false);
  }, [project.id, projectVideoUrl]);

  const currentSource = candidates[sourceIndex];

  if (!currentSource || failed) {
    return (
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-950">
            <Video size={20} className="text-slate-400" />
          </div>

          <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            Video unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-black">
      {!loaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950">
          <LoaderCircle size={22} className="animate-spin text-white/70" />
          <span className="mt-2 text-[10px] font-semibold text-white/50">
            Loading preview...
          </span>
        </div>
      )}

      <video
        key={currentSource}
        src={currentSource}
        controls
        preload="metadata"
        playsInline
        className={`h-full w-full object-contain transition-opacity ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadedMetadata={() => setLoaded(true)}
        onCanPlay={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);

          if (sourceIndex < candidates.length - 1) {
            setSourceIndex((value) => value + 1);
          } else {
            setFailed(true);
          }
        }}
      />

      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
        Project Video
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  open,
  title,
  description,
  icon,
  children,
  onClose,
  wide = false,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 ${
          wide ? "max-w-lg" : "max-w-md"
        }`}
      >
        {/* modal header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-950 dark:text-white">
                {title}
              </h3>

              {description && (
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-extrabold transition ${
        danger
          ? "border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-100 dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-400"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

/* =========================================================
   MAIN CARD
========================================================= */

export default function ProjectCard({
  project,
  onCreateDemo,
  creating,
  onChangeType,
  onDownload,
  onDelete,
  onReplaceVideo,
  onDeleteVideo,
  busy,
  error,
  confirming,
  setDeleteProjectId,
  getProjectVideoUrl,
}) {
  const [durationMinutes, setDurationMinutes] = useState(60);

  const [modal, setModal] = useState(null);

  const type = getProjectType(project.type);
  const videoUrl = getProjectVideoUrl(project);

  const hasVideo = Boolean(project.video || videoUrl);

  const videoBusy = busy === "video";
  const deleteBusy = busy === "delete";

  const typeClass =
    type.className ||
    "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";

  const closeModal = () => {
    if (!busy) {
      setModal(null);
    }
  };

  const openDelete = () => {
    setModal("delete");
    setDeleteProjectId(project.id);
  };

  const closeDelete = () => {
    setModal(null);
    setDeleteProjectId("");
  };

  return (
    <>
      {/* ===================================================
          COMPACT PROJECT CARD
      =================================================== */}

      <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
        {/* header */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${typeClass}`}
            >
              {type.icon || <Code2 size={19} />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="max-w-[140px] truncate rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {type.label}
                </span>

                {project.hasDockerfile && (
                  <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Check size={10} />
                    Docker
                  </span>
                )}
              </div>

              <h3 className="mt-2 truncate text-[15px] font-black tracking-tight text-slate-950 dark:text-white">
                {project.name}
              </h3>

              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                {project.id}
              </p>
            </div>
          </div>
        </div>

        {/* video */}
        <div className="border-y border-slate-100 dark:border-slate-900">
          {hasVideo ? (
            <ProjectVideo project={project} projectVideoUrl={videoUrl} />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-slate-50 dark:bg-slate-900/50">
              <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-950">
                  <Video size={19} className="text-slate-400" />
                </div>

                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  No video
                </p>
              </div>
            </div>
          )}
        </div>

        {/* quick demo */}
        <div className="p-4 sm:p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Play size={14} fill="currentColor" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-slate-800 dark:text-white">
                    Live Demo
                  </p>

                  <p className="truncate text-[10px] text-slate-400">
                    {durationMinutes === 60
                      ? "1 hour session"
                      : `${durationMinutes} min session`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModal("demo")}
                disabled={busy}
                className="shrink-0 rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Launch
              </button>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="mt-3">
              <InlineMessage variant="error">{error}</InlineMessage>
            </div>
          )}

          {/* compact actions */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ActionButton
              icon={<Settings2 size={13} />}
              label="Settings"
              onClick={() => setModal("settings")}
              disabled={Boolean(busy)}
            />

            <ActionButton
              icon={<Video size={13} />}
              label="Video"
              onClick={() => setModal("video")}
              disabled={Boolean(busy)}
            />

            <ActionButton
              icon={<MoreHorizontal size={14} />}
              label="More"
              onClick={() => setModal("more")}
              disabled={Boolean(busy)}
            />
          </div>
        </div>
      </article>

      {/* ===================================================
          DEMO MODAL
      =================================================== */}

      <Modal
        open={modal === "demo"}
        onClose={closeModal}
        title="Create Live Demo"
        description="Choose how long the isolated demo session should remain active."
        icon={<Play size={17} />}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Clock3 size={16} />
            </div>

            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">
                Session Duration
              </p>

              <p className="text-[10px] text-slate-400">
                Project: {project.name}
              </p>
            </div>
          </div>

          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            disabled={busy}
            className="mt-4 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-slate-800"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={360}>6 hours</option>
            <option value={720}>12 hours</option>
            <option value={1440}>1 day</option>
            <option value={10080}>7 days</option>
          </select>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={closeModal}
            disabled={creating}
            className="h-11 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onCreateDemo(project.id, durationMinutes)}
            disabled={busy}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {creating ? (
              <>
                <LoaderCircle size={14} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                Start Demo
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* ===================================================
          SETTINGS MODAL
      =================================================== */}

      <Modal
        open={modal === "settings"}
        onClose={closeModal}
        title="Project Settings"
        description="Manage project type and runtime detection."
        icon={<Settings2 size={17} />}
      >
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <Code2 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 dark:text-white">
                Project Type
              </p>

              <p className="truncate text-[10px] text-slate-400">
                Choose automatic detection or a specific type.
              </p>
            </div>
          </div>

          <select
            value={project.typeIsManual ? project.type : "auto"}
            onChange={(event) => onChangeType(project.id, event.target.value)}
            disabled={Boolean(busy)}
            className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-slate-800"
          >
            {PROJECT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              Runtime
            </span>

            <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              {project.hasDockerfile ? "Dockerfile" : "Auto Build"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              Video
            </span>

            <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              {hasVideo ? "Attached" : "None"}
            </p>
          </div>
        </div>
      </Modal>

      {/* ===================================================
          VIDEO MODAL
      =================================================== */}

      <Modal
        open={modal === "video"}
        onClose={closeModal}
        title="Project Video"
        description="Upload, replace, or remove the project walkthrough video."
        icon={<Video size={17} />}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white">
                Current Video
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {project.video
                  ? "A video is attached to this project."
                  : "No video is currently attached."}
              </p>
            </div>

            <div
              className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${
                project.video
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {project.video ? "Attached" : "None"}
            </div>
          </div>
        </div>

        <label
          className={`mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900 ${
            busy ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <UploadCloud size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-700 dark:text-slate-200">
              {project.video ? "Replace video" : "Upload video"}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Select a video file from your computer
            </p>
          </div>

          <input
            type="file"
            accept="video/*"
            hidden
            disabled={Boolean(busy)}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                onReplaceVideo(project.id, file);
                setModal(null);
              }

              event.target.value = "";
            }}
          />
        </label>

        {project.video && (
          <button
            type="button"
            onClick={() => onDeleteVideo(project.id)}
            disabled={Boolean(busy)}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-xs font-extrabold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-400"
          >
            {videoBusy ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Remove Video
          </button>
        )}
      </Modal>

      {/* ===================================================
          MORE MODAL
      =================================================== */}

      <Modal
        open={modal === "more"}
        onClose={closeModal}
        title="Project Options"
        description="Additional project actions and information."
        icon={<MoreHorizontal size={18} />}
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setModal(null);
              onDownload(project);
            }}
            disabled={Boolean(busy)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {busy === "download" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <ArrowDownToLine size={16} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                Download Project
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Download the project source/package.
              </p>
            </div>

            <ChevronRight size={15} className="text-slate-400" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 dark:bg-slate-950">
              <Info size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                Project ID
              </p>

              <code className="mt-1 block truncate text-[10px] font-semibold text-slate-400">
                {project.id}
              </code>
            </div>
          </div>

          <button
            type="button"
            onClick={openDelete}
            disabled={Boolean(busy)}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-left transition hover:border-red-200 hover:bg-red-100 disabled:opacity-50 dark:border-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/15"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 dark:bg-slate-950 dark:text-red-400">
              <Trash2 size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-red-700 dark:text-red-400">
                Delete Project
              </p>

              <p className="mt-0.5 text-[10px] text-red-400/80">
                Permanently remove this project.
              </p>
            </div>

            <ChevronRight size={15} className="text-red-400" />
          </button>
        </div>
      </Modal>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      <Modal
        open={modal === "delete"}
        onClose={closeDelete}
        title="Delete Project?"
        description="This action cannot be undone."
        icon={<Trash2 size={17} className="text-red-600 dark:text-red-400" />}
      >
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-500/10 dark:bg-red-500/10">
          <p className="text-xs font-bold leading-5 text-red-700 dark:text-red-300">
            You are about to delete:
          </p>

          <div className="mt-2 rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-950/60">
            <p className="truncate text-sm font-black text-slate-800 dark:text-white">
              {project.name}
            </p>

            <code className="mt-0.5 block truncate text-[10px] text-slate-400">
              {project.id}
            </code>
          </div>

          <p className="mt-3 text-[10px] leading-5 text-red-500/80 dark:text-red-400/70">
            The project and associated project data may be permanently removed.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={closeDelete}
            disabled={deleteBusy}
            className="h-11 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onDelete(project)}
            disabled={deleteBusy}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleteBusy ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}

            {deleteBusy ? "Deleting..." : "Delete Project"}
          </button>
        </div>

        {/* fallback for existing parent confirmation state */}
        {confirming && !deleteBusy && (
          <button
            type="button"
            onClick={() => setDeleteProjectId("")}
            className="mt-3 hidden"
          >
            Cancel
          </button>
        )}
      </Modal>
    </>
  );
}
