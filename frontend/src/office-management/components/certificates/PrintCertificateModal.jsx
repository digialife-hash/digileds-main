import React, { useState } from "react";
import { X, Printer, Download, Layout } from "lucide-react";
import CertificateTemplate from "./CertificateTemplate";

const PrintCertificateModal = ({ isOpen, onClose, certificates = [] }) => {
  const [paperFormat, setPaperFormat] = useState("A4"); // 'A4' or 'Letter'

  if (!isOpen || certificates.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Print & Download Certificates ({certificates.length})
              </h2>
              <p className="text-xs text-slate-500">
                High-resolution A4 / Letter print-ready preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600"
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

        {/* Paper Controls (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3 text-xs print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Paper Format:</span>
            <div className="flex gap-1.5">
              {["A4", "Letter"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setPaperFormat(fmt)}
                  className={`rounded-lg px-3 py-1 font-bold transition ${
                    paperFormat === fmt
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {fmt} Paper
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Printable Area */}
        <div className="max-h-[75vh] overflow-y-auto p-8 print:p-0 print:max-h-none" id="printable-certificates">
          <div className="space-y-12 justify-items-center">
            {certificates.map((cert, idx) => (
              <div key={cert._id || idx} className="page-break-inside-avoid py-4 flex justify-center">
                <CertificateTemplate
                  certificate={cert}
                  orientation={cert.orientation || "Landscape"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCertificateModal;
