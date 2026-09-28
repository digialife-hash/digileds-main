import React from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const CertificateAnalyticsDashboard = ({ analytics = null, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-slate-100 p-4"
          />
        ))}
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalCertificates: 0,
    activeCertificates: 0,
    expiredCertificates: 0,
    renewedCertificates: 0,
    revokedCertificates: 0,
    issuedThisMonth: 0,
    expiringSoon: 0,
  };

  const charts = analytics?.charts || {
    monthlyIssuance: [],
    typeDistribution: [],
    statusDistribution: [],
  };

  const cards = [
    {
      title: "Total Certificates",
      value: metrics.totalCertificates,
      icon: Award,
      textColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Certificates",
      value: metrics.activeCertificates,
      icon: CheckCircle2,
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Expired Certificates",
      value: metrics.expiredCertificates,
      icon: Clock,
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Renewed Certificates",
      value: metrics.renewedCertificates,
      icon: RefreshCw,
      textColor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Revoked Certificates",
      value: metrics.revokedCertificates,
      icon: XCircle,
      textColor: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Issued This Month",
      value: metrics.issuedThisMonth,
      icon: Calendar,
      textColor: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Expiring Soon (30 Days)",
      value: metrics.expiringSoon,
      icon: AlertTriangle,
      textColor: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 truncate">
                  {card.title}
                </span>
                <div className={`rounded-xl ${card.bg} ${card.textColor} p-1.5 shrink-0`}>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Certificate Issuance Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Certificate Issuance
                </h3>
                <p className="text-xs text-slate-500">
                  Total certificates issued over time
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-56 w-full">
            {charts.monthlyIssuance.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No issuance trend data available
              </div>
            ) : (
              <div className="flex h-full items-end gap-3 pt-4 pb-2">
                {charts.monthlyIssuance.map((item, index) => {
                  const maxVal = Math.max(
                    ...charts.monthlyIssuance.map((m) => m.total),
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
                        className="w-6 rounded-t-md bg-amber-500 hover:bg-amber-600 transition-all"
                        title={`Total: ${item.total}`}
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

        {/* Certificate Type Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Certificate Category Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Authorized, Verified, Gold, Platinum, etc.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {charts.typeDistribution.map((item, idx) => {
              const pct =
                metrics.totalCertificates > 0
                  ? Math.round((item.count / metrics.totalCertificates) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.type}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
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

export default CertificateAnalyticsDashboard;
