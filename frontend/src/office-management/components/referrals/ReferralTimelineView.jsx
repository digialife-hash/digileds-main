import React from "react";
import {
  Clock,
  Sparkles,
  UserCheck,
  RefreshCw,
  MessageSquare,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const activityIcons = {
  "Referral Created": { icon: Sparkles, color: "bg-sky-500 text-white" },
  "Employee Assigned": { icon: UserCheck, color: "bg-blue-500 text-white" },
  "Status Changed": { icon: RefreshCw, color: "bg-purple-500 text-white text-xs" },
  "Comment Added": { icon: MessageSquare, color: "bg-indigo-500 text-white" },
  "Internal Note Added": { icon: FileText, color: "bg-amber-500 text-white" },
  "Attachment Uploaded": { icon: Upload, color: "bg-teal-500 text-white" },
  "Attachment Deleted": { icon: AlertCircle, color: "bg-rose-500 text-white" },
  Converted: { icon: CheckCircle2, color: "bg-emerald-500 text-white" },
};

const ReferralTimelineView = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Clock className="h-4 w-4 text-blue-600" /> Chronological Activity Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => {
          const conf = activityIcons[event.activity] || {
            icon: Clock,
            color: "bg-slate-500 text-white",
          };
          const Icon = conf.icon;

          return (
            <div key={event.id || idx} className="relative group">
              {/* Event Badge Dot */}
              <div
                className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full shadow-xs ${conf.color}`}
              >
                <Icon className="h-3 w-3" />
              </div>

              {/* Event Details Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition group-hover:border-slate-300 group-hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {event.activity}
                    </span>
                    {event.role && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 capitalize">
                        {event.role.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {event.date} at {event.time}
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium text-slate-700">
                  {event.description}
                </p>

                <div className="mt-2 text-[11px] text-slate-400">
                  By: <span className="font-semibold text-slate-600">{event.user}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferralTimelineView;
