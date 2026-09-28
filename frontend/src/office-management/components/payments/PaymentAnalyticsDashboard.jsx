import React from "react";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  CreditCard,
} from "lucide-react";

const PaymentAnalyticsDashboard = ({ analytics = null, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-slate-100 p-4"
          />
        ))}
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalPayments: 0,
    totalAmountPaid: 0,
    pendingAmount: 0,
    processingAmount: 0,
    paidAmount: 0,
    failedAmount: 0,
    cancelledAmount: 0,
    monthlyTotalAmount: 0,
  };

  const charts = analytics?.charts || {
    monthlyTrend: [],
    statusDistribution: [],
    methodDistribution: [],
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const cards = [
    {
      title: "Total Disbursed",
      value: formatCurrency(metrics.totalAmountPaid),
      icon: IndianRupee,
      color: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Monthly Payments Total",
      value: formatCurrency(metrics.monthlyTotalAmount),
      icon: Calendar,
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Amount",
      value: formatCurrency(metrics.pendingAmount),
      icon: Clock,
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Processing Amount",
      value: formatCurrency(metrics.processingAmount),
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-500",
      textColor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Successfully Paid Amount",
      value: formatCurrency(metrics.paidAmount),
      icon: CheckCircle2,
      color: "from-teal-500 to-emerald-600",
      textColor: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Failed / Cancelled Amount",
      value: formatCurrency(metrics.failedAmount + metrics.cancelledAmount),
      icon: XCircle,
      color: "from-rose-500 to-red-600",
      textColor: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {card.title}
                </span>
                <div className={`rounded-xl ${card.bg} ${card.textColor} p-1.5`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Payment Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Payment Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Payout volumes over past months
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-56 w-full">
            {charts.monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No payment trend data available
              </div>
            ) : (
              <div className="flex h-full items-end gap-3 pt-4 pb-2">
                {charts.monthlyTrend.map((item, index) => {
                  const maxVal = Math.max(
                    ...charts.monthlyTrend.map((m) => m.total),
                    1
                  );
                  const totalH = Math.round((item.total / maxVal) * 160);

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        style={{ height: `${totalH}px` }}
                        className="w-6 rounded-t-md bg-emerald-500 hover:bg-emerald-600 transition-all"
                        title={`Amount: ₹${item.total}`}
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

        {/* Payment Method Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Payment Method Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Bank Transfer, UPI, Cash, Cheque
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {charts.methodDistribution.map((item, idx) => {
              const pct =
                metrics.totalPayments > 0
                  ? Math.round((item.count / metrics.totalPayments) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.mode}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
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

export default PaymentAnalyticsDashboard;
