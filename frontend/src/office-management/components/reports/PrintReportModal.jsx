import React from "react";
import { X, Printer, Download } from "lucide-react";

const PrintReportModal = ({
  isOpen,
  onClose,
  reportTitle = "Business Intelligence Report",
  headers = [],
  data = [],
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header Bar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Print Report Preview
              </h2>
              <p className="text-xs text-slate-500">
                Formatted A4 Print Layout with Company Seal & Branding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              <span>Print Now</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Preview Content */}
        <div className="max-h-[80vh] overflow-y-auto p-8 font-sans print:p-0 print:max-h-none" id="printable-report">
          {/* Company Branding Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Digital Alife Pvt Ltd
              </h1>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Official Business Intelligence & Performance Report
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-extrabold text-slate-900 block">{reportTitle}</span>
              <span className="text-slate-500 text-[10px]">
                Generated on: {new Date().toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] border-b border-slate-300">
                {headers.map((h, i) => (
                  <th key={i} className="p-2.5 border-r border-slate-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className="p-2.5 border-r border-slate-200 text-[11px] font-medium">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Report Footer */}
          <div className="mt-8 border-t border-slate-200 pt-4 flex items-center justify-between text-[10px] text-slate-500">
            <span>Confidential • Digital Alife Referral Partner Network</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintReportModal;
