
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AtSign,
  Bell,
  ChevronDown,
  Clock3,
  ExternalLink,
  Inbox,
  LoaderCircle,
  MessageCircle,
  Pencil,
  RefreshCw,
  Reply,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import { apiRequest } from "../../services/api.js";

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getId(item) {
  if (!item || typeof item === "string") {
    return "";
  }

  return String(
    item.id ??
      item._id ??
      item.replyId ??
      item.commentId ??
      item.reviewId ??
      item.messageId ??
      item.resourceName ??
      ""
  ).trim();
}

function getText(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item) {
    return "";
  }

  return String(
    item.text ??
      item.message ??
      item.body ??
      item.content ??
      item.comment ??
      item.review ??
      item.description ??
      ""
  );
}

function getAuthor(item) {
  if (typeof item === "string") {
    return "";
  }

  if (!item) {
    return "Unknown";
  }

  return (
    item.author ??
    item.authorName ??
    item.username ??
    item.userName ??
    item.from?.name ??
    item.sender?.name ??
    item.user?.name ??
    item.profile?.name ??
    item.name ??
    "Unknown"
  );
}

function getAvatar(item) {
  if (!item || typeof item === "string") {
    return "";
  }

  return (
    item.avatar ??
    item.avatarUrl ??
    item.profilePicture ??
    item.profile_picture ??
    item.from?.picture ??
    item.from?.avatar ??
    item.sender?.avatar ??
    item.user?.avatar ??
    item.profile?.picture ??
    ""
  );
}

function getDate(item) {
  if (!item || typeof item === "string") {
    return "";
  }

  return (
    item.createdAt ??
    item.created_at ??
    item.publishedAt ??
    item.published_at ??
    item.updatedAt ??
    item.updated_at ??
    item.timestamp ??
    item.date ??
    ""
  );
}

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getReplies(item) {
  if (!item || typeof item === "string") {
    return [];
  }

  return safeArray(
    item.replies ??
      item.children ??
      item.responses ??
      item.thread ??
      item.comments
  );
}

function isOwnerReply(item) {
  if (!item || typeof item === "string") {
    return false;
  }

  const explicitOwnerFlags = [
    item.isOwner,
    item.isMine,
    item.authorIsOwner,
    item.fromOwner,
    item.fromMe,
    item.mine,
    item.ownedByPage,
    item.isBusinessReply,
    item.owner,
  ];

  if (explicitOwnerFlags.some((value) => value === true)) {
    return true;
  }

  const authorType = normalize(
    item.authorType ??
      item.senderType ??
      item.actorType ??
      item.role ??
      ""
  );

  if (
    [
      "owner",
      "business",
      "page",
      "admin",
      "business_owner",
      "page_owner",
    ].includes(authorType)
  ) {
    return true;
  }

  return false;
}

function isGoogleBusiness(platform) {
  const value = normalize(platform);

  return (
    value.includes("google business") ||
    value.includes("google_business") ||
    value === "google" ||
    value.includes("googlebusiness")
  );
}

function getOwnerReplyObject(item) {
  const rawReply = item?.ownerReply;

  if (
    rawReply === null ||
    rawReply === undefined ||
    rawReply === ""
  ) {
    return null;
  }

  if (typeof rawReply === "object") {
    return {
      ...rawReply,
      isOwner: true,
    };
  }

  const parentId = getId(item);

  return {
    id: parentId,
    replyId: parentId,
    parentId,
    text: String(rawReply),
    isOwner: true,
    platform:
      item?.platform ||
      item?.provider ||
      "google business",
  };
}

function flattenReplies(replies, output = []) {
  for (const reply of safeArray(replies)) {
    output.push(reply);

    const children = getReplies(reply);

    if (children.length > 0) {
      flattenReplies(children, output);
    }
  }

  return output;
}

function getSearchText(item) {
  const parts = [
    getAuthor(item),
    getText(item),
    item?.platform,
    item?.provider,
    item?.title,
    item?.message,
  ];

  const replies = getReplies(item);

  if (replies.length > 0) {
    flattenReplies(replies).forEach((reply) => {
      parts.push(getAuthor(reply));
      parts.push(getText(reply));
    });
  }

  const ownerReply = getOwnerReplyObject(item);

  if (ownerReply) {
    parts.push(getAuthor(ownerReply));
    parts.push(getText(ownerReply));
  }

  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/* =========================================================
   PLATFORM
========================================================= */

function getPlatformConfig(platform) {
  const value = normalize(platform);

  if (value.includes("instagram")) {
    return {
      label: "Instagram",
      wrapper:
        "border-pink-200/80 bg-pink-50 text-pink-700 dark:border-pink-400/15 dark:bg-pink-400/[0.08] dark:text-pink-300",
      dot: "bg-pink-500 dark:bg-pink-400",
    };
  }

  if (value.includes("facebook")) {
    return {
      label: "Facebook",
      wrapper:
        "border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-400/15 dark:bg-blue-400/[0.08] dark:text-blue-300",
      dot: "bg-blue-500 dark:bg-blue-400",
    };
  }

  if (value.includes("youtube")) {
    return {
      label: "YouTube",
      wrapper:
        "border-red-200/80 bg-red-50 text-red-700 dark:border-red-400/15 dark:bg-red-400/[0.08] dark:text-red-300",
      dot: "bg-red-500 dark:bg-red-400",
    };
  }

  if (isGoogleBusiness(platform)) {
    return {
      label: "Google Business",
      wrapper:
        "border-indigo-200/80 bg-indigo-50 text-indigo-700 dark:border-indigo-400/15 dark:bg-indigo-400/[0.08] dark:text-indigo-300",
      dot: "bg-indigo-500 dark:bg-indigo-400",
    };
  }

  return {
    label: platform || "Unknown",
    wrapper:
      "border-stone-200 bg-stone-100 text-stone-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-300",
    dot: "bg-stone-500 dark:bg-slate-400",
  };
}

/* =========================================================
   ACTION ENDPOINTS
========================================================= */

function buildActionRequest(action, platform, target) {
  const encodedPlatform = encodeURIComponent(platform || "");
  const targetId = encodeURIComponent(getId(target));

  if (!targetId) {
    throw new Error("Target ID is missing.");
  }

  if (action === "reply") {
    return {
      path: `/engagement/${encodedPlatform}/${targetId}/reply`,
      method: "POST",
    };
  }

  if (action === "edit") {
    return {
      path: `/engagement/${encodedPlatform}/replies/${targetId}`,
      method: "PATCH",
    };
  }

  if (action === "delete") {
    return {
      path: `/engagement/${encodedPlatform}/replies/${targetId}`,
      method: "DELETE",
    };
  }

  throw new Error(`Unsupported action: ${action}`);
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ item, small = false }) {
  const avatar = getAvatar(item);
  const author = getAuthor(item);

  const size = small ? "h-8 w-8" : "h-10 w-10";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-[#0d1422]`}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }

  const letter = String(author || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className={`${size} grid shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white shadow-sm dark:bg-white dark:text-slate-950`}
    >
      {letter || "?"}
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  icon: Icon,
  children,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/[0.08]"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
      ].join(" ")}
    >
      <Icon size={13} />
      {children}
    </button>
  );
}

/* =========================================================
   REPLY EDITOR
========================================================= */

function ReplyEditor({
  value,
  onChange,
  onCancel,
  onSubmit,
  submitting,
  placeholder = "Write a reply...",
  submitLabel = "Reply",
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/80 p-3 dark:border-white/[0.08] dark:bg-black/20">
      <textarea
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-white/[0.08] dark:bg-[#0a111e] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-orange-400/30 dark:focus:ring-orange-400/[0.08]"
      />

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl px-3 py-2 text-xs font-bold text-stone-500 transition hover:bg-white hover:text-stone-800 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !value.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {submitting && (
            <LoaderCircle size={13} className="animate-spin" />
          )}

          {submitLabel}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   REPLY NODE
========================================================= */

function ReplyNode({
  reply,
  platform,
  depth = 0,
  onAction,
  actionState,
}) {
  const replyId = getId(reply);
  const owner = isOwnerReply(reply);
  const children = getReplies(reply);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(getText(reply));

  const replyActionKey =
    `reply-${normalize(platform)}-${replyId}`;

  const editActionKey =
    `edit-${normalize(platform)}-${replyId}`;

  const deleteActionKey =
    `delete-${normalize(platform)}-${replyId}`;

  const replying = actionState === replyActionKey;
  const editingNow = actionState === editActionKey;
  const deletingNow = actionState === deleteActionKey;

  const hasId = Boolean(replyId);

  async function handleReply() {
    const text = replyText.trim();

    if (!text || !hasId) {
      return;
    }

    const success = await onAction(
      "reply",
      {
        ...reply,
        id: replyId,
        parentId: replyId,
        platform,
      },
      text
    );

    if (success) {
      setReplyText("");
      setReplyOpen(false);
    }
  }

  async function handleEdit() {
    const text = editText.trim();

    if (!text || !owner || !hasId) {
      return;
    }

    const success = await onAction(
      "edit",
      {
        ...reply,
        id: replyId,
        platform,
        isOwner: true,
      },
      text
    );

    if (success) {
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!owner || !hasId) {
      return;
    }

    if (
      !window.confirm(
        "Delete your reply? This action cannot be undone."
      )
    ) {
      return;
    }

    await onAction("delete", {
      ...reply,
      id: replyId,
      platform,
      isOwner: true,
    });
  }

  return (
    <div
      className={[
        "relative mt-3",
        depth === 0 ? "ml-5 sm:ml-8" : "ml-7 sm:ml-12",
      ].join(" ")}
    >
      <div className="absolute -left-4 top-0 h-full w-px bg-stone-200 dark:bg-white/[0.08]" />

      <div className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white/80 p-3.5 shadow-sm transition hover:border-stone-300 hover:shadow-md dark:border-white/[0.07] dark:bg-[#0b1320]/80 dark:hover:border-white/[0.12]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.035] dark:to-transparent" />

        <div className="relative flex items-start gap-3">
          <Avatar item={reply} small />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-stone-900 dark:text-white">
                {getAuthor(reply)}
              </span>

              {owner && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/[0.08] dark:text-emerald-300">
                  You
                </span>
              )}

              <span className="text-[10px] text-stone-400 dark:text-slate-500">
                {formatDate(getDate(reply))}
              </span>
            </div>

            {editing ? (
              <div className="mt-2">
                <textarea
                  autoFocus
                  value={editText}
                  onChange={(event) =>
                    setEditText(event.target.value)
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-white/[0.08] dark:bg-[#0a111e] dark:text-slate-100 dark:focus:border-orange-400/30 dark:focus:ring-orange-400/[0.08]"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={editingNow}
                    onClick={() => {
                      setEditText(getText(reply));
                      setEditing(false);
                    }}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      editingNow ||
                      !editText.trim() ||
                      !hasId
                    }
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
                  >
                    {editingNow && (
                      <LoaderCircle
                        size={12}
                        className="animate-spin"
                      />
                    )}

                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-stone-700 dark:text-slate-300">
                {getText(reply) || "—"}
              </p>
            )}

            {!editing && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <ActionButton
                  icon={Reply}
                  disabled={Boolean(actionState) || !hasId}
                  onClick={() =>
                    setReplyOpen((value) => !value)
                  }
                >
                  Reply
                </ActionButton>

                {owner && (
                  <>
                    <ActionButton
                      icon={Pencil}
                      disabled={Boolean(actionState) || !hasId}
                      onClick={() => {
                        setEditText(getText(reply));
                        setEditing(true);
                        setReplyOpen(false);
                      }}
                    >
                      Edit
                    </ActionButton>

                    <ActionButton
                      icon={Trash2}
                      danger
                      disabled={Boolean(actionState) || !hasId}
                      onClick={handleDelete}
                    >
                      {deletingNow ? "Deleting..." : "Delete"}
                    </ActionButton>
                  </>
                )}
              </div>
            )}

            {replyOpen && !editing && (
              <ReplyEditor
                value={replyText}
                onChange={setReplyText}
                onCancel={() => {
                  setReplyText("");
                  setReplyOpen(false);
                }}
                onSubmit={handleReply}
                submitting={replying}
                placeholder={`Reply to ${
                  getAuthor(reply) || "this reply"
                }...`}
                submitLabel="Reply"
              />
            )}
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div>
          {children.map((child, index) => (
            <ReplyNode
              key={
                getId(child) ||
                `${replyId}-child-${index}`
              }
              reply={child}
              platform={platform}
              depth={depth + 1}
              onAction={onAction}
              actionState={actionState}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   GOOGLE BUSINESS OWNER REPLY
========================================================= */

function GoogleOwnerReply({
  item,
  onAction,
  actionState,
}) {
  const ownerReply = getOwnerReplyObject(item);

  if (!ownerReply) {
    return null;
  }

  const parentId = getId(item);
  const replyId = getId(ownerReply) || parentId;

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(
    getText(ownerReply)
  );

  const editKey =
    `edit-google business-${replyId}`;

  const deleteKey =
    `delete-google business-${replyId}`;

  const editingNow = actionState === editKey;
  const deletingNow = actionState === deleteKey;

  const target = {
    ...ownerReply,
    id: replyId,
    replyId,
    parentId,
    platform:
      item?.platform ||
      item?.provider ||
      "google business",
    isOwner: true,
  };

  async function save() {
    const text = editText.trim();

    if (!text || !replyId) {
      return;
    }

    const success = await onAction(
      "edit",
      target,
      text
    );

    if (success) {
      setEditing(false);
    }
  }

  async function remove() {
    if (!replyId) {
      return;
    }

    if (
      !window.confirm(
        "Delete your Google Business reply?"
      )
    ) {
      return;
    }

    await onAction("delete", target);
  }

  return (
    <div className="relative mt-4 ml-5 overflow-hidden rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-3.5 shadow-sm sm:ml-8 dark:border-indigo-400/15 dark:bg-indigo-400/[0.06]">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-indigo-400/[0.12] blur-2xl dark:bg-indigo-400/[0.08]" />

      <div className="relative flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
          <ShieldCheck size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
              Your reply
            </span>

            <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-700 dark:border-indigo-400/15 dark:bg-indigo-400/[0.1] dark:text-indigo-300">
              Business
            </span>
          </div>

          {editing ? (
            <>
              <textarea
                autoFocus
                value={editText}
                onChange={(event) =>
                  setEditText(event.target.value)
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm text-indigo-950 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-400/15 dark:bg-[#0a111e] dark:text-slate-100 dark:focus:ring-indigo-400/[0.08]"
              />

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={editingNow}
                  onClick={() => {
                    setEditText(
                      getText(ownerReply)
                    );
                    setEditing(false);
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-white disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    editingNow ||
                    !editText.trim() ||
                    !replyId
                  }
                  onClick={save}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-3 py-1.5 text-xs font-black text-white disabled:opacity-50 dark:bg-indigo-500"
                >
                  {editingNow && (
                    <LoaderCircle
                      size={12}
                      className="animate-spin"
                    />
                  )}

                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-indigo-950/80 dark:text-indigo-100/80">
                {getText(ownerReply) || "—"}
              </p>

              <div className="mt-2 flex flex-wrap gap-1">
                <ActionButton
                  icon={Pencil}
                  disabled={
                    Boolean(actionState) ||
                    !replyId
                  }
                  onClick={() => {
                    setEditText(
                      getText(ownerReply)
                    );
                    setEditing(true);
                  }}
                >
                  Edit
                </ActionButton>

                <ActionButton
                  icon={Trash2}
                  danger
                  disabled={
                    Boolean(actionState) ||
                    !replyId
                  }
                  onClick={remove}
                >
                  {deletingNow
                    ? "Deleting..."
                    : "Delete"}
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMMENT CARD
========================================================= */

function CommentCard({
  item,
  onAction,
  actionState,
}) {
  const platform =
    item?.platform ||
    item?.provider ||
    "";

  const config = getPlatformConfig(platform);
  const commentId = getId(item);
  const replies = getReplies(item);
  const google = isGoogleBusiness(platform);

  const googleOwnerReply = google
    ? getOwnerReplyObject(item)
    : null;

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const replyKey =
    `reply-${normalize(platform)}-${commentId}`;

  const replying = actionState === replyKey;

  const canReply = Boolean(commentId);

  /*
   * Existing moderation behavior preserved.
   */
  const canDeleteComment =
    Boolean(commentId) &&
    !google &&
    ["Facebook", "Instagram", "YouTube"].includes(
      getPlatformConfig(platform).label
    );

  async function handleReply() {
    const text = replyText.trim();

    if (!text || !canReply) {
      return;
    }

    const success = await onAction(
      "reply",
      {
        ...item,
        id: commentId,
        parentId: commentId,
        platform,
      },
      text
    );

    if (success) {
      setReplyText("");
      setReplyOpen(false);
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/80 shadow-[0_18px_55px_rgba(15,23,42,0.055)] backdrop-blur-xl transition duration-300 hover:-translate-y-[1px] hover:border-stone-300 hover:shadow-[0_22px_65px_rgba(15,23,42,0.08)] dark:border-white/[0.07] dark:bg-[#0d1422]/85 dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)] dark:hover:border-white/[0.11]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent dark:via-orange-400/20" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.04] dark:to-transparent" />

      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-orange-400/[0.05] blur-3xl dark:bg-orange-400/[0.06]" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar item={item} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-stone-950 dark:text-white">
                {getAuthor(item)}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wide ${config.wrapper}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                />

                {config.label}
              </span>

              {item?.rating != null && (
                <span className="text-xs font-bold text-amber-500">
                  {"★".repeat(
                    Math.max(
                      0,
                      Math.min(
                        5,
                        Number(item.rating) || 0
                      )
                    )
                  )}
                </span>
              )}

              <span className="text-[10px] text-stone-400 dark:text-slate-500">
                {formatDate(getDate(item))}
              </span>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700 dark:text-slate-300">
              {getText(item) || "—"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1">
              {item?.likes != null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-400 dark:text-slate-500">
                  <ThumbsUp size={13} />
                  {item.likes}
                </span>
              )}

              <ActionButton
                icon={Reply}
                disabled={
                  Boolean(actionState) ||
                  !canReply ||
                  Boolean(googleOwnerReply)
                }
                onClick={() => {
                  setReplyText("");
                  setReplyOpen((value) => !value);
                }}
              >
                Reply
              </ActionButton>

              {canDeleteComment && (
                <ActionButton
                  icon={Trash2}
                  danger
                  disabled={Boolean(actionState)}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this comment from the connected platform?"
                      )
                    ) {
                      onAction("delete", {
                        ...item,
                        id: commentId,
                        platform,
                      });
                    }
                  }}
                >
                  {actionState ===
                  `delete-${normalize(platform)}-${commentId}`
                    ? "Deleting..."
                    : "Delete"}
                </ActionButton>
              )}
            </div>

            {replyOpen && (
              <ReplyEditor
                value={replyText}
                onChange={setReplyText}
                onCancel={() => {
                  setReplyText("");
                  setReplyOpen(false);
                }}
                onSubmit={handleReply}
                submitting={replying}
                placeholder={
                  google
                    ? "Write a response to this Google review..."
                    : "Write a reply..."
                }
                submitLabel="Reply"
              />
            )}
          </div>
        </div>

        {google && (
          <GoogleOwnerReply
            item={item}
            onAction={onAction}
            actionState={actionState}
          />
        )}

        {!google && replies.length > 0 && (
          <div className="mt-3">
            {replies.map((reply, index) => (
              <ReplyNode
                key={
                  getId(reply) ||
                  `${commentId}-reply-${index}`
                }
                reply={reply}
                platform={platform}
                depth={0}
                onAction={onAction}
                actionState={actionState}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-dashed border-stone-300 bg-white/75 p-10 text-center shadow-sm backdrop-blur-xl dark:border-white/[0.09] dark:bg-[#0d1422]/75">
      <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-cyan-400/[0.06] blur-3xl dark:bg-cyan-400/[0.07]" />

      <div className="relative">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-500 dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-400">
          <Icon size={21} />
        </div>

        <h3 className="mt-4 text-sm font-black text-stone-900 dark:text-white">
          {title}
        </h3>

        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-stone-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function EngagementStat({ stat, index }) {
  const Icon = stat.icon;

  const accents = [
    {
      glow: "bg-orange-400/[0.08] dark:bg-orange-400/[0.07]",
      icon: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-400/[0.08] dark:text-orange-300 dark:border-orange-400/[0.12]",
    },
    {
      glow: "bg-cyan-400/[0.07] dark:bg-cyan-400/[0.06]",
      icon: "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-400/[0.08] dark:text-cyan-300 dark:border-cyan-400/[0.12]",
    },
    {
      glow: "bg-violet-400/[0.07] dark:bg-violet-400/[0.06]",
      icon: "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-400/[0.08] dark:text-violet-300 dark:border-violet-400/[0.12]",
    },
    {
      glow: "bg-emerald-400/[0.07] dark:bg-emerald-400/[0.06]",
      icon: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-400/[0.08] dark:text-emerald-300 dark:border-emerald-400/[0.12]",
    },
  ];

  const accent = accents[index % accents.length];

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-stone-200/80 bg-white/75 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.045)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.07)] dark:border-white/[0.07] dark:bg-[#0d1422]/80 dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${accent.glow}`}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.035] dark:to-transparent" />

      <div className="relative">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl border ${accent.icon}`}
        >
          <Icon size={17} />
        </div>

        <div className="mt-3 text-2xl font-black tracking-tight text-stone-950 dark:text-white">
          {stat.value}
        </div>

        <div className="mt-0.5 text-xs font-semibold text-stone-500 dark:text-slate-400">
          {stat.label}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Engagement() {
  const [activeTab, setActiveTab] = useState("Comments");

  const [data, setData] = useState({
    items: [],
    providers: [],
    capabilities: {},
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [
    visibleCommentCount,
    setVisibleCommentCount,
  ] = useState(5);

  const [
    showAllComments,
    setShowAllComments,
  ] = useState(false);

  const [actionState, setActionState] = useState(null);
  const [actionError, setActionError] = useState("");

  /* =======================================================
     LOAD ENGAGEMENT
  ======================================================= */

  const loadEngagement = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await apiRequest(
          `/engagement?refresh=${Date.now()}`,
          {
            cache: "no-store",
            allowSocialSurface: true,
          }
        );

        setData({
          items: safeArray(response?.items),
          providers: safeArray(response?.providers),
          capabilities:
            response?.capabilities || {},
        });
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to load engagement data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEngagement(false);
  }, [loadEngagement]);

  /* =======================================================
     ACTION HANDLER
  ======================================================= */

  const runCommentAction = useCallback(
    async (action, target, text = "") => {
      setActionError("");

      const platform =
        target?.platform ||
        target?.provider ||
        "";

      const targetId = getId(target);

      if (!platform) {
        setActionError(
          "Platform information is missing."
        );
        return false;
      }

      if (!targetId) {
        setActionError(
          action === "reply"
            ? "Comment/reply ID is missing."
            : "Reply ID is missing."
        );
        return false;
      }

      if (action === "edit") {
        if (!isOwnerReply(target)) {
          setActionError(
            "You can only edit your own reply."
          );
          return false;
        }
      }

      if (
        isGoogleBusiness(platform) &&
        (action === "edit" ||
          action === "delete")
      ) {
        if (!isOwnerReply(target)) {
          setActionError(
            "Google Business response does not belong to your connected business."
          );
          return false;
        }
      }

      if (
        action === "reply" &&
        !text.trim()
      ) {
        setActionError(
          "Reply text cannot be empty."
        );
        return false;
      }

      const stateKey =
        `${action}-${normalize(platform)}-${targetId}`;

      setActionState(stateKey);

      try {
        const request =
          buildActionRequest(
            action,
            platform,
            target
          );

        const options = {
          method: request.method,
        };

        if (action !== "delete") {
          options.headers = {
            "Content-Type":
              "application/json",
          };

          options.body = JSON.stringify({
            text: text.trim(),
            parentId:
              target?.parentId ??
              target?.commentId ??
              targetId,
            replyId:
              action === "edit"
                ? targetId
                : null,
          });
        }

        await apiRequest(
          request.path,
          { ...options, allowSocialSurface: true }
        );

        await loadEngagement(true);

        return true;
      } catch (requestError) {
        setActionError(
          requestError?.message ||
            `${action} action failed.`
        );

        return false;
      } finally {
        setActionState(null);
      }
    },
    [loadEngagement]
  );

  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      label: "Comments",
      icon: MessageCircle,
    },
    {
      label: "Mentions",
      icon: AtSign,
    },
    {
      label: "Messages",
      icon: Inbox,
    },
    {
      label: "Notifications",
      icon: Bell,
    },
  ];

  /* =======================================================
     DATA GROUPS
  ======================================================= */

  const safeItems = useMemo(
    () => safeArray(data.items),
    [data.items]
  );

  const comments = useMemo(
    () =>
      safeItems.filter((item) => {
        const type = normalize(item?.type);

        return (
          type === "comment" ||
          type === "review" ||
          type === "comments" ||
          (!type &&
            Boolean(
              item?.text ||
                item?.comment ||
                item?.review
            ))
        );
      }),
    [safeItems]
  );

  const mentions = useMemo(
    () =>
      safeItems.filter(
        (item) =>
          normalize(item?.type) ===
          "mention"
      ),
    [safeItems]
  );

  const messages = useMemo(
    () =>
      safeItems.filter((item) => {
        const type = normalize(item?.type);

        return (
          type === "message" ||
          type === "dm" ||
          type === "direct_message"
        );
      }),
    [safeItems]
  );

  const notifications = useMemo(
    () =>
      safeItems.filter((item) => {
        const type = normalize(item?.type);

        return (
          type === "notification" ||
          type === "alert"
        );
      }),
    [safeItems]
  );

  const currentItems = useMemo(() => {
    if (activeTab === "Comments") {
      return comments;
    }

    if (activeTab === "Mentions") {
      return mentions;
    }

    if (activeTab === "Messages") {
      return messages;
    }

    return notifications;
  }, [
    activeTab,
    comments,
    mentions,
    messages,
    notifications,
  ]);

  /* =======================================================
     PLATFORMS
  ======================================================= */

  const supportedPlatforms = useMemo(() => {
    const fromItems = currentItems
      .map(
        (item) =>
          item?.platform ??
          item?.provider
      )
      .filter(Boolean);

    const fromProviders =
      data.providers
        .map(
          (provider) =>
            provider?.platform ??
            provider?.name ??
            provider
        )
        .filter(Boolean);

    const fromCapabilities =
      safeArray(
        data.capabilities?.comments
      );

    return [
      ...new Set([
        ...fromItems,
        ...fromProviders,
        ...fromCapabilities,
      ]),
    ];
  }, [
    currentItems,
    data.providers,
    data.capabilities,
  ]);

  /* =======================================================
     FILTER / SORT
  ======================================================= */

  const filteredItems = useMemo(() => {
    const query = normalize(search);

    let result = currentItems.filter(
      (item) => {
        const platform = String(
          item?.platform ??
            item?.provider ??
            ""
        );

        if (
          platformFilter !== "all" &&
          normalize(platform) !==
            normalize(platformFilter)
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        return getSearchText(item).includes(
          query
        );
      }
    );

    result = [...result].sort(
      (first, second) => {
        if (sortBy === "likes") {
          return (
            Number(
              second?.likes || 0
            ) -
            Number(
              first?.likes || 0
            )
          );
        }

        const firstTime =
          new Date(
            getDate(first)
          ).getTime() || 0;

        const secondTime =
          new Date(
            getDate(second)
          ).getTime() || 0;

        return sortBy === "oldest"
          ? firstTime - secondTime
          : secondTime - firstTime;
      }
    );

    return result;
  }, [
    currentItems,
    platformFilter,
    search,
    sortBy,
  ]);

  const visibleItems =
    activeTab === "Comments" &&
    !showAllComments
      ? filteredItems.slice(
          0,
          visibleCommentCount
        )
      : filteredItems;

  const hasMoreComments =
    activeTab === "Comments" &&
    filteredItems.length >
      visibleCommentCount;

  /* =======================================================
     STATS
  ======================================================= */

  const stats = [
    {
      label: "Comments",
      value: comments.length,
      icon: MessageCircle,
    },
    {
      label: "Mentions",
      value: mentions.length,
      icon: AtSign,
    },
    {
      label: "Messages",
      value: messages.length,
      icon: Inbox,
    },
    {
      label: "Notifications",
      value: notifications.length,
      icon: Bell,
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-[#070b14] dark:text-white">
      {/* ===================================================
          PAGE AMBIENCE
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[360px] w-[360px] rounded-full bg-orange-400/[0.055] blur-3xl dark:bg-orange-400/[0.055]" />

        <div className="absolute right-[-140px] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-400/[0.045] blur-3xl dark:bg-cyan-400/[0.045]" />

        <div className="absolute bottom-[-160px] left-[30%] h-[400px] w-[400px] rounded-full bg-violet-400/[0.035] blur-3xl dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1550px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <PageHeader
          eyebrow="Community"
          title="Engagement"
          description="Manage comments, replies, mentions, messages and notifications from your connected platforms."
          action={
            <button
              type="button"
              onClick={() =>
                loadEngagement(true)
              }
              disabled={
                refreshing ||
                Boolean(actionState)
              }
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200/80 bg-white/80 px-4 text-xs font-black text-stone-700 shadow-sm backdrop-blur-xl transition hover:border-orange-200 hover:bg-white hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-[#0d1422]/80 dark:text-slate-200 dark:hover:border-white/[0.13] dark:hover:bg-[#101827] dark:hover:text-white"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : "transition-transform duration-300 group-hover:rotate-45"
                }
              />
              Refresh
            </button>
          }
        />

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <EngagementStat
              key={stat.label}
              stat={stat}
              index={index}
            />
          ))}
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="mt-6 overflow-x-auto pb-1">
          <div className="inline-flex min-w-full gap-1.5 rounded-2xl border border-stone-200/80 bg-white/70 p-1.5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:min-w-0 dark:border-white/[0.07] dark:bg-[#0d1422]/75 dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                activeTab === tab.label;

              const count =
                tab.label === "Comments"
                  ? comments.length
                  : tab.label === "Mentions"
                    ? mentions.length
                    : tab.label === "Messages"
                      ? messages.length
                      : notifications.length;

              return (
                <button
                  type="button"
                  key={tab.label}
                  onClick={() => {
                    setActiveTab(
                      tab.label
                    );
                    setSearch("");
                    setPlatformFilter(
                      "all"
                    );
                    setShowAllComments(
                      false
                    );
                    setVisibleCommentCount(
                      5
                    );
                    setActionError("");
                  }}
                  className={[
                    "inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition sm:flex-none",
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950 dark:shadow-white/5"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={14} />

                  {tab.label}

                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[9px]",
                      active
                        ? "bg-white/15 text-white dark:bg-slate-950/[0.08] dark:text-slate-950"
                        : "bg-stone-100 text-stone-500 dark:bg-white/[0.06] dark:text-slate-400",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {(error || actionError) && (
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-red-700 shadow-sm backdrop-blur-xl dark:border-red-400/15 dark:bg-red-400/[0.06] dark:text-red-300">
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-red-400/[0.08] blur-2xl" />

            <div className="relative flex items-start gap-3">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black">
                  Something went wrong
                </p>

                <p className="mt-1 text-xs leading-5">
                  {actionError || error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setActionError("");
                }}
                className="rounded-lg p-1 transition hover:bg-red-100 dark:hover:bg-red-400/[0.1]"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            PROVIDER STATUS
        ================================================= */}

        {data.providers.some(
          (provider) =>
            provider?.error
        ) && (
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-amber-900 shadow-sm backdrop-blur-xl dark:border-amber-400/15 dark:bg-amber-400/[0.06] dark:text-amber-200">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-400/[0.1] blur-2xl" />

            <div className="relative">
              <p className="text-xs font-black">
                Provider status
              </p>

              {data.providers
                .filter(
                  (provider) =>
                    provider?.error
                )
                .map((provider, index) => (
                  <p
                    key={
                      provider.platform ||
                      provider.name ||
                      index
                    }
                    className="mt-1 text-xs"
                  >
                    {provider.platform ||
                      provider.name}
                    : {provider.error}
                  </p>
                ))}
            </div>
          </div>
        )}

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="relative mt-5 overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/75 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.045)] backdrop-blur-xl sm:p-4 dark:border-white/[0.07] dark:bg-[#0d1422]/80 dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.035] dark:to-transparent" />

          <div className="relative flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3 transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-white/[0.08] dark:bg-[#0a111e]/80 dark:focus-within:border-orange-400/30 dark:focus-within:ring-orange-400/[0.06]">
              <Search
                size={15}
                className="shrink-0 text-stone-400 dark:text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={
                  activeTab === "Comments"
                    ? "Search comments, replies or people..."
                    : `Search ${activeTab.toLowerCase()}...`
                }
                className="min-w-0 flex-1 bg-transparent py-2.5 text-xs text-stone-800 outline-none placeholder:text-stone-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="rounded-md p-1 text-stone-400 transition hover:bg-white hover:text-stone-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex">
              <div className="relative min-w-0">
                <SlidersHorizontal
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500"
                />

                <select
                  value={platformFilter}
                  onChange={(event) =>
                    setPlatformFilter(
                      event.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-9 text-xs font-bold text-stone-700 outline-none transition hover:border-stone-300 focus:border-orange-300 dark:border-white/[0.08] dark:bg-[#0a111e] dark:text-slate-200 dark:hover:border-white/[0.12] dark:focus:border-orange-400/30"
                >
                  <option value="all">
                    All platforms
                  </option>

                  {supportedPlatforms.map(
                    (platform) => (
                      <option
                        key={platform}
                        value={platform}
                      >
                        {
                          getPlatformConfig(
                            platform
                          ).label
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500"
                />
              </div>

              <div className="relative min-w-0">
                <Clock3
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500"
                />

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-9 text-xs font-bold text-stone-700 outline-none transition hover:border-stone-300 focus:border-orange-300 dark:border-white/[0.08] dark:bg-[#0a111e] dark:text-slate-200 dark:hover:border-white/[0.12] dark:focus:border-orange-400/30"
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>

                  {activeTab ===
                    "Comments" && (
                    <option value="likes">
                      Most liked
                    </option>
                  )}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-5">
          {loading ? (
            <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/75 p-12 text-center shadow-sm backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0d1422]/80">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.035] dark:to-transparent" />

              <div className="relative">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-stone-200 bg-stone-50 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <LoaderCircle
                    size={25}
                    className="animate-spin text-orange-500 dark:text-orange-400"
                  />
                </div>

                <p className="mt-3 text-xs font-bold text-stone-500 dark:text-slate-400">
                  Loading engagement...
                </p>
              </div>
            </div>
          ) : visibleItems.length === 0 ? (
            <EmptyState
              icon={
                activeTab === "Comments"
                  ? MessageCircle
                  : activeTab === "Mentions"
                    ? AtSign
                    : activeTab === "Messages"
                      ? Inbox
                      : Bell
              }
              title={`No ${activeTab.toLowerCase()} found`}
              description={
                search ||
                platformFilter !== "all"
                  ? "Try changing your search or filters."
                  : `There are no ${activeTab.toLowerCase()} available from your connected platforms.`
              }
            />
          ) : activeTab === "Comments" ? (
            <div className="space-y-3">
              {visibleItems.map(
                (item, index) => (
                  <CommentCard
                    key={
                      getId(item) ||
                      `${
                        item?.platform ||
                        "item"
                      }-${index}`
                    }
                    item={item}
                    onAction={
                      runCommentAction
                    }
                    actionState={
                      actionState
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map(
                (item, index) => {
                  const config =
                    getPlatformConfig(
                      item?.platform
                    );

                  const Icon =
                    activeTab ===
                    "Mentions"
                      ? AtSign
                      : activeTab ===
                          "Messages"
                        ? Inbox
                        : Bell;

                  return (
                    <div
                      key={
                        getId(item) ||
                        `${activeTab}-${index}`
                      }
                      className="group relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/80 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.045)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_20px_55px_rgba(15,23,42,0.07)] sm:p-5 dark:border-white/[0.07] dark:bg-[#0d1422]/85 dark:shadow-[0_18px_55px_rgba(0,0,0,0.24)] dark:hover:border-white/[0.12]"
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

                      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.035] dark:to-transparent" />

                      <div className="relative flex items-start gap-3">
                        <Avatar item={item} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-stone-950 dark:text-white">
                              {getAuthor(item)}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wide ${config.wrapper}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                              />

                              {
                                config.label
                              }
                            </span>

                            <span className="text-[10px] text-stone-400 dark:text-slate-500">
                              {formatDate(
                                getDate(
                                  item
                                )
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex items-start gap-2">
                            <Icon
                              size={14}
                              className="mt-1 shrink-0 text-stone-400 dark:text-slate-500"
                            />

                            <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700 dark:text-slate-300">
                              {getText(
                                item
                              ) ||
                                item?.title ||
                                "—"}
                            </p>
                          </div>
                        </div>

                        {item?.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                          >
                            <ExternalLink
                              size={13}
                            />
                            <span className="hidden sm:inline">
                              Open
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =================================================
            LOAD MORE
        ================================================= */}

        {activeTab === "Comments" &&
          hasMoreComments && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const nextCount =
                    visibleCommentCount +
                    5;

                  if (
                    nextCount >=
                    filteredItems.length
                  ) {
                    setShowAllComments(
                      true
                    );

                    setVisibleCommentCount(
                      filteredItems.length
                    );
                  } else {
                    setVisibleCommentCount(
                      nextCount
                    );
                  }
                }}
                className="group inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/80 px-5 py-2.5 text-xs font-black text-stone-700 shadow-sm backdrop-blur-xl transition hover:border-orange-200 hover:bg-white hover:text-stone-950 dark:border-white/[0.08] dark:bg-[#0d1422]/80 dark:text-slate-300 dark:hover:border-white/[0.13] dark:hover:bg-[#101827] dark:hover:text-white"
              >
                Load more comments

                <ChevronDown
                  size={14}
                  className="transition-transform group-hover:translate-y-0.5"
                />
              </button>
            </div>
          )}

        {/* =================================================
            COLLAPSE
        ================================================= */}

        {activeTab === "Comments" &&
          showAllComments &&
          filteredItems.length > 5 && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowAllComments(
                    false
                  );
                  setVisibleCommentCount(
                    5
                  );
                }}
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-500 transition hover:bg-white hover:text-stone-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                Show fewer
              </button>
            </div>
          )}

        {/* =================================================
            INFO
        ================================================= */}

        {activeTab === "Comments" && (
          <div className="relative mt-6 overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/75 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.045)] backdrop-blur-xl sm:p-5 dark:border-white/[0.07] dark:bg-[#0d1422]/80 dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-400/[0.06] blur-3xl dark:bg-emerald-400/[0.07]" />

            <div className="relative flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-400/[0.12] dark:bg-emerald-400/[0.08] dark:text-emerald-300">
                <ShieldCheck size={17} />
              </div>

              <div>
                <h3 className="text-xs font-black text-stone-900 dark:text-white">
                  Reply controls
                </h3>

                <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
                  Incoming comments are
                  read-only. You can reply
                  to a comment or to
                  another reply. Edit and
                  Delete are available only
                  on replies owned by your
                  connected account. Nested
                  replies are supported when
                  the platform API provides
                  them. Google Business
                  owner responses have their
                  own Edit and Delete
                  controls.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="relative mt-5 overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/75 px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0d1422]/80 dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 bg-stone-100 text-stone-600 dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-400">
                <Users size={15} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-500">
                  Connected
                </p>

                <p className="text-xs font-bold text-stone-700 dark:text-slate-300">
                  {supportedPlatforms.length}{" "}
                  platform
                  {supportedPlatforms.length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {supportedPlatforms.map(
                (platform) => {
                  const config =
                    getPlatformConfig(
                      platform
                    );

                  return (
                    <span
                      key={platform}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black ${config.wrapper}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                      />

                      {config.label}
                    </span>
                  );
                }
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              </span>

              <Sparkles size={13} />

              Live sync
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
