import { useEffect, useState } from "react";
import { KeyRound, RefreshCcw, ShieldCheck, X } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getSystemUsers, updateSystemUser } from "../../services/systemUserService";
import { useAuth } from "../../context/authStore";

const permissionActions = ["view", "create", "edit", "delete", "approve", "assign", "convertToProject"];
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

const blankPermissions = () =>
  Object.fromEntries(permissionModules.map(([moduleName]) => [moduleName, {}]));

const SystemUserManagement = () => {
  const { user: actor } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionUser, setPermissionUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [tenants, setTenants] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getSystemUsers();
      setUsers(response.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load system users");
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await fetch("/api/tenants", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load tenants");
      }
      setTenants(data.tenants || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openPermissions = (account) => {
    setPermissionUser(account);
    setPermissions(
      permissionModules.reduce((result, [moduleName]) => {
        result[moduleName] = { ...(account.permissions?.[moduleName] || {}) };
        return result;
      }, blankPermissions())
    );
  };

  const canGrant = (moduleName, action) =>
    actor?.role === "super_admin" ||
    actor?.permissions?.[moduleName]?.[action] === true;

  const togglePermission = (moduleName, action) => {
    if (!canGrant(moduleName, action)) return;
    setPermissions((current) => ({
      ...current,
      [moduleName]: {
        ...current[moduleName],
        [action]: !current[moduleName]?.[action],
      },
    }));
  };

  const savePermissions = async () => {
    if (!permissionUser) return;
    try {
      setSaving(true);
      const response = await updateSystemUser(permissionUser._id, { permissions });
      setUsers((current) =>
        current.map((item) => (item._id === response.data._id ? response.data : item))
      );
      setPermissionUser(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Permissions could not be updated");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadTenants();
  }, []);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">System administration</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Users, Roles & Permissions</h1>
        </div>
        <button type="button" onClick={() => void Promise.all([loadUsers(), loadTenants()])} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>
      {loading ? <LoadingSpinner /> : error ? <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>{["User", "Email", "Role", "Tenant", "Status", "Last login", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold text-slate-600">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700"><ShieldCheck size={13} /> {user.role.replaceAll("_", " ")}</span></td>
                  <td className="px-4 py-3">
                    <select
                      value={user.tenantId || ""}
                      disabled={actor?.role !== "super_admin" || user.role === "super_admin" || saving}
                      onChange={async (event) => {
                        try {
                          setSaving(true);
                          setError("");
                          const response = await updateSystemUser(user._id, {
                            tenantId: event.target.value || null,
                          });
                          setUsers((current) =>
                            current.map((item) =>
                              item._id === response.data._id ? response.data : item,
                            ),
                          );
                        } catch (requestError) {
                          setError(requestError.response?.data?.message || requestError.message);
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="max-w-48 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {tenants.filter((tenant) => tenant.status === "active").map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.slug})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{user.status}</td>
                  <td className="px-4 py-3 text-slate-600">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openPermissions(user)} className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" title="Manage permissions">
                      <KeyRound size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {permissionUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Permissions · {permissionUser.name}</h2>
                <p className="text-sm text-slate-500">You can only grant permissions available to your own role.</p>
              </div>
              <button type="button" onClick={() => setPermissionUser(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-200"><th className="px-3 py-3 text-xs font-black uppercase text-slate-500">Module</th>{permissionActions.map((action) => <th key={action} className="px-3 py-3 text-center text-xs font-black uppercase text-slate-500">{action}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionModules.map(([moduleName, label]) => (
                    <tr key={moduleName}>
                      <td className="px-3 py-3 font-bold text-slate-800">{label}</td>
                      {permissionActions.map((action) => (
                        <td key={action} className="px-3 py-3 text-center">
                          <input type="checkbox" checked={permissions[moduleName]?.[action] === true} disabled={!canGrant(moduleName, action)} onChange={() => togglePermission(moduleName, action)} className="h-4 w-4 rounded border-slate-300 text-blue-600 disabled:opacity-40" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPermissionUser(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
              <button type="button" onClick={() => void savePermissions()} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save permissions"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SystemUserManagement;
