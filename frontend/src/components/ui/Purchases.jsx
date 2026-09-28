import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
  ReceiptText,
  Package,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";

/* =========================================================
   API
========================================================= */

const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount, currency = "INR") => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({ status }) {
  const value = String(status || "").toLowerCase();

  if (value === "paid") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-emerald-50
          px-3
          py-1.5
          text-xs
          font-semibold
          text-emerald-700
          dark:bg-emerald-500/10
          dark:text-emerald-300
        "
      >
        <CheckCircle2 size={14} />
        Paid
      </span>
    );
  }

  if (value === "created" || value === "pending") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-amber-50
          px-3
          py-1.5
          text-xs
          font-semibold
          text-amber-700
          dark:bg-amber-500/10
          dark:text-amber-300
        "
      >
        <Clock3 size={14} />
        Pending
      </span>
    );
  }

  if (value === "failed" || value === "cancelled") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-red-50
          px-3
          py-1.5
          text-xs
          font-semibold
          text-red-700
          dark:bg-red-500/10
          dark:text-red-300
        "
      >
        <XCircle size={14} />

        {value === "cancelled" ? "Cancelled" : "Failed"}
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        rounded-full
        bg-slate-100
        px-3
        py-1.5
        text-xs
        font-semibold
        text-slate-600
        dark:bg-slate-800
        dark:text-slate-300
      "
    >
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   PURCHASE CARD
========================================================= */

function PurchaseCard({ purchase, isDark }) {
  const productName = purchase?.productName || "Purchased Item";

  const productDescription = purchase?.productDescription || "";

  const productType =
    purchase?.productType === "service" ? "Service" : "Product";

  const amount = purchase?.amount ?? purchase?.totalAmount ?? 0;

  const currency = purchase?.currency || "INR";

  const quantity =
    Number(purchase?.quantity) > 0 ? Number(purchase?.quantity) : 1;

  const purchaseDate =
    purchase?.paidAt || purchase?.updatedAt || purchase?.createdAt;

  const orderId =
    purchase?.razorpayOrderId || purchase?.orderId || "Not available";

  const paymentId =
    purchase?.razorpayPaymentId || purchase?.paymentId || "Not available";

  const productImage = purchase?.productImage || "";

  return (
    <article
      className={`
        overflow-hidden
        border
        ${
          isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
        }
      `}
    >
      {/* ===================================================
          MAIN PRODUCT AREA
      =================================================== */}

      <div
        className="
          flex
          flex-col
          gap-5
          p-5
          sm:p-6
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            gap-4
          "
        >
          {/* IMAGE / ICON */}

          <div
            className="
              h-16
              w-16
              shrink-0
              overflow-hidden
              rounded-2xl
              bg-emerald-50
              dark:bg-emerald-500/10
            "
          >
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="
                  h-full
                  w-full
                  object-cover
                "
                loading="lazy"
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                {productType === "Service" ? (
                  <BriefcaseBusiness size={25} />
                ) : (
                  <Package size={25} />
                )}
              </div>
            )}
          </div>

          {/* TEXT */}

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <h2
                className="
                  text-lg
                  font-bold
                  leading-6
                  sm:text-xl
                "
              >
                {productName}
              </h2>

              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-600
                  dark:bg-slate-800
                  dark:text-slate-300
                "
              >
                {productType}
              </span>
            </div>

            {productDescription && (
              <p
                className={`
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  ${isDark ? "text-slate-400" : "text-slate-500"}
                `}
              >
                {productDescription}
              </p>
            )}

            <div
              className={`
                mt-3
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
                text-xs
                ${isDark ? "text-slate-400" : "text-slate-500"}
              `}
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                "
              >
                <CalendarDays size={14} />

                {formatDate(purchaseDate)}
              </span>

              <span>
                Quantity: <strong>{quantity}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            PRICE + STATUS
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            border-t
            pt-4
            lg:min-w-[150px]
            lg:flex-col
            lg:items-end
            lg:border-t-0
            lg:pt-0
          "
        >
          <div
            className="
              text-xl
              font-bold
            "
          >
            {formatCurrency(amount, currency)}
          </div>

          <StatusBadge status={purchase?.status} />
        </div>
      </div>

      {/* ===================================================
          PAYMENT DETAILS
      =================================================== */}

      <div
        className={`
          border-t
          px-5
          py-5
          sm:px-6
          ${
            isDark
              ? "border-slate-800 bg-slate-950/40"
              : "border-slate-100 bg-slate-50/60"
          }
        `}
      >
        <div
          className="
            grid
            gap-5
            sm:grid-cols-2
          "
        >
          {/* ORDER ID */}

          <div>
            <p
              className={`
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                ${isDark ? "text-slate-500" : "text-slate-400"}
              `}
            >
              Razorpay Order ID
            </p>

            <p
              className="
                mt-1.5
                break-all
                font-mono
                text-xs
                font-medium
              "
            >
              {orderId}
            </p>
          </div>

          {/* PAYMENT ID */}

          <div>
            <p
              className={`
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                ${isDark ? "text-slate-500" : "text-slate-400"}
              `}
            >
              Razorpay Payment ID
            </p>

            <p
              className="
                mt-1.5
                break-all
                font-mono
                text-xs
                font-medium
              "
            >
              {paymentId}
            </p>
          </div>
        </div>

        {/* PAYMENT DATE */}

        <div
          className={`
            mt-5
            flex
            items-center
            gap-2
            border-t
            pt-4
            text-xs
            ${
              isDark
                ? "border-slate-800 text-slate-400"
                : "border-slate-200 text-slate-500"
            }
          `}
        >
          <CreditCard
            size={14}
            className="
              shrink-0
              text-emerald-500
            "
          />
          Payment recorded on{" "}
          <strong className={isDark ? "text-slate-200" : "text-slate-700"}>
            {formatDateTime(purchaseDate)}
          </strong>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PURCHASES PAGE
========================================================= */

function Purchases() {
  const [purchases, setPurchases] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark",
  );

  /* =======================================================
     FETCH PURCHASES
     
     NO LOGIN CHECK HERE.
     
     JUST REQUEST BACKEND.
  ======================================================= */

  const fetchPurchases = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${SITE_API}/api/payments/my-purchases`, {
        method: "GET",

        credentials: "include",

        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Unable to load purchases.");
      }

      /* =================================================
         BACKEND RESPONSE
         
         Expected:
         
         {
           success: true,
           count: 1,
           data: [...]
         }
      ================================================= */

      const data = Array.isArray(result?.data) ? result.data : [];

      setPurchases(data);
    } catch (requestError) {
      console.error("Purchases API error:", requestError);

      setError(requestError?.message || "Unable to load purchases.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL REQUEST
  ======================================================= */

  useEffect(() => {
    fetchPurchases();
  }, []);

  /* =======================================================
     THEME
  ======================================================= */

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("themechange", syncTheme);

    return () => {
      observer.disconnect();

      window.removeEventListener("themechange", syncTheme);
    };
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className={`
          flex
          min-h-screen
          items-center
          justify-center
          px-5
          ${isDark ? "bg-slate-950 text-white" : "bg-[#F7FAF9] text-slate-900"}
        `}
      >
        <div
          className="
            text-center
          "
        >
          <Loader2
            size={30}
            className="
              mx-auto
              animate-spin
              text-emerald-600
            "
          />

          <p
            className={`
              mt-4
              text-sm
              font-medium
              ${isDark ? "text-slate-400" : "text-slate-500"}
            `}
          >
            Loading purchases...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className={`
        min-h-screen
        px-4
        pb-12
        pt-24
        sm:px-6
        lg:px-8
        ${isDark ? "bg-slate-950 text-white" : "bg-[#F7FAF9] text-slate-900"}
      `}
    >
      <div
        className="
          mx-auto
          max-w-5xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <Link
              to="/profile"
              className={`
                inline-flex
                items-center
                gap-1.5
                text-sm
                font-semibold
                transition
                ${
                  isDark
                    ? "text-slate-400 hover:text-emerald-300"
                    : "text-slate-500 hover:text-emerald-600"
                }
              `}
            >
              <ArrowLeft size={16} />
              Back to Profile
            </Link>

            <h1
              className="
                mt-4
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
              "
            >
              My Purchases
            </h1>

            <p
              className={`
                mt-2
                text-sm
                leading-6
                ${isDark ? "text-slate-400" : "text-slate-500"}
              `}
            >
              Products and services purchased from your account.
            </p>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => fetchPurchases(true)}
            disabled={refreshing}
            className={`
              inline-flex
              w-fit
              items-center
              gap-2
              border
              px-4
              py-2.5
              text-sm
              font-semibold
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
              ${
                isDark
                  ? `
                    border-slate-700
                    bg-slate-900
                    text-slate-200
                    hover:bg-slate-800
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-700
                    hover:bg-slate-50
                  `
              }
            `}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-6
              border
              border-red-200
              bg-red-50
              p-5
              dark:border-red-500/20
              dark:bg-red-500/10
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <XCircle
                size={20}
                className="
                  mt-0.5
                  shrink-0
                  text-red-600
                  dark:text-red-400
                "
              />

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-sm
                    font-bold
                    text-red-700
                    dark:text-red-300
                  "
                >
                  Unable to load purchases
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-red-600
                    dark:text-red-300
                  "
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error && purchases.length === 0 && (
          <section
            className={`
                border
                px-6
                py-16
                text-center
                ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }
              `}
          >
            <div
              className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500/10
                  text-emerald-600
                  dark:text-emerald-400
                "
            >
              <ShoppingBag size={27} />
            </div>

            <h2
              className="
                  mt-5
                  text-xl
                  font-bold
                "
            >
              No purchases found
            </h2>

            <p
              className={`
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  ${isDark ? "text-slate-400" : "text-slate-500"}
                `}
            >
              Your successfully completed purchases will appear here.
            </p>

            <Link
              to="/"
              className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  bg-[#2E9E6D]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#227955]
                "
            >
              Browse Products
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </section>
        )}

        {/* =================================================
            PURCHASE LIST
        ================================================= */}

        {!error && purchases.length > 0 && (
          <section>
            <div
              className={`
                  mb-4
                  flex
                  items-center
                  gap-2
                  text-sm
                  ${isDark ? "text-slate-400" : "text-slate-500"}
                `}
            >
              <ReceiptText
                size={16}
                className="
                    text-emerald-500
                  "
              />

              <span>
                {purchases.length}{" "}
                {purchases.length === 1 ? "purchase" : "purchases"}
              </span>
            </div>

            <div
              className="
                  space-y-4
                "
            >
              {purchases.map((purchase, index) => (
                <PurchaseCard
                  key={
                    purchase?._id ||
                    purchase?.razorpayPaymentId ||
                    purchase?.razorpayOrderId ||
                    index
                  }
                  purchase={purchase}
                  isDark={isDark}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Purchases;
