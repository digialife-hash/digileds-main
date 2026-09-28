import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2, CheckCircle2, User } from "lucide-react";
import toast from "react-hot-toast";
import { assignEmployeeApi } from "../../services/referralClientService";
import { getEmployees } from "../../services/employeeService";

const AssignEmployeeModal = ({
  isOpen,
  onClose,
  referral,
  onSuccess,
}) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    referral?.assignedEmployee?._id || ""
  );
  const [remarks, setRemarks] = useState("");
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployeesList();
    }
  }, [isOpen]);

  const fetchEmployeesList = async () => {
    try {
      setIsLoadingEmployees(true);
      const res = await getEmployees({ limit: 100 });
      if (res.success && res.data?.employees) {
        setEmployees(res.data.employees);
      } else if (res.data) {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees list");
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  if (!isOpen || !referral) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await assignEmployeeApi(referral._id, {
        employeeId: selectedEmployeeId,
        remarks,
      });

      if (res.success) {
        toast.success("Employee assigned successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to assign employee");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign employee");
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
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Assign Employee
              </h2>
              <p className="text-xs text-slate-500">
                {referral.referralId} – {referral.clientName}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Select Employee <span className="text-rose-500">*</span>
            </label>
            {isLoadingEmployees ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading employees list...</span>
              </div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id || emp.user?._id}>
                    {emp.name || emp.user?.name} (
                    {emp.email || emp.user?.email || "Employee"})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Assignment Notes / Remarks
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Instructions or notes for the assigned employee..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
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
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignEmployeeModal;
