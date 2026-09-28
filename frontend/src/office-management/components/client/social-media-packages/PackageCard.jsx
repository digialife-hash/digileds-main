import React from "react";
import { Sparkles, MessageSquare, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PackageFeatureList from "./PackageFeatureList";
import { ROUTES } from "../../../routes/routeConstants";

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();
  const { name, formattedPrice, subtitle, isPopular, badge, features } = pkg;

  const handleContactAdmin = () => {
    // Navigate to Client Submit Service / Requests page
    navigate(ROUTES.CLIENT_SUBMIT_SERVICE || "/client/submit-service");
  };

  return (
    <div
      className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
        isPopular
          ? "bg-gradient-to-b from-blue-50/90 via-white to-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02] z-10"
          : "bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300"
      }`}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center space-x-1">
          <Sparkles size={12} />
          <span>Most Popular</span>
        </div>
      )}

      <div>
        {/* Top Title & Subtitle */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {badge}
            </span>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              {name}
            </h3>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Pricing Block */}
        <div className="py-4">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {formattedPrice}
            </span>
            <span className="text-xs font-bold text-slate-500">/ Month</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            + GST as applicable (Monthly Billing)
          </p>
        </div>

        {/* Feature List */}
        <PackageFeatureList features={features} isPopular={isPopular} />
      </div>

      {/* Display-only Action Button */}
      <div className="pt-4 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={handleContactAdmin}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            isPopular
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <MessageSquare size={14} />
          <span>Contact Admin to Enquire</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PackageCard;
