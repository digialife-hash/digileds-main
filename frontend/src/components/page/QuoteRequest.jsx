import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Navigation,
  Phone,
  Mail,
  Globe,
  Star,
  Lock,
  Unlock,
  Loader2,
  X,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Building2,
  Clock3,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ""
).replace(/\/+$/, "");

const UNLOCK_PRICE = 49;

/*
  Backend endpoints expected:

  POST /api/leads/unlock/create-order
  POST /api/leads/unlock/verify
  GET  /api/leads/unlock/:placeId

  You can change these paths according to your backend.
*/

/* =========================================================
   GOOGLE MAPS SCRIPT LOADER
========================================================= */

let googleMapsPromise = null;

const loadGoogleMaps = () => {
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google);
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error(
        "Google Maps API key missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.",
      ),
    );
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-maps="places"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google));

      existingScript.addEventListener("error", () =>
        reject(new Error("Google Maps failed to load.")),
      );

      return;
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY,
    )}&v=weekly`;

    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "places";

    script.onload = () => {
      if (window.google?.maps?.importLibrary) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps Places library is not available."));
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          "Unable to load Google Maps. Check API key and enabled APIs.",
        ),
      );
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

/* =========================================================
   RAZORPAY SCRIPT
========================================================= */

let razorpayPromise = null;

const loadRazorpay = () => {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-razorpay="checkout"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          reject(new Error("Razorpay SDK unavailable."));
        }
      });

      existingScript.addEventListener("error", () => {
        reject(new Error("Razorpay failed to load."));
      });

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "checkout";

    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay SDK unavailable."));
      }
    };

    script.onerror = () => {
      reject(new Error("Unable to load Razorpay."));
    };

    document.body.appendChild(script);
  });

  return razorpayPromise;
};

/* =========================================================
   HELPERS
========================================================= */

const getPlaceId = (place) => {
  return (
    place?.id ||
    place?.placeId ||
    place?.name ||
    Math.random().toString(36).slice(2)
  );
};

const getPlaceName = (place) => {
  return place?.displayName || place?.name || "Unknown Business";
};

const getAddress = (place) => {
  return place?.formattedAddress || place?.address || "Address not available";
};

const getLocation = (place) => {
  if (!place?.location) return null;

  if (
    typeof place.location.lat === "function" &&
    typeof place.location.lng === "function"
  ) {
    return {
      lat: place.location.lat(),
      lng: place.location.lng(),
    };
  }

  if (
    typeof place.location.lat === "number" &&
    typeof place.location.lng === "number"
  ) {
    return {
      lat: place.location.lat,
      lng: place.location.lng,
    };
  }

  return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const getMapsUrl = (place) => {
  if (place?.googleMapsURI) {
    return place.googleMapsURI;
  }

  const location = getLocation(place);

  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${location.lat},${location.lng}`,
    )}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    getPlaceName(place),
  )}`;
};

const getOpeningText = (place) => {
  if (typeof place?.regularOpeningHours?.isOpen === "boolean") {
    return place.regularOpeningHours.isOpen ? "Open now" : "Closed now";
  }

  return null;
};

/* =========================================================
   API HELPERS
========================================================= */

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`,
    );
  }

  return data;
};

/* =========================================================
   COMPONENT
========================================================= */

function QuoteRequest() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPlace, setSelectedPlace] = useState(null);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [unlockedPlaces, setUnlockedPlaces] = useState({});

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  /* =======================================================
     GET USER LOCATION
  ======================================================= */

  const requestLocation = () => {
    setLocationLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setLocationLoading(false);
      setError("Your browser does not support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      (locationError) => {
        console.error(locationError);

        setLocationLoading(false);

        setError(
          "Location permission nahi mili. Browser location permission allow karein.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  };

  /* =======================================================
     AUTO LOCATION
  ======================================================= */

  useEffect(() => {
    requestLocation();
  }, []);

  /* =======================================================
     SEARCH PLACES
  ======================================================= */

  const searchPlaces = async (customQuery = null) => {
    const query = String(customQuery ?? searchText).trim();

    if (!query) {
      setError("Please enter what you want to search.");
      return;
    }

    setSearchLoading(true);
    setError("");
    setResults([]);

    try {
      await loadGoogleMaps();

      const { Place } = await window.google.maps.importLibrary("places");

      /*
        Google Places API (New)
        Search by text with current location bias.
      */

      const request = {
        textQuery: query,
        fields: [
          "id",
          "displayName",
          "formattedAddress",
          "location",
          "googleMapsURI",
          "businessStatus",
          "rating",
          "userRatingCount",
          "regularOpeningHours",
          "websiteURI",
        ],
        maxResultCount: 20,
        language: "en",
        region: "in",
      };

      if (userLocation) {
        request.locationBias = {
          center: userLocation,
          radius: 15000,
        };
      }

      const response = await Place.searchByText(request);

      const places = response?.places || [];

      setResults(places);

      if (!places.length) {
        setError("Is search ke liye nearby koi result nahi mila.");
      }
    } catch (err) {
      console.error("Places search error:", err);

      setError(
        err?.message ||
          "Search failed. Please check Google Maps API configuration.",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  /* =======================================================
     QUICK SEARCH
  ======================================================= */

  const quickSearches = [
    "Restaurants near me",
    "Hospitals near me",
    "Hotels near me",
    "Salons near me",
    "Gyms near me",
    "Real estate agents near me",
    "Car dealers near me",
    "Plumbers near me",
  ];

  /* =======================================================
     DISTANCE
  ======================================================= */

  const processedResults = useMemo(() => {
    return results.map((place) => {
      const location = getLocation(place);

      const distance =
        userLocation && location
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              location.lat,
              location.lng,
            )
          : null;

      return {
        ...place,
        _distance: distance,
      };
    });
  }, [results, userLocation]);

  /* =======================================================
     OPEN PLACE DETAILS / PAYMENT MODAL
  ======================================================= */

  const openUnlockModal = (place) => {
    setSelectedPlace(place);
    setPaymentError("");

    /*
      If already unlocked in this session,
      no payment modal needed.
    */

    const id = getPlaceId(place);

    if (unlockedPlaces[id]) {
      return;
    }
  };

  const closeModal = () => {
    if (paymentLoading) return;

    setSelectedPlace(null);
    setPaymentError("");
  };

  /* =======================================================
     CREATE PAYMENT ORDER
  ======================================================= */

  const createPaymentOrder = async () => {
    if (!selectedPlace) return;

    if (!customer.name.trim()) {
      setPaymentError("Please enter your name.");
      return;
    }

    if (!customer.email.trim()) {
      setPaymentError("Please enter your email.");
      return;
    }

    if (!customer.phone.trim()) {
      setPaymentError("Please enter your phone number.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const placeId = getPlaceId(selectedPlace);

      /*
        IMPORTANT:
        Backend creates Razorpay order.

        Example response:

        {
          orderId: "order_xxxxx",
          amount: 4900,
          currency: "INR",
          keyId: "rzp_live_xxxxx"
        }
      */

      const orderResponse = await apiRequest("/api/leads/unlock/create-order", {
        method: "POST",
        body: JSON.stringify({
          placeId,
          businessName: getPlaceName(selectedPlace),
          amount: UNLOCK_PRICE,
          customer,
        }),
      });

      if (!orderResponse?.orderId) {
        throw new Error("Payment order create nahi hua.");
      }

      const Razorpay = await loadRazorpay();

      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount || UNLOCK_PRICE * 100,

        currency: orderResponse.currency || "INR",

        name: "Lead Unlock",
        description: `Unlock contact details - ${getPlaceName(selectedPlace)}`,

        order_id: orderResponse.orderId,

        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },

        theme: {
          color: "#0C2C50",
        },

        handler: async (paymentResponse) => {
          try {
            /*
              NEVER unlock only from this response.
              Backend verifies signature/payment.
            */

            const verifyResponse = await apiRequest(
              "/api/leads/unlock/verify",
              {
                method: "POST",
                body: JSON.stringify({
                  placeId,
                  customer,
                  razorpay_order_id: paymentResponse.razorpay_order_id,

                  razorpay_payment_id: paymentResponse.razorpay_payment_id,

                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              },
            );

            if (!verifyResponse?.success) {
              throw new Error("Payment verification failed.");
            }

            /*
              Payment verified.
              Now request protected contact data.
            */

            const detailsResponse = await apiRequest(
              `/api/leads/unlock/${encodeURIComponent(placeId)}`,
            );

            if (!detailsResponse?.success) {
              throw new Error("Contact details unlock nahi ho paaye.");
            }

            setUnlockedPlaces((previous) => ({
              ...previous,
              [placeId]: detailsResponse.data,
            }));

            setSelectedPlace(null);
            setPaymentError("");
          } catch (err) {
            console.error("Payment verification error:", err);

            setPaymentError(
              err?.message ||
                "Payment successful ho sakta hai, lekin verification failed.",
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const paymentObject = new Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response);

        setPaymentError(
          response?.error?.description || "Payment failed. Please try again.",
        );

        setPaymentLoading(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error("Payment error:", err);

      setPaymentError(err?.message || "Payment start nahi ho paya.");

      setPaymentLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen  text-slate-900">
      {/* =================================================
          HERO / SEARCH
      ================================================= */}

      <section className="relative overflow-hidden  rounded-2xl bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-400 blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-400 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl">
              <MapPin size={16} />
              Nearby Business Search
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Businesses Near You
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7  sm:text-base">
              Search for businesses, services and places near your location.
              Basic business information is free. Contact details can be
              unlocked after payment.
            </p>

            {/* SEARCH BOX */}

            <div className="mx-auto mt-9 max-w-3xl rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col-4 gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={21}
                    className="absolute left-4 top-1/2 -translate-y-1/2 "
                  />

                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        searchPlaces();
                      }
                    }}
                    placeholder="e.g. restaurants near me"
                    className="h-14 w-full rounded-xl border border-white/10  pl-12 pr-4 text-sm outline-none  focus:border-emerald-400/60 focus:bg-white/15"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => searchPlaces()}
                  disabled={searchLoading}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#2E9E6D] px-7 text-sm font-semibold text-white transition hover:bg-[#25865c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LOCATION */}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={requestLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium  transition hover:bg-white/15 disabled:opacity-60"
              >
                {locationLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Navigation size={14} />
                )}

                {userLocation ? "Location enabled" : "Use my location"}
              </button>

              {userLocation && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs ">
                  <CheckCircle2 size={14} />
                  Nearby results enabled
                </span>
              )}
            </div>
          </div>

          {/* QUICK SEARCH */}

          <div className="mx-auto mt-10 max-w-5xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] ">
              Quick Search
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {quickSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSearchText(item);
                    searchPlaces(item);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs transition hover:border-emerald-400/40 hover:bg-white/10 hover:text-red-500"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        </div>
      )}

      {/* =================================================
          RESULTS
      ================================================= */}

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        {results.length > 0 && (
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2E9E6D]">
                Search Results
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#0C2C50]">
                {results.length} businesses found
              </h2>
            </div>

            <button
              type="button"
              onClick={() => searchPlaces()}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#2E9E6D]/40 hover:text-[#2E9E6D]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        )}

        {/* RESULT GRID */}

        <div className="grid gap-5 md:grid-cols-2">
          {processedResults.map((place, index) => {
            const placeId = getPlaceId(place);
            const unlocked = unlockedPlaces[placeId];

            const location = getLocation(place);

            const distance = place._distance;

            const openingText = getOpeningText(place);

            return (
              <article
                key={`${placeId}-${index}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* TOP */}

                <div className="p-5">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0C2C50]/5 text-[#0C2C50]">
                      <Building2 size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                          {getPlaceName(place)}
                        </h3>

                        {place.rating != null && (
                          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                            <Star size={13} fill="currentColor" />
                            {Number(place.rating).toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                        <MapPin size={15} className="mt-0.5 shrink-0" />

                        <span>{getAddress(place)}</span>
                      </div>
                    </div>
                  </div>

                  {/* META */}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {distance != null && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {distance < 1
                          ? `${Math.round(distance * 1000)} m away`
                          : `${distance.toFixed(1)} km away`}
                      </span>
                    )}

                    {place.userRatingCount != null && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {place.userRatingCount.toLocaleString("en-IN")} reviews
                      </span>
                    )}

                    {openingText && (
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          place.regularOpeningHours?.isOpen
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <Clock3 size={12} className="mr-1 inline" />

                        {openingText}
                      </span>
                    )}
                  </div>

                  {/* CONTACT AREA */}

                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                    {unlocked ? (
                      <div className="bg-emerald-50/60 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                          <Unlock size={16} />
                          Contact Details Unlocked
                        </div>

                        <div className="space-y-2.5">
                          {unlocked.phone && (
                            <a
                              href={`tel:${unlocked.phone}`}
                              className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:text-[#2E9E6D]"
                            >
                              <Phone size={16} className="text-[#2E9E6D]" />

                              <span>{unlocked.phone}</span>
                            </a>
                          )}

                          {unlocked.email && (
                            <a
                              href={`mailto:${unlocked.email}`}
                              className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:text-[#2E9E6D]"
                            >
                              <Mail size={16} className="text-[#2E9E6D]" />

                              <span className="break-all">
                                {unlocked.email}
                              </span>
                            </a>
                          )}

                          {unlocked.website && (
                            <a
                              href={unlocked.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:text-[#2E9E6D]"
                            >
                              <Globe size={16} className="text-[#2E9E6D]" />

                              <span className="truncate">
                                {unlocked.website}
                              </span>

                              <ExternalLink
                                size={14}
                                className="ml-auto shrink-0"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden bg-slate-50 p-4">
                        {/* Fake locked contact */}

                        <div className="pointer-events-none select-none opacity-40 blur-[5px]">
                          <div className="flex items-center gap-3">
                            <Phone size={17} />
                            <span>+91 98765 43210</span>
                          </div>

                          <div className="mt-2 flex items-center gap-3">
                            <Mail size={17} />
                            <span>business@example.com</span>
                          </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                            <Lock size={14} />
                            Contact Locked
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <a
                      href={getMapsUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0C2C50] hover:text-[#0C2C50]"
                    >
                      <MapPin size={16} />
                      View on Maps
                    </a>

                    {!unlocked ? (
                      <button
                        type="button"
                        onClick={() => openUnlockModal(place)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0C2C50] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123b68]"
                      >
                        <Unlock size={16} />
                        Unlock Contact ₹{UNLOCK_PRICE}
                      </button>
                    ) : (
                      <div className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 size={16} />
                        Unlocked
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* EMPTY */}

        {!searchLoading && results.length === 0 && !error && (
          <div className="mx-auto max-w-xl py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0C2C50]/5 text-[#0C2C50]">
              <Search size={28} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#0C2C50]">
              Search for a business
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Search anything like <b>restaurants near me</b>,{" "}
              <b>hospitals near me</b>, <b>plumbers near me</b>, etc.
            </p>
          </div>
        )}
      </section>

      {/* =================================================
          PAYMENT / UNLOCK MODAL
      ================================================= */}

      {selectedPlace && !unlockedPlaces[getPlaceId(selectedPlace)] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* CLOSE */}

            <button
              type="button"
              onClick={closeModal}
              disabled={paymentLoading}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* HEADER */}

            <div className="bg-[#0C2C50] px-6 py-7 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Unlock size={21} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    Contact Unlock
                  </p>

                  <h3 className="mt-1 pr-8 text-lg font-bold">
                    {getPlaceName(selectedPlace)}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* WHAT YOU GET */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  After successful payment
                </p>

                <div className="mt-3 grid gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-[#2E9E6D]" />
                    Business phone number
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-[#2E9E6D]" />
                    Available email
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-[#2E9E6D]" />
                    Available website
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}

              <div className="mt-6">
                <h4 className="text-sm font-bold text-[#0C2C50]">
                  Your Details
                </h4>

                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Your name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2E9E6D] focus:ring-4 focus:ring-[#2E9E6D]/10"
                  />

                  <input
                    type="email"
                    value={customer.email}
                    onChange={(event) =>
                      setCustomer((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                    placeholder="Your email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2E9E6D] focus:ring-4 focus:ring-[#2E9E6D]/10"
                  />

                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Your mobile number"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2E9E6D] focus:ring-4 focus:ring-[#2E9E6D]/10"
                  />
                </div>
              </div>

              {/* PAYMENT ERROR */}

              {paymentError && (
                <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{paymentError}</span>
                </div>
              )}

              {/* PRICE */}

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                <div>
                  <p className="text-xs text-slate-500">One-time unlock</p>

                  <p className="mt-1 text-2xl font-bold text-[#0C2C50]">
                    ₹{UNLOCK_PRICE}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={17} />
                  Secure payment
                </div>
              </div>

              {/* PAY */}

              <button
                type="button"
                onClick={createPaymentOrder}
                disabled={paymentLoading}
                className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#2E9E6D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#25865c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pay ₹{UNLOCK_PRICE} & Unlock
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Contact information will be displayed only after the payment has
                been successfully verified by the server.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteRequest;
