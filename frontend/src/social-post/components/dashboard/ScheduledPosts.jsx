import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Image as ImageIcon,
  Layers3,
  MonitorPlay,
  Plus,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import PageHeader from "../layout/PageHeader.jsx";
import { usePost } from "../../hooks/usePost.js";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const VIEW_OPTIONS = ["Month", "Week", "Day"];

const INDIA_FESTIVALS = {
  2026: {
    "01-13": ["Lohri"],
    "01-14": ["Makar Sankranti", "Pongal"],
    "01-15": ["Magh Bihu", "Kite Festival"],
    "01-23": [
      "Vasant Panchami",
      "Netaji Subhas Chandra Bose Jayanti",
    ],
    "01-26": ["Republic Day"],
    "01-30": ["Martyrs' Day"],
    "02-04": ["World Cancer Day"],
    "02-14": ["Valentine's Day"],
    "02-15": ["Maha Shivratri"],
    "02-19": ["Chhatrapati Shivaji Maharaj Jayanti"],
    "02-28": ["National Science Day"],
    "03-03": ["World Wildlife Day"],
    "03-04": ["Holi"],
    "03-08": ["International Women's Day"],
    "03-15": ["World Consumer Rights Day"],
    "03-19": ["Ugadi", "Gudi Padwa"],
    "03-20": ["Eid al-Fitr"],
    "03-21": ["World Poetry Day"],
    "03-26": ["Ram Navami"],
    "03-27": ["World Theatre Day"],
    "03-31": ["Mahavir Jayanti"],
    "04-01": ["Odisha Day", "April Fools' Day"],
    "04-03": ["Good Friday"],
    "04-07": ["World Health Day"],
    "04-14": [
      "Tamil New Year",
      "Vishu",
      "Ambedkar Jayanti",
      "Baisakhi",
    ],
    "04-15": ["Pohela Boishakh"],
    "04-18": ["World Heritage Day"],
    "04-22": ["Earth Day"],
    "05-01": [
      "Buddha Purnima",
      "Maharashtra Day",
      "Gujarat Day",
      "International Workers' Day",
    ],
    "05-09": ["Rabindra Jayanti"],
    "05-11": ["National Technology Day"],
    "05-27": ["Eid al-Adha"],
    "05-31": ["World No Tobacco Day"],
    "06-05": ["World Environment Day"],
    "06-21": ["International Day of Yoga"],
    "06-26": ["Muharram"],
    "07-01": ["National Doctors' Day", "GST Day"],
    "07-11": ["World Population Day"],
    "07-26": ["Kargil Vijay Diwas"],
    "08-07": ["National Handloom Day"],
    "08-09": ["Quit India Movement Day"],
    "08-15": ["Independence Day"],
    "08-19": ["World Photography Day"],
    "08-20": ["Sadbhavana Diwas"],
    "08-28": ["Onam"],
    "08-29": ["National Sports Day"],
    "09-04": ["Janmashtami"],
    "09-05": ["Teachers' Day"],
    "09-08": ["International Literacy Day"],
    "09-14": ["Ganesh Chaturthi", "Hindi Diwas"],
    "09-16": ["World Ozone Day"],
    "09-17": ["Vishwakarma Puja"],
    "09-27": ["World Tourism Day"],
    "10-02": ["Gandhi Jayanti"],
    "10-08": ["Indian Air Force Day"],
    "10-10": ["World Mental Health Day"],
    "10-15": ["Global Handwashing Day"],
    "10-16": ["World Food Day"],
    "10-20": ["Dussehra"],
    "10-24": ["United Nations Day"],
    "11-08": ["Diwali"],
    "11-09": ["Govardhan Puja"],
    "11-11": ["Bhai Dooj"],
    "11-14": ["Children's Day", "Nehru Jayanti"],
    "11-19": ["International Men's Day"],
    "11-24": ["Guru Nanak Jayanti"],
    "11-26": ["Constitution Day"],
    "12-01": ["World AIDS Day"],
    "12-04": ["Indian Navy Day"],
    "12-10": ["Human Rights Day"],
    "12-14": ["National Energy Conservation Day"],
    "12-22": ["National Mathematics Day"],
    "12-25": ["Christmas"],
    "12-31": ["New Year's Eve"],
  },
};

const STATUS_STYLES = {
  scheduled: {
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/15 dark:bg-orange-400/[0.08] dark:text-orange-400",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
  published: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/[0.08] dark:text-emerald-400",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  pending: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/[0.08] dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  draft: {
    badge:
      "border-stone-200 bg-stone-100 text-stone-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400",
    dot: "bg-stone-400 dark:bg-slate-500",
  },
  failed: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/15 dark:bg-red-400/[0.08] dark:text-red-400",
    dot: "bg-red-500 dark:bg-red-400",
  },
  cancelled: {
    badge:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",
    dot: "bg-slate-400 dark:bg-slate-500",
  },
};

export default function ScheduledPosts() {
  const { posts = [] } = usePost();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("Month");

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const today = useMemo(() => new Date(), []);

  /* =========================================================
     NORMALIZED POSTS
  ========================================================== */

  const calendarPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];

    return posts
      .map(normalizePost)
      .filter(
        (post) =>
          post.date instanceof Date &&
          !Number.isNaN(post.date.getTime()),
      )
      .sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime(),
      );
  }, [posts]);

  /* =========================================================
     MONTH
  ========================================================== */

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      },
    );
  }, [currentDate]);

  /* =========================================================
     STATS
  ========================================================== */

  const calendarStats = useMemo(() => {
    const currentMonthPosts =
      calendarPosts.filter(
        (post) =>
          post.date.getFullYear() === year &&
          post.date.getMonth() === month,
      );

    return {
      total: currentMonthPosts.length,
      scheduled:
        currentMonthPosts.filter(
          (post) =>
            post.status === "scheduled",
        ).length,
      published:
        currentMonthPosts.filter(
          (post) =>
            post.status === "published",
        ).length,
      media:
        currentMonthPosts.filter(
          (post) =>
            post.mediaType !== "text",
        ).length,
    };
  }, [calendarPosts, year, month]);

  /* =========================================================
     MONTH CALENDAR
  ========================================================== */

  const calendarDays = useMemo(() => {
    const days = [];

    const firstDay = new Date(
      year,
      month,
      1,
    ).getDay();

    const mondayStart =
      firstDay === 0
        ? 6
        : firstDay - 1;

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    for (
      let index = 0;
      index < mondayStart;
      index += 1
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      days.push(day);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [year, month]);

  /* =========================================================
     WEEK
  ========================================================== */

  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();

    const mondayOffset =
      day === 0 ? -6 : 1 - day;

    date.setDate(
      date.getDate() + mondayOffset,
    );

    date.setHours(0, 0, 0, 0);

    return date;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(
          weekStart,
        );

        date.setDate(
          weekStart.getDate() + index,
        );

        return date;
      },
    );
  }, [weekStart]);

  /* =========================================================
     DAY POSTS
  ========================================================== */

  const dayPosts = useMemo(() => {
    return calendarPosts
      .filter((post) =>
        isSameDay(
          post.date,
          currentDate,
        ),
      )
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime(),
      );
  }, [calendarPosts, currentDate]);

  /* =========================================================
     HEADER LABEL
  ========================================================== */

  const periodLabel = useMemo(() => {
    if (view === "Month") {
      return monthLabel;
    }

    if (view === "Week") {
      const end = new Date(weekStart);

      end.setDate(
        end.getDate() + 6,
      );

      const startLabel =
        weekStart.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          },
        );

      const endLabel =
        end.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        );

      return `${startLabel} – ${endLabel}`;
    }

    return currentDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );
  }, [
    view,
    monthLabel,
    weekStart,
    currentDate,
  ]);

  /* =========================================================
     NAVIGATION
  ========================================================== */

  function previousPeriod() {
    const next = new Date(
      currentDate,
    );

    if (view === "Month") {
      next.setMonth(
        next.getMonth() - 1,
      );
      next.setDate(1);
    } else if (view === "Week") {
      next.setDate(
        next.getDate() - 7,
      );
    } else {
      next.setDate(
        next.getDate() - 1,
      );
    }

    setCurrentDate(next);
  }

  function nextPeriod() {
    const next = new Date(
      currentDate,
    );

    if (view === "Month") {
      next.setMonth(
        next.getMonth() + 1,
      );
      next.setDate(1);
    } else if (view === "Week") {
      next.setDate(
        next.getDate() + 7,
      );
    } else {
      next.setDate(
        next.getDate() + 1,
      );
    }

    setCurrentDate(next);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  /* =========================================================
     OPEN DAY
  ========================================================== */

  function openDay(date) {
    if (!date) return;

    const postsForSelectedDay =
      calendarPosts
        .filter((post) =>
          isSameDay(
            post.date,
            date,
          ),
        )
        .sort(
          (a, b) =>
            a.date.getTime() -
            b.date.getTime(),
        );

    setSelectedDay({
      date: new Date(date),
      posts: postsForSelectedDay,
    });
  }

  /* =========================================================
     OPEN POST
  ========================================================== */

  function openPost(post) {
    const id =
      post?.id ??
      post?._id;

    if (!id) {
      return;
    }

    setSelectedDay(null);
    setSelectedPost(null);

    navigate(
      `/dashboard/posts?focus=${encodeURIComponent(
        id,
      )}`,
    );
  }

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        relative min-h-screen
        overflow-hidden
        bg-[#f6f7fb]
        transition-colors duration-300
        dark:bg-[#070b14]
      "
    >
      {/* =====================================================
          GLOBAL AMBIENT LIGHT
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          -right-40
          -top-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-orange-400/[0.08]
          blur-[120px]
          dark:bg-orange-500/[0.045]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          -bottom-40
          -left-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-cyan-400/[0.06]
          blur-[120px]
          dark:bg-cyan-500/[0.025]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          left-1/2
          top-1/2
          h-[300px]
          w-[300px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-violet-400/[0.025]
          blur-[120px]
          dark:bg-violet-500/[0.015]
        "
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        <PageHeader
          eyebrow="Content calendar"
          title="Calendar"
          description="Plan, schedule, and review everything coming next."
          action={
            <Link
              to="/dashboard/create-post"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-stone-900
                bg-stone-950
                px-4
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(15,23,42,0.12)]
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-stone-800

                dark:border-white/[0.10]
                dark:bg-white
                dark:text-slate-950
                dark:shadow-[0_10px_30px_rgba(255,255,255,0.06)]
                dark:hover:bg-slate-100
              "
            >
              <Plus
                size={17}
                strokeWidth={2.2}
              />

              Create post
            </Link>
          }
        />

        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            icon={<Layers3 size={16} />}
            label="Total"
            value={calendarStats.total}
          />

          <SummaryCard
            icon={<Clock3 size={16} />}
            label="Scheduled"
            value={calendarStats.scheduled}
          />

          <SummaryCard
            icon={<Sparkles size={16} />}
            label="Published"
            value={calendarStats.published}
          />

          <SummaryCard
            icon={<MonitorPlay size={16} />}
            label="Media"
            value={calendarStats.media}
          />
        </div>

        {/* ===================================================
            CALENDAR CARD
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[28px]
            border
            border-stone-200/70
            bg-white/[0.72]
            shadow-[0_24px_80px_rgba(15,23,42,0.06)]
            backdrop-blur-2xl

            dark:border-white/[0.08]
            dark:bg-[#0d1422]/80
            dark:shadow-[0_25px_90px_rgba(0,0,0,0.30)]
          "
        >
          {/* Ambient glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-orange-400/10
              blur-[110px]
              dark:bg-orange-500/[0.035]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              -left-28
              h-72
              w-72
              rounded-full
              bg-cyan-400/5
              blur-[110px]
              dark:bg-cyan-500/[0.025]
            "
          />

          {/* Top edge */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-orange-400/30
              to-transparent
              dark:via-orange-400/15
            "
          />

          {/* Reflection */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-20
              bg-gradient-to-b
              from-white/35
              to-transparent
              dark:from-white/[0.035]
              dark:to-transparent
            "
          />

          {/* =================================================
              TOOLBAR
          ================================================== */}

          <div
            className="
              relative
              border-b
              border-stone-200/70
              px-4
              py-4
              dark:border-white/[0.07]
              sm:px-6
              sm:py-5
            "
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    grid
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    border
                    border-orange-200/80
                    bg-orange-50
                    text-orange-600
                    shadow-sm

                    dark:border-orange-400/10
                    dark:bg-orange-400/[0.07]
                    dark:text-orange-400
                  "
                >
                  <CalendarDays
                    size={19}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      truncate
                      text-[15px]
                      font-black
                      tracking-tight
                      text-stone-900
                      dark:text-white
                      sm:text-base
                    "
                  >
                    {periodLabel}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-stone-500
                      dark:text-slate-500
                    "
                  >
                    {calendarStats.total} post
                    {calendarStats.total === 1
                      ? ""
                      : "s"} this month
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* VIEW */}

                <div
                  className="
                    grid
                    grid-cols-3
                    rounded-xl
                    border
                    border-stone-200/80
                    bg-stone-100/70
                    p-1

                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                  "
                >
                  {VIEW_OPTIONS.map(
                    (option) => {
                      const active =
                        view === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setView(option)
                          }
                          className={`
                            rounded-lg
                            px-3
                            py-2
                            text-[10px]
                            font-bold
                            transition-all
                            duration-200
                            sm:px-4

                            ${
                              active
                                ? `
                                  bg-white
                                  text-stone-900
                                  shadow-sm
                                  ring-1
                                  ring-stone-200/80

                                  dark:bg-white
                                  dark:text-slate-950
                                  dark:ring-white/[0.08]
                                `
                                : `
                                  text-stone-400
                                  hover:text-stone-700

                                  dark:text-slate-500
                                  dark:hover:text-slate-200
                                `
                            }
                          `}
                        >
                          {option}
                        </button>
                      );
                    },
                  )}
                </div>

                {/* NAV */}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToday}
                    className="
                      h-10
                      flex-1
                      rounded-xl
                      border
                      border-stone-200
                      bg-white
                      px-4
                      text-xs
                      font-bold
                      text-stone-600
                      shadow-sm
                      transition-all

                      hover:bg-stone-50
                      hover:text-stone-900

                      dark:border-white/[0.08]
                      dark:bg-white/[0.035]
                      dark:text-slate-400
                      dark:hover:bg-white/[0.06]
                      dark:hover:text-white

                      sm:flex-none
                    "
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    onClick={
                      previousPeriod
                    }
                    aria-label="Previous period"
                    className="
                      grid
                      h-10
                      w-10
                      shrink-0
                      place-items-center
                      rounded-xl
                      border
                      border-stone-200
                      bg-white
                      text-stone-500
                      shadow-sm
                      transition-all

                      hover:bg-stone-50
                      hover:text-stone-900

                      dark:border-white/[0.08]
                      dark:bg-white/[0.035]
                      dark:text-slate-500
                      dark:hover:bg-white/[0.06]
                      dark:hover:text-white
                    "
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={
                      nextPeriod
                    }
                    aria-label="Next period"
                    className="
                      grid
                      h-10
                      w-10
                      shrink-0
                      place-items-center
                      rounded-xl
                      border
                      border-stone-200
                      bg-white
                      text-stone-500
                      shadow-sm
                      transition-all

                      hover:bg-stone-50
                      hover:text-stone-900

                      dark:border-white/[0.08]
                      dark:bg-white/[0.035]
                      dark:text-slate-500
                      dark:hover:bg-white/[0.06]
                      dark:hover:text-white
                    "
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              MONTH
          ================================================== */}

          {view === "Month" && (
            <MonthView
              calendarDays={calendarDays}
              calendarPosts={
                calendarPosts
              }
              month={month}
              year={year}
              today={today}
              onOpenDay={openDay}
            />
          )}

          {/* =================================================
              WEEK
          ================================================== */}

          {view === "Week" && (
            <WeekView
              weekDays={weekDays}
              calendarPosts={
                calendarPosts
              }
              today={today}
              onOpenDay={openDay}
            />
          )}

          {/* =================================================
              DAY
          ================================================== */}

          {view === "Day" && (
            <DayView
              date={currentDate}
              posts={dayPosts}
              onSelectPost={(post) =>
                setSelectedPost(post)
              }
            />
          )}
        </section>

        <button
          type="button"
          onClick={goToday}
          className="
            mt-4
            flex
            h-10
            w-full
            items-center
            justify-center
            rounded-xl
            border
            border-stone-200
            bg-white
            text-xs
            font-bold
            text-stone-600
            shadow-sm
            transition-all
            hover:bg-stone-50

            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:text-slate-400
            dark:hover:bg-white/[0.06]
            dark:hover:text-white

            sm:hidden
          "
        >
          Back to today
        </button>
      </div>

      {/* =====================================================
          DAY POSTS POPUP
      ====================================================== */}

      {selectedDay && (
        <DayPostsModal
          date={selectedDay.date}
          posts={selectedDay.posts}
          onClose={() =>
            setSelectedDay(null)
          }
          onSelectPost={openPost}
        />
      )}

      {/* =====================================================
          POST DETAILS POPUP
      ====================================================== */}

      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() =>
            setSelectedPost(null)
          }
          onOpenPost={openPost}
        />
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-stone-200/70
        bg-white/[0.72]
        p-3
        shadow-[0_10px_35px_rgba(15,23,42,0.035)]
        backdrop-blur-xl
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_14px_40px_rgba(15,23,42,0.06)]

        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:shadow-[0_15px_45px_rgba(0,0,0,0.16)]
        dark:hover:border-white/[0.12]
        dark:hover:bg-white/[0.04]

        sm:p-4
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-16
          w-16
          rounded-full
          bg-orange-400/[0.05]
          blur-2xl
          dark:bg-orange-500/[0.025]
        "
      />

      <div className="relative flex items-center justify-between gap-3">
        <div
          className="
            grid
            h-8
            w-8
            place-items-center
            rounded-xl
            border
            border-stone-200/80
            bg-stone-50
            text-stone-500

            dark:border-white/[0.07]
            dark:bg-white/[0.04]
            dark:text-slate-400
          "
        >
          {icon}
        </div>

        <span
          className="
            text-xl
            font-black
            tracking-tight
            text-stone-900
            dark:text-white
          "
        >
          {value}
        </span>
      </div>

      <p
        className="
          relative
          mt-3
          text-[9px]
          font-black
          uppercase
          tracking-[0.14em]
          text-stone-400
          dark:text-slate-500
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   MONTH VIEW
========================================================= */

function MonthView({
  calendarDays,
  calendarPosts,
  month,
  year,
  today,
  onOpenDay,
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* DAYS */}

        <div
          className="
            grid
            grid-cols-7
            border-b
            border-stone-200/70
            bg-stone-50/70

            dark:border-white/[0.07]
            dark:bg-white/[0.02]
          "
        >
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="
                px-1
                py-3
                text-center
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-stone-400
                dark:text-slate-500
              "
            >
              <span className="hidden sm:inline">
                {day.slice(0, 3)}
              </span>

              <span className="sm:hidden">
                {day.charAt(0)}
              </span>
            </div>
          ))}
        </div>

        {/* CELLS */}

        <div className="grid grid-cols-7">
          {calendarDays.map(
            (day, index) => {
              const date = day
                ? new Date(
                    year,
                    month,
                    day,
                  )
                : null;

              const postsForDay =
                date
                  ? calendarPosts.filter(
                      (post) =>
                        isSameDay(
                          post.date,
                          date,
                        ),
                    )
                  : [];

              const festivals = date
                ? getIndiaFestivals(
                    date,
                  )
                : [];

              const isToday =
                date &&
                isSameDay(
                  date,
                  today,
                );

              const isWeekend =
                date &&
                (date.getDay() === 0 ||
                  date.getDay() === 6);

              return (
                <button
                  key={`day-${index}`}
                  type="button"
                  disabled={!date}
                  onClick={() =>
                    date &&
                    onOpenDay(date)
                  }
                  className={`
                    group
                    relative
                    min-h-[140px]
                    min-w-0
                    border-b
                    border-r
                    border-stone-200/60
                    p-1.5
                    text-left
                    transition-all

                    dark:border-white/[0.055]

                    sm:min-h-[155px]
                    sm:p-2.5

                    lg:min-h-[170px]

                    ${
                      !date
                        ? `
                          cursor-default
                          bg-stone-50/30
                          dark:bg-white/[0.008]
                        `
                        : `
                          cursor-pointer
                          hover:bg-orange-50/25
                          dark:hover:bg-orange-400/[0.025]
                        `
                    }

                    ${
                      isWeekend
                        ? `
                          bg-stone-50/30
                          dark:bg-white/[0.012]
                        `
                        : `
                          bg-white/20
                          dark:bg-transparent
                        `
                    }
                  `}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`
                            grid
                            h-7
                            w-7
                            shrink-0
                            place-items-center
                            rounded-full
                            text-[11px]
                            font-bold
                            transition-transform
                            group-hover:scale-105

                            ${
                              isToday
                                ? `
                                  bg-orange-500
                                  text-white
                                  shadow-[0_0_18px_rgba(249,115,22,0.25)]
                                `
                                : `
                                  text-stone-600
                                  group-hover:bg-white

                                  dark:text-slate-400
                                  dark:group-hover:bg-white/[0.07]
                                `
                            }
                          `}
                        >
                          {day}
                        </span>

                        <div className="flex items-center gap-1">
                          {postsForDay.length >
                            0 && (
                            <span
                              className="
                                rounded-full
                                border
                                border-stone-200
                                bg-stone-100
                                px-1.5
                                py-0.5
                                text-[8px]
                                font-black
                                text-stone-400

                                dark:border-white/[0.06]
                                dark:bg-white/[0.04]
                                dark:text-slate-500
                              "
                            >
                              {
                                postsForDay.length
                              }
                            </span>
                          )}

                          {isToday && (
                            <span
                              className="
                                hidden
                                text-[8px]
                                font-black
                                uppercase
                                tracking-[0.1em]
                                text-orange-600
                                dark:text-orange-400
                                lg:block
                              "
                            >
                              Today
                            </span>
                          )}
                        </div>
                      </div>

                      {postsForDay.length >
                        0 && (
                        <div
                          className="
                            mt-5
                            rounded-xl
                            border
                            border-dashed
                            border-orange-200/80
                            bg-orange-50/45
                            px-2
                            py-3
                            text-center

                            dark:border-orange-400/10
                            dark:bg-orange-400/[0.035]
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              font-black
                              uppercase
                              tracking-[0.1em]
                              text-orange-600
                              dark:text-orange-400
                            "
                          >
                            {postsForDay.length ===
                            1
                              ? "1 post"
                              : `${postsForDay.length} posts`}
                          </p>

                          <p
                            className="
                              mt-1
                              text-[8px]
                              font-semibold
                              text-stone-400
                              dark:text-slate-500
                            "
                          >
                            Click to view
                          </p>
                        </div>
                      )}

                      {festivals.length >
                        0 && (
                        <div
                          className="
                            mt-2
                            rounded-xl
                            border
                            border-amber-200/80
                            bg-amber-50/80
                            px-2
                            py-2

                            dark:border-amber-400/10
                            dark:bg-amber-400/[0.045]
                          "
                        >
                          <p
                            className="
                              text-[8px]
                              font-black
                              uppercase
                              tracking-[0.08em]
                              text-amber-700
                              dark:text-amber-400
                            "
                          >
                            India
                          </p>

                          <p
                            className="
                              mt-0.5
                              line-clamp-2
                              text-[9px]
                              font-bold
                              leading-4
                              text-amber-800
                              dark:text-amber-300
                            "
                          >
                            {festivals.join(
                              " · ",
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI CALENDAR POST
========================================================= */

function MiniCalendarPost({
  post,
}) {
  const statusStyle =
    STATUS_STYLES[
      post.status
    ] ||
    STATUS_STYLES.draft;

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-lg
        border
        border-stone-200/70
        bg-white/90
        px-2
        py-1.5
        shadow-[0_3px_10px_rgba(0,0,0,0.025)]

        dark:border-white/[0.07]
        dark:bg-white/[0.035]
        dark:shadow-[0_4px_14px_rgba(0,0,0,0.14)]
      "
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={`
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            ${statusStyle.dot}
          `}
        />

        {post.mediaType ===
        "video" ? (
          <Video
            size={10}
            className="shrink-0 text-stone-400 dark:text-slate-500"
          />
        ) : post.mediaType ===
          "image" ? (
          <ImageIcon
            size={10}
            className="shrink-0 text-stone-400 dark:text-slate-500"
          />
        ) : (
          <FileText
            size={10}
            className="shrink-0 text-stone-400 dark:text-slate-500"
          />
        )}

        <span
          className="
            min-w-0
            truncate
            text-[9px]
            font-bold
            text-stone-600
            dark:text-slate-400
          "
        >
          {post.title}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   WEEK VIEW
========================================================= */

function WeekView({
  weekDays,
  calendarPosts,
  today,
  onOpenDay,
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div
          className="
            grid
            grid-cols-7
            border-b
            border-stone-200/70
            bg-stone-50/70

            dark:border-white/[0.07]
            dark:bg-white/[0.02]
          "
        >
          {weekDays.map(
            (date) => {
              const isToday =
                isSameDay(
                  date,
                  today,
                );

              const count =
                calendarPosts.filter(
                  (post) =>
                    isSameDay(
                      post.date,
                      date,
                    ),
                ).length;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() =>
                    onOpenDay(date)
                  }
                  className="
                    border-r
                    border-stone-200/60
                    px-3
                    py-4
                    text-center
                    transition-colors
                    hover:bg-orange-50/40
                    last:border-r-0

                    dark:border-white/[0.055]
                    dark:hover:bg-orange-400/[0.025]
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-stone-400
                      dark:text-slate-500
                    "
                  >
                    {date.toLocaleDateString(
                      "en-US",
                      {
                        weekday:
                          "short",
                      },
                    )}
                  </p>

                  <div
                    className={`
                      mx-auto
                      mt-2
                      grid
                      h-9
                      w-9
                      place-items-center
                      rounded-full
                      text-sm
                      font-black

                      ${
                        isToday
                          ? `
                            bg-orange-500
                            text-white
                            shadow-[0_0_18px_rgba(249,115,22,0.22)]
                          `
                          : `
                            text-stone-700
                            dark:text-slate-300
                          `
                      }
                    `}
                  >
                    {date.getDate()}
                  </div>

                  {count > 0 && (
                    <p
                      className="
                        mt-2
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.1em]
                        text-stone-400
                        dark:text-slate-500
                      "
                    >
                      {count} post
                      {count === 1
                        ? ""
                        : "s"}
                    </p>
                  )}
                </button>
              );
            },
          )}
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map(
            (date) => {
              const dayPosts =
                calendarPosts
                  .filter(
                    (post) =>
                      isSameDay(
                        post.date,
                        date,
                      ),
                  )
                  .sort(
                    (a, b) =>
                      a.date.getTime() -
                      b.date.getTime(),
                  );

              return (
                <div
                  key={date.toISOString()}
                  className="
                    min-h-[460px]
                    border-r
                    border-stone-200/60
                    p-2
                    last:border-r-0

                    dark:border-white/[0.055]
                  "
                >
                  {dayPosts.length >
                  0 ? (
                    <div className="space-y-2">
                      {dayPosts.map(
                        (post) => (
                          <CalendarPost
                            key={
                              post.key
                            }
                            post={
                              post
                            }
                            detailed
                            onClick={() =>
                              onOpenDay(
                                date,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenDay(
                          date,
                        )
                      }
                      className="
                        flex
                        h-full
                        min-h-[420px]
                        w-full
                        items-center
                        justify-center
                        text-[10px]
                        font-medium
                        text-stone-300
                        transition-colors
                        hover:text-orange-400
                        dark:text-slate-700
                        dark:hover:text-orange-400
                      "
                    >
                      No posts
                    </button>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DAY VIEW
========================================================= */

function DayView({
  date,
  posts,
  onSelectPost,
}) {
  const dateLabel =
    date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );

  return (
    <div className="p-4 sm:p-6">
      <div
        className="
          mb-5
          relative
          overflow-hidden
          rounded-2xl
          border
          border-orange-200/70
          bg-gradient-to-br
          from-orange-50
          to-white
          px-4
          py-4

          dark:border-orange-400/10
          dark:from-orange-400/[0.06]
          dark:to-white/[0.015]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-20
            w-20
            rounded-full
            bg-orange-400/10
            blur-2xl
            dark:bg-orange-500/[0.04]
          "
        />

        <p
          className="
            relative
            text-[10px]
            font-black
            uppercase
            tracking-[0.14em]
            text-orange-600
            dark:text-orange-400
          "
        >
          Selected day
        </p>

        <p
          className="
            relative
            mt-1
            text-sm
            font-bold
            text-stone-800
            dark:text-slate-200
          "
        >
          {dateLabel}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <CalendarPost
              key={post.key}
              post={post}
              detailed
              onClick={() =>
                onSelectPost(post)
              }
            />
          ))}
        </div>
      ) : (
        <div
          className="
            flex
            min-h-[340px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-stone-200
            bg-stone-50/50

            dark:border-white/[0.08]
            dark:bg-white/[0.015]
          "
        >
          <CalendarDays
            size={24}
            className="text-stone-300 dark:text-slate-700"
          />

          <h3
            className="
              mt-4
              text-sm
              font-black
              text-stone-700
              dark:text-slate-300
            "
          >
            Nothing scheduled
          </h3>

          <p
            className="
              mt-1.5
              text-xs
              text-stone-400
              dark:text-slate-500
            "
          >
            There are no posts for
            this day.
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CALENDAR POST
========================================================= */

function CalendarPost({
  post,
  detailed = false,
  onClick,
}) {
  const statusStyle =
    STATUS_STYLES[
      post.status
    ] ||
    STATUS_STYLES.draft;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        block
        w-full
        overflow-hidden
        rounded-xl
        border
        border-stone-200/80
        bg-white
        text-left
        shadow-[0_4px_15px_rgba(0,0,0,0.025)]
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-orange-200
        hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]

        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:shadow-[0_6px_18px_rgba(0,0,0,0.16)]

        dark:hover:border-orange-400/15
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.22)]

        ${
          detailed
            ? "p-3.5 sm:p-4"
            : "p-2.5"
        }
      `}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="
            mt-0.5
            grid
            h-7
            w-7
            shrink-0
            place-items-center
            rounded-lg
            border
            border-stone-200/80
            bg-stone-50
            text-orange-600

            dark:border-white/[0.07]
            dark:bg-white/[0.035]
            dark:text-orange-400
          "
        >
          {post.mediaType ===
          "video" ? (
            <Video size={12} />
          ) : post.mediaType ===
            "image" ? (
            <ImageIcon size={12} />
          ) : (
            <FileText size={12} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className="
                min-w-0
                truncate
                text-xs
                font-black
                text-stone-800
                dark:text-slate-200
              "
            >
              {post.title}
            </p>

            <span
              className={`
                mt-1
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                ${statusStyle.dot}
              `}
            />
          </div>

          <p
            className="
              mt-1
              truncate
              text-[9px]
              font-semibold
              text-stone-400
              dark:text-slate-500
            "
          >
            {post.platformLabel}
          </p>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div
              className="
                flex
                items-center
                gap-1
                text-[9px]
                font-semibold
                text-stone-500
                dark:text-slate-500
              "
            >
              <Clock3 size={9} />

              {formatTime(
                post.date,
              )}
            </div>

            {detailed && (
              <span
                className={`
                  rounded-full
                  border
                  px-1.5
                  py-0.5
                  text-[7px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  ${statusStyle.badge}
                `}
              >
                {post.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   DAY POSTS MODAL
========================================================= */

function DayPostsModal({
  date,
  posts,
  onClose,
  onSelectPost,
}) {
  const festivals =
    getIndiaFestivals(date);

  const dateLabel =
    date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[60]
        flex
        items-center
        justify-center
        bg-stone-950/50
        p-3
        backdrop-blur-sm
        dark:bg-black/70
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
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-white/80
          bg-white
          shadow-[0_30px_100px_rgba(0,0,0,0.20)]

          dark:border-white/[0.08]
          dark:bg-[#0d1422]
          dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
        "
      >
        {/* HEADER */}

        <div
          className="
            border-b
            border-stone-200/70
            px-5
            py-4
            dark:border-white/[0.07]
            sm:px-6
            sm:py-5
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-orange-600
                  dark:text-orange-400
                "
              >
                Scheduled content
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-black
                  tracking-tight
                  text-stone-900
                  dark:text-white
                  sm:text-xl
                "
              >
                {dateLabel}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-stone-500
                  dark:text-slate-500
                "
              >
                {posts.length} post
                {posts.length === 1
                  ? ""
                  : "s"} on this day
              </p>

              {festivals.length >
                0 && (
                <div
                  className="
                    mt-3
                    rounded-xl
                    border
                    border-amber-200
                    bg-amber-50
                    px-3
                    py-2

                    dark:border-amber-400/10
                    dark:bg-amber-400/[0.05]
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-amber-700
                      dark:text-amber-400
                    "
                  >
                    India today
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-bold
                      text-amber-900
                      dark:text-amber-300
                    "
                  >
                    {festivals.join(
                      " · ",
                    )}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-xl
                border
                border-stone-200
                text-stone-500
                transition-colors
                hover:bg-stone-50
                hover:text-stone-900

                dark:border-white/[0.08]
                dark:text-slate-500
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* LIST */}

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {posts.length > 0 ? (
            <div className="space-y-2.5">
              {posts.map(
                (post, index) => (
                  <button
                    key={post.key}
                    type="button"
                    onClick={() =>
                      onSelectPost(
                        post,
                      )
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-stone-200
                      bg-white
                      p-3
                      text-left
                      transition-all

                      hover:-translate-y-0.5
                      hover:border-orange-200
                      hover:bg-orange-50/30
                      hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]

                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]

                      dark:hover:border-orange-400/15
                      dark:hover:bg-orange-400/[0.035]
                      dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.20)]

                      sm:p-4
                    "
                  >
                    {/* NUMBER */}

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
                        bg-stone-100
                        text-[10px]
                        font-black
                        text-stone-500

                        group-hover:border-orange-200
                        group-hover:bg-orange-100
                        group-hover:text-orange-600

                        dark:border-white/[0.07]
                        dark:bg-white/[0.04]
                        dark:text-slate-500

                        dark:group-hover:border-orange-400/10
                        dark:group-hover:bg-orange-400/[0.08]
                        dark:group-hover:text-orange-400
                      "
                    >
                      {String(
                        index + 1,
                      ).padStart(2, "0")}
                    </div>

                    {/* MEDIA */}

                    <div
                      className="
                        grid
                        h-11
                        w-11
                        shrink-0
                        place-items-center
                        rounded-xl
                        border
                        border-stone-200
                        bg-stone-50
                        text-orange-500

                        dark:border-white/[0.07]
                        dark:bg-white/[0.035]
                        dark:text-orange-400
                      "
                    >
                      {post.mediaType ===
                      "video" ? (
                        <Video size={17} />
                      ) : post.mediaType ===
                        "image" ? (
                        <ImageIcon
                          size={17}
                        />
                      ) : (
                        <FileText
                          size={17}
                        />
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          truncate
                          text-sm
                          font-black
                          text-stone-800
                          dark:text-slate-200
                        "
                      >
                        {post.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className="
                            text-[10px]
                            font-semibold
                            text-stone-400
                            dark:text-slate-500
                          "
                        >
                          {
                            post.platformLabel
                          }
                        </span>

                        <span className="text-stone-300 dark:text-slate-700">
                          •
                        </span>

                        <span
                          className="
                            flex
                            items-center
                            gap-1
                            text-[10px]
                            font-semibold
                            text-stone-500
                            dark:text-slate-500
                          "
                        >
                          <Clock3
                            size={10}
                          />

                          {formatTime(
                            post.date,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* STATUS */}

                    <span
                      className={`
                        hidden
                        rounded-full
                        border
                        px-2
                        py-1
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.08em]
                        sm:inline-flex

                        ${
                          (
                            STATUS_STYLES[
                              post
                                .status
                            ] ||
                            STATUS_STYLES
                              .draft
                          ).badge
                        }
                      `}
                    >
                      {post.status}
                    </span>

                    <ChevronRight
                      size={15}
                      className="
                        shrink-0
                        text-stone-300
                        transition-all
                        group-hover:translate-x-0.5
                        group-hover:text-orange-500

                        dark:text-slate-700
                        dark:group-hover:text-orange-400
                      "
                    />
                  </button>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                flex
                min-h-[280px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-stone-200
                bg-stone-50/50
                text-center

                dark:border-white/[0.08]
                dark:bg-white/[0.015]
              "
            >
              <CalendarDays
                size={25}
                className="text-stone-300 dark:text-slate-700"
              />

              <h3
                className="
                  mt-4
                  text-sm
                  font-black
                  text-stone-700
                  dark:text-slate-300
                "
              >
                No posts
              </h3>

              <p
                className="
                  mt-1
                  max-w-xs
                  text-xs
                  leading-5
                  text-stone-400
                  dark:text-slate-500
                "
              >
                Nothing is scheduled
                or recorded for this
                day.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div
          className="
            border-t
            border-stone-200/70
            bg-stone-50/70
            px-5
            py-3
            text-right

            dark:border-white/[0.07]
            dark:bg-white/[0.02]

            sm:px-6
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              h-9
              rounded-xl
              border
              border-stone-200
              bg-white
              px-4
              text-xs
              font-bold
              text-stone-600
              transition-colors
              hover:bg-stone-50

              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:text-slate-400
              dark:hover:bg-white/[0.06]
              dark:hover:text-white
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   POST DETAILS MODAL
========================================================= */

function PostDetailsModal({
  post,
  onClose,
  onOpenPost,
}) {
  const normalized =
    normalizePost(post);

  const statusStyle =
    STATUS_STYLES[
      normalized.status
    ] ||
    STATUS_STYLES.draft;

  return (
    <div
      className="
        fixed
        inset-0
        z-[70]
        grid
        place-items-center
        bg-stone-950/50
        p-3
        backdrop-blur-sm
        dark:bg-black/70
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
      <div
        className="
          w-full
          max-w-xl
          overflow-hidden
          rounded-[28px]
          border
          border-white/80
          bg-white
          shadow-2xl

          dark:border-white/[0.08]
          dark:bg-[#0d1422]
          dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
        "
      >
        <div
          className="
            border-b
            border-stone-200/70
            px-5
            py-4

            dark:border-white/[0.07]

            sm:px-6
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-orange-600
                  dark:text-orange-400
                "
              >
                Post details
              </p>

              <h2
                className="
                  mt-1
                  break-words
                  text-lg
                  font-black
                  text-stone-900
                  dark:text-white
                "
              >
                {normalized.title}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    ${statusStyle.badge}
                  `}
                >
                  {normalized.status}
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-stone-200
                    bg-stone-50
                    px-2.5
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-stone-500

                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                    dark:text-slate-500
                  "
                >
                  {normalized.mediaLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-xl
                border
                border-stone-200
                text-stone-500
                transition-colors
                hover:bg-stone-50

                dark:border-white/[0.08]
                dark:text-slate-500
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Scheduled time"
              value={
                normalized.date
                  ? normalized.date.toLocaleString(
                      "en-US",
                      {
                        dateStyle:
                          "medium",
                        timeStyle:
                          "short",
                      },
                    )
                  : "—"
              }
            />

            <DetailItem
              label="Platforms"
              value={
                normalized.platformLabel
              }
            />

            <DetailItem
              label="Media"
              value={
                normalized.mediaLabel
              }
            />

            <DetailItem
              label="Visibility"
              value={
                normalized.visibility ||
                "—"
              }
            />
          </div>

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-stone-200
              bg-stone-50/70
              p-4

              dark:border-white/[0.08]
              dark:bg-white/[0.025]
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-stone-400
                dark:text-slate-500
              "
            >
              Caption
            </p>

            <p
              className="
                mt-2
                whitespace-pre-wrap
                text-sm
                leading-6
                text-stone-700
                dark:text-slate-300
              "
            >
              {normalized.caption ||
                "No caption added."}
            </p>
          </div>

          {normalized.hashtags && (
            <div
              className="
                mt-4
                rounded-2xl
                border
                border-stone-200
                bg-white
                p-4

                dark:border-white/[0.08]
                dark:bg-white/[0.025]
              "
            >
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-stone-400
                  dark:text-slate-500
                "
              >
                Hashtags
              </p>

              <p
                className="
                  mt-2
                  whitespace-pre-wrap
                  text-xs
                  leading-5
                  text-stone-600
                  dark:text-slate-400
                "
              >
                {normalized.hashtags}
              </p>
            </div>
          )}
        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-stone-200/70
            bg-stone-50/70
            px-5
            py-4

            dark:border-white/[0.07]
            dark:bg-white/[0.02]

            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              h-10
              rounded-xl
              border
              border-stone-200
              bg-white
              px-4
              text-xs
              font-bold
              text-stone-600
              transition-colors
              hover:bg-stone-50

              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:text-slate-400
              dark:hover:bg-white/[0.06]
              dark:hover:text-white
            "
          >
            Close
          </button>

          {normalized.id && (
            <button
              type="button"
              onClick={() =>
                onOpenPost(
                  normalized.raw,
                )
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
              Open post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function DetailItem({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-stone-200
        bg-white
        p-3

        dark:border-white/[0.08]
        dark:bg-white/[0.025]
      "
    >
      <p
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.12em]
          text-stone-400
          dark:text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          text-sm
          font-bold
          text-stone-800
          dark:text-slate-300
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   NORMALIZE
========================================================= */

function normalizePost(post) {
  const rawDate =
    resolvePostDate(post);

  const date =
    parseDate(rawDate);

  const status = String(
    post?.status || "draft",
  ).toLowerCase();

  const mediaType =
    getMediaType(post);

  return {
    raw: post,

    id:
      post?.id ??
      post?._id ??
      "",

    key:
      post?.id ??
      post?._id ??
      `${post?.title || "post"}-${rawDate || "date"}`,

    title:
      post?.title ||
      post?.caption ||
      "Untitled post",

    caption:
      post?.caption || "",

    hashtags:
      post?.hashtags || "",

    status,

    date,

    createdAt:
      parseDate(
        post?.createdAt ||
          post?.created_at,
      ),

    visibility:
      post?.visibility || "",

    mediaType,

    mediaLabel:
      mediaType === "video"
        ? "Video"
        : mediaType === "image"
          ? "Image"
          : post?.hasMedia
            ? "Media"
            : "Text",

    platformLabel:
      getPlatformLabel(post),
  };
}

function getIndiaFestivals(date) {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    return [];
  }

  const year =
    date.getFullYear();

  const monthDay = `${String(
    date.getMonth() + 1,
  ).padStart(
    2,
    "0",
  )}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

  return (
    INDIA_FESTIVALS[year]?.[
      monthDay
    ] || []
  );
}

/* =========================================================
   DATE
========================================================= */

function resolvePostDate(post) {
  const status = String(
    post?.status || "",
  ).toLowerCase();

  const candidates = [
    status === "scheduled"
      ? post?.scheduledAt ||
        post?.scheduled_at
      : null,

    post?.scheduledFor,
    post?.scheduledAt,
    post?.scheduled_at,

    post?.publishedAt,
    post?.published_at,

    post?.date,

    post?.createdAt,
    post?.created_at,
  ];

  for (const value of candidates) {
    const parsed =
      parseDate(value);

    if (parsed) return parsed;
  }

  return null;
}

function parseDate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(
          value.getTime(),
        )
      : new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function isSameDay(
  dateA,
  dateB,
) {
  if (!dateA || !dateB) {
    return false;
  }

  return (
    dateA.getFullYear() ===
      dateB.getFullYear() &&
    dateA.getMonth() ===
      dateB.getMonth() &&
    dateA.getDate() ===
      dateB.getDate()
  );
}

function formatTime(date) {
  if (!date) {
    return "Scheduled";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

/* =========================================================
   MEDIA
========================================================= */

function getMediaType(post) {
  const mimeType =
    String(
      post?.media?.mimeType ||
        post?.media?.type ||
        post?.mimeType ||
        "",
    ).toLowerCase();

  if (
    mimeType.startsWith(
      "video/",
    )
  ) {
    return "video";
  }

  if (
    mimeType.startsWith(
      "image/",
    )
  ) {
    return "image";
  }

  const type = String(
    post?.mediaType ||
      post?.type ||
      "",
  ).toLowerCase();

  if (
    type.includes("video")
  ) {
    return "video";
  }

  if (
    type.includes("image") ||
    type.includes("photo")
  ) {
    return "image";
  }

  return "text";
}

/* =========================================================
   PLATFORM
========================================================= */

function getPlatformLabel(post) {
  const value =
    post?.platform ||
    post?.platformName ||
    post?.platforms ||
    post?.socialPlatform;

  if (Array.isArray(value)) {
    const names = value
      .map((item) => {
        if (
          typeof item ===
          "string"
        ) {
          return item;
        }

        return (
          item?.name ||
          item?.platform ||
          item?.type ||
          ""
        );
      })
      .filter(Boolean);

    return names.length
      ? names.join(" • ")
      : "Social";
  }

  if (
    typeof value ===
      "object" &&
    value !== null
  ) {
    return (
      value.name ||
      value.platform ||
      "Social"
    );
  }

  return value
    ? String(value)
    : "Social";
}