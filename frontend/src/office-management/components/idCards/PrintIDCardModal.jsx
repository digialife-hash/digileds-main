import React, { useState } from "react";
import { X, Printer, Download, Layout, Sliders } from "lucide-react";
import IDCardTemplate from "./IDCardTemplate";

const PrintIDCardModal = ({ isOpen, onClose, idCards = [], idCard = null }) => {
  const [printSide, setPrintSide] = useState("both"); // 'front', 'back', 'both'
  const [paperFormat, setPaperFormat] = useState("pvc"); // 'pvc' or 'a4'

  const effectiveCards = idCards.length > 0 ? idCards : idCard ? [idCard] : [];

  if (!isOpen || effectiveCards.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Print & Export ID Cards ({effectiveCards.length})
              </h2>
              <p className="text-xs text-slate-500">
                High-resolution PVC & A4 print-ready preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print Now</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Print Configuration Controls (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-3 text-xs print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Print Sides:</span>
            <div className="flex gap-1.5">
              {[
                { label: "Both Sides", val: "both" },
                { label: "Front Only", val: "front" },
                { label: "Back Only", val: "back" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPrintSide(opt.val)}
                  className={`rounded-lg px-3 py-1 font-bold transition ${
                    printSide === opt.val
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Paper Layout:</span>
            <div className="flex gap-1.5">
              {[
                { label: "PVC Card (Standard)", val: "pvc" },
                { label: "A4 Sheet (Multi-Card Grid)", val: "a4" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPaperFormat(opt.val)}
                  className={`rounded-lg px-3 py-1 font-bold transition ${
                    paperFormat === opt.val
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Printable Area */}
        <div className="max-h-[75vh] overflow-y-auto p-8 print:p-0 print:max-h-none flex flex-col items-center justify-center bg-slate-100" id="printable-id-cards">
          <div
            className={`grid gap-8 ${
              paperFormat === "a4"
                ? "grid-cols-1 sm:grid-cols-2 print:grid-cols-2"
                : "grid-cols-1"
            } justify-items-center`}
          >
            {effectiveCards.map((card, idx) => (
              <div key={card._id || idx} className="page-break-inside-avoid py-2">
                <IDCardTemplate
                  idCard={card}
                  side={printSide}
                  orientation={card.cardOrientation || card.orientation || "Portrait"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintIDCardModal;
