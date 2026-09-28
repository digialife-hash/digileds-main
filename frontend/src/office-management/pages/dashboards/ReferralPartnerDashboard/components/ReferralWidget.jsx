import React, { useState } from "react";
import toast from "react-hot-toast";
import { Copy, MessageCircle, Mail } from "lucide-react";

export const ReferralWidget = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register-client?ref=${referralCode || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hey! Sign up using my referral link to get started: ${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Register using my client referral link");
    const body = encodeURIComponent(`Hi,\n\nPlease register using my client referral link:\n${referralLink}\n\nThanks!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-5">Referral Code & Link</h2>

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Referral Code</label>
          <div className="mt-1.5 flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4">
            <span className="font-mono text-base font-black tracking-widest text-blue-600">
              {referralCode || "N/A"}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode || "");
                toast.success("Referral code copied!");
              }}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition"
            >
              Copy
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unique Share Link</label>
          <div className="mt-1.5 relative flex items-center">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-24 text-xs font-semibold text-slate-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute right-2 flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Copy size={12} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs transition hover:bg-emerald-100"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button
            onClick={handleShareEmail}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs transition hover:bg-blue-100"
          >
            <Mail size={16} /> Email
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReferralWidget;
