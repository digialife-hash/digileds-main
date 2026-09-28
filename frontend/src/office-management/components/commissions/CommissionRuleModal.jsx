import React, { useState, useEffect } from "react";
import { X, Settings, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getCommissionRulesApi,
  saveCommissionRuleApi,
} from "../../services/commissionService";

const COMMISSION_TYPES = [
  "Percentage Based",
  "Fixed Amount",
  "Manual Commission",
  "Project Based",
  "Monthly Commission",
];

const CommissionRuleModal = ({ isOpen, onClose, onSuccess }) => {
  const [ruleName, setRuleName] = useState("Default Commission Rule");
  const [commissionType, setCommissionType] = useState("Percentage Based");
  const [percentage, setPercentage] = useState("10");
  const [fixedAmount, setFixedAmount] = useState("5000");
  const [minBudgetThreshold, setMinBudgetThreshold] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentRule();
    }
  }, [isOpen]);

  const fetchCurrentRule = async () => {
    try {
      const res = await getCommissionRulesApi();
      if (res.success && res.data?.rules?.length > 0) {
        const activeRule = res.data.rules.find((r) => r.isActive) || res.data.rules[0];
        setRuleName(activeRule.ruleName || "Default Commission Rule");
        setCommissionType(activeRule.commissionType || "Percentage Based");
        setPercentage(activeRule.percentage || 10);
        setFixedAmount(activeRule.fixedAmount || 5000);
        setMinBudgetThreshold(activeRule.minBudgetThreshold || 0);
        setIsActive(activeRule.isActive !== undefined ? activeRule.isActive : true);
        setDescription(activeRule.description || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await saveCommissionRuleApi({
        ruleName,
        commissionType,
        percentage: Number(percentage),
        fixedAmount: Number(fixedAmount),
        minBudgetThreshold: Number(minBudgetThreshold),
        isActive,
        description,
      });

      if (res.success) {
        toast.success("Commission rule updated!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to save rule");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configure Commission Rules
              </h2>
              <p className="text-xs text-slate-500">
                Set default calculation percentage & model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Rule Name
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Commission Type
            </label>
            <select
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {COMMISSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {commissionType === "Percentage Based" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Commission Percentage (%)
              </label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          )}

          {commissionType === "Fixed Amount" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Fixed Amount Per Conversion (₹)
              </label>
              <input
                type="number"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                min="0"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Min Budget Threshold (₹)
            </label>
            <input
              type="number"
              value={minBudgetThreshold}
              onChange={(e) => setMinBudgetThreshold(e.target.value)}
              min="0"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded-md border-slate-300 text-blue-600"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-slate-700">
              Enable this rule as default for auto-calculation
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionRuleModal;
