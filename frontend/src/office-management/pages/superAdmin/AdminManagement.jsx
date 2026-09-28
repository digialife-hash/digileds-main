import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
} from "../../services/adminManagementService";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Panel,
  StatusBadge,
} from "../HR/HRUi";
import { useAuth } from "../../context/authStore";
import Unauthorized from "../Unauthorized";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  tenantId: "",
  status: "active",
};

const permissionActions = [
  ["view", "View"],
  ["create", "Create"],
  ["edit", "Edit"],
  ["delete", "Delete"],
  ["approve", "Approve"],
  ["assign", "Assign"],
  ["convertToProject", "Convert"],
];

const permissionModules = [
  ["clients", "Clients"],
  ["serviceRequests", "Service requests"],
  ["projects", "Projects"],
  ["employees", "Employees"],
  ["teams", "Teams"],
  ["tasks", "Tasks"],
  ["payroll", "Payroll"],
  ["reports", "Reports"],
  ["documents", "Documents"],
  ["leaves", "Leaves"],
  ["attendance", "Attendance"],
  ["settings", "Settings"],
  ["dailyWorkReports", "Daily work reports"],
  ["holidays", "Holidays"],
  ["announcements", "Announcements"],
  ["meetings", "Meetings"],
];

const dashboardPermissions = [
  ["adminDashboard", "DigiLeads Admin Dashboard"],
  ["socialDashboard", "Sociapost Dashboard"],
  ["officeDashboard", "Digileads Office Dashboard"],
];

const emptyPermissions = () =>
  Object.fromEntries([
    ...permissionModules.map(([moduleName]) => [moduleName, {}]),
    ...dashboardPermissions.map(([moduleName]) => [moduleName, { view: false }]),
  ]);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  fallback;

const AdminManagement = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingAccount, setEditingAccount] = useState(null);
  const [permissionAccount, setPermissionAccount] = useState(null);
  const [permissions, setPermissions] = useState(emptyPermissions);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tenants, setTenants] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminAccounts();
      setAccounts(response.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Admin accounts could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTenants = useCallback(async () => {
    try {
      const response = await fetch("/api/tenants", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Tenant list could not be loaded.");
      }
      setTenants(data.tenants || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Tenant list could not be loaded."));
    }
  }, []);

  useEffect(() => {
    if (user?.role === "super_admin") {
      void load();
      void loadTenants();
    }
  }, [load, loadTenants, user?.role]);

  const activeCount = useMemo(
    () => accounts.filter((account) => account.status === "active").length,
    [accounts],
  );

  const closeForm = () => {
    setShowForm(false);
    setEditingAccount(null);
    setForm(initialForm);
    setFormError("");
  };

  const openCreate = () => {
    setEditingAccount(null);
    setForm(initialForm);
    setFormError("");
    setShowPassword(false);
    setShowForm(true);
  };

  const openEdit = (account) => {
    setEditingAccount(account);
    setForm({
      name: account.name || "",
      email: account.email || "",
      phone: account.phone || "",
      password: "",
      tenantId: account.tenantId || "",
      status: account.status || "active",
    });
    setFormError("");
    setShowPassword(false);
    setShowForm(true);
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || (!editingAccount && !form.password)) {
      setFormError(
        editingAccount
          ? "Full name and email are required."
          : "Full name, email and temporary password are required.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please provide a valid email address.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      const payload = {
        name,
        phone: form.phone.trim(),
        tenantId: form.tenantId || null,
        status: form.status,
      };
      if (!editingAccount) {
        payload.email = email;
        payload.password = form.password;
        payload.permissions = emptyPermissions();
      } else if (form.password) {
        payload.password = form.password;
      }

      const response = editingAccount
        ? await updateAdminAccount(editingAccount._id, payload)
        : await createAdminAccount(payload);

      setAccounts((current) =>
        editingAccount
          ? current.map((account) =>
              account._id === response.data._id ? response.data : account,
            )
          : [response.data, ...current],
      );
      closeForm();
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, "Admin account could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (account) => {
    try {
      setError("");
      const response = await updateAdminAccount(account._id, {
        status: account.status === "active" ? "inactive" : "active",
      });
      setAccounts((current) =>
        current.map((item) =>
          item._id === response.data._id ? response.data : item,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Account status could not be updated."));
    }
  };

  const openPermissions = (account) => {
    setPermissionAccount(account);
    setPermissions(
      [...permissionModules, ...dashboardPermissions].reduce((result, [moduleName]) => {
        result[moduleName] = {
          ...(result[moduleName] || {}),
          ...(account.permissions?.[moduleName] || {}),
        };
        return result;
      }, emptyPermissions()),
    );
  };

  const updatePermission = (moduleName, action) => {
    setPermissions((current) => ({
      ...current,
      [moduleName]: {
        ...current[moduleName],
        [action]: !current[moduleName]?.[action],
      },
    }));
  };

  const setModulePermissions = (moduleName, enabled) => {
    setPermissions((current) => ({
      ...current,
      [moduleName]: enabled
        ? Object.fromEntries(permissionActions.map(([action]) => [action, true]))
        : {},
    }));
  };

  const savePermissions = async () => {
    if (!permissionAccount) return;
    try {
      setSaving(true);
      setError("");
      const response = await updateAdminAccount(permissionAccount._id, {
        permissions,
      });
      setAccounts((current) =>
        current.map((account) =>
          account._id === response.data._id ? response.data : account,
        ),
      );
      setPermissionAccount(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Admin permissions could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (account) => {
    if (!window.confirm(`Delete main admin account for ${account.name}?`)) return;
    try {
      setError("");
      await deleteAdminAccount(account._id);
      setAccounts((current) =>
        current.filter((item) => item._id !== account._id),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Admin account could not be deleted."));
    }
  };

  if (user?.role !== "super_admin") return <Unauthorized />;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Super Admin control center"
        title="Main Admin Management"
        description="Create admin accounts, control their status, and assign the exact modules and actions they can use."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={17} /> Create main admin
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total admins", accounts.length, "bg-blue-50 text-blue-700"],
          ["Active admins", activeCount, "bg-emerald-50 text-emerald-700"],
          ["Inactive admins", accounts.length - activeCount, "bg-amber-50 text-amber-700"],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-black text-slate-950">{value}</p>
              <span className={`rounded-xl px-3 py-2 text-xs font-black ${tone}`}>
                <UserCog size={18} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading main admin accounts..." />
      ) : (
        <Panel
          title="Admin accounts"
          description="Only Super Admin can create, edit, disable, delete, or change these permissions."
        >
          {!accounts.length ? (
            <EmptyState label="No main admin accounts created yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {["Admin", "Contact", "Tenant", "Status", "Last login", "Actions"].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => (
                    <tr key={account._id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-black text-slate-900">{account.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{account.email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{account.phone || "Not added"}</td>
                      <td className="px-4 py-4 text-slate-600">
                        {tenants.find((tenant) => tenant.id === String(account.tenantId))?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-4"><StatusBadge value={account.status} /></td>
                      <td className="px-4 py-4 text-slate-600">{account.lastLogin ? new Date(account.lastLogin).toLocaleString("en-IN") : "Never"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openPermissions(account)} title="Manage permissions" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"><KeyRound size={14} /> Permissions</button>
                          <button type="button" onClick={() => openEdit(account)} title="Edit account" className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"><Pencil size={15} /></button>
                          <button type="button" onClick={() => void toggleStatus(account)} title="Toggle status" className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"><ShieldCheck size={15} /></button>
                          <button type="button" onClick={() => void remove(account)} title="Delete account" className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{editingAccount ? "Account settings" : "New account"}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{editingAccount ? "Edit main admin" : "Create main admin"}</h2>
                <p className="mt-1 text-sm text-slate-500">{editingAccount ? "Update account details or set a new password." : "Create the account first, then assign permissions from the account list."}</p>
              </div>
              <button type="button" onClick={closeForm} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            {formError && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{formError}</div>}
            <form onSubmit={saveAccount} className="grid gap-5 sm:grid-cols-2">
              <label className="group space-y-2 text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2"><UserRound size={15} className="text-blue-600" /> Full name</span>
                <span className="relative block">
                  <UserRound size={17} className="pointer-events-none absolute left-3 top-3.5 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter full name" autoComplete="name" className="field-input h-12 rounded-xl pl-10 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                </span>
              </label>
              <label className="group space-y-2 text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2"><Mail size={15} className="text-blue-600" /> Email address</span>
                <span className="relative block">
                  <Mail size={17} className="pointer-events-none absolute left-3 top-3.5 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input required={!editingAccount} disabled={!!editingAccount} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@example.com" autoComplete="email" className="field-input h-12 rounded-xl pl-10 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100" />
                </span>
                {editingAccount && <span className="block text-[11px] font-medium text-slate-400">Email cannot be changed after account creation.</span>}
              </label>
              <label className="group space-y-2 text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2"><Phone size={15} className="text-blue-600" /> Phone number <em className="text-xs font-medium text-slate-400">(optional)</em></span>
                <span className="relative block">
                  <Phone size={17} className="pointer-events-none absolute left-3 top-3.5 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input type="tel" inputMode="numeric" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit phone number" autoComplete="tel" className="field-input h-12 rounded-xl pl-10 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                </span>
              </label>
              <label className="group space-y-2 text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2"><LockKeyhole size={15} className="text-blue-600" /> {editingAccount ? "New password" : "Temporary password"} {editingAccount && <em className="text-xs font-medium text-slate-400">(optional)</em>}</span>
                <span className="relative block">
                  <LockKeyhole size={17} className="pointer-events-none absolute left-3 top-3.5 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input required={!editingAccount} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editingAccount ? "Leave blank to keep current" : "Minimum 8 characters"} autoComplete="new-password" className="field-input h-12 rounded-xl pl-10 pr-11 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </span>
                {!editingAccount && <span className="block text-[11px] font-medium text-slate-400">Use 8+ characters with uppercase, lowercase, number and special character.</span>}
              </label>
              {editingAccount && <label className="group space-y-2 text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-blue-600" /> Account status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="field-input h-12 rounded-xl transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>}
              <label className="group space-y-2 text-sm font-bold text-slate-700 sm:col-span-2">
                <span className="flex items-center gap-2"><UserCog size={15} className="text-blue-600" /> Tenant assignment</span>
                <select value={form.tenantId} onChange={(event) => setForm({ ...form, tenantId: event.target.value })} className="field-input h-12 rounded-xl transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                  <option value="">Unassigned</option>
                  {tenants.filter((tenant) => tenant.status === "active").map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.slug})</option>
                  ))}
                </select>
                <span className="block text-[11px] font-medium text-slate-400">The admin can log in to and manage data for this tenant.</span>
              </label>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving..." : <><Check size={16} /> {editingAccount ? "Save changes" : "Create main admin"}</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {permissionAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Access control</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Permissions · {permissionAccount.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Select exactly what this Admin can access. Unselected actions are denied by the backend.</p>
              </div>
              <button type="button" onClick={() => setPermissionAccount(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {dashboardPermissions.map(([moduleName, label]) => (
                <label key={moduleName} className="flex cursor-pointer items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <span><span className="block text-sm font-black text-slate-800">{label}</span><span className="text-xs font-medium text-slate-500">Allow this dashboard after login</span></span>
                  <input type="checkbox" checked={permissions[moduleName]?.view === true} onChange={() => updatePermission(moduleName, "view")} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </label>
              ))}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">Module</th>{permissionActions.map(([action, label]) => <th key={action} className="px-3 py-3 text-center text-xs font-black uppercase tracking-wide text-slate-500">{label}</th>)}<th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wide text-slate-500">All</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionModules.map(([moduleName, label]) => {
                    const allEnabled = permissionActions.every(([action]) => permissions[moduleName]?.[action] === true);
                    return <tr key={moduleName} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{label}</td>
                      {permissionActions.map(([action, actionLabel]) => <td key={action} className="px-3 py-3 text-center"><input type="checkbox" checked={permissions[moduleName]?.[action] === true} onChange={() => updatePermission(moduleName, action)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" aria-label={`${label} ${actionLabel}`} /></td>)}
                      <td className="px-3 py-3 text-center"><input type="checkbox" checked={allEnabled} onChange={(event) => setModulePermissions(moduleName, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" aria-label={`${label} all permissions`} /></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPermissionAccount(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => void savePermissions()} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving..." : "Save permissions"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminManagement;
