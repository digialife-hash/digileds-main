import React from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  ShieldCheck,
} from "lucide-react";

const NotificationAnalyticsDashboard = ({ analytics = null, isLoading = false }) => {
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
    totalNotifications: 0,
    unreadNotifications: 0,
    readNotifications: 0,
    emailNotificationsSent: 0,
    smsNotificationsSent: 0,
    whatsAppNotificationsSent: 0,
    failedNotifications: 0,
    todaysNotifications: 0,
    monthlyNotifications: 0,
    deliverySuccessRate: 100,
  };

  const charts = analytics?.charts || {
    monthlyTrend: [],
    channelDistribution: [],
    typeDistribution: [],
  };

  const cards = [
    {
      title: "Total Notifications",
      value: metrics.totalNotifications,
      icon: Bell,
      textColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Unread Notifications",
      value: metrics.unreadNotifications,
      icon: Bell,
      textColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Read Notifications",
      value: metrics.readNotifications,
      icon: CheckCircle2,
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Email Sent",
      value: metrics.emailNotificationsSent,
      icon: Mail,
      textColor: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "SMS Sent",
      value: metrics.smsNotificationsSent,
      icon: MessageSquare,
      textColor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "WhatsApp Sent",
      value: metrics.whatsAppNotificationsSent,
      icon: MessageCircle,
      textColor: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Delivery Success Rate",
      value: `${metrics.deliverySuccessRate}%`,
      icon: ShieldCheck,
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Failed Notifications",
      value: metrics.failedNotifications,
      icon: XCircle,
      textColor: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
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
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Notification Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Notification Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Volume of notifications generated over time
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-56 w-full">
            {charts.monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No notification trend data available
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
                        className="w-6 rounded-t-md bg-blue-600 hover:bg-blue-700 transition-all"
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

        {/* Delivery Channel Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Delivery Channel Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Dashboard, Email, SMS, WhatsApp
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {charts.channelDistribution.map((item, idx) => {
              const pct =
                metrics.totalNotifications > 0
                  ? Math.round((item.count / metrics.totalNotifications) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.channel}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
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

export default NotificationAnalyticsDashboard;
