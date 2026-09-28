import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Reply,
  CornerDownRight,
  User,
  Loader2,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  addCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from "../../services/referralClientService";
import { useAuth } from "../../context/authStore";

const ReferralCommentsSection = ({
  referralId,
  comments = [],
  onRefresh,
}) => {
  const { user: currentUser } = useAuth();
  const [newCommentText, setNewCommentText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group top-level comments and child replies
  const rootComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentCommentId?.toString() === parentId.toString());

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await addCommentApi(referralId, {
        comment: newCommentText,
        parentCommentId: replyParentId,
      });

      if (res.success) {
        toast.success("Comment added");
        setNewCommentText("");
        setReplyParentId(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    if (!editText.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await updateCommentApi(referralId, commentId, {
        comment: editText,
      });
      if (res.success) {
        toast.success("Comment updated");
        setEditingCommentId(null);
        setEditText("");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await deleteCommentApi(referralId, commentId);
      if (res.success) {
        toast.success("Comment deleted");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  const renderCommentCard = (c, isReply = false) => {
    const isOwner = c.user?._id?.toString() === currentUser?._id?.toString();
    const isAdmin = currentUser?.role === "super_admin";
    const canDelete = isOwner || isAdmin;
    const canEdit = isOwner;

    const formattedDate = new Date(c.createdAt).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isEditing = editingCommentId === c._id;

    return (
      <div
        key={c._id}
        className={`rounded-2xl border border-slate-100 p-4 transition ${
          isReply ? "ml-6 bg-slate-50/60 border-l-2 border-l-blue-500" : "bg-white shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {c.user?.name ? c.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">
                {c.user?.name || "User"}
              </span>
              <span className="ml-2 inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase">
                {c.user?.role || "Member"}
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">{formattedDate}</span>
        </div>

        {isEditing ? (
          <div className="mt-3 space-y-2">
            <textarea
              rows="2"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingCommentId(null)}
                className="rounded-lg border px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(c._id)}
                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
            {c.comment}
          </p>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            {!isReply && (
              <button
                onClick={() => {
                  setReplyParentId(c._id);
                }}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => {
                  setEditingCommentId(c._id);
                  setEditText(c.comment);
                }}
                className="flex items-center gap-1 hover:text-slate-900"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => handleDelete(c._id)}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-700"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
        )}

        {/* Render Nested Replies */}
        {getReplies(c._id).length > 0 && (
          <div className="mt-3 space-y-2">
            {getReplies(c._id).map((reply) => renderCommentCard(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <MessageSquare className="h-4 w-4 text-blue-600" /> Discussion & Comments ({comments.length})
        </h3>
      </div>

      {/* Add / Reply Comment Form */}
      <form onSubmit={handleAddComment} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        {replyParentId && (
          <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
            <span className="flex items-center gap-1.5 font-semibold">
              <CornerDownRight className="h-3.5 w-3.5" /> Replying to comment
            </span>
            <button
              type="button"
              onClick={() => setReplyParentId(null)}
              className="text-blue-900 hover:text-blue-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <textarea
          rows="3"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Write a comment or message..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newCommentText.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Post Comment</span>
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-3">
        {rootComments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            No comments yet. Start the conversation!
          </div>
        ) : (
          rootComments.map((c) => renderCommentCard(c))
        )}
      </div>
    </div>
  );
};

export default ReferralCommentsSection;
