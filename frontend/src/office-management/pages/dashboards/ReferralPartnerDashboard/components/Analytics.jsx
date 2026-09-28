import React, { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

export const Analytics = ({ analyticsData, loading }) => {
  const [activeTab, setActiveTab] = useState("referrals");

  if (loading) {
    return (
      <div className="h-96 w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="h-6 w-48 rounded bg-slate-200 mb-6"></div>
        <div className="h-64 w-full rounded bg-slate-100"></div>
      </div>
    );
  }

  const referrals = analyticsData?.referralsTrend || [];
  const commissions = analyticsData?.commissionsTrend || [];

  // Compute maximum values for scaling
  const maxReferrals = Math.max(...referrals.map((r) => r.total || 0), 5);
  const maxCommissions = Math.max(...commissions.map((c) => c.earned || 0), 10000);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Performance Analytics</h2>
          <p className="text-xs font-semibold text-slate-500">Track your referral numbers and commission payouts</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "referrals"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 size={14} /> Referrals
          </button>
          <button
            onClick={() => setActiveTab("commissions")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "commissions"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp size={14} /> Commissions
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        {activeTab === "referrals" ? (
          referrals.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-slate-400 text-sm font-semibold">
              No referral data available yet
            </div>
          ) : (
            <div className="w-full">
              {/* Responsive SVG Bar Chart */}
              <svg viewBox="0 0 500 240" className="w-full h-64">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={30 + p * 160}
                    x2="480"
                    y2={30 + p * 160}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Bars */}
                {referrals.map((r, index) => {
                  const barWidth = 30;
                  const gap = (440 - referrals.length * barWidth) / (referrals.length + 1);
                  const x = 40 + gap + index * (barWidth + gap);
                  const totalHeight = (r.total / maxReferrals) * 160;
                  const convertedHeight = (r.converted / maxReferrals) * 160;

                  return (
                    <g key={index} className="group cursor-pointer">
                      {/* Total Referrals Bar */}
                      <rect
                        x={x}
                        y={190 - totalHeight}
                        width={barWidth}
                        height={totalHeight}
                        rx="4"
                        fill="url(#totalGrad)"
                        className="transition-all duration-300 hover:opacity-80"
                      />
                      {/* Converted Referrals Bar */}
                      <rect
                        x={x}
                        y={190 - convertedHeight}
                        width={barWidth}
                        height={convertedHeight}
                        rx="4"
                        fill="url(#convGrad)"
                        className="transition-all duration-300 hover:opacity-90"
                      />
                      {/* X Label */}
                      <text
                        x={x + barWidth / 2}
                        y="215"
                        fill="#64748b"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {r.label}
                      </text>
                      {/* Tooltip on hover */}
                      <title>{`Total: ${r.total}\nConverted: ${r.converted}\nPending: ${r.pending}`}</title>
                    </g>
                  );
                })}

                {/* Y Axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                  <text
                    key={i}
                    x="25"
                    y={195 - p * 160}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {Math.round((1 - p) * maxReferrals)}
                  </text>
                ))}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="mt-4 flex justify-center gap-6 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-blue-500"></span> Total Referrals
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-500"></span> Converted
                </div>
              </div>
            </div>
          )
        ) : commissions.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-slate-400 text-sm font-semibold">
            No commission trend data available yet
          </div>
        ) : (
          <div className="w-full">
            {/* Line Chart */}
            <svg viewBox="0 0 500 240" className="w-full h-64">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <line
                  key={i}
                  x1="45"
                  y1={30 + p * 160}
                  x2="480"
                  y2={30 + p * 160}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
              ))}

              {/* Line path generation */}
              {(() => {
                const points = commissions.map((c, index) => {
                  const step = 420 / (commissions.length - 1 || 1);
                  const x = 50 + index * step;
                  const y = 190 - (c.earned / maxCommissions) * 160;
                  return { x, y };
                });

                const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

                return (
                  <>
                    {/* Fill Area */}
                    <path
                      d={`${pathD} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`}
                      fill="url(#commAreaGrad)"
                    />
                    {/* Line Stroke */}
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    {/* Data Points */}
                    {points.map((p, index) => (
                      <g key={index} className="group cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="#ffffff"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                        <text
                          x={p.x}
                          y="215"
                          fill="#64748b"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {commissions[index].label}
                        </text>
                        <title>{`Earned: ₹${commissions[index].earned.toLocaleString("en-IN")}`}</title>
                      </g>
                    ))}
                  </>
                );
              })()}

              {/* Y Axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <text
                  key={i}
                  x="20"
                  y={195 - p * 160}
                  fill="#64748b"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {`₹${Math.round((1 - p) * maxCommissions / 1000)}k`}
                </text>
              ))}

              <defs>
                <linearGradient id="commAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-4 flex justify-center text-xs font-bold text-emerald-600">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-6 bg-emerald-500 rounded"></span> Monthly Earnings Trend
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Analytics;
