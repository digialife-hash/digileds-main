import {
  Archive,
  ArrowUpRight,
  Bookmark,
  FileText,
  Filter,
  Lightbulb,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import PageHeader from "../layout/PageHeader.jsx";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "socialpost_content_library";

const CATEGORIES = [
  "All",
  "Ideas",
  "Captions",
  "Hooks",
  "Campaign",
  "Notes",
];

const EMPTY_FORM = {
  title: "",
  content: "",
  category: "Ideas",
  tags: "",
};

/* =========================================================
   DEFAULT SAMPLE CONTENT
   Stored only on first load when library has no saved data.
========================================================= */

const SAMPLE_ITEMS = [
  {
    id: "sample-1",
    title: "Behind the scenes campaign",
    content:
      "Show how the team turns an initial idea into a finished campaign. Keep the story short, visual and authentic.",
    category: "Ideas",
    tags: ["behind-scenes", "brand"],
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "Simple product hook",
    content:
      "What if your audience could solve one daily problem in under 60 seconds?",
    category: "Hooks",
    tags: ["hook", "short-form"],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-3",
    title: "Launch caption framework",
    content:
      "Problem → solution → benefit → proof → CTA. Reuse this structure for product or service launch posts.",
    category: "Captions",
    tags: ["launch", "copywriting"],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* =========================================================
   MAIN
========================================================= */

export default function ContentLibrary() {
  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [deleteId, setDeleteId] =
    useState(null);

  const [viewItem, setViewItem] =
    useState(null);

  /* =======================================================
     LOAD STORAGE
  ======================================================== */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEY
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
          return;
        }
      }

      setItems(SAMPLE_ITEMS);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(SAMPLE_ITEMS)
      );
    } catch {
      setItems([]);
    }
  }, []);

  /* =======================================================
     SAVE STORAGE
  ======================================================== */

  useEffect(() => {
    if (!Array.isArray(items)) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch {
      // Ignore localStorage write errors.
    }
  }, [items]);

  /* =======================================================
     FILTERED ITEMS
  ======================================================== */

  const filteredItems = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return [...items]
      .filter((item) => {
        const matchesCategory =
          category === "All" ||
          item.category === category;

        if (!matchesCategory) {
          return false;
        }

        if (!keyword) {
          return true;
        }

        const searchable = [
          item.title,
          item.content,
          item.category,
          ...(item.tags || []),
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
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
        );
      });
  }, [items, search, category]);

  /* =======================================================
     STATS
  ======================================================== */

  const stats = useMemo(() => {
    const favorites = items.filter(
      (item) => item.favorite
    ).length;

    const categoriesUsed = new Set(
      items.map((item) => item.category)
    ).size;

    const tagsCount = new Set(
      items.flatMap((item) => item.tags || [])
    ).size;

    return {
      total: items.length,
      favorites,
      categoriesUsed,
      tagsCount,
    };
  }, [items]);

  /* =======================================================
     OPEN ADD
  ======================================================== */

  const handleAddIdea = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================== */

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      content: item.content || "",
      category:
        item.category || "Ideas",
      tags: Array.isArray(item.tags)
        ? item.tags.join(", ")
        : "",
    });

    setModalOpen(true);
  };

  /* =======================================================
     SAVE
  ======================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);

    const now = new Date().toISOString();

    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title,
                content,
                category: form.category,
                tags,
                updatedAt: now,
              }
            : item
        )
      );
    } else {
      setItems((current) => [
        {
          id: createId(),
          title,
          content,
          category: form.category,
          tags,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ]);
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /* =======================================================
     DELETE
  ======================================================== */

  const handleDelete = () => {
    if (!deleteId) return;

    setItems((current) =>
      current.filter(
        (item) => item.id !== deleteId
      )
    );

    if (viewItem?.id === deleteId) {
      setViewItem(null);
    }

    setDeleteId(null);
  };

  /* =======================================================
     FAVORITE
  ======================================================== */

  const handleFavorite = (id) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              favorite: !item.favorite,
              updatedAt:
                new Date().toISOString(),
            }
          : item
      )
    );
  };

  /* =======================================================
     CLEAR ALL
  ======================================================== */

  const handleClearAll = () => {
    setItems([]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* ===================================================
          AMBIENT BACKGROUND
      ==================================================== */}

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
          title="Content library"
          description="Keep reusable ideas, captions, hooks and campaign notes close to your workflow."
          action={
            <button
              type="button"
              onClick={handleAddIdea}
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
                duration-200
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)]
                dark:bg-white
                dark:text-slate-950
                dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]
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

              Add idea
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
            border-violet-100/80
            bg-white/[0.68]
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-violet-400/10
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent dark:via-violet-400/20" />

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
              bg-violet-400/10
              blur-[90px]
              dark:bg-violet-400/[0.08]
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
              bg-cyan-400/5
              blur-[80px]
              dark:bg-cyan-400/[0.05]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              p-4
              sm:p-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-violet-100
                  bg-violet-50
                  text-violet-600
                  dark:border-violet-400/15
                  dark:bg-violet-400/10
                  dark:text-violet-300
                "
              >
                <Lightbulb
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black tracking-tight text-stone-900 transition-colors dark:text-white sm:text-base">
                    Build your reusable content vault
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-violet-100
                      bg-violet-50
                      px-2
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-violet-600
                      dark:border-violet-400/15
                      dark:bg-violet-400/10
                      dark:text-violet-300
                    "
                  >
                    Workspace
                  </span>
                </div>

                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-stone-500 transition-colors dark:text-slate-400">
                  Save strong hooks, campaign ideas, captions and notes.
                  Everything stays available for your next content workflow.
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
                className="text-orange-500 dark:text-orange-400"
              />
              Reusable content
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        ==================================================== */}

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 lg:grid-cols-4">
          <LibraryStat
            icon={FileText}
            label="Total items"
            value={stats.total}
            tone="violet"
          />

          <LibraryStat
            icon={Bookmark}
            label="Favorites"
            value={stats.favorites}
            tone="amber"
          />

          <LibraryStat
            icon={Tag}
            label="Tags used"
            value={stats.tagsCount}
            tone="cyan"
          />

          <LibraryStat
            icon={Archive}
            label="Categories"
            value={stats.categoriesUsed}
            tone="green"
          />
        </section>

        {/* ===================================================
            CONTROLS
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[22px]
            border
            border-white/80
            bg-white/[0.68]
            p-3
            shadow-[0_14px_40px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_18px_55px_rgba(0,0,0,0.24)]
            sm:mt-6
            sm:p-4
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent dark:via-cyan-400/15" />

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            {/* Search */}

            <div className="relative">
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
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search ideas, captions, hooks..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-stone-200
                  bg-white/80
                  pl-9
                  pr-10
                  text-xs
                  font-medium
                  text-stone-700
                  outline-none
                  transition
                  placeholder:text-stone-400
                  focus:border-violet-300
                  focus:ring-4
                  focus:ring-violet-500/10
                  dark:border-white/[0.08]
                  dark:bg-white/[0.035]
                  dark:text-slate-200
                  dark:placeholder:text-slate-600
                  dark:focus:border-violet-400/30
                  dark:focus:bg-white/[0.05]
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
                    transition
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

            {/* Categories */}

            <div
              className="
                flex
                min-w-0
                gap-1.5
                overflow-x-auto
                pb-0.5
                scrollbar-none
              "
            >
              {CATEGORIES.map((item) => {
                const active =
                  category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setCategory(item)
                    }
                    className={`
                      shrink-0
                      rounded-xl
                      px-3
                      py-2.5
                      text-[10px]
                      font-black
                      transition-all
                      duration-200
                      ${
                        active
                          ? "bg-stone-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                          : "border border-stone-200 bg-white/75 text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-400 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter summary */}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-stone-400 dark:text-slate-500">
              <Filter size={12} />

              Showing{" "}
              <span className="font-black text-stone-600 dark:text-slate-300">
                {filteredItems.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-stone-600 dark:text-slate-300">
                {items.length}
              </span>{" "}
              items
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="
                  text-[10px]
                  font-bold
                  text-red-500
                  transition
                  hover:text-red-600
                  dark:text-red-400
                  dark:hover:text-red-300
                "
              >
                Clear library
              </button>
            )}
          </div>
        </section>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <section className="mt-5 sm:mt-6">
          {filteredItems.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {filteredItems.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onView={() =>
                    setViewItem(item)
                  }
                  onEdit={() =>
                    handleEdit(item)
                  }
                  onDelete={() =>
                    setDeleteId(item.id)
                  }
                  onFavorite={() =>
                    handleFavorite(item.id)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyLibrary
              hasItems={items.length > 0}
              onAdd={handleAddIdea}
              onClearFilters={() => {
                setSearch("");
                setCategory("All");
              }}
            />
          )}
        </section>

        {/* ===================================================
            BOTTOM INFO
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
          <InfoCard
            icon={Lightbulb}
            title="Ideas"
            text="Store campaign concepts, post angles and creative directions."
          />

          <InfoCard
            icon={Bookmark}
            title="Saved captions"
            text="Keep strong captions and reusable copy ready for future content."
          />

          <InfoCard
            icon={Sparkles}
            title="Smart workflow"
            text="Search, organize, edit and reuse your strongest content ideas anytime."
          />
        </section>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {modalOpen && (
        <ModalOverlay
          onClose={() => {
            setModalOpen(false);
            setEditingId(null);
          }}
        >
          <div
            className="
              relative
              w-full
              max-w-2xl
              overflow-hidden
              rounded-[28px]
              border
              border-white/80
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.20)]
              dark:border-white/[0.08]
              dark:bg-[#0d1421]
              dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent dark:via-violet-400/25" />

            {/* Modal header */}

            <div className="flex items-start justify-between gap-4 border-b border-stone-200/70 p-5 dark:border-white/[0.07] sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-xl
                    border
                    border-violet-100
                    bg-violet-50
                    text-violet-600
                    dark:border-violet-400/15
                    dark:bg-violet-400/10
                    dark:text-violet-300
                  "
                >
                  {editingId ? (
                    <Pencil size={17} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-black text-stone-900 dark:text-white">
                    {editingId
                      ? "Edit library item"
                      : "Add content idea"}
                  </h2>

                  <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                    Save something useful for your next post.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingId(null);
                }}
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
                  hover:bg-stone-100
                  hover:text-stone-700
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-500
                  dark:hover:bg-white/[0.08]
                  dark:hover:text-slate-200
                "
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5 sm:p-6"
            >
              {/* Title */}

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-500">
                  Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title:
                        event.target.value,
                    }))
                  }
                  placeholder="Example: Summer launch hook"
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
                    transition
                    placeholder:text-stone-400
                    focus:border-violet-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-violet-500/10
                    dark:border-white/[0.08]
                    dark:bg-white/[0.025]
                    dark:text-slate-200
                    dark:placeholder:text-slate-600
                    dark:focus:border-violet-400/30
                    dark:focus:bg-white/[0.045]
                  "
                />
              </div>

              {/* Content */}

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-500">
                  Content
                </label>

                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content:
                        event.target.value,
                    }))
                  }
                  placeholder="Write the idea, caption, hook or campaign note..."
                  rows={6}
                  className="
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-stone-200
                    bg-stone-50/50
                    px-3
                    py-3
                    text-sm
                    font-medium
                    leading-6
                    text-stone-800
                    outline-none
                    transition
                    placeholder:text-stone-400
                    focus:border-violet-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-violet-500/10
                    dark:border-white/[0.08]
                    dark:bg-white/[0.025]
                    dark:text-slate-200
                    dark:placeholder:text-slate-600
                    dark:focus:border-violet-400/30
                    dark:focus:bg-white/[0.045]
                  "
                />
              </div>

              {/* Category + tags */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-500">
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
                      transition
                      focus:border-violet-300
                      focus:bg-white
                      focus:ring-4
                      focus:ring-violet-500/10
                      dark:border-white/[0.08]
                      dark:bg-[#111a28]
                      dark:text-slate-200
                      dark:focus:border-violet-400/30
                    "
                  >
                    {CATEGORIES.filter(
                      (item) => item !== "All"
                    ).map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="bg-white text-stone-800 dark:bg-[#111a28] dark:text-slate-200"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 dark:text-slate-500">
                    Tags
                  </label>

                  <input
                    type="text"
                    value={form.tags}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tags:
                          event.target.value,
                      }))
                    }
                    placeholder="launch, reels, brand"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50/50
                      px-3
                      text-xs
                      font-medium
                      text-stone-700
                      outline-none
                      transition
                      placeholder:text-stone-400
                      focus:border-violet-300
                      focus:bg-white
                      focus:ring-4
                      focus:ring-violet-500/10
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:text-slate-200
                      dark:placeholder:text-slate-600
                      dark:focus:border-violet-400/30
                      dark:focus:bg-white/[0.045]
                    "
                  />
                </div>
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-4 dark:border-white/[0.07] sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingId(null);
                  }}
                  className="
                    h-11
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
                    dark:bg-white/[0.035]
                    dark:text-slate-300
                    dark:hover:bg-white/[0.07]
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !form.title.trim() ||
                    !form.content.trim()
                  }
                  className="
                    h-11
                    rounded-xl
                    bg-stone-950
                    px-5
                    text-xs
                    font-bold
                    text-white
                    shadow-lg
                    transition
                    hover:bg-stone-800
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    dark:bg-white
                    dark:text-slate-950
                    dark:hover:bg-slate-100
                  "
                >
                  {editingId
                    ? "Save changes"
                    : "Add to library"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* =====================================================
          VIEW MODAL
      ====================================================== */}

      {viewItem && (
        <ModalOverlay
          onClose={() => setViewItem(null)}
        >
          <div
            className="
              relative
              w-full
              max-w-2xl
              overflow-hidden
              rounded-[28px]
              border
              border-white/80
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.20)]
              dark:border-white/[0.08]
              dark:bg-[#0d1421]
              dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent dark:via-violet-400/25" />

            <div className="border-b border-stone-200/70 p-5 dark:border-white/[0.07] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="
                        inline-flex
                        items-center
                        rounded-lg
                        border
                        border-violet-100
                        bg-violet-50
                        px-2
                        py-1
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.08em]
                        text-violet-600
                        dark:border-violet-400/15
                        dark:bg-violet-400/10
                        dark:text-violet-300
                      "
                    >
                      {viewItem.category}
                    </span>

                    {viewItem.favorite && (
                      <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
                        Favorite
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 break-words text-lg font-black tracking-tight text-stone-900 transition-colors dark:text-white sm:text-xl">
                    {viewItem.title}
                  </h2>

                  <p className="mt-1 text-[10px] text-stone-400 dark:text-slate-500">
                    Updated{" "}
                    {formatDate(
                      viewItem.updatedAt ||
                        viewItem.createdAt
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewItem(null)
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
                    hover:bg-stone-100
                    hover:text-stone-700
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-500
                    dark:hover:bg-white/[0.08]
                    dark:hover:text-slate-200
                  "
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div
                className="
                  whitespace-pre-wrap
                  break-words
                  rounded-2xl
                  border
                  border-stone-200
                  bg-stone-50/70
                  p-4
                  text-sm
                  leading-7
                  text-stone-700
                  dark:border-white/[0.08]
                  dark:bg-white/[0.025]
                  dark:text-slate-300
                "
              >
                {viewItem.content}
              </div>

              {viewItem.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {viewItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-stone-200
                        bg-white
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-bold
                        text-stone-500
                        dark:border-white/[0.08]
                        dark:bg-white/[0.035]
                        dark:text-slate-400
                      "
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setViewItem(null);
                    handleEdit(viewItem);
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
                    dark:bg-white/[0.035]
                    dark:text-slate-300
                    dark:hover:bg-white/[0.07]
                  "
                >
                  <Pencil size={13} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewItem(null);
                    setDeleteId(viewItem.id);
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
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-[26px]
              border
              border-white/80
              bg-white
              p-5
              shadow-[0_30px_100px_rgba(0,0,0,0.20)]
              dark:border-white/[0.08]
              dark:bg-[#0d1421]
              dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
              sm:p-6
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent dark:via-red-400/20" />

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
                  Delete this item?
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
                  This content idea will be permanently removed from your library.
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
                  dark:bg-white/[0.035]
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
                  shadow-sm
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
   LIBRARY STAT
========================================================= */

function LibraryStat({
  icon: Icon,
  label,
  value,
  tone = "slate",
}) {
  const tones = {
    violet:
      "border-violet-200/70 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",
    amber:
      "border-amber-200/70 bg-amber-50 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300",
    cyan:
      "border-cyan-200/70 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",
    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",
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
        bg-white/[0.68]
        p-4
        shadow-[0_14px_40px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_18px_55px_rgba(0,0,0,0.24)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.08]" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-stone-900 transition-colors dark:text-white sm:text-3xl">
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
   CONTENT CARD
========================================================= */

function ContentCard({
  item,
  onView,
  onEdit,
  onDelete,
  onFavorite,
}) {
  return (
    <article
      className="
        group
        relative
        flex
        min-h-[275px]
        min-w-0
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-white/80
        bg-white/[0.68]
        shadow-[0_16px_45px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_60px_rgba(0,0,0,0.26)]
        dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.34)]
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent dark:via-violet-400/15" />

      <div
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-violet-400/5
          blur-[55px]
          dark:bg-violet-400/[0.06]
        "
      />

      {/* Header */}

      <div className="relative flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-4 dark:border-white/[0.06]">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-xl
              border
              border-violet-100
              bg-violet-50
              text-violet-600
              dark:border-violet-400/15
              dark:bg-violet-400/10
              dark:text-violet-300
            "
          >
            {getCategoryIcon(item.category)}
          </div>

          <div className="min-w-0">
            <span
              className="
                inline-flex
                rounded-lg
                border
                border-stone-200
                bg-stone-50
                px-2
                py-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.08em]
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              {item.category}
            </span>

            <h3
              className="
                mt-1.5
                truncate
                text-sm
                font-black
                text-stone-900
                transition-colors
                dark:text-white
              "
              title={item.title}
            >
              {item.title}
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
            border
            transition
            ${
              item.favorite
                ? "border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300"
                : "border-transparent bg-stone-50 text-stone-300 hover:border-amber-100 hover:bg-amber-50 hover:text-amber-500 dark:bg-white/[0.035] dark:text-slate-600 dark:hover:border-amber-400/15 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
            }
          `}
          aria-label={
            item.favorite
              ? "Remove favorite"
              : "Add favorite"
          }
        >
          <Bookmark
            size={15}
            fill={
              item.favorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* Content */}

      <button
        type="button"
        onClick={onView}
        className="
          flex
          min-w-0
          flex-1
          flex-col
          p-4
          text-left
          outline-none
        "
      >
        <p className="line-clamp-5 break-words text-sm leading-6 text-stone-600 transition-colors dark:text-slate-300">
          {item.content}
        </p>

        <div className="mt-auto pt-5">
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="
                      rounded-full
                      border
                      border-stone-200
                      bg-stone-50
                      px-2
                      py-1
                      text-[8px]
                      font-bold
                      text-stone-400
                      dark:border-white/[0.07]
                      dark:bg-white/[0.035]
                      dark:text-slate-500
                    "
                  >
                    #{tag}
                  </span>
                ))}

              {item.tags.length > 3 && (
                <span
                  className="
                    rounded-full
                    border
                    border-stone-200
                    bg-stone-50
                    px-2
                    py-1
                    text-[8px]
                    font-bold
                    text-stone-400
                    dark:border-white/[0.07]
                    dark:bg-white/[0.035]
                    dark:text-slate-500
                  "
                >
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </button>

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
          dark:bg-white/[0.02]
        "
      >
        <span className="text-[9px] font-semibold text-stone-400 dark:text-slate-500">
          {formatDate(
            item.updatedAt ||
              item.createdAt
          )}
        </span>

        <div className="flex items-center gap-1">
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
              dark:hover:bg-white/[0.07]
              dark:hover:text-slate-200
            "
            aria-label="Edit"
          >
            <Pencil size={13} />
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

          <button
            type="button"
            onClick={onView}
            className="
              inline-flex
              h-8
              items-center
              gap-1
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
              hover:text-stone-800
              dark:border-white/[0.08]
              dark:bg-white/[0.045]
              dark:text-slate-400
              dark:shadow-none
              dark:hover:bg-white/[0.08]
              dark:hover:text-slate-200
            "
          >
            Open
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
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
        bg-white/[0.68]
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
          <h3 className="text-sm font-black text-stone-800 transition-colors dark:text-slate-200">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-stone-500 transition-colors dark:text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY LIBRARY
========================================================= */

function EmptyLibrary({
  hasItems,
  onAdd,
  onClearFilters,
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
        bg-white/[0.68]
        px-5
        py-14
        text-center
        shadow-[0_18px_55px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-colors
        duration-300
        dark:border-white/[0.10]
        dark:bg-white/[0.025]
        dark:shadow-[0_20px_60px_rgba(0,0,0,0.24)]
        sm:px-8
      "
    >
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
          bg-violet-400/5
          blur-3xl
          dark:bg-violet-400/[0.06]
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
          dark:text-slate-600
          dark:shadow-none
        "
      >
        {hasItems ? (
          <Search size={25} />
        ) : (
          <Lightbulb size={25} />
        )}
      </div>

      <h2 className="relative mt-5 text-base font-black tracking-tight text-stone-800 transition-colors dark:text-slate-200 sm:text-lg">
        {hasItems
          ? "No matching content"
          : "Your content library is empty"}
      </h2>

      <p className="relative mt-2 max-w-md text-xs leading-5 text-stone-400 transition-colors dark:text-slate-500 sm:text-sm">
        {hasItems
          ? "Try another search term or category, or clear the filters to see all saved items."
          : "Save campaign ideas, reusable captions, hooks and creative notes here for your next post."}
      </p>

      <div className="relative mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={
            hasItems
              ? onClearFilters
              : onAdd
          }
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-stone-950
            px-5
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
          <Plus size={14} />

          {hasItems
            ? "Clear filters"
            : "Add your first idea"}
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   MODAL OVERLAY
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
        items-center
        justify-center
        overflow-y-auto
        bg-stone-950/45
        p-3
        backdrop-blur-sm
        dark:bg-black/65
        sm:p-5
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCategoryIcon(category) {
  switch (category) {
    case "Captions":
      return (
        <FileText
          size={17}
          strokeWidth={1.8}
        />
      );

    case "Hooks":
      return (
        <Sparkles
          size={17}
          strokeWidth={1.8}
        />
      );

    case "Campaign":
      return (
        <Archive
          size={17}
          strokeWidth={1.8}
        />
      );

    case "Notes":
      return (
        <Bookmark
          size={17}
          strokeWidth={1.8}
        />
      );

    default:
      return (
        <Lightbulb
          size={17}
          strokeWidth={1.8}
        />
      );
  }
}