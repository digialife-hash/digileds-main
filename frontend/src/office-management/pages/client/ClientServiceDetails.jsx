import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Share2,
  Globe,
  Search,
  Palette,
  Video,
  DollarSign,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMyAssignedServiceDetailsApi } from "../../services/clientServiceDetailService";
import { getMyInvoices } from "../../services/invoiceService";
import { getServiceFormComponent } from "../../components/serviceDetails/serviceFormRegistry";
import BillingInvoicesSection from "../../components/serviceDetails/BillingInvoicesSection";
import { ROUTES } from "../../routes/routeConstants";

const SERVICE_ICONS = {
  social_media_management: Share2,
  website_development: Globe,
  seo: Search,
  paid_advertising: DollarSign,
  branding: Palette,
  content_writing: FileText,
  video_editing: Video,
  custom_service: Sliders,
};

const STATUS_BADGE_CLASS = {
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-purple-50 text-purple-700 border-purple-200",
  changes_requested: "bg-rose-50 text-rose-700 border-rose-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const STATUS_LABEL = {
  not_started: "Not Started",
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

const ClientServiceDetails = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [billingInvoices, setBillingInvoices] = useState([]);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  useEffect(() => {
    fetchAssignedServices();
  }, []);

  useEffect(() => {
    if (selectedService?._id) {
      void fetchBillingInvoices(selectedService);
    }
  }, [selectedService?._id]);

  async function fetchAssignedServices() {
    try {
      setIsLoading(true);
      const res = await getMyAssignedServiceDetailsApi();
      if (res?.success) {
        setData(res.data);
        const list = res.data.serviceDetails || [];
        if (list.length > 0) {
          // Default select first or currently editing
          setSelectedService((prev) =>
            prev ? list.find((s) => s.serviceType === prev.serviceType) || list[0] : list[0]
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned service details");
    } finally {
      setIsLoading(false);
    }
  }

  const clientInfo = data?.client || {};
  const serviceDetails = data?.serviceDetails || [];

  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || "";
  };

  const getServiceInvoices = (invoiceList, service) =>
    invoiceList.filter((invoice) => {
      const invoiceServiceDetailId = getId(invoice.serviceDetailId);
      if (invoiceServiceDetailId) return invoiceServiceDetailId === service._id;
      if (invoice.serviceType) return invoice.serviceType === service.serviceType;
      return getId(invoice.clientId) === getId(service.clientId || clientInfo._id);
    });

  async function fetchBillingInvoices(service = selectedService) {
    if (!service) return;

    try {
      setIsBillingLoading(true);
      setBillingError("");
      const res = await getMyInvoices({ limit: 100 });
      setBillingInvoices(getServiceInvoices(res?.data?.invoices || [], service));
    } catch (err) {
      console.error(err);
      setBillingError(err.message || "Unable to load invoices for this service.");
    } finally {
      setIsBillingLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Service Details
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Provide the information and resources required for the services assigned to your account. You can save incomplete information as a draft and submit it when ready.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAssignedServices}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
          <p className="text-xs font-semibold text-slate-500">Loading your assigned service details...</p>
        </div>
      ) : serviceDetails.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <FileText size={36} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-900">No Services Assigned Yet</p>
          <p className="text-xs text-slate-400">
            Please contact your Account Manager or Admin to assign services to your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Service Cards Bar / Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceDetails.map((service) => {
              const Icon = SERVICE_ICONS[service.serviceType] || Sliders;
              const isSelected = selectedService?.serviceType === service.serviceType;
              const status = service.status || "not_started";
              const pct = service.completionPercentage || 0;

              return (
                <div
                  key={service.serviceType}
                  onClick={() => setSelectedService(service)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-2xl ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {service.serviceName}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Updated: {service.updatedAt ? new Date(service.updatedAt).toLocaleDateString("en-IN") : "Never"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                        STATUS_BADGE_CLASS[status] || STATUS_BADGE_CLASS.not_started
                      }`}
                    >
                      {STATUS_LABEL[status] || status}
                    </span>
                  </div>

                  {/* Change Request Warning Banner */}
                  {status === "changes_requested" && service.changeRequestMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-[11px] text-rose-900 font-semibold flex items-start space-x-1.5">
                      <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      <p className="line-clamp-2">Changes Requested: {service.changeRequestMessage}</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Form Progress</span>
                      <span className="text-blue-700">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <span className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                      <Edit3 size={14} />
                      <span>{isSelected ? "Currently Editing" : "Open Service Form"}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Service Form Container */}
          {selectedService && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-5 rounded-3xl flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                    {React.createElement(SERVICE_ICONS[selectedService.serviceType] || Sliders, { size: 20 })}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{selectedService.serviceName} Form</h2>
                    <p className="text-xs text-slate-300">
                      Status: <span className="font-extrabold text-blue-300 uppercase">{STATUS_LABEL[selectedService.status]}</span> ({selectedService.completionPercentage}% Complete)
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Modular Form Component */}
              {React.createElement(getServiceFormComponent(selectedService.serviceType), {
                serviceDetail: selectedService,
                onRefresh: fetchAssignedServices,
              })}

              <BillingInvoicesSection
                invoices={billingInvoices}
                isLoading={isBillingLoading}
                errorMessage={billingError}
                onRetry={() => fetchBillingInvoices(selectedService)}
                serviceName={selectedService.serviceName}
                onViewInvoice={(invoice) =>
                  navigate(`${ROUTES.CLIENT_INVOICES}?invoiceId=${invoice._id}`)
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientServiceDetails;
