import {
  Check,
  ExternalLink,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SITE_API } from "../utils.js";

const EMPTY_PRODUCT = {
  title: "",
  description: "",
  price: "",
  image_path: "",
  file_link: "",
  download_path: "",
  is_active: true,
};

function assetUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || /^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? `${SITE_API}${raw}` : raw;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/products`);
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to load products.");
      setProducts(Array.isArray(payload.tables) ? payload.tables : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function selectImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      image_path: product.image_path || "",
      file_link: product.file_link || "",
      download_path: product.download_path || "",
      is_active: Boolean(product.is_active),
    });
    setImageFile(null);
    setImagePreview("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...EMPTY_PRODUCT });
    setImageFile(null);
    setImagePreview("");
  }

  async function uploadImage() {
    if (!imageFile) return;
    setUploadingImage(true);
    setError("");
    setMessage("");
    try {
      const data = new FormData();
      data.append("image", imageFile);
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/products/image`,
        {
          method: "POST",
          body: data,
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to upload product image.");
      }
      setForm((current) => ({ ...current, image_path: payload.url }));
      setImageFile(null);
      setMessage("Product image uploaded. Save the product to continue.");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload product image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/products${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to create product.");
      if (editingId) {
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId ? payload.data : product,
          ),
        );
      } else {
        setProducts((current) => [payload.data, ...current]);
      }
      resetForm();
      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully.",
      );
    } catch (saveError) {
      setError(saveError.message || "Unable to create product.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    setError("");
    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/products/${id}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to delete product.");
      setProducts((current) => current.filter((product) => product.id !== id));
      setMessage("Product deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete product.");
    } finally {
      setDeleting(null);
    }
  }

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      product.title,
      product.description,
      product.price,
      product.file_link,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            {editingId ? "Edit product" : "Add product"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage products stored in the production MySQL products table.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProducts}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
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
        onSubmit={submitProduct}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [
              "title",
              "Product title",
              "e.g. Instagram Marketing Template Pack",
            ],
            ["price", "Price (INR)", "1999.00"],
            ["image_path", "Image path / URL", "images/common/hero-1.jpg"],
            ["file_link", "File link", "https://..."],
            ["download_path", "Download path", "/downloads/product.zip"],
          ].map(([name, label, placeholder]) => (
            <label
              key={name}
              className={name === "title" ? "md:col-span-2" : ""}
            >
              <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {label}
              </span>
              <input
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
              Product image upload
            </span>
            <div className="grid gap-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 sm:grid-cols-[140px_1fr]">
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
                {imagePreview || form.image_path ? (
                  <img
                    src={imagePreview || assetUrl(form.image_path)}
                    alt="Product preview"
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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={uploadImage}
                    disabled={!imageFile || uploadingImage}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}{" "}
                    Upload image
                  </button>
                  {form.image_path && (
                    <span className="text-xs text-emerald-600">
                      Uploaded: {form.image_path}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WebP, SVG or ICO. Upload first, then add the
                  product.
                </p>
              </div>
            </div>
          </div>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
              Description
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={3}
              placeholder="Describe what the customer receives."
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={updateField}
            className="h-4 w-4 accent-emerald-600"
          />{" "}
          Active product
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {saving ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}{" "}
          {editingId ? "Update product" : "Add product"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold dark:border-slate-700"
          >
            <X size={16} /> Cancel edit
          </button>
        )}
      </form>

      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products by title, description or price..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
            Loading products...
          </div>
        ) : (
          filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {product.image_path && (
                <img
                  src={assetUrl(product.image_path)}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white">
                      {product.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {product.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                    ₹{product.price}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {product.file_link && product.file_link !== "#" ? (
                    <a
                      href={assetUrl(product.file_link)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"
                    >
                      Open file <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No file link</span>
                  )}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      disabled={deleting === product.id}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={14} />{" "}
                      {deleting === product.id ? "Deleting..." : "Delete"}
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
