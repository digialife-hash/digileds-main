import React from "react";
import { Star, BarChart, Percent, Award, UserCheck } from "lucide-react";

export const PerformanceSummary = ({ statistics }) => {
  const items = [
    {
      label: "Best Performing Month",
      value: "July 2026",
      icon: <Star className="text-amber-600" size={16} />,
      badgeTone: "bg-amber-50 ring-1 ring-amber-100",
    },
    {
      label: "Avg. Monthly Referrals",
      value: "4.5 / mo",
      icon: <BarChart className="text-blue-600" size={16} />,
      badgeTone: "bg-blue-50 ring-1 ring-blue-100",
    },
    {
      label: "Conversion Rate",
      value: `${((statistics?.referrals?.converted ?? 0) / (statistics?.referrals?.total || 1) * 100).toFixed(0)}%`,
      icon: <Percent className="text-emerald-600" size={16} />,
      badgeTone: "bg-emerald-50 ring-1 ring-emerald-100",
    },
    {
      label: "Highest Earnings Month",
      value: "₹18,500",
      icon: <Award className="text-purple-600" size={16} />,
      badgeTone: "bg-purple-50 ring-1 ring-purple-100",
    },
    {
      label: "Total Converted Clients",
      value: statistics?.referrals?.converted ?? 0,
      icon: <UserCheck className="text-indigo-600" size={16} />,
      badgeTone: "bg-indigo-50 ring-1 ring-indigo-100",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-5">Performance Summary</h2>
      <div className="mt-6 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-slate-50 hover:border-slate-100 transition">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.badgeTone}`}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </div>
            <span className="text-sm font-black text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PerformanceSummary;
