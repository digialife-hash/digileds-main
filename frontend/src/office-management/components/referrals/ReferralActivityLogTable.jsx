import React from "react";
import { ShieldCheck, Monitor, Globe, Laptop, Smartphone } from "lucide-react";

const ReferralActivityLogTable = ({ activityLogs = [] }) => {
  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
        No audit activity logs recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Audit Activity Logs
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User & Role</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">IP Address</th>
              <th className="px-4 py-3">Browser / Device</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {activityLogs.map((log) => {
              const formattedDate = new Date(log.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={log._id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {log.user?.name || "System"}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {log.role || log.user?.role || "user"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.ipAddress || "127.0.0.1"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      {log.device === "Mobile" ? (
                        <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <Laptop className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>
                        {log.browser || "Browser"} / {log.device || "Desktop"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {formattedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralActivityLogTable;
