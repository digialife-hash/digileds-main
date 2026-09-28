import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  Link,
  useParams,
  Navigate,
} from "react-router-dom";

import {
  startRazorpayPayment,
} from "../../utils/razorpayPayment";


/* =========================================================
   API
========================================================= */

const API_BASE =
  import.meta.env.VITE_SITE_API_URL || "";


/* =========================================================
   AD API
========================================================= */

const getAdApiUrl = (id) => {
  return `${API_BASE}/api/ads/${id}`;
};


/* =========================================================
   PRODUCT ADS PAGE
========================================================= */

function ProductAds() {
  const { id } = useParams();

  /* =======================================================
     STATE
  ======================================================= */

  const [ad, setAd] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [paymentProductId, setPaymentProductId] =
    useState(null);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [paymentMessageType, setPaymentMessageType] =
    useState("");


  /* =======================================================
     FETCH SINGLE AD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchAd = async () => {
      try {
        setLoading(true);

        setError("");

        if (!id) {
          setError(
            "Advertisement ID is missing."
          );

          return;
        }

        const response = await fetch(
          getAdApiUrl(id)
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch advertisement (${response.status})`
          );
        }

        const result =
          await response.json();

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Advertisement not found."
          );
        }

        const adData =
          result?.data;

        if (!adData) {
          throw new Error(
            "Advertisement data is empty."
          );
        }

        if (!cancelled) {
          setAd(adData);
        }
      } catch (error) {
        console.error(
          "ProductAds fetch error:",
          error
        );

        if (!cancelled) {
          setError(
            error?.message ||
              "Unable to load advertisement."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAd();

    return () => {
      cancelled = true;
    };
  }, [id]);


  /* =======================================================
     PAYMENT MESSAGE
  ======================================================= */

  const showPaymentMessage = (
    message,
    type = "success"
  ) => {
    setPaymentMessage(message);

    setPaymentMessageType(type);

    window.setTimeout(() => {
      setPaymentMessage("");

      setPaymentMessageType("");
    }, 5000);
  };


  /* =======================================================
     HANDLE PRODUCT PAYMENT
  ======================================================= */

  const handleProductPayment = async (
    product
  ) => {
    try {
      if (!product) {
        return;
      }

      const productId =
        product.id ||
        product._id;

      if (!productId) {
        showPaymentMessage(
          "Product ID is missing.",
          "error"
        );

        return;
      }

      if (!id) {
        showPaymentMessage(
          "Advertisement ID is missing.",
          "error"
        );

        return;
      }

      setPaymentProductId(
        productId
      );

      setPaymentMessage("");

      setPaymentMessageType("");


      /* ===================================================
         START PAYMENT

         NOTE:
         PRICE FRONTEND SE BACKEND KO NAHI BHEJ RAHE.

         Backend:
         adId + productId
              ↓
         database
              ↓
         actual price
              ↓
         Razorpay order
      =================================================== */

      await startRazorpayPayment({
        adId: id,

        productId,

        productType:
          product.type === "service"
            ? "service"
            : "product",

        quantity: 1,

        name:
          ad?.heading ||
          "Digital Alife",

        description:
          product.name ||
          "Product Purchase",

        image:
          product.image ||
          ad?.image ||
          "",

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        /* ================================================
           SUCCESS
        ================================================ */

        onSuccess: async ({
          razorpay,
          verification,
          order,
        }) => {
          console.log(
            "Payment successful:",
            {
              razorpay,
              verification,
              order,
            }
          );

          showPaymentMessage(
            "Payment successful! Your order has been confirmed.",
            "success"
          );

          /**
           * Future:
           *
           * - Order details page
           * - Invoice
           * - Email
           * - WhatsApp
           * - Service activation
           * - Download access
           *
           * yahan add kar sakte hain.
           */
        },


        /* ================================================
           FAILURE
        ================================================ */

        onFailure: (paymentError) => {
          console.error(
            "Payment failure:",
            paymentError
          );

          if (
            paymentError?.type ===
            "dismissed"
          ) {
            showPaymentMessage(
              "Payment window closed.",
              "error"
            );

            return;
          }

          showPaymentMessage(
            paymentError?.message ||
              "Payment could not be completed.",
            "error"
          );
        },


        /* ================================================
           DISMISS
        ================================================ */

        onDismiss: () => {
          console.log(
            "Razorpay checkout dismissed."
          );
        },
      });
    } catch (error) {
      console.error(
        "Product payment error:",
        error
      );

      showPaymentMessage(
        error?.message ||
          "Unable to start payment.",
        "error"
      );
    } finally {
      setPaymentProductId(null);
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F7FAF9]
          text-slate-900
          dark:bg-slate-950
          dark:text-white
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-4
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-emerald-500/10
            "
          >
            <Loader2
              size={28}
              className="
                animate-spin
                text-emerald-500
              "
            />
          </div>

          <p
            className="
              text-sm
              font-semibold
              text-slate-500
              dark:text-slate-400
            "
          >
            Loading advertisement...
          </p>
        </div>
      </main>
    );
  }


  /* =======================================================
     INVALID / NOT FOUND
  ======================================================= */

  if (error || !ad) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  /* =======================================================
     PRODUCTS
  ======================================================= */

  const products = Array.isArray(
    ad.products
  )
    ? ad.products
    : [];


  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#F7FAF9]
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >

      <section
        className="
          relative
          overflow-hidden
          py-15
        "
      >

        {/* =================================================
            BACKGROUND GLOW
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -left-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-emerald-400/20
            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-40
            -right-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-400/10
            blur-[120px]
          "
        />


        <div
          className="
            relative
            mx-auto
            max-w-[1500px]
            px-5
            py-8
            sm:px-8
            lg:px-12
            lg:py-12
          "
        >

          {/* =================================================
              PAYMENT MESSAGE
          ================================================= */}

          {paymentMessage && (
            <div
              className="
                fixed
                right-5
                top-5
                z-[9999]
                w-[calc(100%-40px)]
                max-w-md
              "
            >
              <div
                className={`
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  p-4
                  shadow-2xl
                  backdrop-blur-xl
                  ${
                    paymentMessageType ===
                    "success"
                      ? `
                        border-emerald-200
                        bg-emerald-50/95
                        text-emerald-800
                        dark:border-emerald-900
                        dark:bg-emerald-950/95
                        dark:text-emerald-200
                      `
                      : `
                        border-red-200
                        bg-red-50/95
                        text-red-800
                        dark:border-red-900
                        dark:bg-red-950/95
                        dark:text-red-200
                      `
                  }
                `}
              >
                {paymentMessageType ===
                "success" ? (
                  <CheckCircle2
                    size={21}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />
                ) : (
                  <XCircle
                    size={21}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />
                )}

                <p
                  className="
                    text-sm
                    font-semibold
                    leading-6
                  "
                >
                  {paymentMessage}
                </p>
              </div>
            </div>
          )}


          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <Link
            to="/"
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-slate-200
              bg-white/80
              px-4
              py-2
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              backdrop-blur
              transition-all
              duration-300
              hover:-translate-x-1
              hover:border-emerald-400
              hover:text-emerald-600
              dark:border-slate-700
              dark:bg-slate-900/80
              dark:text-slate-200
              dark:hover:border-emerald-500
              dark:hover:text-emerald-400
            "
          >
            <ArrowLeft size={17} />

            Back
          </Link>


          {/* =================================================
              AD HEADER
          ================================================= */}

          <div
            className="
              grid
              overflow-hidden
              rounded-[32px]
              border
              border-slate-200
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.10)]
              dark:border-slate-800
              dark:bg-slate-900
              lg:grid-cols-2
            "
          >

            {/* =================================================
                IMAGE
            ================================================= */}

            <div
              className="
                relative
                min-h-[300px]
                overflow-hidden
                bg-slate-100
                dark:bg-slate-800
                lg:min-h-[420px]
              "
            >
              <img
                src={
                  ad.image ||
                  ad.mobileImage ||
                  "/images/placeholder.jpg"
                }
                alt={
                  ad.heading ||
                  "Advertisement"
                }
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.03]
                "
                loading="eager"
                decoding="async"
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/45
                  via-black/5
                  to-transparent
                "
              />


              {/* =================================================
                  BADGE
              ================================================= */}

              <div
                className="
                  absolute
                  left-5
                  top-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/20
                  bg-black/30
                  px-4
                  py-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-white
                  backdrop-blur-md
                  sm:left-7
                  sm:top-7
                "
              >
                <Sparkles
                  size={14}
                  className="
                    text-emerald-300
                  "
                />

                {ad.badge ||
                  "Featured"}
              </div>
            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div
              className="
                flex
                flex-col
                justify-center
                p-6
                sm:p-10
                lg:p-14
                xl:p-16
              "
            >

              {ad.label && (
                <div className="mb-4">
                  <span
                    className="
                      inline-flex
                      rounded-full
                      bg-emerald-500/10
                      px-4
                      py-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-600
                      dark:bg-emerald-400/10
                      dark:text-emerald-400
                    "
                  >
                    {ad.label}
                  </span>
                </div>
              )}


              <h1
                className="
                  max-w-[650px]
                  text-3xl
                  font-black
                  leading-[1.05]
                  tracking-tight
                  text-slate-900
                  sm:text-4xl
                  lg:text-5xl
                  dark:text-white
                "
              >
                {ad.heading ||
                  "Featured Offer"}
              </h1>


              {ad.description && (
                <p
                  className="
                    mt-6
                    max-w-[600px]
                    text-base
                    leading-7
                    text-slate-600
                    sm:text-lg
                    dark:text-slate-300
                  "
                >
                  {ad.description}
                </p>
              )}


              {ad.productId && (
                <div
                  className="
                    mt-8
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    dark:border-slate-700
                    dark:bg-slate-800/60
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Product
                  </p>

                  {ad.productSlug && (
                    <p
                      className="
                        mt-1
                        text-sm
                        font-bold
                        text-slate-700
                        dark:text-slate-200
                      "
                    >
                      {ad.productSlug}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* =================================================
              PRODUCTS / SERVICES
          ================================================= */}

          {products.length > 0 && (
            <div className="mt-10">

              <h2
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  sm:text-3xl
                "
              >
                What's included
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {products.length} item
                {products.length > 1
                  ? "s"
                  : ""}{" "}
                in this offer
              </p>


              {/* =================================================
                  PRODUCT GRID
              ================================================= */}

              <div
                className="
                  mt-6
                  grid
                  gap-6
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {products.map(
                  (product, index) => {
                    const productId =
                      product.id ||
                      product._id ||
                      index;

                    const productImage =
                      product.image ||
                      "/images/placeholder.jpg";

                    const productType =
                      product.type ===
                      "service"
                        ? "Service"
                        : "Product";

                    const isPaymentLoading =
                      paymentProductId ===
                      productId;


                    return (
                      <div
                        key={productId}
                        className="
                          group
                          overflow-hidden
                          rounded-3xl
                          border
                          border-slate-200
                          bg-white
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:shadow-lg
                          dark:border-slate-800
                          dark:bg-slate-900
                        "
                      >

                        {/* =================================================
                            PRODUCT IMAGE
                        ================================================= */}

                        <div
                          className="
                            relative
                            h-48
                            w-full
                            overflow-hidden
                            bg-slate-100
                            dark:bg-slate-800
                          "
                        >
                          <img
                            src={
                              productImage
                            }
                            alt={
                              product.name ||
                              "Product"
                            }
                            className="
                              absolute
                              inset-0
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-105
                            "
                            loading="lazy"
                            decoding="async"
                          />

                          <span
                            className="
                              absolute
                              left-3
                              top-3
                              rounded-full
                              bg-black/60
                              px-3
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-white
                              backdrop-blur-sm
                            "
                          >
                            {productType}
                          </span>
                        </div>


                        {/* =================================================
                            PRODUCT CONTENT
                        ================================================= */}

                        <div className="p-5">

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-2
                            "
                          >
                            <h3
                              className="
                                text-base
                                font-bold
                                leading-tight
                              "
                            >
                              {product.name ||
                                "Unnamed Product"}
                            </h3>

                            {product.price && (
                              <span
                                className="
                                  shrink-0
                                  text-sm
                                  font-black
                                  text-emerald-600
                                  dark:text-emerald-400
                                "
                              >
                                {product.price}
                              </span>
                            )}
                          </div>


                          {product.description && (
                            <p
                              className="
                                mt-2
                                text-sm
                                leading-6
                                text-slate-500
                                dark:text-slate-400
                              "
                            >
                              {
                                product.description
                              }
                            </p>
                          )}


                          {/* =================================================
                              PAYMENT BUTTON
                          ================================================= */}

                          <button
                            type="button"
                            disabled={
                              paymentProductId !==
                                null
                            }
                            onClick={() =>
                              handleProductPayment(
                                product
                              )
                            }
                            className="
                              mt-4
                              inline-flex
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-full
                              bg-gradient-to-r
                              from-black
                              via-slate-900
                              to-emerald-600
                              px-4
                              py-2.5
                              text-sm
                              font-bold
                              text-white
                              shadow-md
                              transition-all
                              duration-300
                              hover:-translate-y-0.5
                              hover:shadow-lg
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              disabled:hover:translate-y-0
                            "
                          >
                            {isPaymentLoading ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="
                                    animate-spin
                                  "
                                />

                                Processing...
                              </>
                            ) : (
                              <>
                                <ShoppingBag
                                  size={16}
                                />

                                {productType ===
                                "Service"
                                  ? "Get Service"
                                  : "Buy Now"}
                              </>
                            )}
                          </button>

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            </div>
          )}


          {/* =================================================
              NO PRODUCTS
          ================================================= */}

          {products.length === 0 && (
            <div
              className="
                mt-10
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white/70
                p-8
                text-center
                dark:border-slate-700
                dark:bg-slate-900/50
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-500
                  dark:text-slate-400
                "
              >
                No products or services are
                listed for this offer.
              </p>
            </div>
          )}


          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div
            className="
              mt-10
              flex
              flex-wrap
              gap-3
            "
          >
            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-300
                px-6
                py-3.5
                text-sm
                font-bold
                text-slate-700
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-emerald-500
                hover:text-emerald-600
                dark:border-slate-700
                dark:text-slate-200
                dark:hover:border-emerald-500
                dark:hover:text-emerald-400
              "
            >
              Continue Browsing

              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}

export default ProductAds;