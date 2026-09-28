import React from "react";
import { BellOff, CheckCheck } from "lucide-react";

export const Notifications = ({ notifications = [], unreadCount, onMarkRead, onMarkAllRead, loading }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-950">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-rose-600 px-2 text-[10px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="h-3 w-1/2 rounded bg-slate-200"></div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
            <BellOff size={28} className="text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">All caught up!</h3>
            <p className="text-xs text-slate-500">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && onMarkRead(notif._id)}
              className={`group relative flex gap-3 p-3 rounded-xl border transition cursor-pointer ${
                notif.isRead
                  ? "bg-white border-slate-100 hover:bg-slate-50"
                  : "bg-blue-50/50 border-blue-200 hover:bg-blue-50"
              }`}
            >
              <div className="flex-1">
                <h4 className={`text-xs font-bold truncate ${notif.isRead ? "text-slate-700" : "text-slate-950"}`}>
                  {notif.title}
                </h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <span className="mt-2 block text-[10px] font-semibold text-slate-400">
                  {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {!notif.isRead && (
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Notifications;
