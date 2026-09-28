import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Activity, Award, UserCheck, CreditCard, DollarSign } from "lucide-react";

export const RecentActivities = ({ activities = [], pagination, onPageChange, onSearch, loading }) => {
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const getIcon = (type) => {
    switch (type) {
      case "referral":
        return <UserCheck className="text-blue-600" size={16} />;
      case "commission":
        return <DollarSign className="text-emerald-600" size={16} />;
      case "certificate":
        return <Award className="text-purple-600" size={16} />;
      case "id_card":
        return <CreditCard className="text-amber-600" size={16} />;
      default:
        return <Activity className="text-slate-500" size={16} />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "referral":
        return "bg-blue-50 ring-1 ring-blue-100";
      case "commission":
        return "bg-emerald-50 ring-1 ring-emerald-100";
      case "certificate":
        return "bg-purple-50 ring-1 ring-purple-100";
      case "id_card":
        return "bg-amber-50 ring-1 ring-amber-100";
      default:
        return "bg-slate-100 ring-1 ring-slate-200";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Recent Activities</h2>
          <p className="text-xs font-semibold text-slate-500">Chronological history of your partner actions</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search activities..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-9 w-9 rounded-xl bg-slate-200 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                <div className="h-3 w-2/3 rounded bg-slate-200"></div>
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
            <Activity size={32} className="text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No activities found</h3>
            <p className="text-xs text-slate-500">Start sharing your referral link to track updates.</p>
          </div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="flex gap-4 p-2.5 rounded-xl border border-transparent transition hover:bg-slate-50 hover:border-slate-100">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${getBgColor(act.type)}`}>
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{act.title}</h4>
                <p className="mt-0.5 text-xs font-medium text-slate-600">{act.description}</p>
                <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                  {new Date(act.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default RecentActivities;
