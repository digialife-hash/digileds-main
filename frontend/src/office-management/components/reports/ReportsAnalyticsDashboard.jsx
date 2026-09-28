import React from "react";
import {
  Users,
  Building2,
  TrendingUp,
  CircleDollarSign,
  Wallet,
  Receipt,
  Award,
  IdCard,
  Percent,
  BarChart3,
  PieChart,
} from "lucide-react";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

const ReportsAnalyticsDashboard = ({ analytics = null, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
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
    totalReferralPartners: 0,
    totalConvertedClients: 0,
    totalRevenueGenerated: 0,
    totalCommissionPaid: 0,
    totalPendingCommission: 0,
    totalPayments: 0,
    activeCertificates: 0,
    activeIDCards: 0,
    overallConversionRate: 0,
  };

  const charts = analytics?.charts || {
    monthlyTrend: [],
    statusDistribution: [],
  };

  const cards = [
    {
      title: "Total Referrals",
      value: metrics.totalReferrals,
      icon: Users,
      textColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Converted Clients",
      value: metrics.totalConvertedClients,
      icon: Building2,
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Conversion Rate",
      value: `${metrics.overallConversionRate}%`,
      icon: Percent,
      textColor: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Revenue Generated",
      value: formatCurrency(metrics.totalRevenueGenerated),
      icon: TrendingUp,
      textColor: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Commission Paid",
      value: formatCurrency(metrics.totalCommissionPaid),
      icon: CircleDollarSign,
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Commission",
      value: formatCurrency(metrics.totalPendingCommission),
      icon: Wallet,
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Payments",
      value: metrics.totalPayments,
      icon: Receipt,
      textColor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Certificates",
      value: metrics.activeCertificates,
      icon: Award,
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active ID Cards",
      value: metrics.activeIDCards,
      icon: IdCard,
      textColor: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {card.title}
                </span>
                <div className={`rounded-xl ${card.bg} ${card.textColor} p-2`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Referral & Revenue Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Referral & Revenue Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Referral volume and revenue generated over time
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-56 w-full">
            {charts.monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No trend data available
              </div>
            ) : (
              <div className="flex h-full items-end gap-3 pt-4 pb-2">
                {charts.monthlyTrend.map((item, index) => {
                  const maxVal = Math.max(
                    ...charts.monthlyTrend.map((m) => m.referrals),
                    1
                  );
                  const totalH = Math.round((item.referrals / maxVal) * 160);

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        style={{ height: `${totalH}px` }}
                        className="w-6 rounded-t-md bg-blue-600 hover:bg-blue-700 transition-all"
                        title={`Referrals: ${item.referrals}, Revenue: ₹${item.revenue}`}
                      />
                      <span className="text-[10px] font-medium text-slate-500 truncate max-w-[50px]">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Referral Status Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Referral Status Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Pending, Contacted, Converted, Rejected
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
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
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
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

export default ReportsAnalyticsDashboard;
