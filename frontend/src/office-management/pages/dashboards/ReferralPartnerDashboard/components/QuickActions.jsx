import React from "react";
import { UserPlus, Users, DollarSign, CreditCard, Award, HelpCircle, FolderCheck } from "lucide-react";

export const QuickActions = ({ onReferClick, onViewReferrals, onViewCommissions, onDownloadID, onDownloadCert, onContactSupport, onViewCompanyDocs }) => {
  const actions = [
    {
      label: "Refer Client",
      description: "Submit new lead info",
      icon: <UserPlus className="text-blue-600" size={18} />,
      onClick: onReferClick,
      badgeTone: "bg-blue-50 group-hover:bg-blue-100/80 text-blue-600",
    },
    {
      label: "View Referrals",
      description: "Monitor status of leads",
      icon: <Users className="text-purple-600" size={18} />,
      onClick: onViewReferrals,
      badgeTone: "bg-purple-50 group-hover:bg-purple-100/80 text-purple-600",
    },
    {
      label: "Company Documents",
      description: "Agreements, NDA & policies",
      icon: <FolderCheck className="text-blue-600" size={18} />,
      onClick: onViewCompanyDocs,
      badgeTone: "bg-blue-50 group-hover:bg-blue-100/80 text-blue-600",
    },
    {
      label: "Commissions",
      description: "Track payouts & history",
      icon: <DollarSign className="text-emerald-600" size={18} />,
      onClick: onViewCommissions,
      badgeTone: "bg-emerald-50 group-hover:bg-emerald-100/80 text-emerald-600",
    },
    {
      label: "Digital Certificate",
      description: "Download certification",
      icon: <Award className="text-amber-600" size={18} />,
      onClick: onDownloadCert,
      badgeTone: "bg-amber-50 group-hover:bg-amber-100/80 text-amber-600",
    },
    {
      label: "Partner ID Card",
      description: "Download digital ID",
      icon: <CreditCard className="text-indigo-600" size={18} />,
      onClick: onDownloadID,
      badgeTone: "bg-indigo-50 group-hover:bg-indigo-100/80 text-indigo-600",
    },
    {
      label: "Contact Support",
      description: "Get assistance/help",
      icon: <HelpCircle className="text-rose-600" size={18} />,
      onClick: onContactSupport,
      badgeTone: "bg-rose-50 group-hover:bg-rose-100/80 text-rose-600",
    },
  ];


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-5">Quick Actions</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            className="group flex flex-col items-start rounded-xl p-3.5 text-left border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-slate-50/80 hover:shadow-sm"
          >
            <div className={`rounded-lg p-2 transition ${act.badgeTone}`}>
              {act.icon}
            </div>
            <h3 className="mt-3 text-xs font-bold text-slate-900 leading-none group-hover:text-blue-600">{act.label}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 leading-tight">{act.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
export default QuickActions;
