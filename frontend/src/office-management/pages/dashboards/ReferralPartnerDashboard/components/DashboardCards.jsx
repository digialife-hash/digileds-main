import React from "react";
import { Users, TrendingUp, Award, FileCheck } from "lucide-react";

export const DashboardCards = ({ statistics, loading }) => {
  const stats = statistics?.statistics || {};
  const partner = statistics?.partner || {};
  const cards = [
    {
      title: "Total Referrals",
      value: stats?.referrals?.total ?? 0,
      sub: `${stats?.referrals?.converted ?? 0} converted • ${stats?.referrals?.pending ?? 0} pending`,
      icon: <Users className="text-blue-600" size={22} />,
      badgeTone: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    },
    {
      title: "Active Commissions",
      value: `₹${(stats?.commissions?.totalEarned ?? 0).toLocaleString("en-IN")}`,
      sub: `₹${(stats?.commissions?.pending ?? 0).toLocaleString("en-IN")} pending • ₹${(stats?.commissions?.paid ?? 0).toLocaleString("en-IN")} paid`,
      icon: <TrendingUp className="text-emerald-600" size={22} />,
      badgeTone: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    },
    {
      title: "KYC & Profile Status",
      value: `${partner?.profileCompletion ?? 80}%`,
      sub: `KYC: ${partner?.kycStatus ?? "verified"}`,
      icon: <Award className="text-amber-600" size={22} />,
      badgeTone: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    },
    {
      title: "Digital Certificate",
      value: stats?.documents?.certificateStatus ?? "Pending",
      sub: "Downloadable PDF Certificate",
      icon: <FileCheck className="text-purple-600" size={22} />,
      badgeTone: "bg-purple-50 text-purple-600 ring-1 ring-purple-100",
      link: stats?.documents?.certificateUrl,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
              <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
            </div>
            <div className="mt-4 h-6 w-16 rounded bg-slate-200"></div>
            <div className="mt-2 h-3 w-32 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-500">{card.title}</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">{card.value}</h3>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.badgeTone}`}>
              {card.icon}
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500 truncate">{card.sub}</p>
          {card.link && (
            <a
              href={card.link}
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 cursor-pointer"
              title="Click to view/download"
            ></a>
          )}
        </div>
      ))}
    </div>
  );
};
export default DashboardCards;
