import React from "react";
import {
  Users,
  Sparkles,
  UserCheck,
  PhoneCall,
  Heart,
  Clock,
  Handshake,
  CheckCircle2,
  XCircle,
  Ban,
  TrendingUp,
  Calendar,
  IndianRupee,
  PieChart,
  BarChart3,
  Activity,
} from "lucide-react";

const ReferralAnalyticsDashboard = ({ analytics = null, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-slate-100 p-4"
          />
        ))}
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalReferrals: 0,
    newReferrals: 0,
    assignedReferrals: 0,
    contacted: 0,
    interested: 0,
    followUp: 0,
    negotiation: 0,
    converted: 0,
    lost: 0,
    cancelled: 0,
    todayReferrals: 0,
    monthlyReferrals: 0,
    conversionRate: 0,
    estimatedBusinessValue: 0,
  };

  const charts = analytics?.charts || {
    monthlyTrend: [],
    statusDistribution: [],
    employeeBreakdown: [],
    partnerBreakdown: [],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const cards = [
    {
      title: "Total Referrals",
      value: metrics.totalReferrals,
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "New Referrals",
      value: metrics.newReferrals,
      icon: Sparkles,
      color: "from-sky-500 to-cyan-500",
      textColor: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Assigned",
      value: metrics.assignedReferrals,
      icon: UserCheck,
      color: "from-indigo-500 to-blue-600",
      textColor: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Contacted",
      value: metrics.contacted,
      icon: PhoneCall,
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Interested",
      value: metrics.interested,
      icon: Heart,
      color: "from-teal-500 to-emerald-500",
      textColor: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Follow Up",
      value: metrics.followUp,
      icon: Clock,
      color: "from-purple-500 to-violet-500",
      textColor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Negotiation",
      value: metrics.negotiation,
      icon: Handshake,
      color: "from-orange-500 to-amber-600",
      textColor: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Converted",
      value: metrics.converted,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Lost",
      value: metrics.lost,
      icon: XCircle,
      color: "from-rose-500 to-red-600",
      textColor: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Cancelled",
      value: metrics.cancelled,
      icon: Ban,
      color: "from-slate-500 to-gray-600",
      textColor: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      title: "Today's Referrals",
      value: metrics.todayReferrals,
      icon: Calendar,
      color: "from-cyan-600 to-blue-600",
      textColor: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      title: "Monthly Referrals",
      value: metrics.monthlyReferrals,
      icon: TrendingUp,
      color: "from-blue-600 to-indigo-700",
      textColor: "text-blue-700",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              Total Business Value
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {formatCurrency(metrics.estimatedBusinessValue)}
          </div>
          <p className="mt-1 text-xs text-blue-100">
            Across all referred client leads
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Conversion Rate
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {metrics.conversionRate}%
          </div>
          <p className="mt-1 text-xs text-emerald-100">
            {metrics.converted} of {metrics.totalReferrals} leads converted
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-white shadow-lg shadow-sky-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-100">
              Today's Referrals
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {metrics.todayReferrals}
          </div>
          <p className="mt-1 text-xs text-sky-100">Submitted today</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white shadow-lg shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
              Monthly Referrals
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {metrics.monthlyReferrals}
          </div>
          <p className="mt-1 text-xs text-purple-100">Submitted this month</p>
        </div>
      </div>

      {/* Grid of Status Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {card.title}
                </span>
                <div
                  className={`rounded-lg ${card.bg} ${card.textColor} p-1.5 transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Referral Trend Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Referral Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Total vs Converted leads over past months
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-64 w-full">
            {charts.monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No trend data available
              </div>
            ) : (
              <div className="flex h-full items-end gap-3 pt-6 pb-2">
                {charts.monthlyTrend.map((item, index) => {
                  const maxVal = Math.max(
                    ...charts.monthlyTrend.map((m) => m.total),
                    1
                  );
                  const totalHeight = Math.round((item.total / maxVal) * 180);
                  const convertedHeight = Math.round(
                    (item.converted / maxVal) * 180
                  );

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-48 items-end gap-1.5">
                        <div
                          style={{ height: `${totalHeight}px` }}
                          className="w-4 rounded-t-md bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                          title={`Total: ${item.total}`}
                        />
                        <div
                          style={{ height: `${convertedHeight}px` }}
                          className="w-4 rounded-t-md bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                          title={`Converted: ${item.converted}`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 truncate max-w-[50px]">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-6 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Total Referrals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>Converted</span>
            </div>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Status Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Breakdown across referral lifecycle stages
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {charts.statusDistribution.map((item, idx) => {
              const pct =
                metrics.totalReferrals > 0
                  ? Math.round((item.count / metrics.totalReferrals) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === "Converted"
                          ? "bg-emerald-500"
                          : item.status === "New"
                          ? "bg-sky-500"
                          : item.status === "Assigned"
                          ? "bg-blue-500"
                          : item.status === "Negotiation"
                          ? "bg-orange-500"
                          : item.status === "Lost"
                          ? "bg-rose-500"
                          : "bg-purple-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralAnalyticsDashboard;
