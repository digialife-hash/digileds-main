import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Image, Save } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PhoneInput from "../../components/common/PhoneInput";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  getCompanySettings,
  updateCompanySettings,
} from "../../services/settingsService";

const initialForm = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  website: "",
  gstNumber: "",
  companyLogo: "",
};

const hasSettingsPermission = (user) => {
  if (user?.role === "super_admin") return true;
  return false;
};

const CompanyProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const canEdit = hasSettingsPermission(user, "edit");

  useEffect(() => {
    if (user && !hasSettingsPermission(user)) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const result = await getCompanySettings();
        setFormData({ ...initialForm, ...(result.data.company || {}) });
      } catch (error) {
        if (error.status === 401) {
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        if (error.status === 403) {
          navigate(ROUTES.UNAUTHORIZED, { replace: true });
          return;
        }

        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCompany();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      const result = await updateCompanySettings(formData);
      setFormData({ ...initialForm, ...(result.data.company || {}) });
      toast.success(result.message || "Company settings updated");
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="h-full overflow-y-auto pb-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_SETTINGS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Settings
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Company Profile
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Company Details</h2>
              <p className="text-sm text-slate-500">
                These details can be reused in invoices, reports, and client-facing pages.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["companyName", "Company Name", "text"],
              ["companyEmail", "Company Email", "email"],
              ["companyPhone", "Company Phone", "tel"],
              ["website", "Website", "url"],
              ["gstNumber", "GST Number", "text"],
              ["companyLogo", "Company Logo URL", "url"],
            ].map(([name, label, type]) => (
              <label key={name} className="block">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                {type === "tel" ? (
                  <PhoneInput
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={label}
                    className={!canEdit ? "pointer-events-none opacity-70" : ""}
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                )}
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">Company Address</span>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                disabled={!canEdit}
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </label>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Image size={18} />
              Logo Preview
            </div>
            <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
              {formData.companyLogo ? (
                <img
                  src={formData.companyLogo}
                  alt="Company logo preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  No logo URL set
                </span>
              )}
            </div>
          </section>

          {!canEdit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
              You can view company settings, but editing requires settings edit permission.
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || !canEdit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {isSaving ? "Saving..." : "Save Company Profile"}
          </button>
        </aside>
      </form>
    </section>
  );
};

export default CompanyProfileSettings;
