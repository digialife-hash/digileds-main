
import {
  ArrowUpDown,
  Check,
  FileVideo2,
  HardDrive,
  Image as ImageIcon,
  Images,
  LoaderCircle,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  Video,
  X,
  AlertCircle,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import PageHeader from "../layout/PageHeader.jsx";
import { usePost } from "../../hooks/usePost.js";
import { apiBlob, apiRequest } from "../../services/api.js";

const MAX_FILE_SIZE = 250 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/mpeg",
];

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { posts = [], addPost } = usePost();

  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef(new Set());

  /* =========================================================
     SAFE ID
  ========================================================== */

  function getPostId(post) {
    return post?.id ?? post?._id ?? null;
  }

  /* =========================================================
     FILE HELPERS
  ========================================================== */

  function isSupportedFile(file) {
    if (!file) return false;

    return (
      ALLOWED_IMAGE_TYPES.includes(file.type) ||
      ALLOWED_VIDEO_TYPES.includes(file.type)
    );
  }

  function getMediaType(fileOrMime) {
    const mime =
      typeof fileOrMime === "string"
        ? fileOrMime
        : fileOrMime?.type || "";

    return mime.startsWith("video/") ? "video" : "image";
  }

  function stripExtension(filename = "") {
    return filename.replace(/\.[^/.]+$/, "");
  }

  function createLocalPreview(file) {
    const url = URL.createObjectURL(file);

    previewUrlsRef.current.add(url);

    return url;
  }

  function revokePreview(url) {
    if (!url) return;

    if (previewUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      previewUrlsRef.current.delete(url);
    }
  }

  /* =========================================================
     FILE PICKER
  ========================================================== */

  function openFilePicker() {
    if (loading) return;

    fileInputRef.current?.click();
  }

  /* =========================================================
     ADD FILES
  ========================================================== */

  async function addFiles(selectedFiles) {
    const incomingFiles = Array.from(selectedFiles || []);

    if (!incomingFiles.length) {
      return;
    }

    setError("");

    const invalidFiles = incomingFiles.filter(
      (file) =>
        !isSupportedFile(file) ||
        file.size > MAX_FILE_SIZE
    );

    const validFiles = incomingFiles.filter(
      (file) =>
        isSupportedFile(file) &&
        file.size <= MAX_FILE_SIZE
    );

    if (invalidFiles.length) {
      const tooLarge = invalidFiles.some(
        (file) => file.size > MAX_FILE_SIZE
      );

      setError(
        tooLarge
          ? "Some files were skipped because they are larger than 250 MB or use an unsupported format."
          : "Some files were skipped because their image/video format is not supported."
      );
    }

    if (!validFiles.length) {
      return;
    }

    setLoading(true);

    const localItems = validFiles.map((file) => ({
      tempId: `local-${cryptoSafeId()}`,
      file,
      fileName: file.name,
      previewUrl: createLocalPreview(file),
      type: getMediaType(file),
      size: file.size,
      createdAt: Date.now(),
    }));

    try {
      const createdPosts = await Promise.all(
        localItems.map(async (item) => {
          const createdPost = await addPost({
            title:
              stripExtension(item.fileName)
                .slice(0, 120) || "Uploaded media",
            caption: "",
            platform: "Instagram",
            status: "Draft",
            date: "Not scheduled",
            hasMedia: true,
            media: item.file,
          });

          return {
            ...item,
            post: createdPost,
          };
        })
      );

      const newItems = createdPosts.map((item) => {
        const postId = getPostId(item.post);

        return {
          id: postId
            ? `post-${postId}`
            : item.tempId,

          postId: postId || null,

          name:
            item.post?.media?.originalName ||
            item.fileName ||
            "Uploaded media",

          size:
            Number(item.post?.media?.size) ||
            item.size ||
            0,

          url: item.previewUrl,

          type:
            item.post?.media?.mimeType
              ? getMediaType(item.post.media.mimeType)
              : item.type,

          createdAt: new Date(
            item.post?.createdAt || Date.now()
          ).getTime(),

          remote: Boolean(postId),
          local: true,
          sourceFile: item.file,
        };
      });

      setFiles((current) => {
        const existingIds = new Set(
          current.map((item) => item.id)
        );

        return [
          ...newItems.filter(
            (item) => !existingIds.has(item.id)
          ),
          ...current,
        ];
      });
    } catch (uploadError) {
      localItems.forEach((item) => {
        revokePreview(item.previewUrl);
      });

      setError(
        uploadError?.message ||
          "Some media could not be uploaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD REMOTE MEDIA
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadRemoteMedia() {
      const mediaPosts = (
        Array.isArray(posts) ? posts : []
      ).filter(
        (post) =>
          post?.media?.mimeType &&
          getPostId(post)
      );

      if (!mediaPosts.length) {
        if (!cancelled) {
          setFiles((current) =>
            current.filter((item) => item.local)
          );
        }

        return;
      }

      const items = await Promise.all(
        mediaPosts.map(async (post) => {
          const postId = getPostId(post);

          try {
            const blob = await apiBlob(
              `/posts/${postId}/media`
            );

            if (!blob || blob.size === 0) {
              return null;
            }

            return {
              id: `post-${postId}`,
              postId,

              name:
                post.media?.originalName ||
                post.title ||
                "Media",

              size:
                Number(post.media?.size) ||
                blob.size ||
                0,

              url: URL.createObjectURL(blob),

              type: getMediaType(
                post.media?.mimeType
              ),

              createdAt: new Date(
                post.createdAt || Date.now()
              ).getTime(),

              remote: true,
              local: false,
              blob,
            };
          } catch {
            return null;
          }
        })
      );

      if (cancelled) {
        items.forEach((item) => {
          if (item?.url) {
            URL.revokeObjectURL(item.url);
          }
        });

        return;
      }

      const validRemoteItems = items.filter(Boolean);

      validRemoteItems.forEach((item) => {
        previewUrlsRef.current.add(item.url);
      });

      setFiles((current) => {
        const localMap = new Map(
          current
            .filter((item) => item.local)
            .map((item) => [item.id, item])
        );

        const nextRemoteIds = new Set(
          validRemoteItems.map((item) => item.id)
        );

        const merged = validRemoteItems.map(
          (remoteItem) => {
            const localItem = localMap.get(
              remoteItem.id
            );

            if (
              localItem &&
              localItem.url &&
              localItem.url !== remoteItem.url
            ) {
              revokePreview(localItem.url);
            }

            return remoteItem;
          }
        );

        const stillLocal = current.filter(
          (item) =>
            item.local &&
            !nextRemoteIds.has(item.id)
        );

        return [...merged, ...stillLocal];
      });
    }

    loadRemoteMedia();

    return () => {
      cancelled = true;
    };
  }, [posts]);

  /* =========================================================
     FILE INPUT
  ========================================================== */

  function handleFileChange(event) {
    addFiles(event.target.files);

    event.target.value = "";
  }

  /* =========================================================
     DRAG & DROP
  ========================================================== */

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.dropEffect = "copy";

    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();

    if (
      !event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      setIsDragging(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    addFiles(event.dataTransfer.files);
  }

  /* =========================================================
     SELECT
  ========================================================== */

  function toggleSelect(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  }

  function selectAllVisible() {
    const ids = filteredFiles.map(
      (item) => item.id
    );

    setSelected((current) => {
      const hasAll = ids.every((id) =>
        current.includes(id)
      );

      if (hasAll) {
        return current.filter(
          (id) => !ids.includes(id)
        );
      }

      return Array.from(
        new Set([...current, ...ids])
      );
    });
  }

  /* =========================================================
     REMOVE SINGLE FILE
  ========================================================== */

  async function removeFile(id) {
    const itemToRemove = files.find(
      (file) => file.id === id
    );

    if (!itemToRemove) {
      return;
    }

    setError("");

    try {
      if (
        itemToRemove.remote &&
        itemToRemove.postId
      ) {
        await apiRequest(
          `/posts/${itemToRemove.postId}/media`,
          {
            method: "DELETE",
          }
        );
      }

      if (itemToRemove.url) {
        revokePreview(itemToRemove.url);
      }

      setFiles((current) =>
        current.filter(
          (file) => file.id !== id
        )
      );

      setSelected((current) =>
        current.filter(
          (item) => item !== id
        )
      );
    } catch (deleteError) {
      setError(
        deleteError?.message ||
          "Unable to delete this media."
      );
    }
  }

  /* =========================================================
     DELETE SELECTED
  ========================================================== */

  async function deleteSelected() {
    if (!selected.length) {
      return;
    }

    setError("");

    const selectedItems = files.filter((item) =>
      selected.includes(item.id)
    );

    try {
      for (const item of selectedItems) {
        if (
          item.remote &&
          item.postId
        ) {
          await apiRequest(
            `/posts/${item.postId}/media`,
            {
              method: "DELETE",
            }
          );
        }

        if (item.url) {
          revokePreview(item.url);
        }
      }

      setFiles((current) =>
        current.filter(
          (item) =>
            !selected.includes(item.id)
        )
      );

      setSelected([]);
    } catch (deleteError) {
      setError(
        deleteError?.message ||
          "Unable to delete one or more selected files."
      );
    }
  }

  /* =========================================================
     CLEANUP
  ========================================================== */

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(
        (url) => {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // Ignore cleanup errors.
          }
        }
      );

      previewUrlsRef.current.clear();
    };
  }, []);

  /* =========================================================
     FORMAT SIZE
  ========================================================== */

  function formatSize(bytes) {
    if (!bytes || bytes <= 0) {
      return "0 KB";
    }

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${Math.max(
        1,
        Math.round(kb)
      )} KB`;
    }

    const mb = kb / 1024;

    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }

    const gb = mb / 1024;

    return `${gb.toFixed(2)} GB`;
  }

  /* =========================================================
     FILTER + SEARCH + SORT
  ========================================================== */

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (filter !== "all") {
      result = result.filter(
        (item) => item.type === filter
      );
    }

    const query = search
      .trim()
      .toLowerCase();

    if (query) {
      result = result.filter((item) =>
        String(
          item?.name ||
            item?.sourceFile?.name ||
            ""
        )
          .toLowerCase()
          .includes(query)
      );
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          (b.createdAt || 0) -
          (a.createdAt || 0)
      );
    }

    if (sort === "oldest") {
      result.sort(
        (a, b) =>
          (a.createdAt || 0) -
          (b.createdAt || 0)
      );
    }

    if (sort === "largest") {
      result.sort(
        (a, b) =>
          (b?.size || 0) -
          (a?.size || 0)
      );
    }

    return result;
  }, [
    files,
    filter,
    search,
    sort,
  ]);

  /* =========================================================
     STORAGE
  ========================================================== */

  const totalStorage = useMemo(
    () =>
      files.reduce(
        (total, item) =>
          total +
          Number(item?.size || 0),
        0
      ),
    [files]
  );

  const selectedVisibleCount =
    filteredFiles.filter((item) =>
      selected.includes(item.id)
    ).length;

  const allVisibleSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((item) =>
      selected.includes(item.id)
    );

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        relative min-h-screen w-full
        overflow-x-hidden
        bg-[#f6f7fb]
        dark:bg-[#070b14]
        transition-colors duration-300
      "
    >
      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-400/10 blur-[110px] dark:bg-orange-500/[0.045]" />

        <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-cyan-400/[0.07] blur-[120px] dark:bg-cyan-500/[0.035]" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-400/[0.05] blur-[120px] dark:bg-violet-500/[0.025]" />

        <div className="absolute right-1/4 top-1/2 h-56 w-56 rounded-full bg-emerald-400/[0.025] blur-[100px] dark:bg-emerald-500/[0.018]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1550px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <PageHeader
          eyebrow="Your assets"
          title="Media library"
          description="Manage the images and videos you use across your social content."
          action={
            <button
              type="button"
              onClick={openFilePicker}
              disabled={loading}
              className="
                group inline-flex h-11 w-full
                items-center justify-center gap-2
                rounded-xl
                bg-stone-950
                px-4
                text-sm font-bold text-white
                shadow-[0_10px_25px_rgba(0,0,0,0.10)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-[0_18px_40px_rgba(249,115,22,0.14)]
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border
                dark:border-white/[0.08]
                dark:bg-white
                dark:text-slate-950
                dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]
                dark:hover:bg-slate-100
                sm:w-auto
              "
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Upload
                  size={17}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                />
              )}

              {loading
                ? "Uploading…"
                : "Upload media"}
            </button>
          }
        />

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <section
            className="
              relative mt-5 overflow-hidden
              rounded-2xl
              border
              border-red-200/80
              bg-red-50/80
              shadow-sm
              dark:border-red-500/20
              dark:bg-red-500/[0.07]
              dark:shadow-[0_15px_40px_rgba(0,0,0,0.16)]
            "
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-400/10 blur-3xl" />

            <div className="relative flex items-start gap-3 p-4">
              <div
                className="
                  grid h-9 w-9 shrink-0
                  place-items-center rounded-xl
                  bg-red-100 text-red-600
                  dark:border
                  dark:border-red-400/10
                  dark:bg-red-400/[0.10]
                  dark:text-red-400
                "
              >
                <AlertCircle size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-800 dark:text-red-300">
                  Media upload issue
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700/80 dark:text-red-300/70">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="
                  grid h-8 w-8 shrink-0
                  place-items-center rounded-lg
                  text-red-400
                  transition
                  hover:bg-red-100
                  hover:text-red-700
                  dark:hover:bg-red-400/[0.10]
                  dark:hover:text-red-300
                "
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MediaStat
            icon={Images}
            label="Total assets"
            value={files.length}
            description="Images & videos"
            tone="orange"
          />

          <MediaStat
            icon={HardDrive}
            label="Storage used"
            value={formatSize(totalStorage)}
            description="Current workspace usage"
            tone="violet"
          />

          <MediaStat
            icon={Check}
            label="Selected"
            value={selected.length}
            description="Assets selected"
            tone="emerald"
          />
        </section>

        {/* =====================================================
            DROPZONE
        ====================================================== */}

        <section
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          className={[
            "group relative mt-6 cursor-pointer overflow-hidden rounded-[26px] border border-dashed p-6 backdrop-blur-xl transition-all duration-300 sm:p-8 lg:p-10",

            isDragging
              ? `
                border-orange-400
                bg-orange-50/70
                shadow-[0_20px_60px_rgba(249,115,22,0.10)]
                dark:border-orange-400/60
                dark:bg-orange-400/[0.07]
                dark:shadow-[0_20px_60px_rgba(249,115,22,0.08)]
              `
              : `
                border-stone-300
                bg-white/[0.62]
                hover:border-orange-300
                hover:bg-white/[0.78]
                dark:border-white/[0.10]
                dark:bg-white/[0.025]
                dark:hover:border-orange-400/30
                dark:hover:bg-white/[0.045]
              `,
          ].join(" ")}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-orange-400/10 blur-[90px] dark:bg-orange-500/[0.05]" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-cyan-400/5 blur-[90px] dark:bg-cyan-500/[0.03]" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent dark:via-orange-400/15" />

          <div className="relative flex flex-col items-center justify-center text-center">
            <div
              className={[
                "relative grid h-14 w-14 place-items-center rounded-2xl border shadow-sm transition-all duration-300",

                isDragging
                  ? `
                    border-orange-300
                    bg-orange-50
                    text-orange-600
                    shadow-[0_0_25px_rgba(249,115,22,0.12)]
                    dark:border-orange-400/20
                    dark:bg-orange-400/[0.10]
                    dark:text-orange-400
                  `
                  : `
                    border-white/80
                    bg-white/75
                    text-stone-500
                    group-hover:scale-105
                    group-hover:text-orange-500
                    dark:border-white/[0.08]
                    dark:bg-white/[0.045]
                    dark:text-slate-400
                    dark:group-hover:text-orange-400
                  `,
              ].join(" ")}
            >
              <span className="pointer-events-none absolute -inset-2 rounded-3xl bg-orange-400/5 blur-xl dark:bg-orange-400/[0.035]" />

              {isDragging ? (
                <FileVideo2
                  size={22}
                  strokeWidth={1.7}
                  className="relative z-10"
                />
              ) : (
                <Upload
                  size={22}
                  strokeWidth={1.7}
                  className="relative z-10"
                />
              )}
            </div>

            <h2 className="mt-5 text-base font-black tracking-tight text-stone-900 dark:text-white sm:text-lg">
              {isDragging
                ? "Drop your files here"
                : "Drop files here to upload"}
            </h2>

            <p className="mt-1.5 text-sm text-stone-500 dark:text-slate-400">
              Drag images or videos into this area
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                "JPG",
                "PNG",
                "WEBP",
                "GIF",
                "MP4",
                "WEBM",
                "MOV",
              ].map((type) => (
                <span
                  key={type}
                  className="
                    rounded-full
                    border
                    border-stone-200/80
                    bg-white/70
                    px-2.5 py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-stone-400
                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                    dark:text-slate-500
                  "
                >
                  {type}
                </span>
              ))}
            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-300 dark:text-slate-600">
              Maximum file size 250 MB
            </p>
          </div>
        </section>

        {/* =====================================================
            LIBRARY TOOLBAR
        ====================================================== */}

        <section className="mt-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-stone-900 dark:text-white">
                  Your library
                </h2>

                <span
                  className="
                    rounded-full
                    border
                    border-stone-200
                    bg-white
                    px-2 py-1
                    text-[9px]
                    font-bold
                    text-stone-400
                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                    dark:text-slate-500
                  "
                >
                  {filteredFiles.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                {filteredFiles.length === files.length
                  ? "All uploaded assets"
                  : `Showing ${filteredFiles.length} matching assets`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filteredFiles.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl
                    border
                    border-stone-200
                    bg-white/80
                    px-3.5 py-2.5
                    text-xs font-bold
                    text-stone-600
                    shadow-sm
                    transition
                    hover:border-stone-300
                    hover:bg-white
                    hover:text-stone-900
                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                    dark:text-slate-300
                    dark:hover:border-white/[0.14]
                    dark:hover:bg-white/[0.06]
                    dark:hover:text-white
                  "
                >
                  <Check size={14} />

                  {allVisibleSelected
                    ? "Deselect visible"
                    : "Select visible"}
                </button>
              )}

              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50/80
                    px-4 py-2.5
                    text-xs font-bold
                    text-red-600
                    transition-all duration-200
                    hover:bg-red-100
                    hover:shadow-sm
                    dark:border-red-500/20
                    dark:bg-red-500/[0.07]
                    dark:text-red-400
                    dark:hover:bg-red-500/[0.12]
                  "
                >
                  <Trash2 size={15} />

                  Delete {selected.length}
                </button>
              )}
            </div>
          </div>

          {/* Filters */}

          <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
            {/* SEARCH */}

            <div
              className="
                group flex h-11 min-w-0
                items-center gap-3
                rounded-xl
                border
                border-white/80
                bg-white/[0.68]
                px-3.5
                shadow-sm
                backdrop-blur-xl
                transition-all duration-200
                focus-within:border-orange-300
                focus-within:bg-white
                focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.05)]
                dark:border-white/[0.08]
                dark:bg-white/[0.025]
                dark:focus-within:border-orange-400/25
                dark:focus-within:bg-white/[0.045]
                dark:focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.035)]
              "
            >
              <Search
                size={17}
                strokeWidth={1.8}
                className="shrink-0 text-stone-400 dark:text-slate-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search your media..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-sm font-medium
                  text-stone-800
                  outline-none
                  placeholder:text-stone-400
                  dark:text-slate-100
                  dark:placeholder:text-slate-600
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="
                    grid h-7 w-7
                    place-items-center
                    rounded-lg
                    text-stone-400
                    transition
                    hover:bg-stone-100
                    hover:text-stone-800
                    dark:hover:bg-white/[0.06]
                    dark:hover:text-white
                  "
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* FILTER */}

            <label
              className="
                flex h-11
                items-center gap-2
                rounded-xl
                border
                border-white/80
                bg-white/[0.68]
                px-3
                shadow-sm
                backdrop-blur-xl
                dark:border-white/[0.08]
                dark:bg-white/[0.025]
              "
            >
              <SlidersHorizontal
                size={16}
                strokeWidth={1.8}
                className="text-stone-400 dark:text-slate-500"
              />

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                className="
                  min-w-[130px]
                  bg-transparent
                  text-xs font-bold
                  text-stone-700
                  outline-none
                  dark:text-slate-300
                "
              >
                <option value="all">All media</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </label>

            {/* SORT */}

            <label
              className="
                flex h-11
                items-center gap-2
                rounded-xl
                border
                border-white/80
                bg-white/[0.68]
                px-3
                shadow-sm
                backdrop-blur-xl
                dark:border-white/[0.08]
                dark:bg-white/[0.025]
              "
            >
              <ArrowUpDown
                size={16}
                strokeWidth={1.8}
                className="text-stone-400 dark:text-slate-500"
              />

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="
                  min-w-[140px]
                  bg-transparent
                  text-xs font-bold
                  text-stone-700
                  outline-none
                  dark:text-slate-300
                "
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>

                <option value="largest">
                  Largest first
                </option>
              </select>
            </label>
          </div>
        </section>

        {/* =====================================================
            MEDIA GRID
        ====================================================== */}

        <section className="mt-5">
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filteredFiles.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  selected={selected.includes(item.id)}
                  onSelect={() =>
                    toggleSelect(item.id)
                  }
                  onDelete={() =>
                    removeFile(item.id)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyMedia
              hasFiles={files.length > 0}
              onUpload={openFilePicker}
              hasSearch={Boolean(search.trim())}
              hasFilter={filter !== "all"}
            />
          )}
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        {files.length > 0 && (
          <div
            className="
              mt-4 flex flex-col gap-2
              px-1 pb-4
              text-[10px]
              font-medium
              text-stone-400
              dark:text-slate-500
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p>
              {filteredFiles.length} of {files.length} assets shown
            </p>

            {selectedVisibleCount > 0 && (
              <p className="font-semibold text-orange-600 dark:text-orange-400">
                {selectedVisibleCount} visible selected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MEDIA STAT
========================================================= */

function MediaStat({
  icon: Icon,
  label,
  value,
  description,
  tone = "orange",
}) {
  const styles = {
    orange: {
      box: `
        border-orange-100
        bg-orange-50
        text-orange-600
        dark:border-orange-400/10
        dark:bg-orange-400/[0.08]
        dark:text-orange-400
      `,
      glow: "bg-orange-400/10 dark:bg-orange-500/[0.045]",
    },

    violet: {
      box: `
        border-violet-100
        bg-violet-50
        text-violet-600
        dark:border-violet-400/10
        dark:bg-violet-400/[0.08]
        dark:text-violet-400
      `,
      glow: "bg-violet-400/10 dark:bg-violet-500/[0.045]",
    },

    emerald: {
      box: `
        border-emerald-100
        bg-emerald-50
        text-emerald-600
        dark:border-emerald-400/10
        dark:bg-emerald-400/[0.08]
        dark:text-emerald-400
      `,
      glow: "bg-emerald-400/10 dark:bg-emerald-500/[0.045]",
    },
  };

  const style =
    styles[tone] || styles.orange;

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white/[0.68]
        p-5
        shadow-[0_14px_40px_rgba(0,0,0,0.04)]
        backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]
        dark:hover:border-white/[0.12]
        dark:hover:bg-white/[0.035]
        dark:hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)]
      "
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-[45px] ${style.glow}`}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent dark:via-orange-400/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-stone-950 dark:text-white sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-stone-400 dark:text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${style.box}`}
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MEDIA CARD
========================================================= */

function MediaCard({
  item,
  selected,
  onSelect,
  onDelete,
}) {
  const fileName =
    item?.name ||
    item?.sourceFile?.name ||
    "Untitled";

  const fileSize =
    Number(item?.size) ||
    Number(item?.sourceFile?.size) ||
    0;

  const isVideo = item.type === "video";

  return (
    <article
      className={[
        `
          group overflow-hidden
          rounded-[20px]
          border
          bg-white/[0.68]
          shadow-[0_12px_35px_rgba(0,0,0,0.04)]
          backdrop-blur-xl
          transition-all duration-300
          dark:bg-white/[0.025]
          dark:shadow-[0_15px_45px_rgba(0,0,0,0.20)]
        `,

        selected
          ? `
            border-orange-300
            ring-2
            ring-orange-500/10
            dark:border-orange-400/30
            dark:ring-orange-400/10
          `
          : `
            border-white/80
            hover:-translate-y-0.5
            hover:border-stone-200
            hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]
            dark:border-white/[0.08]
            dark:hover:border-white/[0.14]
            dark:hover:bg-white/[0.04]
            dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]
          `,
      ].join(" ")}
    >
      {/* ===================================================
          PREVIEW
      ==================================================== */}

      <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-[#0a111e]">
        {item.url ? (
          isVideo ? (
            <video
              src={item.url}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              playsInline
              preload="metadata"
              controls={false}
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <img
              src={item.url}
              alt={fileName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              draggable="false"
            />
          )
        ) : (
          <div
            className="
              flex h-full w-full
              flex-col items-center
              justify-center
              bg-stone-100
              text-stone-400
              dark:bg-[#0a111e]
              dark:text-slate-600
            "
          >
            {isVideo ? (
              <FileVideo2
                size={28}
                strokeWidth={1.5}
              />
            ) : (
              <ImageIcon
                size={28}
                strokeWidth={1.5}
              />
            )}

            <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em]">
              Preview unavailable
            </span>
          </div>
        )}

        {/* Bottom gradient */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Type badge */}

        <div
          className="
            absolute left-2.5 top-2.5
            grid h-8 w-8
            place-items-center
            rounded-xl
            border
            border-white/70
            bg-white/90
            text-stone-700
            shadow-sm
            backdrop-blur-md
            dark:border-white/10
            dark:bg-[#0d1422]/85
            dark:text-slate-200
          "
        >
          {isVideo ? (
            <Video size={14} />
          ) : (
            <ImageIcon size={14} />
          )}
        </div>

        {/* Local badge */}

        {item.local && (
          <div
            className="
              absolute bottom-2.5 left-2.5
              rounded-lg
              border border-white/50
              bg-black/45
              px-2 py-1
              text-[8px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-white
              backdrop-blur-md
            "
          >
            Uploaded
          </div>
        )}

        {/* Select */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          aria-label={
            selected
              ? "Deselect media"
              : "Select media"
          }
          aria-pressed={selected}
          className={[
            `
              absolute right-2.5 top-2.5
              grid h-8 w-8
              place-items-center
              rounded-xl
              border
              transition-all duration-200
            `,

            selected
              ? `
                border-orange-500
                bg-orange-500
                text-white
                shadow-[0_8px_20px_rgba(249,115,22,0.25)]
              `
              : `
                border-white/70
                bg-white/90
                text-transparent
                hover:text-stone-500
                dark:border-white/10
                dark:bg-[#0d1422]/85
                dark:hover:text-white
              `,
          ].join(" ")}
        >
          <Check
            size={14}
            strokeWidth={2.5}
          />
        </button>

        {/* Delete */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${fileName}`}
          className="
            absolute bottom-2.5 right-2.5
            grid h-8 w-8
            place-items-center
            rounded-xl
            border
            border-white/70
            bg-white/90
            text-stone-500
            opacity-0
            shadow-sm
            backdrop-blur-md
            transition-all duration-200
            hover:bg-red-50
            hover:text-red-500
            group-hover:opacity-100
            focus:opacity-100
            dark:border-white/10
            dark:bg-[#0d1422]/85
            dark:text-slate-400
            dark:hover:bg-red-500/[0.12]
            dark:hover:text-red-400
          "
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* ===================================================
          INFO
      ==================================================== */}

      <div className="flex min-w-0 items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p
            title={fileName}
            className="truncate text-[11px] font-bold text-stone-700 dark:text-slate-200"
          >
            {fileName}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-medium text-stone-400 dark:text-slate-500">
            <span>
              {formatCardSize(fileSize)}
            </span>

            <span className="text-stone-300 dark:text-slate-700">
              ·
            </span>

            <span className="uppercase">
              {item.type}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) =>
            event.stopPropagation()
          }
          aria-label="More options"
          className="
            grid h-8 w-8 shrink-0
            place-items-center
            rounded-lg
            text-stone-400
            transition
            hover:bg-stone-100
            hover:text-stone-800
            dark:text-slate-500
            dark:hover:bg-white/[0.06]
            dark:hover:text-white
          "
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY MEDIA
========================================================= */

function EmptyMedia({
  hasFiles,
  onUpload,
  hasSearch,
  hasFilter,
}) {
  const filtered =
    hasFiles &&
    (hasSearch || hasFilter);

  return (
    <div
      className="
        relative overflow-hidden
        rounded-[26px]
        border
        border-white/80
        bg-white/[0.62]
        px-6 py-20
        text-center
        shadow-[0_18px_55px_rgba(0,0,0,0.04)]
        backdrop-blur-xl
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]
      "
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-400/10 blur-[80px] dark:bg-orange-500/[0.04]" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-400/5 blur-[80px] dark:bg-cyan-500/[0.025]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

      <div className="relative">
        <div
          className="
            mx-auto grid h-14 w-14
            place-items-center
            rounded-2xl
            border
            border-white/80
            bg-stone-100
            text-stone-400
            shadow-sm
            dark:border-white/[0.08]
            dark:bg-white/[0.045]
            dark:text-slate-500
          "
        >
          <ImageIcon
            size={23}
            strokeWidth={1.6}
          />
        </div>

        <h2 className="mt-5 text-lg font-black tracking-tight text-stone-900 dark:text-white">
          {filtered
            ? "No matching media"
            : "No media yet"}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500 dark:text-slate-400">
          {filtered
            ? "Try changing your search or filters to find the asset you're looking for."
            : "Upload images and videos to start building your content library."}
        </p>

        {!hasFiles && (
          <button
            type="button"
            onClick={onUpload}
            className="
              mt-5 inline-flex
              items-center gap-2
              rounded-xl
              bg-stone-950
              px-4 py-2.5
              text-xs font-bold
              text-white
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              dark:border
              dark:border-white/[0.08]
              dark:bg-white
              dark:text-slate-950
              dark:hover:bg-slate-100
            "
          >
            <Upload size={14} />
            Upload media
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CARD SIZE
========================================================= */

function formatCardSize(bytes) {
  if (!bytes || bytes <= 0) {
    return "0 KB";
  }

  const mb =
    bytes / (1024 * 1024);

  if (mb < 1) {
    return `${Math.max(
      1,
      Math.round(bytes / 1024)
    )} KB`;
  }

  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${(
    mb / 1024
  ).toFixed(2)} GB`;
}

/* =========================================================
   SAFE ID
========================================================= */

function cryptoSafeId() {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Fallback below.
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

