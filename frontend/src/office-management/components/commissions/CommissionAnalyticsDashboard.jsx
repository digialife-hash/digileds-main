import React from "react";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Wallet,
  Calendar,
  Percent,
} from "lucide-react";

const CommissionAnalyticsDashboard = ({ analytics = null, isLoading = false }) => {
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
    totalCommission: 0,
    pendingCommission: 0,
    approvedCommission: 0,
    paidCommission: 0,
    rejectedCommission: 0,
    thisMonthCommission: 0,
    todayCommission: 0,
    totalCommissionPaid: 0,
    outstandingCommission: 0,
    averageCommission: 0,
  };

  const charts = analytics?.charts || {
    monthlyTrend: [],
    statusDistribution: [],
    topPartners: [],
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const cards = [
    {
      title: "Total Commission",
      value: formatCurrency(metrics.totalCommission),
      icon: Wallet,
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Commission",
      value: formatCurrency(metrics.pendingCommission),
      icon: Clock,
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Approved Commission",
      value: formatCurrency(metrics.approvedCommission),
      icon: CheckCircle2,
      color: "from-sky-500 to-blue-500",
      textColor: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Paid Commission",
      value: formatCurrency(metrics.paidCommission),
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Rejected / Cancelled",
      value: formatCurrency(metrics.rejectedCommission),
      icon: XCircle,
      color: "from-rose-500 to-red-600",
      textColor: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "This Month Commission",
      value: formatCurrency(metrics.thisMonthCommission),
      icon: Calendar,
      color: "from-purple-500 to-indigo-600",
      textColor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Outstanding Commission",
      value: formatCurrency(metrics.outstandingCommission),
      icon: TrendingUp,
      color: "from-orange-500 to-amber-600",
      textColor: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Average Commission",
      value: formatCurrency(metrics.averageCommission),
      icon: Percent,
      color: "from-teal-500 to-emerald-600",
      textColor: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Total Commission Paid
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {formatCurrency(metrics.totalCommissionPaid)}
          </div>
          <p className="mt-1 text-xs text-emerald-100">
            Successfully disbursed to partners
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Outstanding Payable
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {formatCurrency(metrics.outstandingCommission)}
          </div>
          <p className="mt-1 text-xs text-amber-100">
            Pending & approved payouts
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              This Month Commission
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {formatCurrency(metrics.thisMonthCommission)}
          </div>
          <p className="mt-1 text-xs text-blue-100">Generated this month</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-5 text-white shadow-lg shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
              Average Per Lead
            </span>
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">
            {formatCurrency(metrics.averageCommission)}
          </div>
          <p className="mt-1 text-xs text-purple-100">Average net commission</p>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-4">
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
              <div className="mt-2 text-lg font-bold text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Commission Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Commission Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Total generated vs paid commissions
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
                    ...charts.monthlyTrend.map((m) => m.total),
                    1
                  );
                  const totalH = Math.round((item.total / maxVal) * 160);
                  const paidH = Math.round((item.paid / maxVal) * 160);

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-40 items-end gap-1.5">
                        <div
                          style={{ height: `${totalH}px` }}
                          className="w-4 rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all"
                          title={`Total: ₹${item.total}`}
                        />
                        <div
                          style={{ height: `${paidH}px` }}
                          className="w-4 rounded-t-md bg-emerald-500 hover:bg-emerald-600 transition-all"
                          title={`Paid: ₹${item.paid}`}
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
        </div>

        {/* Top Performing Partners */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Top Performing Referral Partners
                </h3>
                <p className="text-xs text-slate-500">
                  Highest commission earners
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {charts.topPartners.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No partner performance data available
              </div>
            ) : (
              charts.topPartners.map((partner, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {partner.partnerName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {partner.commissionCount} referrals
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {formatCurrency(partner.totalEarned)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionAnalyticsDashboard;
