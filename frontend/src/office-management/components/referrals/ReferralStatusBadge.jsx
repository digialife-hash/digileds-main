import React from "react";
import {
  Sparkles,
  UserCheck,
  PhoneCall,
  Heart,
  Clock,
  Handshake,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";

const statusConfigs = {
  New: {
    bg: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    icon: Sparkles,
  },
  Assigned: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: UserCheck,
  },
  Contacted: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: PhoneCall,
  },
  Interested: {
    bg: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
    icon: Heart,
  },
  "Follow Up": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    icon: Clock,
  },
  Negotiation: {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    icon: Handshake,
  },
  Converted: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Lost: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  Cancelled: {
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-500",
    icon: Ban,
  },
  // Legacy status fallbacks
  pending: {
    bg: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    icon: Sparkles,
  },
  active: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: UserCheck,
  },
  rejected: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

const ReferralStatusBadge = ({ status = "New", size = "normal" }) => {
  const config = statusConfigs[status] || statusConfigs.New;
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

export default ReferralStatusBadge;
