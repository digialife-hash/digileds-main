import {
  Check,
  ExternalLink,
  LoaderCircle,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SITE_API } from "../utils.js";

const EMPTY = {
  title: "",
  category: "",
  image_path: "",
  project_link: "",
  is_featured: true,
  is_active: true,
};

function assetUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || /^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${SITE_API}${raw}`;
  if (raw.startsWith("uploads/")) return `${SITE_API}/${raw}`;
  return raw;
}

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/portfolio`);
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to load portfolio.");
      setItems(Array.isArray(payload.tables) ? payload.tables : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function selectImage(event) {
    const next = event.target.files?.[0];
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function uploadImage() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("image", file);
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/portfolio/image`,
        { method: "POST", body: data },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to upload portfolio image.");
      setForm((current) => ({ ...current, image_path: payload.url }));
      setFile(null);
      setMessage("Image uploaded. Save the portfolio item.");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload portfolio image.");
    } finally {
      setUploading(false);
    }
  }

  function editItem(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "",
      image_path: item.image_path || "",
      project_link: item.project_link || "",
      is_featured: Boolean(item.is_featured),
      is_active: Boolean(item.is_active),
    });
    setPreview("");
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setFile(null);
    setPreview("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/portfolio${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to save portfolio item.");
      if (editingId)
        setItems((current) =>
          current.map((item) => (item.id === editingId ? payload.data : item)),
        );
      else setItems((current) => [payload.data, ...current]);
      resetForm();
      setMessage(
        editingId ? "Portfolio item updated." : "Portfolio item added.",
      );
    } catch (saveError) {
      setError(saveError.message || "Unable to save portfolio item.");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id) {
    if (!window.confirm("Delete this portfolio item? This cannot be undone."))
      return;
    setDeleting(id);
    setError("");
    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/portfolio/${id}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to delete portfolio item.");
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("Portfolio item deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete portfolio item.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            {editingId ? "Edit portfolio" : "Add portfolio"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage portfolio items stored in the portfolio_items table.
          </p>
        </div>
        <button
          type="button"
          onClick={loadItems}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold dark:border-slate-800 dark:bg-slate-900"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
          Reload
        </button>
      </div>
      {(error || message) && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {error ? <X size={16} /> : <Check size={16} />}
          {error || message}
        </div>
      )}

      <form
        onSubmit={submit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["title", "Project title", "Alley Printing"],
            ["category", "Category", "Printing Press"],
            ["project_link", "Project URL", "https://example.com"],
          ].map(([name, label, placeholder]) => (
            <label
              key={name}
              className={name === "project_link" ? "md:col-span-2" : ""}
            >
              <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {label}
              </span>
              <input
                required
                name={name}
                value={form[name]}
                onChange={updateField}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
          ))}
          <div className="md:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
              Portfolio image
            </span>
            <div className="grid gap-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 sm:grid-cols-[160px_1fr]">
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
                {preview || form.image_path ? (
                  <img
                    src={preview || assetUrl(form.image_path)}
                    alt="Portfolio preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No image</span>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico"
                  onChange={selectImage}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                />
                <button
                  type="button"
                  onClick={uploadImage}
                  disabled={!file || uploading}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  {uploading ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <UploadCloud size={14} />
                  )}{" "}
                  Upload image
                </button>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WebP, SVG or ICO. Upload first, then save.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={updateField}
              className="accent-emerald-600"
            />
            <Star size={15} /> Featured
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={updateField}
              className="accent-emerald-600"
            />{" "}
            Active
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {saving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {editingId ? "Update portfolio" : "Add portfolio"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold dark:border-slate-700"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
            Loading portfolio...
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {item.image_path && (
                <img
                  src={assetUrl(item.image_path)}
                  alt={item.title}
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.category}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {item.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {item.project_link && (
                    <a
                      href={assetUrl(item.project_link)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"
                    >
                      Open project <ExternalLink size={13} />
                    </a>
                  )}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => editItem(item)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={deleting === item.id}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
