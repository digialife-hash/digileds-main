import React from "react";
import { Share2, Sparkles, TrendingUp, BarChart2, Headphones } from "lucide-react";
import { whyChooseBenefits } from "../../../data/socialMediaPackages";

const ICON_MAP = {
  Share2,
  Sparkles,
  TrendingUp,
  BarChart2,
  Headphones,
};

const WhyChooseUsSection = () => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8 space-y-6 shadow-2xs">
      <div className="text-center max-w-2xl mx-auto space-y-1.5">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Why Choose Digital Alife Pvt. Ltd.?
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Empowering your brand with consistent creative content, strategic marketing, and transparent performance tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {whyChooseBenefits.map((benefit) => {
          const Icon = ICON_MAP[benefit.iconName] || Sparkles;
          return (
            <div
              key={benefit.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-300 transition"
            >
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit">
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {benefit.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhyChooseUsSection;
