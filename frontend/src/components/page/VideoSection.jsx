import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
} from "lucide-react";

function VideoSection() {
  const sliderRef = useRef(null);

  const [videos, setVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  =========================
  API URL
  =========================
  */

  const API_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "";

  /*
  =========================
  GET INSTAGRAM VIDEOS
  =========================
  */

 useEffect(() => {
  const fetchInstagramVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/social-app/posts/instagram/videos`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error("API returned non-JSON:", text);

        throw new Error(
          `API JSON nahi de rahi. Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load Instagram videos."
        );
      }

      const backendVideos = Array.isArray(data.posts)
        ? data.posts
        : [];

      const formattedVideos = backendVideos.map((post) => ({
        id: post._id,
        title:
          post.title ||
          post.caption ||
          "Instagram Video",
        category: "Instagram",
        src: `${API_URL}/api/posts/${post._id}/media`,
        postId: post._id,
        createdAt: post.createdAt,
      }));

      setVideos(formattedVideos);
      setActiveIndex(0);
    } catch (error) {
      console.error(
        "Instagram videos fetch error:",
        error
      );

      setError(
        error.message || "Unable to load videos."
      );

      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  fetchInstagramVideos();
}, [API_URL]);
  /*
  =========================
  SCROLL TO INDEX
  =========================
  */

  const scrollToIndex = (index) => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const cards = slider.children;

    if (!cards[index]) return;

    const card = cards[index];

    slider.scrollTo({
      left: card.offsetLeft - 16,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  /*
  =========================
  NEXT
  =========================
  */

  const handleNext = () => {
    if (!videos.length) return;

    const nextIndex =
      activeIndex >= videos.length - 1
        ? 0
        : activeIndex + 1;

    scrollToIndex(nextIndex);
  };

  /*
  =========================
  PREVIOUS
  =========================
  */

  const handlePrevious = () => {
    if (!videos.length) return;

    const previousIndex =
      activeIndex <= 0
        ? videos.length - 1
        : activeIndex - 1;

    scrollToIndex(previousIndex);
  };

  /*
  =========================
  DETECT ACTIVE CARD
  =========================
  */

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const handleScroll = () => {
      const cards = Array.from(slider.children);

      if (!cards.length) return;

      let closestIndex = 0;
      let smallestDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs(
          card.offsetLeft -
            slider.scrollLeft -
            16
        );

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    slider.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      slider.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [videos]);

  /*
  =========================
  AUTO SCROLL
  =========================
  */

  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, videos.length]);

  /*
  =========================
  LOADING
  =========================
  */

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#2E9E6D]/10 blur-3xl" />

          <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#0C2C50]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="!text-5xl font-bold tracking-tight text-[#0C2C50] sm:text-4xl lg:text-5xl">
            Explore Our{" "}
            <span className="text-[#2E9E6D]">
              Latest Work
            </span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Discover our latest projects, creative work and
            digital experiences through our featured videos.
          </p>

          <div className="mt-10 flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  min-w-full
                  animate-pulse
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-200
                  bg-slate-100
                  sm:min-w-[calc(50%-8px)]
                  lg:min-w-[calc(25%-12px)]
                "
              >
                <div className="aspect-[16/10] bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-12 rounded bg-slate-200" />
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /*
  =========================
  NO VIDEOS
  =========================
  */

  if (!videos.length) {
    return (
      <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#2E9E6D]/10 blur-3xl" />

          <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#0C2C50]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-10">
          <h2 className="!text-5xl font-bold tracking-tight text-[#0C2C50] sm:text-4xl lg:text-5xl">
            Explore Our{" "}
            <span className="text-[#2E9E6D]">
              Latest Work
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            {error ||
              "No Instagram videos are available right now."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* =========================
          BACKGROUND
      ========================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#2E9E6D]/10 blur-3xl" />

        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#0C2C50]/10 blur-3xl" />
      </div>

      {/* =========================
          HEADER
      ========================== */}

      <div className="relative mx-auto mb-10 max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="!text-5xl font-bold tracking-tight text-[#0C2C50] sm:text-4xl lg:text-5xl">
              Explore Our{" "}
              <span className="text-[#2E9E6D]">
                Latest Work
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Discover our latest projects, creative work and
              digital experiences through our featured videos.
            </p>
          </div>

          {/* =========================
              DESKTOP CONTROLS
          ========================== */}

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={handlePrevious}
              className="
                group
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-[#0C2C50]
                shadow-sm
                transition-all
                duration-300
                hover:-translate-x-1
                hover:border-[#2E9E6D]
                hover:bg-[#2E9E6D]
                hover:text-white
                hover:shadow-lg
                hover:shadow-[#2E9E6D]/20
                active:scale-90
              "
              aria-label="Previous videos"
            >
              <ChevronLeft
                size={22}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="
                group
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-[#2E9E6D]
                bg-[#2E9E6D]
                text-white
                shadow-lg
                shadow-[#2E9E6D]/20
                transition-all
                duration-300
                hover:translate-x-1
                hover:bg-[#247e57]
                hover:shadow-xl
                active:scale-90
              "
              aria-label="Next videos"
            >
              <ChevronRight
                size={22}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          VIDEO SCROLLER
      ========================== */}

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-10">
        {/* MOBILE LEFT BUTTON */}

        <button
          type="button"
          onClick={handlePrevious}
          className="
            absolute
            left-2
            top-1/2
            z-30
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-[#0C2C50]/85
            text-white
            shadow-xl
            backdrop-blur-md
            transition-all
            duration-300
            hover:bg-[#2E9E6D]
            active:scale-90
            sm:hidden
          "
          aria-label="Previous video"
        >
          <ChevronLeft size={20} />
        </button>

        {/* MOBILE RIGHT BUTTON */}

        <button
          type="button"
          onClick={handleNext}
          className="
            absolute
            right-2
            top-1/2
            z-30
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-[#0C2C50]/85
            text-white
            shadow-xl
            backdrop-blur-md
            transition-all
            duration-300
            hover:bg-[#2E9E6D]
            active:scale-90
            sm:hidden
          "
          aria-label="Next video"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={sliderRef}
          className="
            flex
            gap-4
            overflow-x-auto
            scroll-smooth
            snap-x
            snap-mandatory
            pb-4
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {videos.map((video, index) => (
            <article
              key={video.id}
              className="
                group
                relative
                min-w-[calc(100%-0px)]
                snap-start
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-1
                hover:shadow-2xl
                sm:min-w-[calc(50%-8px)]
                lg:min-w-[calc(25%-12px)]
              "
            >
              {/* VIDEO */}

              <div className="relative aspect-[16/10] overflow-hidden bg-[#0C2C50]">
                <video
                  src={video.src}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />

                {/* Gradient */}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C2C50]/80 via-transparent to-transparent opacity-70" />

                {/* Play Icon */}

                <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                  <Play
                    size={22}
                    fill="currentColor"
                    className="ml-1"
                  />
                </div>

                {/* Category */}

                <div className="absolute left-4 top-4">
                  <span className="rounded-full border border-white/20 bg-[#0C2C50]/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {video.category}
                  </span>
                </div>

                {/* Sound Icon */}

                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md">
                  <Volume2 size={14} />
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2E9E6D]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="ml-3 h-px flex-1 bg-slate-100" />
                </div>

                <h3 className="line-clamp-1 text-lg font-bold text-[#0C2C50] transition-colors duration-300 group-hover:text-[#2E9E6D]">
                  {video.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Watch our latest creative work and digital experience.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* =========================
          DOT INDICATOR
      ========================== */}

      <div className="relative mt-6 flex justify-center gap-2">
        {videos.map((video, index) => (
          <button
            key={video.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={`
              h-1.5
              rounded-full
              transition-all
              duration-300
              ${
                activeIndex === index
                  ? "w-8 bg-[#2E9E6D]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }
            `}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default VideoSection;