
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Copy,
  Edit3,
  Filter,
  Hash,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import PageHeader from "../layout/PageHeader.jsx";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "socialpost_hashtag_groups";

const CATEGORIES = [
  "All",
  "Campaign",
  "Niche",
  "Brand",
  "Content",
  "Seasonal",
];

const PLATFORMS = [
  "All",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "YouTube",
  "X",
  "Universal",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "Campaign",
  platform: "Instagram",
  hashtags: "",
};

/* =========================================================
   SAMPLE DATA
   Used only when local library does not exist yet.
========================================================= */

const SAMPLE_GROUPS = [
  {
    id: "sample-growth",
    name: "Marketing Growth",
    description:
      "General marketing and social media growth hashtags for recurring content.",
    category: "Niche",
    platform: "Instagram",
    hashtags: [
      "socialmedia",
      "digitalmarketing",
      "marketing",
      "contentmarketing",
      "socialmediamarketing",
      "marketingstrategy",
      "growthmarketing",
    ],
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-brand",
    name: "Brand Campaign",
    description:
      "Reusable tags for brand announcements, launches and promotional campaigns.",
    category: "Campaign",
    platform: "Universal",
    hashtags: [
      "branding",
      "brandstrategy",
      "brandlaunch",
      "business",
      "entrepreneur",
      "smallbusiness",
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-content",
    name: "Content Creator",
    description:
      "A flexible creator-focused hashtag collection for educational and creative posts.",
    category: "Content",
    platform: "Instagram",
    hashtags: [
      "contentcreator",
      "creator",
      "creatortips",
      "contentcreation",
      "reels",
      "reelsinstagram",
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* =========================================================
   MAIN
========================================================= */

export default function HashtagResearch() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewGroup, setViewGroup] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  /* =======================================================
     LOAD
  ======================================================== */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setGroups(parsed);
          return;
        }
      }

      setGroups(SAMPLE_GROUPS);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(SAMPLE_GROUPS)
      );
    } catch {
      setGroups([]);
    }
  }, []);

  /* =======================================================
     SAVE
  ======================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(groups)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [groups]);

  /* =======================================================
     FILTERED GROUPS
  ======================================================== */

  const filteredGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return [...groups]
      .filter((group) => {
        const matchesCategory =
          category === "All" ||
          group.category === category;

        const matchesPlatform =
          platform === "All" ||
          group.platform === platform;

        if (!matchesCategory || !matchesPlatform) {
          return false;
        }

        if (!keyword) {
          return true;
        }

        const searchable = [
          group.name,
          group.description,
          group.category,
          group.platform,
          ...(group.hashtags || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(keyword);
      })
      .sort((a, b) => {
        if (
          Boolean(b.favorite) !==
          Boolean(a.favorite)
        ) {
          return b.favorite ? 1 : -1;
        }

        return (
          new Date(
            b.updatedAt || b.createdAt
          ) -
          new Date(
            a.updatedAt || a.createdAt
          )
        );
      });
  }, [
    groups,
    search,
    category,
    platform,
  ]);

  /* =======================================================
     STATS
  ======================================================== */

  const stats = useMemo(() => {
    const hashtags = new Set(
      groups.flatMap(
        (group) => group.hashtags || []
      )
    );

    return {
      groups: groups.length,
      hashtags: hashtags.size,
      favorites: groups.filter(
        (group) => group.favorite
      ).length,
      platforms: new Set(
        groups.map(
          (group) => group.platform
        )
      ).size,
    };
  }, [groups]);

  /* =======================================================
     ADD
  ======================================================== */

  const handleNewGroup = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  /* =======================================================
     EDIT
  ======================================================== */

  const handleEdit = (group) => {
    setEditingId(group.id);

    setForm({
      name: group.name || "",
      description: group.description || "",
      category: group.category || "Campaign",
      platform: group.platform || "Instagram",
      hashtags: Array.isArray(group.hashtags)
        ? group.hashtags.join(", ")
        : "",
    });

    setModalOpen(true);
  };

  /* =======================================================
     SAVE
  ======================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) return;

    const hashtags = normalizeHashtags(
      form.hashtags
    );

    if (!hashtags.length) return;

    const now = new Date().toISOString();

    if (editingId) {
      setGroups((current) =>
        current.map((group) =>
          group.id === editingId
            ? {
                ...group,
                name,
                description:
                  form.description.trim(),
                category: form.category,
                platform: form.platform,
                hashtags,
                updatedAt: now,
              }
            : group
        )
      );
    } else {
      setGroups((current) => [
        {
          id: createId(),
          name,
          description:
            form.description.trim(),
          category: form.category,
          platform: form.platform,
          hashtags,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ]);
    }

    closeModal();
  };

  /* =======================================================
     DELETE
  ======================================================== */

  const handleDelete = () => {
    if (!deleteId) return;

    setGroups((current) =>
      current.filter(
        (group) => group.id !== deleteId
      )
    );

    if (viewGroup?.id === deleteId) {
      setViewGroup(null);
    }

    setDeleteId(null);
  };

  /* =======================================================
     FAVORITE
  ======================================================== */

  const handleFavorite = (id) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === id
          ? {
              ...group,
              favorite: !group.favorite,
              updatedAt:
                new Date().toISOString(),
            }
          : group
      )
    );
  };

  /* =======================================================
     COPY
  ======================================================== */

  const handleCopy = async (group) => {
    const text = group.hashtags
      .map((tag) => `#${cleanTag(tag)}`)
      .join(" ");

    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(group.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 1600);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================== */

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />
        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />
        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <PageHeader
          eyebrow="Tools"
          title="Hashtag research"
          description="Organize reusable hashtag groups for recurring campaigns, niches and content."
          action={
            <button
              type="button"
              onClick={handleNewGroup}
              className="
                group
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-stone-950
                px-4
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(0,0,0,0.10)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-stone-800
                dark:bg-white
                dark:text-slate-950
                dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]
                dark:hover:bg-slate-100
                sm:w-auto
              "
            >
              <Plus
                size={16}
                className="
                  transition-transform
                  duration-200
                  group-hover:rotate-90
                "
              />
              New group
            </button>
          }
        />

        {/* ===================================================
            HERO
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-cyan-100/80
            bg-white/[0.72]
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-cyan-400/10
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent dark:via-cyan-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-56
              w-56
              rounded-full
              bg-cyan-400/10
              blur-[90px]
              dark:bg-cyan-400/[0.055]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              left-1/3
              h-44
              w-44
              rounded-full
              bg-violet-400/10
              blur-[80px]
              dark:bg-violet-400/[0.045]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              p-4
              sm:p-5
              lg:flex-row
              lg:items-center
              lg:justify-between
              lg:p-6
            "
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-cyan-100
                  bg-cyan-50
                  text-cyan-600
                  dark:border-cyan-400/15
                  dark:bg-cyan-400/10
                  dark:text-cyan-300
                "
              >
                <Hash
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black tracking-tight text-stone-900 transition-colors duration-300 dark:text-white sm:text-base">
                    Build reusable hashtag groups
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-cyan-100
                      bg-cyan-50
                      px-2
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-cyan-600
                      dark:border-cyan-400/15
                      dark:bg-cyan-400/10
                      dark:text-cyan-300
                    "
                  >
                    Organized
                  </span>
                </div>

                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                  Save campaign-specific hashtag collections and
                  quickly copy the right set while creating your
                  next social post.
                </p>
              </div>
            </div>

            <div
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-stone-200
                bg-white/70
                px-3
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              <Sparkles
                size={12}
                className="text-violet-500 dark:text-violet-300"
              />
              Reusable sets
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
            sm:mt-6
            lg:grid-cols-4
          "
        >
          <ResearchStat
            icon={Hash}
            label="Groups"
            value={stats.groups}
            tone="cyan"
          />

          <ResearchStat
            icon={Sparkles}
            label="Hashtags"
            value={stats.hashtags}
            tone="violet"
          />

          <ResearchStat
            icon={Bookmark}
            label="Favorites"
            value={stats.favorites}
            tone="amber"
          />

          <ResearchStat
            icon={Filter}
            label="Platforms"
            value={stats.platforms}
            tone="green"
          />
        </section>

        {/* ===================================================
            SEARCH / FILTER
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[22px]
            border
            border-white/80
            bg-white/[0.72]
            p-3
            shadow-[0_14px_40px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]
            sm:mt-6
            sm:p-4
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent dark:via-orange-400/15" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.025] dark:to-transparent" />

          <div className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
            {/* Search */}
            <div className="relative min-w-0">
              <Search
                size={15}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-stone-400
                  dark:text-slate-500
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search groups or hashtags..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-stone-200
                  bg-white
                  pl-9
                  pr-10
                  text-xs
                  font-medium
                  text-stone-700
                  outline-none
                  placeholder:text-stone-400
                  focus:border-cyan-300
                  focus:ring-4
                  focus:ring-cyan-500/10
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-200
                  dark:placeholder:text-slate-500
                  dark:focus:border-cyan-400/30
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-stone-400
                    hover:text-stone-700
                    dark:text-slate-500
                    dark:hover:text-slate-200
                  "
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-white
                px-3
                text-xs
                font-bold
                text-stone-700
                outline-none
                focus:border-cyan-300
                focus:ring-4
                focus:ring-cyan-500/10
                dark:border-white/[0.08]
                dark:bg-[#0d1422]
                dark:text-slate-200
                dark:focus:border-cyan-400/30
              "
            >
              {CATEGORIES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "All"
                    ? "All categories"
                    : item}
                </option>
              ))}
            </select>

            {/* Platform */}
            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value)
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-white
                px-3
                text-xs
                font-bold
                text-stone-700
                outline-none
                focus:border-cyan-300
                focus:ring-4
                focus:ring-cyan-500/10
                dark:border-white/[0.08]
                dark:bg-[#0d1422]
                dark:text-slate-200
                dark:focus:border-cyan-400/30
              "
            >
              {PLATFORMS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "All"
                    ? "All platforms"
                    : item}
                </option>
              ))}
            </select>
          </div>

          <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-white/[0.06]">
            <p className="text-[10px] font-semibold text-stone-400 dark:text-slate-500">
              Showing{" "}
              <span className="font-black text-stone-600 dark:text-slate-300">
                {filteredGroups.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-stone-600 dark:text-slate-300">
                {groups.length}
              </span>{" "}
              groups
            </p>

            {(search ||
              category !== "All" ||
              platform !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setPlatform("All");
                }}
                className="
                  text-[10px]
                  font-bold
                  text-cyan-600
                  hover:text-cyan-700
                  dark:text-cyan-400
                  dark:hover:text-cyan-300
                "
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* ===================================================
            GROUP LIST
        ==================================================== */}

        <section className="mt-5 sm:mt-6">
          {filteredGroups.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {filteredGroups.map((group) => (
                <HashtagGroupCard
                  key={group.id}
                  group={group}
                  copied={copiedId === group.id}
                  onCopy={() =>
                    handleCopy(group)
                  }
                  onFavorite={() =>
                    handleFavorite(group.id)
                  }
                  onView={() =>
                    setViewGroup(group)
                  }
                  onEdit={() =>
                    handleEdit(group)
                  }
                  onDelete={() =>
                    setDeleteId(group.id)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyGroups
              hasGroups={groups.length > 0}
              onAdd={handleNewGroup}
              onClear={() => {
                setSearch("");
                setCategory("All");
                setPlatform("All");
              }}
            />
          )}
        </section>

        {/* ===================================================
            HELPFUL SECTIONS
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            gap-3
            pb-4
            sm:mt-6
            sm:pb-6
            md:grid-cols-3
          "
        >
          <HelpfulCard
            icon={Hash}
            title="Campaign tags"
            text="Keep focused hashtag sets for launches, promotions and recurring campaigns."
          />

          <HelpfulCard
            icon={Search}
            title="Topic groups"
            text="Organize hashtags around services, niches and recurring content themes."
          />

          <HelpfulCard
            icon={Lightbulb}
            title="Reusable sets"
            text="Build ready-to-copy combinations so publishing takes less time."
          />
        </section>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {modalOpen && (
        <ModalOverlay onClose={closeModal}>
          <div
            className="
              relative
              flex
              min-h-0
              w-[calc(100vw-1rem)]
              max-w-[42rem]
              flex-col
              overflow-hidden
              overscroll-contain
              rounded-2xl
              border
              border-white/80
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.18)]
              dark:border-white/[0.08]
              dark:bg-[#0b111d]
              dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
              max-h-[calc(100dvh-1rem)]
              sm:max-h-[calc(100dvh-2.5rem)]
              sm:rounded-[28px]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent dark:via-cyan-400/25" />

            {/* Modal header */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200/70 p-4 dark:border-white/[0.08] sm:gap-4 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-xl
                    border
                    border-cyan-100
                    bg-cyan-50
                    text-cyan-600
                    dark:border-cyan-400/15
                    dark:bg-cyan-400/10
                    dark:text-cyan-300
                  "
                >
                  {editingId ? (
                    <Edit3 size={17} />
                  ) : (
                    <Hash size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-sm font-black text-stone-900 dark:text-white sm:text-base">
                    {editingId
                      ? "Edit hashtag group"
                      : "Create hashtag group"}
                  </h2>

                  <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                    Organize a reusable set of hashtags.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="
                  grid
                  h-9
                  w-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-stone-200
                  bg-stone-50
                  text-stone-400
                  transition
                  hover:text-stone-700
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-500
                  dark:hover:text-slate-200
                "
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-400">
                  Group name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example: Summer campaign"
                  autoFocus
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-stone-200
                    bg-stone-50/50
                    px-3
                    text-sm
                    font-medium
                    text-stone-800
                    outline-none
                    placeholder:text-stone-400
                    focus:border-cyan-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-500/10
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-200
                    dark:placeholder:text-slate-500
                    dark:focus:border-cyan-400/30
                    dark:focus:bg-white/[0.06]
                  "
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-400">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  rows={3}
                  className="
                    max-h-36
                    min-h-20
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-stone-200
                    bg-stone-50/50
                    px-3
                    py-3
                    text-sm
                    leading-6
                    text-stone-700
                    outline-none
                    placeholder:text-stone-400
                    focus:border-cyan-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-500/10
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-200
                    dark:placeholder:text-slate-500
                    dark:focus:border-cyan-400/30
                    dark:focus:bg-white/[0.06]
                  "
                />
              </div>

              {/* Category / Platform */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-400">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category:
                          event.target.value,
                      }))
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50/50
                      px-3
                      text-xs
                      font-bold
                      text-stone-700
                      outline-none
                      focus:border-cyan-300
                      focus:bg-white
                      dark:border-white/[0.08]
                      dark:bg-[#0d1422]
                      dark:text-slate-200
                      dark:focus:border-cyan-400/30
                    "
                  >
                    {CATEGORIES.filter(
                      (item) => item !== "All"
                    ).map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-400">
                    Platform
                  </label>

                  <select
                    value={form.platform}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        platform:
                          event.target.value,
                      }))
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50/50
                      px-3
                      text-xs
                      font-bold
                      text-stone-700
                      outline-none
                      focus:border-cyan-300
                      focus:bg-white
                      dark:border-white/[0.08]
                      dark:bg-[#0d1422]
                      dark:text-slate-200
                      dark:focus:border-cyan-400/30
                    "
                  >
                    {PLATFORMS.filter(
                      (item) => item !== "All"
                    ).map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-400">
                    Hashtags
                  </label>

                  <span className="text-[9px] font-semibold text-stone-400 dark:text-slate-500">
                    Separate with commas
                  </span>
                </div>

                <textarea
                  value={form.hashtags}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hashtags:
                        event.target.value,
                    }))
                  }
                  rows={5}
                  className="
                    max-h-48
                    min-h-28
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-stone-200
                    bg-stone-50/50
                    px-3
                    py-3
                    text-sm
                    leading-6
                    text-stone-700
                    outline-none
                    placeholder:text-stone-400
                    focus:border-cyan-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-500/10
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-200
                    dark:placeholder:text-slate-500
                    dark:focus:border-cyan-400/30
                    dark:focus:bg-white/[0.06]
                  "
                  placeholder="socialmedia, marketing, digitalmarketing, contentmarketing"
                />

                <p className="mt-1.5 text-[9px] leading-4 text-stone-400 dark:text-slate-500">
                  You can enter hashtags with or without the #
                  symbol.
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-stone-100 pt-4 dark:border-white/[0.07] sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-stone-200
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-stone-600
                    transition
                    hover:bg-stone-50
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-300
                    dark:hover:bg-white/[0.07]
                    sm:w-auto
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !form.name.trim() ||
                    normalizeHashtags(
                      form.hashtags
                    ).length === 0
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    bg-stone-950
                    px-5
                    text-xs
                    font-bold
                    text-white
                    transition
                    hover:bg-stone-800
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    dark:bg-white
                    dark:text-slate-950
                    dark:hover:bg-slate-100
                    sm:w-auto
                  "
                >
                  {editingId
                    ? "Save changes"
                    : "Create group"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* =====================================================
          VIEW MODAL
      ====================================================== */}

      {viewGroup && (
        <ModalOverlay
          onClose={() =>
            setViewGroup(null)
          }
        >
          <div
            className="
              w-full
              max-w-2xl
              overflow-hidden
              rounded-[28px]
              border
              border-white/80
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.18)]
              dark:border-white/[0.08]
              dark:bg-[#0b111d]
              dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent dark:via-cyan-400/25" />

            <div className="flex items-start justify-between gap-4 border-b border-stone-200/70 p-5 dark:border-white/[0.08] sm:p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-cyan-100 bg-cyan-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300">
                    {viewGroup.category}
                  </span>

                  <span className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
                    {viewGroup.platform}
                  </span>

                  {viewGroup.favorite && (
                    <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
                      Favorite
                    </span>
                  )}
                </div>

                <h2 className="mt-3 break-words text-lg font-black tracking-tight text-stone-900 dark:text-white sm:text-xl">
                  {viewGroup.name}
                </h2>

                {viewGroup.description && (
                  <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
                    {viewGroup.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewGroup(null)
                }
                className="
                  grid
                  h-9
                  w-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-stone-200
                  bg-stone-50
                  text-stone-400
                  transition
                  hover:text-stone-700
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-500
                  dark:hover:text-slate-200
                "
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.025]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Hash
                      size={15}
                      className="text-cyan-500 dark:text-cyan-300"
                    />

                    <span className="text-xs font-black text-stone-700 dark:text-slate-200">
                      {viewGroup.hashtags.length} hashtags
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(viewGroup)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-stone-200
                      bg-white
                      px-2.5
                      py-1.5
                      text-[9px]
                      font-bold
                      text-stone-600
                      shadow-sm
                      transition
                      hover:text-cyan-600
                      dark:border-white/[0.08]
                      dark:bg-white/[0.05]
                      dark:text-slate-300
                      dark:hover:text-cyan-300
                    "
                  >
                    {copiedId === viewGroup.id ? (
                      <>
                        <Check size={11} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        Copy all
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {viewGroup.hashtags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="
                          rounded-full
                          border
                          border-cyan-100
                          bg-white
                          px-2.5
                          py-1.5
                          text-[10px]
                          font-bold
                          text-cyan-700
                          dark:border-cyan-400/15
                          dark:bg-cyan-400/[0.07]
                          dark:text-cyan-300
                        "
                      >
                        #{cleanTag(tag)}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setViewGroup(null);
                    handleEdit(viewGroup);
                  }}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-stone-200
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-stone-600
                    transition
                    hover:bg-stone-50
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-300
                    dark:hover:bg-white/[0.07]
                  "
                >
                  <Edit3 size={13} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewGroup(null);
                    setDeleteId(
                      viewGroup.id
                    );
                  }}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-50
                    px-4
                    text-xs
                    font-bold
                    text-red-600
                    transition
                    hover:bg-red-100
                    dark:bg-red-400/10
                    dark:text-red-300
                    dark:hover:bg-red-400/15
                  "
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteId && (
        <ModalOverlay
          onClose={() => setDeleteId(null)}
        >
          <div
            className="
              w-full
              max-w-md
              rounded-[26px]
              border
              border-white/80
              bg-white
              p-5
              shadow-[0_30px_100px_rgba(0,0,0,0.18)]
              dark:border-white/[0.08]
              dark:bg-[#0b111d]
              dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
              sm:p-6
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50
                  text-red-500
                  dark:border-red-400/15
                  dark:bg-red-400/10
                  dark:text-red-300
                "
              >
                <Trash2 size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-black text-stone-900 dark:text-white">
                  Delete hashtag group?
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
                  This group and its saved hashtags will be removed from
                  your local content workspace.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-stone-200
                  bg-white
                  px-4
                  text-xs
                  font-bold
                  text-stone-600
                  transition
                  hover:bg-stone-50
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-300
                  dark:hover:bg-white/[0.07]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  h-10
                  rounded-xl
                  bg-red-600
                  px-4
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-red-700
                  dark:bg-red-500
                  dark:hover:bg-red-400
                "
              >
                Delete
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* =========================================================
   GROUP CARD
========================================================= */

function HashtagGroupCard({
  group,
  copied,
  onCopy,
  onFavorite,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <article
      className="
        group
        relative
        flex
        min-h-[300px]
        min-w-0
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-white/80
        bg-white/[0.76]
        shadow-[0_16px_45px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:shadow-[0_18px_55px_rgba(0,0,0,0.24)]
        dark:hover:border-white/[0.12]
        dark:hover:bg-white/[0.04]
        dark:hover:shadow-[0_22px_60px_rgba(0,0,0,0.30)]
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent dark:via-cyan-400/15" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

      <div
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-cyan-400/5
          blur-[55px]
          dark:bg-cyan-400/[0.035]
        "
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-4 dark:border-white/[0.06]">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              grid
              h-11
              w-11
              shrink-0
              place-items-center
              rounded-xl
              border
              border-cyan-100
              bg-cyan-50
              text-cyan-600
              dark:border-cyan-400/15
              dark:bg-cyan-400/10
              dark:text-cyan-300
            "
          >
            <Hash
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              <span
                className="
                  rounded-lg
                  border
                  border-cyan-100
                  bg-cyan-50
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-cyan-600
                  dark:border-cyan-400/15
                  dark:bg-cyan-400/10
                  dark:text-cyan-300
                "
              >
                {group.category}
              </span>

              <span
                className="
                  rounded-lg
                  border
                  border-stone-200
                  bg-stone-50
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  text-stone-500
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-400
                "
              >
                {group.platform}
              </span>
            </div>

            <h3
              className="
                mt-1.5
                truncate
                text-sm
                font-black
                text-stone-900
                dark:text-white
              "
              title={group.name}
            >
              {group.name}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onFavorite}
          className={`
            grid
            h-9
            w-9
            shrink-0
            place-items-center
            rounded-xl
            transition
            ${
              group.favorite
                ? "border border-amber-100 bg-amber-50 text-amber-500 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300"
                : "bg-stone-50 text-stone-300 hover:bg-amber-50 hover:text-amber-500 dark:bg-white/[0.04] dark:text-slate-600 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
            }
          `}
          aria-label={
            group.favorite
              ? "Remove favorite"
              : "Add favorite"
          }
        >
          <Bookmark
            size={15}
            fill={
              group.favorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 flex-col p-4">
        {group.description && (
          <p className="line-clamp-2 text-xs leading-5 text-stone-500 dark:text-slate-400">
            {group.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {group.hashtags
            .slice(0, 8)
            .map((tag) => (
              <span
                key={tag}
                className="
                  rounded-full
                  border
                  border-stone-200
                  bg-stone-50
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-bold
                  text-stone-500
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-400
                "
              >
                #{cleanTag(tag)}
              </span>
            ))}

          {group.hashtags.length > 8 && (
            <span
              className="
                rounded-full
                bg-stone-100
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                text-stone-400
                dark:bg-white/[0.05]
                dark:text-slate-500
              "
            >
              +{group.hashtags.length - 8}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] font-semibold text-stone-400 dark:text-slate-500">
              {group.hashtags.length}{" "}
              {group.hashtags.length === 1
                ? "hashtag"
                : "hashtags"}
            </span>

            <span className="text-[9px] font-semibold text-stone-400 dark:text-slate-500">
              Reusable set
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-2
          border-t
          border-stone-100
          bg-stone-50/50
          px-4
          py-3
          dark:border-white/[0.06]
          dark:bg-white/[0.018]
        "
      >
        <button
          type="button"
          onClick={onCopy}
          className="
            inline-flex
            h-8
            items-center
            gap-1.5
            rounded-lg
            border
            border-stone-200
            bg-white
            px-2.5
            text-[9px]
            font-bold
            text-stone-500
            shadow-sm
            transition
            hover:text-cyan-600
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-400
            dark:hover:text-cyan-300
          "
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy tags
            </>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onView}
            className="
              grid
              h-8
              w-8
              place-items-center
              rounded-lg
              text-stone-400
              transition
              hover:bg-white
              hover:text-stone-700
              dark:text-slate-500
              dark:hover:bg-white/[0.06]
              dark:hover:text-slate-200
            "
            aria-label="View"
          >
            <ArrowUpRight size={13} />
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="
              grid
              h-8
              w-8
              place-items-center
              rounded-lg
              text-stone-400
              transition
              hover:bg-white
              hover:text-stone-700
              dark:text-slate-500
              dark:hover:bg-white/[0.06]
              dark:hover:text-slate-200
            "
            aria-label="Edit"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="
              grid
              h-8
              w-8
              place-items-center
              rounded-lg
              text-stone-400
              transition
              hover:bg-red-50
              hover:text-red-500
              dark:text-slate-500
              dark:hover:bg-red-400/10
              dark:hover:text-red-300
            "
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   STAT
========================================================= */

function ResearchStat({
  icon: Icon,
  label,
  value,
  tone = "slate",
}) {
  const tones = {
    cyan:
      "border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",
    violet:
      "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",
    amber:
      "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300",
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",
    slate:
      "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",
  };

  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white/[0.72]
        p-4
        shadow-[0_14px_40px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-colors
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.08]" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            ${tones[tone] || tones.slate}
          `}
        >
          <Icon size={17} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HELPFUL CARD
========================================================= */

function HelpfulCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-white/80
        bg-white/[0.72]
        p-4
        shadow-[0_12px_35px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-colors
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.03]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.07]" />

      <div className="flex items-start gap-3">
        <div
          className="
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            text-stone-500
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-400
          "
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-black text-stone-800 dark:text-slate-200">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY GROUPS
========================================================= */

function EmptyGroups({
  hasGroups,
  onAdd,
  onClear,
}) {
  return (
    <section
      className="
        relative
        flex
        min-h-[350px]
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[26px]
        border
        border-dashed
        border-stone-300
        bg-white/[0.72]
        px-5
        py-14
        text-center
        shadow-[0_18px_55px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        dark:border-white/[0.1]
        dark:bg-white/[0.02]
        dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent dark:via-cyan-400/15" />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-64
          w-64
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/5
          blur-3xl
          dark:bg-cyan-400/[0.035]
        "
      />

      <div
        className="
          relative
          grid
          h-16
          w-16
          place-items-center
          rounded-2xl
          border
          border-stone-200
          bg-white
          text-stone-300
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.04]
          dark:text-slate-500
        "
      >
        <Hash
          size={27}
          strokeWidth={1.6}
        />
      </div>

      <h2 className="relative mt-5 text-base font-black tracking-tight text-stone-800 dark:text-slate-200 sm:text-lg">
        {hasGroups
          ? "No matching hashtag groups"
          : "No hashtag groups yet"}
      </h2>

      <p className="relative mt-2 max-w-md text-xs leading-5 text-stone-400 dark:text-slate-500 sm:text-sm">
        {hasGroups
          ? "Try another search term or clear the filters to see your saved groups."
          : "Create your first reusable hashtag set for a campaign, niche or recurring content theme."}
      </p>

      <button
        type="button"
        onClick={
          hasGroups ? onClear : onAdd
        }
        className="
          relative
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-stone-950
          px-4
          py-2.5
          text-xs
          font-bold
          text-white
          shadow-lg
          transition
          hover:-translate-y-0.5
          hover:bg-stone-800
          dark:bg-white
          dark:text-slate-950
          dark:hover:bg-slate-100
        "
      >
        {hasGroups ? (
          <>
            <X size={13} />
            Clear filters
          </>
        ) : (
          <>
            <Plus size={13} />
            Create first group
          </>
        )}
      </button>
    </section>
  );
}

/* =========================================================
   MODAL
========================================================= */

function ModalOverlay({
  children,
  onClose,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-start
        justify-center
        overflow-y-auto
        bg-stone-950/45
        px-2
        py-2
        backdrop-blur-sm
        dark:bg-black/65
        sm:items-center
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   DATA HELPERS
========================================================= */

function normalizeHashtags(value) {
  return [
    ...new Set(
      String(value || "")
        .split(/[\s,]+/)
        .map((tag) => cleanTag(tag))
        .filter(Boolean)
    ),
  ].slice(0, 40);
}

function cleanTag(value) {
  return String(value || "")
    .trim()
    .replace(/^#+/, "")
    .replace(/[^\p{L}\p{N}_-]/gu, "");
}

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
