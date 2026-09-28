import React from "react";
import { AlertCircle, Clock, ShieldAlert } from "lucide-react";

export const ReminderWidget = ({ statistics }) => {
  const reminders = [
    {
      title: "KYC Verification Complete",
      description: "Your KYC status is Verified. No further action needed.",
      icon: <Clock className="text-emerald-600" size={16} />,
      color: "border-emerald-200 bg-emerald-50/60 text-slate-900",
    },
    {
      title: "Certificate Renewal",
      description: "Your partner certificate is valid until June 2027.",
      icon: <AlertCircle className="text-blue-600" size={16} />,
      color: "border-blue-200 bg-blue-50/60 text-slate-900",
    },
    {
      title: "ID Card Status",
      description: "Partner ID card is active and ready for download.",
      icon: <ShieldAlert className="text-indigo-600" size={16} />,
      color: "border-indigo-200 bg-indigo-50/60 text-slate-900",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-5">Reminders & Updates</h2>
      <div className="mt-6 space-y-3">
        {reminders.map((rem, idx) => (
          <div key={idx} className={`flex gap-3 rounded-xl border p-3.5 ${rem.color}`}>
            <div className="mt-0.5 shrink-0">
              {rem.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-none">{rem.title}</h4>
              <p className="mt-1.5 text-[11px] font-medium text-slate-600 leading-tight">
                {rem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ReminderWidget;
