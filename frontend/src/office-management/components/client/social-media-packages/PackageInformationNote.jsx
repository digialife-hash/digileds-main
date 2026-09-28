import React from "react";
import { Info } from "lucide-react";
import { importantNotes } from "../../../data/socialMediaPackages";

const PackageInformationNote = () => {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-3">
      <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
        <Info size={16} className="text-blue-600" />
        <span>Important Package Information & Service Terms</span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
        {importantNotes.map((note, idx) => (
          <li key={idx} className="flex items-start space-x-2">
            <span className="text-blue-600 font-extrabold">•</span>
            <span className="leading-relaxed">{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackageInformationNote;
