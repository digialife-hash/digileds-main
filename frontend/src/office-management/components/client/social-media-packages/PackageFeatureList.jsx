import React from "react";
import { CheckCircle2 } from "lucide-react";

const PackageFeatureList = ({ features = [], isPopular = false }) => {
  return (
    <ul className="space-y-2.5 my-4 text-xs font-semibold text-slate-700">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start space-x-2 leading-relaxed">
          <CheckCircle2
            size={16}
            className={`shrink-0 mt-0.5 ${
              isPopular ? "text-blue-600" : "text-emerald-500"
            }`}
          />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
};

export default PackageFeatureList;
