import React, { useState } from "react";
import { Lock, Plus, Trash2, Edit3, ShieldAlert, Loader2, Tag } from "lucide-react";
import toast from "react-hot-toast";
import {
  addInternalNoteApi,
  updateInternalNoteApi,
  deleteInternalNoteApi,
} from "../../services/referralClientService";
import { useAuth } from "../../context/authStore";

const CATEGORIES = [
  "Customer Behaviour",
  "Follow-up Instructions",
  "Risk Assessment",
  "Future Opportunities",
  "General",
];

const categoryColors = {
  "Customer Behaviour": "bg-purple-50 text-purple-700 border-purple-200",
  "Follow-up Instructions": "bg-blue-50 text-blue-700 border-blue-200",
  "Risk Assessment": "bg-rose-50 text-rose-700 border-rose-200",
  "Future Opportunities": "bg-emerald-50 text-emerald-700 border-emerald-200",
  General: "bg-slate-100 text-slate-700 border-slate-200",
};

const ReferralInternalNotesSection = ({
  referralId,
  internalNotes = [],
  onRefresh,
}) => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [noteText, setNoteText] = useState("");
  const [category, setCategory] = useState("General");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referral Partners must never see this component
  if (!isAdmin) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await addInternalNoteApi(referralId, {
        note: noteText,
        category,
      });

      if (res.success) {
        toast.success("Internal note added");
        setNoteText("");
        setCategory("General");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add internal note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (noteId) => {
    if (!editText.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await updateInternalNoteApi(referralId, noteId, {
        note: editText,
        category: editCategory,
      });
      if (res.success) {
        toast.success("Internal note updated");
        setEditingId(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update internal note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this internal note?")) return;
    try {
      const res = await deleteInternalNoteApi(referralId, noteId);
      if (res.success) {
        toast.success("Internal note deleted");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete internal note");
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50/20 p-5">
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-500 p-2 text-white shadow-xs">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Admin Internal Notes
            </h3>
            <p className="text-[11px] text-amber-700">
              Confidential notes visible only to Super Admins
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
          Admin Only
        </span>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="space-y-3 rounded-2xl bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-700">Note Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <textarea
          rows="2"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Record confidential notes on customer behavior, risk factors, or follow-up strategy..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !noteText.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            <span>Add Note</span>
          </button>
        </div>
      </form>

      {/* Existing Internal Notes */}
      <div className="space-y-3">
        {internalNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 p-4 text-center text-xs text-amber-700/70">
            No internal notes created yet.
          </div>
        ) : (
          internalNotes.map((note) => {
            const isEditing = editingId === note._id;
            const badgeStyle = categoryColors[note.category] || categoryColors.General;
            const dateStr = new Date(note.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={note._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badgeStyle}`}
                    >
                      <Tag className="h-3 w-3" /> {note.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      by {note.adminUser?.name || "Admin"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{dateStr}</span>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-2">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="rounded-xl border border-slate-200 p-1.5 text-xs"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows="2"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border px-3 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(note._id)}
                        className="rounded-lg bg-amber-600 px-3 py-1 text-xs text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap">
                    {note.note}
                  </p>
                )}

                {!isEditing && (
                  <div className="flex justify-end gap-3 pt-1 text-[11px]">
                    <button
                      onClick={() => {
                        setEditingId(note._id);
                        setEditText(note.note);
                        setEditCategory(note.category);
                      }}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReferralInternalNotesSection;
