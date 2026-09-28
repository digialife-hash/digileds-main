import React from "react";
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Ban,
} from "lucide-react";

const statusConfigs = {
  Pending: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  "Under Review": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    icon: HelpCircle,
  },
  Approved: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  Rejected: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  Paid: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCheck,
  },
  Cancelled: {
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-500",
    icon: Ban,
  },
  pending: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  paid: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCheck,
  },
  rejected: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

const CommissionStatusBadge = ({ status = "Pending", size = "normal" }) => {
  const config = statusConfigs[status] || statusConfigs.Pending;
  const Icon = config.icon;
  const isSmall = size === "small";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${
        config.bg
      } ${isSmall ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{status}</span>
    </span>
  );
};

export default CommissionStatusBadge;
