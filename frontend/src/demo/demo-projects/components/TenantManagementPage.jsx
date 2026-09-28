import { useEffect, useState } from "react";
import { Building2, Check, Edit3, Plus, RefreshCw, Save, X } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  slug: "",
  domains: "",
  status: "active",
};

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");

  async function loadTenants() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tenants", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Tenants could not be loaded.");
      }
      setTenants(Array.isArray(data.tenants) ? data.tenants : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  async function createTenant(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editingId ? `/api/tenants/${editingId}` : "/api/tenants",
        {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          ...(editingId ? {} : { slug: form.slug }),
          domains: form.domains
            .split(",")
            .map((domain) => domain.trim())
            .filter(Boolean),
          status: form.status,
        }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Tenant could not be created.");
      }
      setForm(EMPTY_FORM);
      setEditingId("");
      await loadTenants();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(tenant) {
    setEditingId(tenant.id);
    setForm({
      name: tenant.name || "",
      slug: tenant.slug || "",
      domains: Array.isArray(tenant.domains) ? tenant.domains.join(", ") : "",
      status: tenant.status || "active",
    });
    setError("");
  }

  function cancelEditing() {
    setEditingId("");
    setForm(EMPTY_FORM);
    setError("");
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            PLATFORM ADMINISTRATION
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Tenants and domains
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage isolated client workspaces and the domains that resolve to them.
          </p>
        </div>
        <button
          type="button"
          onClick={loadTenants}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={createTenant}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_0.7fr_auto_auto]"
      >
        <input
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Tenant name"
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        />
        <input
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          value={form.slug}
          onChange={(event) => setForm({ ...form, slug: event.target.value })}
          placeholder="tenant-slug"
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        />
        <input
          value={form.domains}
          onChange={(event) => setForm({ ...form, domains: event.target.value })}
          placeholder="client-a.com, www.client-a.com"
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        />
        <select
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {saving ? <Save size={14} /> : editingId ? <Check size={14} /> : <Plus size={14} />}
          {saving ? "Saving..." : editingId ? "Save tenant" : "Create tenant"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={cancelEditing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300"
          >
            <X size={14} /> Cancel
          </button>
        )}
      </form>

      <div className="grid gap-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
            Loading tenants...
          </div>
        ) : tenants.length ? (
          tenants.map((tenant) => (
            <article
              key={tenant.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Building2 size={17} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                    {tenant.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tenant.slug} · {tenant.domains?.join(", ") || "No custom domain"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(tenant)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-600 dark:border-slate-800 dark:text-slate-300"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    tenant.status === "active"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}
                >
                  {tenant.status}
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No tenants found.
          </div>
        )}
      </div>
    </section>
  );
}
