import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import PageHeader from "../layout/PageHeader.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

/* =========================================================
   CONSTANTS
========================================================= */

const FILTERS = [
  "All",
  "Unread",
  "Publishing",
  "Accounts",
  "System",
];

/* =========================================================
   MAIN
========================================================= */

export default function Notifications() {
  const {
    notifications,
    markAsRead: markAsReadAction,
    markAllAsRead: markAllAsReadAction,
    removeNotification: removeNotificationAction,
    clearAll: clearAllAction,
  } = useNotifications();

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [selectedId, setSelectedId] =
    useState(null);

  const [toast, setToast] =
    useState("");

  /* =======================================================
     STATS
  ======================================================== */

  const stats = useMemo(() => {
    const unread = notifications.filter(
      (item) => !item.read
    ).length;

    const publishing =
      notifications.filter(
        (item) =>
          item.type === "publishing"
      ).length;

    const accounts =
      notifications.filter(
        (item) =>
          item.type === "account"
      ).length;

    return {
      total: notifications.length,
      unread,
      publishing,
      accounts,
    };
  }, [notifications]);

  /* =======================================================
     FILTER
  ======================================================== */

  const filteredNotifications =
    useMemo(() => {
      return notifications
        .filter((notification) => {
          switch (activeFilter) {
            case "Unread":
              return !notification.read;

            case "Publishing":
              return (
                notification.type ===
                "publishing"
              );

            case "Accounts":
              return (
                notification.type ===
                "account"
              );

            case "System":
              return (
                notification.type ===
                "system"
              );

            default:
              return true;
          }
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    }, [
      notifications,
      activeFilter,
    ]);

  /* =======================================================
     READ
  ======================================================== */

  const markAsRead = (id) => {
    markAsReadAction(id);
  };

  const markAllAsRead = () => {
    markAllAsReadAction();

    showToast(
      "All notifications marked as read"
    );
  };

  /* =======================================================
     DELETE
  ======================================================== */

  const removeNotification = (id) => {
    removeNotificationAction(id);

    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const clearAll = () => {
    clearAllAction();

    setSelectedId(null);

    showToast("Notifications cleared");
  };

  /* =======================================================
     OPEN
  ======================================================== */

  const openNotification = (
    notification
  ) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    setSelectedId(
      notification.id
    );
  };

  const selectedNotification =
    notifications.find(
      (item) =>
        item.id === selectedId
    );

  /* =======================================================
     TOAST
  ======================================================== */

  function showToast(message) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 1800);
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* =================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />

        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />

        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <PageHeader
          eyebrow="Tools"
          title="Notifications"
          description="Stay updated with publishing results, account events and important workspace alerts."
          action={
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={
                stats.unread === 0
              }
              className="
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-stone-200
                bg-stone-950
                px-4
                text-xs
                font-bold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-stone-800
                disabled:cursor-not-allowed
                disabled:opacity-40
                dark:border-white/[0.08]
                dark:bg-white
                dark:text-slate-950
                dark:hover:bg-slate-100
                sm:w-auto
              "
            >
              <Check size={14} />
              Mark all read
            </button>
          }
        />

        {/* ===================================================
            OVERVIEW
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-violet-100/80
            bg-white/[0.72]
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-violet-400/10
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent dark:via-violet-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-56
              w-56
              rounded-full
              bg-violet-400/10
              blur-[90px]
              dark:bg-violet-400/[0.06]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              left-1/3
              h-40
              w-40
              rounded-full
              bg-cyan-400/5
              blur-[80px]
              dark:bg-cyan-400/[0.04]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              p-4
              sm:p-5
              lg:flex-row
              lg:items-center
              lg:justify-between
              lg:p-6
            "
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-violet-100
                  bg-violet-50
                  text-violet-600
                  dark:border-violet-400/15
                  dark:bg-violet-400/10
                  dark:text-violet-300
                "
              >
                <BellRing
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black tracking-tight text-stone-900 transition-colors duration-300 dark:text-white sm:text-base">
                    Notification center
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-violet-100
                      bg-violet-50
                      px-2
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-violet-600
                      dark:border-violet-400/15
                      dark:bg-violet-400/10
                      dark:text-violet-300
                    "
                  >
                    Workspace
                  </span>
                </div>

                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                  Publishing updates, account events and
                  important workspace alerts are collected here.
                </p>
              </div>
            </div>

            <div
              className={`
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                px-3
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                ${
                  stats.unread > 0
                    ? "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300"
                    : "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300"
                }
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${
                    stats.unread > 0
                      ? "bg-violet-500 dark:bg-violet-300"
                      : "bg-emerald-500 dark:bg-emerald-300"
                  }
                `}
              />

              {stats.unread > 0
                ? `${stats.unread} unread`
                : "All caught up"}
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
            sm:mt-6
            lg:grid-cols-4
          "
        >
          <NotificationStat
            icon={Bell}
            label="Total"
            value={stats.total}
            tone="violet"
          />

          <NotificationStat
            icon={BellRing}
            label="Unread"
            value={stats.unread}
            tone={
              stats.unread > 0
                ? "orange"
                : "green"
            }
          />

          <NotificationStat
            icon={Clock3}
            label="Publishing"
            value={stats.publishing}
            tone="cyan"
          />

          <NotificationStat
            icon={Settings2}
            label="Accounts"
            value={stats.accounts}
            tone="slate"
          />
        </section>

        {/* ===================================================
            FILTER BAR
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[22px]
            border
            border-white/80
            bg-white/[0.72]
            p-3
            shadow-[0_14px_40px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]
            sm:mt-6
            sm:p-4
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent dark:via-cyan-400/15" />

          <div className="flex min-w-0 items-center gap-2">
            <div
              className="
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                text-stone-400
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-500
              "
            >
              <FilterIcon />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
                Notification filters
              </p>

              <p className="mt-0.5 text-xs text-stone-500 dark:text-slate-400">
                Focus on the updates you need.
              </p>
            </div>
          </div>

          <div
            className="
              mt-3
              flex
              min-w-0
              gap-1.5
              overflow-x-auto
              pb-0.5
            "
          >
            {FILTERS.map((filter) => {
              const active =
                activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter
                    )
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    px-3
                    py-2.5
                    text-[10px]
                    font-black
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-stone-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                        : "border border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.07] dark:hover:text-slate-200"
                    }
                  `}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            NOTIFICATIONS LIST
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-white/80
            bg-white/[0.72]
            shadow-[0_20px_65px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent dark:via-orange-400/15" />

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-stone-200/70
              px-4
              py-5
              transition-colors
              duration-300
              dark:border-white/[0.06]
              sm:px-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2 className="text-[15px] font-black tracking-tight text-stone-900 dark:text-white">
                Activity
              </h2>

              <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                {filteredNotifications.length} notification
                {filteredNotifications.length === 1
                  ? ""
                  : "s"} shown
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-1.5
                  text-[10px]
                  font-bold
                  text-red-500
                  transition-colors
                  hover:text-red-600
                  dark:text-red-400
                  dark:hover:text-red-300
                "
              >
                <Trash2 size={12} />
                Clear all
              </button>
            )}
          </div>

          {filteredNotifications.length >
          0 ? (
            <div className="divide-y divide-stone-100 dark:divide-white/[0.06]">
              {filteredNotifications.map(
                (notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={
                      notification
                    }
                    onOpen={() =>
                      openNotification(
                        notification
                      )
                    }
                    onRead={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                    onDelete={() =>
                      removeNotification(
                        notification.id
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyNotifications
              filtered={
                notifications.length > 0
              }
              onReset={() =>
                setActiveFilter("All")
              }
            />
          )}
        </section>

        {/* ===================================================
            INFORMATION
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            gap-3
            pb-4
            sm:mt-6
            sm:pb-6
            md:grid-cols-3
          "
        >
          <InfoCard
            icon={Bell}
            title="Publishing alerts"
            text="Successful publishing, failed posts and queue-related events can appear here."
          />

          <InfoCard
            icon={Settings2}
            title="Account events"
            text="Connection problems, permission issues and provider-related updates can be shown here."
          />

          <InfoCard
            icon={Sparkles}
            title="Workspace events"
            text="Important system updates and future automation events can be added to this timeline."
          />
        </section>
      </div>

      {/* =====================================================
          VIEW MODAL
      ====================================================== */}

      {selectedNotification && (
        <ModalOverlay
          onClose={() =>
            setSelectedId(null)
          }
        >
          <div
            className="
              relative
              w-full
              max-w-lg
              overflow-hidden
              rounded-[28px]
              border
              border-white/80
              bg-white
              shadow-2xl
              transition-colors
              duration-300
              dark:border-white/[0.1]
              dark:bg-[#0b1220]
              dark:shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent dark:via-violet-400/25" />

            <div className="flex items-start justify-between gap-4 border-b border-stone-200/70 p-5 transition-colors duration-300 dark:border-white/[0.08] sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <NotificationIcon
                  type={
                    selectedNotification.type
                  }
                  large
                />

                <div className="min-w-0">
                  <span
                    className="
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-stone-400
                      dark:text-slate-500
                    "
                  >
                    {getTypeLabel(
                      selectedNotification.type
                    )}
                  </span>

                  <h2 className="mt-1 break-words text-base font-black text-stone-900 dark:text-white">
                    {selectedNotification.title}
                  </h2>

                  <p className="mt-1 text-[10px] text-stone-400 dark:text-slate-500">
                    {formatDate(
                      selectedNotification.createdAt
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedId(null)
                }
                className="
                  grid
                  h-9
                  w-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-stone-200
                  bg-stone-50
                  text-stone-400
                  transition-all
                  hover:text-stone-700
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-500
                  dark:hover:bg-white/[0.07]
                  dark:hover:text-slate-200
                "
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div
                className="
                  rounded-2xl
                  border
                  border-stone-200
                  bg-stone-50/70
                  p-4
                  text-sm
                  leading-6
                  text-stone-600
                  transition-colors
                  duration-300
                  dark:border-white/[0.08]
                  dark:bg-white/[0.025]
                  dark:text-slate-300
                "
              >
                {selectedNotification.message}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedId(null)
                  }
                  className="
                    h-10
                    rounded-xl
                    bg-stone-950
                    px-4
                    text-xs
                    font-bold
                    text-white
                    transition-all
                    hover:bg-stone-800
                    dark:bg-white
                    dark:text-slate-950
                    dark:hover:bg-slate-100
                  "
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* =====================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div
          className="
            fixed
            bottom-5
            left-1/2
            z-[200]
            flex
            -translate-x-1/2
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-stone-950
            px-4
            py-3
            text-xs
            font-bold
            text-white
            shadow-2xl
            dark:border-white/[0.08]
          "
        >
          <CheckCircle2
            size={14}
            className="text-emerald-400"
          />

          {toast}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationItem({
  notification,
  onOpen,
  onRead,
  onDelete,
}) {
  return (
    <article
      className={`
        group
        relative
        flex
        min-w-0
        gap-3
        px-4
        py-4
        transition-colors
        hover:bg-stone-50/60
        dark:hover:bg-white/[0.025]
        sm:px-5
        sm:py-5
        lg:px-6
        ${
          !notification.read
            ? "bg-violet-50/25 dark:bg-violet-400/[0.035]"
            : ""
        }
      `}
    >
      {!notification.read && (
        <span
          className="
            absolute
            bottom-0
            left-0
            top-0
            w-1
            bg-violet-500
            dark:bg-violet-400
          "
        />
      )}

      <NotificationIcon
        type={notification.type}
      />

      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            min-w-0
            flex-col
            gap-2
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <button
            type="button"
            onClick={onOpen}
            className="
              min-w-0
              text-left
              outline-none
            "
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3
                className={`
                  truncate
                  text-sm
                  ${
                    notification.read
                      ? "font-bold text-stone-700 dark:text-slate-300"
                      : "font-black text-stone-900 dark:text-white"
                  }
                `}
                title={notification.title}
              >
                {notification.title}
              </h3>

              {!notification.read && (
                <span
                  className="
                    rounded-full
                    border
                    border-violet-100
                    bg-violet-50
                    px-2
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-violet-600
                    dark:border-violet-400/15
                    dark:bg-violet-400/10
                    dark:text-violet-300
                  "
                >
                  New
                </span>
              )}
            </div>

            <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-stone-500 dark:text-slate-400">
              {notification.message}
            </p>
          </button>

          <time
            className="
              shrink-0
              text-[10px]
              font-medium
              text-stone-400
              dark:text-slate-500
            "
            title={formatDate(
              notification.createdAt
            )}
          >
            {formatRelative(
              notification.createdAt
            )}
          </time>
        </div>

        {/* Bottom actions */}

        <div
          className="
            mt-3
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <span
            className="
              rounded-lg
              border
              border-stone-200
              bg-stone-50
              px-2
              py-1
              text-[8px]
              font-black
              uppercase
              tracking-[0.08em]
              text-stone-400
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-500
            "
          >
            {getTypeLabel(
              notification.type
            )}
          </span>

          {!notification.read && (
            <button
              type="button"
              onClick={onRead}
              className="
                inline-flex
                items-center
                gap-1
                text-[9px]
                font-bold
                text-violet-600
                transition-colors
                hover:text-violet-700
                dark:text-violet-400
                dark:hover:text-violet-300
              "
            >
              <Check size={11} />
              Mark read
            </button>
          )}

          <button
            type="button"
            onClick={onOpen}
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-bold
              text-stone-500
              transition-colors
              hover:text-stone-800
              dark:text-slate-400
              dark:hover:text-slate-200
            "
          >
            View
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-bold
              text-red-400
              transition-colors
              hover:text-red-600
              dark:text-red-400
              dark:hover:text-red-300
            "
          >
            <Trash2 size={10} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({
  type,
  large = false,
}) {
  const config = {
    publishing: {
      icon: Clock3,
      className:
        "border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",
    },

    account: {
      icon: Settings2,
      className:
        "border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",
    },

    system: {
      icon: Sparkles,
      className:
        "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",
    },

    default: {
      icon: Bell,
      className:
        "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",
    },
  };

  const selected =
    config[type] ||
    config.default;

  const Icon = selected.icon;

  return (
    <div
      className={`
        grid
        shrink-0
        place-items-center
        rounded-xl
        border
        ${selected.className}
        ${
          large
            ? "h-11 w-11 rounded-2xl"
            : "h-10 w-10"
        }
      `}
    >
      <Icon
        size={large ? 19 : 16}
        strokeWidth={1.8}
      />
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function NotificationStat({
  icon: Icon,
  label,
  value,
  tone = "slate",
}) {
  const tones = {
    violet:
      "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",

    orange:
      "border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",

    cyan:
      "border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",

    green:
      "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",

    slate:
      "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",
  };

  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white/[0.72]
        p-4
        shadow-[0_14px_40px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-all
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.08]" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            ${tones[tone] || tones.slate}
          `}
        >
          <Icon size={17} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-white/80
        bg-white/[0.72]
        p-4
        shadow-[0_12px_35px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-all
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.03]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.2)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent dark:via-cyan-400/12" />

      <div className="flex items-start gap-3">
        <div
          className="
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            text-stone-500
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-400
          "
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-black text-stone-800 dark:text-slate-200">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyNotifications({
  filtered,
  onReset,
}) {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        px-5
        py-12
        text-center
      "
    >
      <div
        className="
          grid
          h-14
          w-14
          place-items-center
          rounded-2xl
          border
          border-stone-200
          bg-stone-50
          text-stone-300
          dark:border-white/[0.08]
          dark:bg-white/[0.04]
          dark:text-slate-500
        "
      >
        <Bell
          size={22}
          strokeWidth={1.6}
        />
      </div>

      <h3 className="mt-4 text-sm font-black text-stone-700 dark:text-slate-200">
        {filtered
          ? "No notifications match this filter"
          : "You are all caught up"}
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-5 text-stone-400 dark:text-slate-500">
        {filtered
          ? "Try another filter or switch back to all notifications."
          : "Important publishing results, account events and workspace alerts will appear here when available."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onReset}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-stone-200
            bg-white
            px-4
            py-2.5
            text-xs
            font-bold
            text-stone-600
            shadow-sm
            transition-all
            hover:bg-stone-50
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-300
            dark:hover:bg-white/[0.07]
          "
        >
          <Bell size={13} />
          Show all
        </button>
      )}

      {!filtered && (
        <span
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-emerald-100
            bg-emerald-50
            px-3
            py-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.1em]
            text-emerald-600
            dark:border-emerald-400/15
            dark:bg-emerald-400/10
            dark:text-emerald-300
          "
        >
          <CheckCircle2 size={11} />
          Nothing new
        </span>
      )}
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function ModalOverlay({
  children,
  onClose,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-stone-950/45
        p-3
        backdrop-blur-sm
        dark:bg-black/65
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   FILTER ICON
========================================================= */

function FilterIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

/* =========================================================
   TYPE LABEL
========================================================= */

function getTypeLabel(type) {
  switch (type) {
    case "publishing":
      return "Publishing";

    case "account":
      return "Account";

    case "system":
      return "System";

    default:
      return "Notification";
  }
}

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(value) {
  if (!value) return "Unknown";

  const timestamp =
    new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const difference =
    Date.now() - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Just now";
  }

  if (difference < hour) {
    return `${Math.floor(
      difference / minute
    )}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(
      difference / hour
    )}h ago`;
  }

  if (difference < 7 * day) {
    return `${Math.floor(
      difference / day
    )}d ago`;
  }

  return new Date(
    timestamp
  ).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
} 