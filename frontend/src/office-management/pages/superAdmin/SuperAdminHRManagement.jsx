import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Save, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import API from "../../api/axiosInstance";
import {
  Cell,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Panel,
  StatusBadge,
  Table,
} from "../HR/HRUi";

const initialForm = { name: "", email: "", phone: "", password: "" };
const permissionActions = ["view", "create", "edit", "delete", "approve"];
const permissionModules = [
  ["employees", "Employees"],
  ["attendance", "Attendance"],
  ["leaves", "Leaves"],
  ["payroll", "Payroll"],
  ["documents", "Documents"],
  ["holidays", "Holidays"],
  ["reports", "Reports"],
  ["announcements", "Announcements"],
  ["meetings", "Meetings"],
];
const defaultHRPermissions = {
  employees: { view: true, create: true, edit: true, delete: false },
  attendance: { view: true, create: false, edit: true, delete: false, approve: true },
  leaves: { view: true, create: false, edit: true, delete: false, approve: true },
  payroll: { view: true, create: true, edit: true, delete: false, approve: true },
  documents: { view: true, create: true, edit: true, delete: false },
  holidays: { view: true, create: true, edit: true, delete: false },
  reports: { view: true },
  announcements: { view: true, create: true, edit: true, delete: false },
  meetings: { view: true, create: true, edit: true, delete: false },
};

const getPermissionState = (account) =>
  permissionModules.reduce((permissions, [moduleName]) => {
    permissions[moduleName] = {
      ...defaultHRPermissions[moduleName],
      ...(account?.permissions?.[moduleName] || {}),
    };
    return permissions;
  }, {});

const SuperAdminHRManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [permissionSaving, setPermissionSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/hr-management");
      setAccounts(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "HR accounts could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await API.post("/hr-management", form);
      setForm(initialForm);
      setShowForm(false);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "HR account could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (account) => {
    try {
      await API.patch(`/hr-management/${account._id}`, {
        status: account.status === "active" ? "inactive" : "active",
      });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "HR account status could not be updated.");
    }
  };

  const openPermissions = (account) => {
    setSelectedAccount(account);
    setPermissions(getPermissionState(account));
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

  const savePermissions = async () => {
    if (!selectedAccount) return;
    try {
      setPermissionSaving(true);
      setError("");
      const response = await API.patch(`/hr-management/${selectedAccount._id}`, { permissions });
      const updated = response.data.data;
      setAccounts((current) => current.map((account) => account._id === updated._id ? updated : account));
      setSelectedAccount(updated);
      setPermissions(getPermissionState(updated));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "HR permissions could not be updated.");
    } finally {
      setPermissionSaving(false);
    }
  };

  const remove = async (account) => {
    if (!window.confirm(`Delete HR account for ${account.name}?`)) return;
    try {
      await API.delete(`/hr-management/${account._id}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "HR account could not be deleted.");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="HR Account Management"
        description="Super Admin controls HR access, account status and HR team membership from here."
        action={<button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><Plus size={17} /> Create HR account</button>}
      />
      {error && <ErrorState message={error} onRetry={load} />}
      {showForm && (
        <Panel title="Create HR account" description="The new user will receive the HR role and default HR permissions.">
          <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Full name", "text"],
              ["email", "Email address", "email"],
              ["phone", "Phone number", "tel"],
              ["password", "Temporary password", "password"],
            ].map(([field, label, type]) => <label key={field} className="space-y-2 text-sm font-bold text-slate-700">{label}<input required value={form[field]} type={type} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="field-input" /></label>)}
            <div className="sm:col-span-2"><button disabled={saving} type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Creating..." : "Create HR account"}</button></div>
          </form>
        </Panel>
      )}
      {loading && <LoadingState label="Loading HR accounts..." />}
      {!loading && !error && <Panel title={`${accounts.length} HR accounts`} description="Only Super Admin can change these accounts.">{!accounts.length ? <EmptyState label="No HR accounts created yet." /> : <Table headers={["HR user", "Phone", "Status", "Last login", "Actions"]}>{accounts.map((account) => <tr key={account._id} className="hover:bg-slate-50"><Cell><div className="font-bold text-slate-950">{account.name}</div><div className="text-xs text-slate-400">{account.email}</div></Cell><Cell>{account.phone || "—"}</Cell><Cell><StatusBadge value={account.status} /></Cell><Cell>{account.lastLogin ? new Date(account.lastLogin).toLocaleString("en-IN") : "Never"}</Cell><Cell><div className="flex gap-2"><button type="button" onClick={() => openPermissions(account)} title="Manage permissions" className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"><KeyRound size={15} /></button><button type="button" onClick={() => toggleStatus(account)} title="Toggle status" className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"><ShieldCheck size={15} /></button><button type="button" onClick={() => remove(account)} title="Delete account" className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"><Trash2 size={15} /></button></div></Cell></tr>)}</Table>}</Panel>}
      {selectedAccount && (
        <Panel
          title={`Permissions · ${selectedAccount.name}`}
          description="Only enabled actions are available to this HR account. Changes apply to backend APIs and the HR sidebar."
          action={<button type="button" onClick={() => setSelectedAccount(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close permissions"><X size={18} /></button>}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200"><th className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-500">Module</th>{permissionActions.map((action) => <th key={action} className="px-3 py-3 text-center text-xs font-black uppercase tracking-wide text-slate-500">{action}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {permissionModules.map(([moduleName, label]) => <tr key={moduleName}><td className="px-3 py-3 font-bold text-slate-800">{label}</td>{permissionActions.map((action) => <td key={action} className="px-3 py-3 text-center"><input type="checkbox" checked={permissions[moduleName]?.[action] === true} onChange={() => updatePermission(moduleName, action)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" aria-label={`${label} ${action}`} /></td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end"><button type="button" onClick={savePermissions} disabled={permissionSaving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={16} />{permissionSaving ? "Saving..." : "Save permissions"}</button></div>
        </Panel>
      )}
      <Panel title="Control policy">
        <div className="grid gap-3 sm:grid-cols-3">
          {[["Role", "HR"], ["Access owner", "Super Admin"], ["Default access", "Employees, leaves, attendance, payroll and reports"]].map(([label, value], index) => <div key={label} className="rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">{index === 0 ? <UserCog size={14} /> : index === 1 ? <ShieldCheck size={14} /> : <KeyRound size={14} />}{label}</div><p className="mt-2 text-sm font-bold capitalize text-slate-900">{value}</p></div>)}
        </div>
      </Panel>
    </section>
  );
};

export default SuperAdminHRManagement;
