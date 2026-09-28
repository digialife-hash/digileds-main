import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import { ROUTES } from "../../routes/routeConstants";
import { ErrorState, PageHeader, Panel } from "./HRUi";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  salary: "",
  employmentType: "full_time",
  password: "",
};

const HREmployeeForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await API.post("/employees", { ...form, salary: Number(form.salary) });
      navigate(ROUTES.HR_EMPLOYEES);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Employee could not be onboarded.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Onboard Employee" description="Create the employee record and their secure application login together." />
      {error && <ErrorState message={error} />}
      <Panel>
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          {[
            ["name", "Full name", "text"],
            ["email", "Work email", "email"],
            ["phone", "Phone number", "tel"],
            ["department", "Department", "text"],
            ["designation", "Designation", "text"],
            ["joiningDate", "Joining date", "date"],
            ["salary", "Monthly salary", "number"],
            ["password", "Initial login password", "password"],
          ].map(([field, label, type]) => (
            <label key={field} className="space-y-2 text-sm font-bold text-slate-700">
              {label}
              <input required value={form[field]} type={type} onChange={(event) => update(field, event.target.value)} className="field-input" />
            </label>
          ))}
          <label className="space-y-2 text-sm font-bold text-slate-700">
            Employment type
            <select value={form.employmentType} onChange={(event) => update("employmentType", event.target.value)} className="field-input">
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="intern">Intern</option>
              <option value="contract">Contract</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </label>
          <div className="flex items-end gap-3 sm:col-span-2">
            <button disabled={saving} type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Creating..." : "Create employee"}</button>
            <button type="button" onClick={() => navigate(ROUTES.HR_EMPLOYEES)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </Panel>
    </section>
  );
};

export default HREmployeeForm;
