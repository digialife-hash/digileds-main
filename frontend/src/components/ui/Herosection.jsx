import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE = import.meta.env.VITE_SITE_API_URL || "";

const ADS_API = `${API_BASE}/api/ads/active`;


/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80";


/* =========================================================
   CONSTANTS
========================================================= */

const AUTO_PLAY_TIME = 5500;

const TRANSITION_TIME = 700;


/* =========================================================
   NORMALIZE BACKEND ADS
   ---------------------------------------------------------
   MongoDB document:

   {
     _id,
     heading,
     description,
     image,
     mobileImage,
     productId,
     productSlug,
     productPath,
     label,
     position,
     active,
     sortOrder,
     products
   }

========================================================= */

const normalizeAds = (response) => {
  /*
    Backend response:

    {
      success: true,
      count: 1,
      data: [...]
    }
  */

  const rawAds =
    response?.data ||
    response?.ads ||
    response?.advertisements ||
    response;

  if (!Array.isArray(rawAds)) {
    return [];
  }

  return rawAds
    .filter(Boolean)
    .map((ad, index) => {
      /*
        MongoDB ka actual _id
      */

      const adId =
        ad?._id ||
        ad?.id ||
        ad?.adId ||
        `ad-${index + 1}`;


      /*
        IMPORTANT:

        ProductAds page ko exact MongoDB ad chahiye.

        Isliye:
        /product_ads/:_id

        use karenge.
      */

      const productAdsPath =
        `/product_ads/${adId}`;


      return {
        /*
          Main ID
        */

        id: adId,


        /*
          Images
        */

        image:
          ad?.image ||
          ad?.banner ||
          ad?.bannerImage ||
          ad?.imageUrl ||
          ad?.thumbnail ||
          "",

        mobileImage:
          ad?.mobileImage ||
          ad?.mobileBanner ||
          ad?.mobileBannerImage ||
          ad?.image ||
          ad?.banner ||
          ad?.bannerImage ||
          ad?.imageUrl ||
          ad?.thumbnail ||
          "",


        /*
          Text
        */

        heading:
          ad?.heading ||
          ad?.title ||
          ad?.name ||
          "Advertisement",

        description:
          ad?.description ||
          ad?.discription ||
          ad?.subtitle ||
          ad?.shortDescription ||
          "",


        /*
          IMPORTANT:
          MongoDB _id based ProductAds URL
        */

        path: productAdsPath,


        /*
          Button
        */

        label:
          ad?.label ||
          ad?.buttonText ||
          ad?.ctaText ||
          "Explore More",


        /*
          Image positioning
        */

        position:
          ad?.position ||
          "center",


        /*
          Keep complete backend data.
          Isse products bhi available rahenge.
        */

        ...ad,

        /*
          id/path ko last me rakh rahe hain
          taaki backend ke wrong path se overwrite na ho.
        */

        id: adId,

        path: productAdsPath,
      };
    })
    .filter((ad) => ad.image);
};


/* =========================================================
   COMPONENT
========================================================= */

const HeroSection = () => {

  /* =======================================================
     STATE
  ======================================================= */

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [current, setCurrent] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);

  const [progress, setProgress] = useState(0);

  const [isPausedByHover, setIsPausedByHover] =
    useState(false);


  /* =======================================================
     REFS
  ======================================================= */

  const touchStartX = useRef(0);

  const touchEndX = useRef(0);

  const progressRef = useRef(null);

  const autoplayRef = useRef(null);


  /* =======================================================
     FETCH ADS
  ======================================================= */

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(ADS_API, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },
      });


      if (!response.ok) {
        throw new Error(
          `Ads API failed with status ${response.status}`
        );
      }


      const result = await response.json();


      if (result?.success === false) {
        throw new Error(
          result?.message ||
            "Advertisements load nahi ho paaye."
        );
      }


      const normalizedAds =
        normalizeAds(result);


      setData(normalizedAds);


      /*
        Current slide safe rakho.
      */

      setCurrent((prev) => {
        if (!normalizedAds.length) {
          return 0;
        }

        return prev >= normalizedAds.length
          ? 0
          : prev;
      });

    } catch (err) {

      console.error(
        "Hero Ads API Error:",
        err
      );

      setData([]);

      setError(
        err?.message ||
          "Advertisements load nahi ho paaye."
      );

    } finally {

      setLoading(false);
    }
  }, []);


  /* =======================================================
     LOAD ADS
  ======================================================= */

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);


  /* =======================================================
     NEXT SLIDE
  ======================================================= */

  const nextSlide = useCallback(() => {

    setCurrent((prev) => {

      if (!data.length) {
        return 0;
      }

      return (
        (prev + 1) %
        data.length
      );
    });

    setProgress(0);

  }, [data.length]);


  /* =======================================================
     PREVIOUS SLIDE
  ======================================================= */

  const prevSlide = useCallback(() => {

    setCurrent((prev) => {

      if (!data.length) {
        return 0;
      }

      return (
        (prev - 1 + data.length) %
        data.length
      );
    });

    setProgress(0);

  }, [data.length]);


  /* =======================================================
     GO TO SLIDE
  ======================================================= */

  const goToSlide = useCallback((index) => {

    setCurrent(index);

    setProgress(0);

  }, []);


  /* =======================================================
     AUTOPLAY
  ======================================================= */

  useEffect(() => {

    if (
      !isPlaying ||
      isPausedByHover ||
      data.length <= 1
    ) {
      return;
    }


    autoplayRef.current =
      setInterval(() => {

        nextSlide();

      }, AUTO_PLAY_TIME);


    return () => {

      clearInterval(
        autoplayRef.current
      );

    };

  }, [
    isPlaying,
    isPausedByHover,
    nextSlide,
    data.length,
  ]);


  /* =======================================================
     PROGRESS BAR
  ======================================================= */

  useEffect(() => {

    if (
      !isPlaying ||
      isPausedByHover ||
      data.length <= 1
    ) {
      setProgress(0);

      return;
    }


    const startTime =
      performance.now();


    const animate = (time) => {

      const elapsed =
        time - startTime;


      const percentage =
        Math.min(
          (elapsed / AUTO_PLAY_TIME) * 100,
          100
        );


      setProgress(percentage);


      if (percentage < 100) {

        progressRef.current =
          requestAnimationFrame(
            animate
          );
      }
    };


    progressRef.current =
      requestAnimationFrame(
        animate
      );


    return () => {

      if (progressRef.current) {

        cancelAnimationFrame(
          progressRef.current
        );
      }
    };

  }, [
    current,
    isPlaying,
    isPausedByHover,
    data.length,
  ]);


  /* =======================================================
     KEYBOARD
  ======================================================= */

  useEffect(() => {

    const handleKeyboard = (event) => {

      if (!data.length) {
        return;
      }


      if (
        event.key === "ArrowRight"
      ) {
        nextSlide();
      }


      if (
        event.key === "ArrowLeft"
      ) {
        prevSlide();
      }


      if (event.key === " ") {

        event.preventDefault();

        setIsPlaying(
          (prev) => !prev
        );
      }
    };


    window.addEventListener(
      "keydown",
      handleKeyboard
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };

  }, [
    nextSlide,
    prevSlide,
    data.length,
  ]);


  /* =======================================================
     TOUCH START
  ======================================================= */

  const handleTouchStart = (
    event
  ) => {

    touchStartX.current =
      event.touches[0].clientX;
  };


  /* =======================================================
     TOUCH MOVE
  ======================================================= */

  const handleTouchMove = (
    event
  ) => {

    touchEndX.current =
      event.touches[0].clientX;
  };


  /* =======================================================
     TOUCH END
  ======================================================= */

  const handleTouchEnd = () => {

    const distance =
      touchStartX.current -
      touchEndX.current;


    const minimumSwipeDistance = 50;


    if (
      Math.abs(distance) <
      minimumSwipeDistance
    ) {
      return;
    }


    if (distance > 0) {

      nextSlide();

    } else {

      prevSlide();
    }


    touchStartX.current = 0;

    touchEndX.current = 0;
  };


  /* =======================================================
     PLAY / PAUSE
  ======================================================= */

  const togglePlay = () => {

    setIsPlaying(
      (prev) => !prev
    );

    setProgress(0);
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <section
        className="
          relative
          flex
          h-[100svh]
          min-h-[620px]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-black
          text-white
        "
      >
        <div className="flex flex-col items-center gap-4">

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
            "
          >
            <Loader2
              size={26}
              className="
                animate-spin
                text-teal-400
              "
            />
          </div>


          <p
            className="
              text-sm
              font-medium
              text-white/60
            "
          >
            Loading advertisements...
          </p>

        </div>
      </section>
    );
  }


  /* =======================================================
     ERROR / EMPTY
  ======================================================= */

  if (!data.length) {

    return (
      <section
        className="
          relative
          flex
          h-[100svh]
          min-h-[620px]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-black
          text-white
        "
      >
        <div className="px-6 text-center">

          <h2
            className="
              text-2xl
              font-bold
              sm:text-3xl
            "
          >
            No advertisements available
          </h2>


          <p
            className="
              mt-3
              max-w-md
              text-sm
              leading-6
              text-white/50
            "
          >
            {error ||
              "Abhi display karne ke liye koi active advertisement nahi hai."}
          </p>


          <button
            type="button"
            onClick={fetchAds}
            className="
              mt-6
              rounded-full
              bg-white
              px-6
              py-3
              text-sm
              font-bold
              text-black
              transition
              hover:scale-105
            "
          >
            Try Again
          </button>

        </div>
      </section>
    );
  }


  /* =======================================================
     MAIN HERO
  ======================================================= */

  return (
    <section
      className="
        relative
        h-[100svh]
        min-h-[620px]
        w-full
        overflow-hidden
        bg-black
        text-white
        select-none
      "
      onMouseEnter={() =>
        setIsPausedByHover(true)
      }
      onMouseLeave={() =>
        setIsPausedByHover(false)
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ===================================================
          SLIDER TRACK
      =================================================== */}

      <div
        className="
          absolute
          inset-0
          flex
          h-full
          w-full
        "
        style={{
          transform: `translate3d(-${
            current * 100
          }%, 0, 0)`,

          transition: `
            transform
            ${TRANSITION_TIME}ms
            cubic-bezier(0.65, 0, 0.35, 1)
          `,

          willChange: "transform",
        }}
      >

        {data.map(
          (slide, index) => {

            const isActive =
              index === current;


            return (
              <div
                key={slide.id}
                className="
                  relative
                  h-full
                  min-w-full
                  shrink-0
                  overflow-hidden
                "
              >

                {/* =================================================
                    IMAGE
                ================================================= */}

                <picture>

                  {slide.mobileImage && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={
                        slide.mobileImage
                      }
                    />
                  )}


                  <img
                    src={
                      slide.image ||
                      FALLBACK_IMAGE
                    }
                    alt={
                      slide.heading ||
                      "Advertisement"
                    }
                    loading={
                      isActive
                        ? "eager"
                        : "lazy"
                    }
                    fetchPriority={
                      isActive
                        ? "high"
                        : "auto"
                    }
                    decoding="async"
                    className={`
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      ${
                        slide.position ===
                        "left"
                          ? "object-left"
                          : slide.position ===
                            "right"
                          ? "object-right"
                          : "object-center"
                      }
                      ${
                        isActive
                          ? "scale-[1.02]"
                          : "scale-100"
                      }
                    `}
                    style={{
                      transition:
                        "transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)",

                      willChange:
                        isActive
                          ? "transform"
                          : "auto",
                    }}
                    onError={(
                      event
                    ) => {

                      if (
                        event
                          .currentTarget
                          .src !==
                        FALLBACK_IMAGE
                      ) {

                        event
                          .currentTarget
                          .src =
                          FALLBACK_IMAGE;
                      }
                    }}
                  />

                </picture>


                {/* =================================================
                    OVERLAYS
                ================================================= */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-black/10
                  "
                />


                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    w-full
                    bg-gradient-to-r
                    from-black/65
                    via-black/30
                    to-transparent
                    md:w-[75%]
                    lg:w-[65%]
                  "
                />


                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    h-[35%]
                    bg-gradient-to-t
                    from-black/55
                    to-transparent
                  "
                />


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    w-full
                    items-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      w-full
                      max-w-[1500px]
                      px-5
                      sm:px-8
                      md:px-12
                      lg:px-16
                      xl:px-20
                    "
                  >

                    <div
                      className={`
                        max-w-[850px]
                        ${
                          isActive
                            ? "translate-y-0 opacity-100"
                            : "translate-y-6 opacity-0"
                        }
                      `}
                      style={{
                        transition:
                          "opacity 600ms ease, transform 700ms ease",

                        transitionDelay:
                          isActive
                            ? "180ms"
                            : "0ms",
                      }}
                    >

                      {/* =================================================
                          HEADING
                      ================================================= */}

                      <h1
                        className="
                          max-w-[850px]
                          text-4xl
                          font-black
                          leading-[1.02]
                          tracking-tight
                          !text-white
                          drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]
                          sm:text-5xl
                          md:text-6xl
                          lg:text-7xl
                          xl:text-[82px]
                        "
                      >
                        {slide.heading}
                      </h1>


                      {/* =================================================
                          DESCRIPTION
                      ================================================= */}

                      {slide.description && (
                        <p
                          className="
                            mt-5
                            max-w-[650px]
                            text-base
                            font-medium
                            leading-7
                            text-white
                            drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
                            sm:text-lg
                            sm:leading-8
                            md:text-xl
                          "
                        >
                          {slide.description}
                        </p>
                      )}


                      {/* =================================================
                          CTA
                      ================================================= */}

                      <div
                        className="
                          mt-7
                          flex
                          flex-wrap
                          items-center
                          gap-3
                          sm:mt-9
                        "
                      >

                        <a
                          href={slide.path}
                          className="
                            group
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-white
                            px-5
                            py-3
                            text-sm
                            font-bold
                            text-black
                            shadow-xl
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-white/90
                            sm:px-6
                            sm:py-3.5
                            sm:text-base
                          "
                        >

                          {slide.label}


                          <ArrowUpRight
                            size={18}
                            className="
                              transition-transform
                              duration-300
                              group-hover:translate-x-0.5
                              group-hover:-translate-y-0.5
                            "
                          />

                        </a>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          z-30
          px-5
          pt-5
          sm:px-8
          sm:pt-7
          md:px-12
          lg:px-16
          xl:px-20
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1500px]
            items-center
            justify-between
          "
        >

          <div
            className="
              text-lg
              font-black
              tracking-tight
              text-white
              drop-shadow-lg
              sm:text-xl
              md:text-2xl
            "
          >
            NOIXATECH
          </div>


          <div
            className="
              rounded-full
              border
              border-white/20
              bg-black/20
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              backdrop-blur-sm
            "
          >

            <span>
              {String(
                current + 1
              ).padStart(2, "0")}
            </span>


            <span
              className="
                mx-1
                text-white/40
              "
            >
              /
            </span>


            <span
              className="
                text-white/60
              "
            >
              {String(
                data.length
              ).padStart(2, "0")}
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          ARROWS
      ===================================================== */}

      {data.length > 1 && (
        <>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={prevSlide}
            className="
              absolute
              left-4
              top-1/2
              z-30
              hidden
              h-12
              w-12
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/20
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-white
              hover:text-black
              md:flex
              lg:left-6
            "
          >
            <ChevronLeft size={22} />
          </button>


          <button
            type="button"
            aria-label="Next slide"
            onClick={nextSlide}
            className="
              absolute
              right-4
              top-1/2
              z-30
              hidden
              h-12
              w-12
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/20
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-white
              hover:text-black
              md:flex
              lg:right-6
            "
          >
            <ChevronRight size={22} />
          </button>

        </>
      )}


      {/* =====================================================
          BOTTOM CONTROLS
      ===================================================== */}

      <div
        className="
          absolute
          bottom-5
          left-0
          right-0
          z-30
          px-5
          sm:bottom-7
          sm:px-8
          md:px-12
          lg:px-16
          xl:px-20
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1500px]
            items-end
            justify-between
            gap-5
          "
        >

          {/* =================================================
              PLAY + PROGRESS
          ================================================= */}

          <div
            className="
              flex
              flex-1
              items-center
              gap-4
            "
          >

            <button
              type="button"
              onClick={togglePlay}
              aria-label={
                isPlaying
                  ? "Pause slider"
                  : "Play slider"
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/25
                bg-black/25
                text-white
                backdrop-blur-sm
                transition
                hover:bg-white
                hover:text-black
                sm:h-11
                sm:w-11
              "
            >

              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play
                  size={16}
                  className="ml-0.5"
                />
              )}

            </button>


            <div
              className="
                relative
                h-[3px]
                max-w-[420px]
                flex-1
                overflow-hidden
                rounded-full
                bg-white/30
              "
            >

              <div
                className="
                  absolute
                  inset-y-0
                  left-0
                  rounded-full
                  bg-white
                "
                style={{
                  width: `${progress}%`,
                  willChange: "width",
                }}
              />

            </div>

          </div>


          {/* =================================================
              DOTS
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            {data.map(
              (slide, index) => (

                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${
                    index + 1
                  }`}
                  onClick={() =>
                    goToSlide(index)
                  }
                  className="
                    group
                    flex
                    h-7
                    items-center
                    justify-center
                  "
                >

                  <span
                    className={`
                      block
                      rounded-full
                      transition-all
                      duration-300
                      ${
                        current === index
                          ? "w-7 bg-white"
                          : "h-2 w-2 bg-white/50 group-hover:bg-white"
                      }
                    `}
                    style={{
                      height:
                        current === index
                          ? "3px"
                          : "8px",
                    }}
                  />

                </button>

              )
            )}

          </div>

        </div>

      </div>

    </section>
  );
};


export default HeroSection;