import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileCog, Mail, MapPin, Phone, Shield } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  getCompanySettings,
  getSecuritySettings,
  updateSecuritySettings,
} from "../../services/settingsService";

const hasSettingsPermission = (user) => {
  if (user?.role === "super_admin") return true;
  return false;
};

const initialCompany = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  website: "",
  gstNumber: "",
  companyLogo: "",
};

const SettingsHome = () => {
  const navigate = useNavigate();
  const { user, logoutAll } = useAuth();
  const [company, setCompany] = useState(initialCompany);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [loginOtpEnabled, setLoginOtpEnabled] = useState(false);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(true);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  useEffect(() => {
    if (user && !hasSettingsPermission(user)) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoadingCompany(true);
        const result = await getCompanySettings();
        setCompany({ ...initialCompany, ...(result.data.company || {}) });
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
        setIsLoadingCompany(false);
      }
    };

    void fetchCompany();
  }, [navigate]);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        setIsLoadingSecurity(true);
        const result = await getSecuritySettings();
        setLoginOtpEnabled(Boolean(result.data?.security?.loginOtpEnabled));
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
        setIsLoadingSecurity(false);
      }
    };

    void fetchSecurity();
  }, [navigate]);

  const handleSecurityChange = async (event) => {
    const enabled = event.target.checked;
    setLoginOtpEnabled(enabled);
    setIsSavingSecurity(true);
    try {
      const result = await updateSecuritySettings({ loginOtpEnabled: enabled });
      setLoginOtpEnabled(Boolean(result.data?.security?.loginOtpEnabled));
      toast.success(enabled ? "Login OTP enabled" : "Login OTP disabled");
    } catch (error) {
      setLoginOtpEnabled(!enabled);
      toast.error(error.message);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Are you sure you want to log out from all devices? You will need to verify with OTP on your next login.")) {
      return;
    }

    try {
      setIsLoggingOutAll(true);
      await logoutAll();
      toast.success("Successfully logged out from all devices");
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      toast.error(error?.message || "Failed to log out from all devices");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          System Configuration
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          Manage the basic company profile used across your office management system.
        </p>
      </div>

      <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                {company.companyLogo ? (
                  <img
                    src={company.companyLogo}
                    alt="Company logo"
                    className="h-8 w-8 rounded-md object-contain"
                  />
                ) : (
                  <Building2 size={22} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="break-words text-lg font-black text-slate-950">
                    {company.companyName || "Company Profile"}
                  </h2>
                  <FileCog
                    size={18}
                    className="shrink-0 text-slate-300 transition group-hover:text-slate-500"
                  />
                </div>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Manage legal identity, contact details, GST, address, and company logo.
                </p>
              </div>
            </div>

            {isLoadingCompany ? (
              <div className="mt-6 flex min-h-24 items-center justify-center rounded-lg bg-slate-50">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Mail size={14} />
                    Email
                  </div>
                  <p className="mt-2 truncate text-sm font-bold text-slate-900">
                    {company.companyEmail || "Not set"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Phone size={14} />
                    Phone
                  </div>
                  <p className="mt-2 truncate text-sm font-bold text-slate-900">
                    {company.companyPhone || "Not set"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <MapPin size={14} />
                    Address
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-900">
                    {company.companyAddress || "Not set"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_SETTINGS_COMPANY_PROFILE)}
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Manage
          </button>
        </div>
      </article>

      {/* Templates & Credentials Config */}
      <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700 ring-1 ring-purple-100">
                <FileCog size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-lg font-black text-slate-950">
                  Document & Credential Templates
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Manage digital ID card issuance, certificate verification rules, and automated template generation for Referral Partners.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUPER_ADMIN_ID_CARDS)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
              >
                Digital ID Cards
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUPER_ADMIN_CERTIFICATES)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
              >
                Certificates
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUPER_ADMIN_COMMISSIONS)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
              >
                Commission Rules
              </button>
            </div>
          </div>
        </div>
      </article>

      <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Login OTP Verification
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  When disabled, users sign in with email or Partner ID and password only. Enable it whenever you want OTP verification for super-admin login.
                </p>
              </div>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3 self-start rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 lg:self-auto">
            <input
              type="checkbox"
              checked={loginOtpEnabled}
              disabled={isLoadingSecurity || isSavingSecurity}
              onChange={handleSecurityChange}
              className="h-5 w-5 accent-amber-600"
            />
            {isSavingSecurity ? "Saving..." : loginOtpEnabled ? "Enabled" : "Disabled"}
          </label>
        </div>
      </article>

      <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 ring-1 ring-red-100">
                <Shield size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="break-words text-lg font-black text-slate-950">
                    Security & Session Management
                  </h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Manage active login sessions and trusted devices. In case of suspicious activity, you can terminate all other active sessions and revoke device trusts immediately.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutAll}
            disabled={isLoggingOutAll}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
          >
            {isLoggingOutAll ? "Terminating..." : "Logout All Devices"}
          </button>
        </div>
      </article>
    </section>
  );
};

export default SettingsHome;
