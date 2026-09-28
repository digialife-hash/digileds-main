import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Package,
  Layers3,
  CalendarDays,
  ArrowUpRight,
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";


/* =========================================================
   API
========================================================= */

const API_BASE =
  import.meta.env.VITE_SITE_API_URL || "";

const ADS_API =
  `${API_BASE}/api/ads`;


/* =========================================================
   HELPERS
========================================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("//")) {
    return `${window.location.protocol}${image}`;
  }

  if (image.startsWith("/")) {
    return `${API_BASE}${image}`;
  }

  return `${API_BASE}/${image}`;
};


const formatDate = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};


const getScheduleStatus = (ad) => {
  const now = new Date();

  if (!ad.active) {
    return {
      label: "Inactive",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  if (
    ad.startAt &&
    new Date(ad.startAt) > now
  ) {
    return {
      label: "Scheduled",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    };
  }

  if (
    ad.endAt &&
    new Date(ad.endAt) < now
  ) {
    return {
      label: "Expired",
      className:
        "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    };
  }

  return {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  };
};


/* =========================================================
   CONFIRM MODAL
========================================================= */

function DeleteModal({
  ad,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Delete Advertisement
          </h3>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>

        </div>


        <div className="p-5">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
            <Trash2 size={28} />
          </div>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Are you sure you want to delete
            <strong className="mx-1 text-slate-900 dark:text-white">
              {ad.heading}
            </strong>
            ?
          </p>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            This action cannot be undone.
          </p>

        </div>


        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Advertisement
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PREVIEW MODAL
========================================================= */

function PreviewModal({
  ad,
  onClose,
}) {
  if (!ad) return null;

  const desktopImage =
    getImageUrl(ad.image);

  const mobileImage =
    getImageUrl(
      ad.mobileImage || ad.image
    );

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">

      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center py-8">

        <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">

            <div className="min-w-0">

              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Advertisement Preview
              </p>

              <h3 className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">
                {ad.heading}
              </h3>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

          </div>


          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">

            {/* Desktop */}

            <div>

              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Monitor size={17} />
                Desktop Image
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950">

                {desktopImage ? (
                  <img
                    src={desktopImage}
                    alt={ad.heading}
                    className="block aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center text-slate-400">
                    <ImageIcon size={40} />
                  </div>
                )}

              </div>


              <div className="mt-5">

                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <Smartphone size={17} />
                  Mobile Image
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950">

                  <img
                    src={mobileImage}
                    alt={`${ad.heading} mobile`}
                    className="mx-auto block max-h-[500px] w-full object-contain"
                  />

                </div>

              </div>

            </div>


            {/* Information */}

            <div className="space-y-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {ad.description ||
                    "No description provided."}
                </p>

              </div>


              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">

                  <p className="text-xs text-slate-500">
                    Position
                  </p>

                  <p className="mt-1 text-sm font-bold capitalize text-slate-900 dark:text-white">
                    {ad.position || "center"}
                  </p>

                </div>


                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">

                  <p className="text-xs text-slate-500">
                    Sort Order
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {ad.sortOrder ?? 0}
                  </p>

                </div>

              </div>


              {ad.products?.length > 0 && (
                <div>

                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <Package size={17} />
                    Products / Services
                  </div>

                  <div className="space-y-2">

                    {ad.products.map(
                      (product, index) => (
                        <div
                          key={
                            product.id ||
                            index
                          }
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {product.name}
                              </p>

                              <p className="mt-0.5 text-xs capitalize text-slate-500">
                                {product.type}
                              </p>

                            </div>

                            {product.price && (
                              <span className="shrink-0 text-xs font-bold text-emerald-600">
                                {product.price}
                              </span>
                            )}

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}


              <a
                href={`/product_ads/${ad._id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <ExternalLink size={17} />
                Open Product Advertisement
              </a>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   AD CARD
========================================================= */

function AdvertisementCard({
  ad,
  onPreview,
  onDelete,
  onToggle,
}) {
  const status =
    getScheduleStatus(ad);

  const image =
    getImageUrl(ad.image);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">

      {/* Image */}

      <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-slate-950">

        {image ? (
          <img
            src={image}
            alt={ad.heading}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageIcon size={40} />
          </div>
        )}


        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
        </div>


        <div className="absolute right-3 top-3">

          <button
            type="button"
            onClick={() =>
              onPreview(ad)
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
            title="Preview"
          >
            <Eye size={17} />
          </button>

        </div>

      </div>


      {/* Content */}

      <div className="p-5">

        <div className="mb-3 flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
              {ad.heading}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {ad.description ||
                "No description provided."}
            </p>

          </div>


          <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            #{ad.sortOrder ?? 0}
          </span>

        </div>


        {/* Meta */}

        <div className="mb-4 flex flex-wrap gap-2">

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Layers3 size={13} />
            {ad.position || "center"}
          </span>


          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Package size={13} />
            {ad.products?.length || 0}
          </span>


          {ad.mobileImage && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
              <Smartphone size={13} />
              Mobile
            </span>
          )}

        </div>


        {/* Schedule */}

        {(ad.startAt ||
          ad.endAt) && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-950">

            <CalendarDays
              size={15}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div className="min-w-0">

              {ad.startAt && (
                <p className="truncate text-[11px] text-slate-500">
                  Start:{" "}
                  {formatDate(
                    ad.startAt
                  )}
                </p>
              )}

              {ad.endAt && (
                <p className="truncate text-[11px] text-slate-500">
                  End:{" "}
                  {formatDate(
                    ad.endAt
                  )}
                </p>
              )}

            </div>

          </div>
        )}


        {/* Actions */}

        <div className="grid grid-cols-4 gap-2">

          <button
            type="button"
            onClick={() =>
              onPreview(ad)
            }
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Preview"
          >
            <Eye size={15} />
          </button>


          <a
            href={`/product_ads/${ad._id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Open"
          >
            <ArrowUpRight size={15} />
          </a>


          <button
            type="button"
            onClick={() =>
              onToggle(ad)
            }
            className={`flex items-center justify-center rounded-xl border py-2.5 transition ${
              ad.active
                ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
            }`}
            title={
              ad.active
                ? "Deactivate"
                : "Activate"
            }
          >
            {ad.active ? (
              <PowerOff size={15} />
            ) : (
              <Power size={15} />
            )}
          </button>


          <button
            type="button"
            onClick={() =>
              onDelete(ad)
            }
            className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 py-2.5 text-red-500 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function AdsManagementPage() {
  const [ads, setAds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortFilter, setSortFilter] =
    useState("order");

  const [page, setPage] =
    useState(1);

  const [previewAd, setPreviewAd] =
    useState(null);

  const [deleteAd, setDeleteAd] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [message, setMessage] =
    useState(null);


  const ITEMS_PER_PAGE = 9;


  /* =======================================================
     FETCH ADS
  ======================================================= */

  const fetchAds = useCallback(
    async (
      showRefresh = false
    ) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setMessage(null);


        const response =
          await fetch(
            ADS_API,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to fetch advertisements."
          );
        }


        setAds(
          Array.isArray(
            result?.data
          )
            ? result.data
            : []
        );
      } catch (error) {
        console.error(
          "Fetch ads error:",
          error
        );

        setMessage({
          type: "error",
          text:
            error?.message ||
            "Unable to load advertisements.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchAds();
  }, [fetchAds]);


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredAds =
    useMemo(() => {
      let result =
        [...ads];


      const query =
        search
          .trim()
          .toLowerCase();


      if (query) {
        result =
          result.filter(
            (ad) => {
              const searchable =
                [
                  ad.heading,
                  ad.description,
                  ad.label,
                  ...(ad.products ||
                    []).map(
                    (product) =>
                      `${product.name} ${product.id}`
                  ),
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              return searchable.includes(
                query
              );
            }
          );
      }


      if (
        statusFilter ===
        "active"
      ) {
        result =
          result.filter(
            (ad) =>
              ad.active
          );
      }


      if (
        statusFilter ===
        "inactive"
      ) {
        result =
          result.filter(
            (ad) =>
              !ad.active
          );
      }


      if (
        statusFilter ===
        "scheduled"
      ) {
        result =
          result.filter(
            (ad) =>
              ad.active &&
              ad.startAt &&
              new Date(
                ad.startAt
              ) > new Date()
          );
      }


      if (
        statusFilter ===
        "expired"
      ) {
        result =
          result.filter(
            (ad) =>
              ad.endAt &&
              new Date(
                ad.endAt
              ) < new Date()
          );
      }


      if (
        sortFilter ===
        "order"
      ) {
        result.sort(
          (a, b) =>
            (a.sortOrder || 0) -
            (b.sortOrder || 0)
        );
      }


      if (
        sortFilter ===
        "newest"
      ) {
        result.sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );
      }


      if (
        sortFilter ===
        "oldest"
      ) {
        result.sort(
          (a, b) =>
            new Date(
              a.createdAt || 0
            ) -
            new Date(
              b.createdAt || 0
            )
        );
      }


      if (
        sortFilter ===
        "name"
      ) {
        result.sort(
          (a, b) =>
            String(
              a.heading || ""
            ).localeCompare(
              String(
                b.heading || ""
              )
            )
        );
      }


      return result;
    }, [
      ads,
      search,
      statusFilter,
      sortFilter,
    ]);


  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredAds.length /
          ITEMS_PER_PAGE
      )
    );


  const safePage =
    Math.min(
      page,
      totalPages
    );


  const paginatedAds =
    filteredAds.slice(
      (safePage - 1) *
        ITEMS_PER_PAGE,
      safePage *
        ITEMS_PER_PAGE
    );


  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    sortFilter,
  ]);


  /* =======================================================
     TOGGLE ACTIVE
  ======================================================= */

  const handleToggle =
    async (ad) => {
      try {
        setActionLoading(
          ad._id
        );

        setMessage(null);


        const response =
          await fetch(
            `${ADS_API}/${ad._id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                active:
                  !ad.active,
              }),
            }
          );


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to update advertisement."
          );
        }


        setAds(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                ad._id
                  ? {
                      ...item,
                      ...result.data,
                    }
                  : item
            )
        );


        setMessage({
          type: "success",
          text:
            ad.active
              ? "Advertisement deactivated."
              : "Advertisement activated.",
        });
      } catch (error) {
        console.error(
          "Toggle ad error:",
          error
        );

        setMessage({
          type: "error",
          text:
            error?.message ||
            "Unable to update advertisement.",
        });
      } finally {
        setActionLoading(null);
      }
    };


  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    async () => {
      if (!deleteAd) return;

      try {
        setDeleting(true);

        setMessage(null);


        const response =
          await fetch(
            `${ADS_API}/${deleteAd._id}`,
            {
              method: "DELETE",
            }
          );


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to delete advertisement."
          );
        }


        setAds(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !==
                deleteAd._id
            )
        );


        setDeleteAd(null);


        setMessage({
          type: "success",
          text:
            "Advertisement deleted successfully.",
        });
      } catch (error) {
        console.error(
          "Delete ad error:",
          error
        );

        setMessage({
          type: "error",
          text:
            error?.message ||
            "Unable to delete advertisement.",
        });
      } finally {
        setDeleting(false);
      }
    };


  /* =======================================================
     NAVIGATE TO ADD
  ======================================================= */

  const goToAdd =
    () => {
      window.location.hash =
        "add-ad";
    };


  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const active =
        ads.filter(
          (ad) =>
            ad.active
        ).length;

      const inactive =
        ads.filter(
          (ad) =>
            !ad.active
        ).length;

      const products =
        ads.reduce(
          (total, ad) =>
            total +
            (ad.products?.length ||
              0),
          0
        );

      return {
        total: ads.length,
        active,
        inactive,
        products,
      };
    }, [ads]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1600px]">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h1 className="!text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Advertisements
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Manage hero advertisements, images,
              products, scheduling and visibility
              from one place.
            </p>

          </div>


          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                fetchAds(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>


            <button
              type="button"
              onClick={
                goToAdd
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Advertisement
            </button>

          </div>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              message.type ===
              "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
            }`}
          >

            {message.type ===
            "success" ? (
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />
            )}

            <span>
              {message.text}
            </span>

          </div>
        )}


        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <p className="text-xs font-semibold text-slate-500">
              Total Ads
            </p>

            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </p>

          </div>


          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">

            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {stats.active}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <p className="text-xs font-semibold text-slate-500">
              Inactive
            </p>

            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {stats.inactive}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <p className="text-xs font-semibold text-slate-500">
              Products / Services
            </p>

            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {stats.products}
            </p>

          </div>

        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">

            {/* Search */}

            <div className="relative">

              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search advertisements, products or services..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

            </div>


            {/* Status */}

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >

              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="expired">
                Expired
              </option>

            </select>


            {/* Sort */}

            <select
              value={
                sortFilter
              }
              onChange={(event) =>
                setSortFilter(
                  event.target.value
                )
              }
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >

              <option value="order">
                Sort Order
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="name">
                Name A-Z
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >

                <div className="aspect-[16/8] animate-pulse bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-3 p-5">

                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                </div>

              </div>
            ))}

          </div>
        ) : paginatedAds.length ===
          0 ? (
          /* ===============================================
             EMPTY
          =============================================== */

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Layers3
                size={30}
              />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No advertisements found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {search ||
              statusFilter !==
                "all"
                ? "Try changing your search or filters."
                : "Create your first advertisement to display it in the hero section."}
            </p>

            {!search &&
              statusFilter ===
                "all" && (
                <button
                  type="button"
                  onClick={
                    goToAdd
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Plus
                    size={17}
                  />
                  Create Advertisement
                </button>
              )}

          </div>
        ) : (
          /* ===============================================
             CARDS
          =============================================== */

          <>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {paginatedAds.map(
                (ad) => (
                  <AdvertisementCard
                    key={
                      ad._id
                    }
                    ad={ad}
                    onPreview={
                      setPreviewAd
                    }
                    onDelete={
                      setDeleteAd
                    }
                    onToggle={
                      handleToggle
                    }
                  />
                )
              )}

            </div>


            {/* =============================================
                PAGINATION
            ============================================= */}

            {totalPages > 1 && (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  <strong>
                    {(safePage -
                      1) *
                      ITEMS_PER_PAGE +
                      1}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    {Math.min(
                      safePage *
                        ITEMS_PER_PAGE,
                      filteredAds.length
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {
                      filteredAds.length
                    }
                  </strong>
                </p>


                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={
                      safePage <= 1
                    }
                    onClick={() =>
                      setPage(
                        (previous) =>
                          Math.max(
                            1,
                            previous -
                              1
                          )
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </button>


                  <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white">
                    {safePage}
                  </span>


                  <button
                    type="button"
                    disabled={
                      safePage >=
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        (previous) =>
                          Math.min(
                            totalPages,
                            previous +
                              1
                          )
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ChevronRight
                      size={17}
                    />
                  </button>

                </div>

              </div>
            )}

          </>
        )}

      </div>


      {/* ===================================================
          PREVIEW
      =================================================== */}

      <PreviewModal
        ad={previewAd}
        onClose={() =>
          setPreviewAd(null)
        }
      />


      {/* ===================================================
          DELETE
      =================================================== */}

      <DeleteModal
        ad={deleteAd}
        loading={deleting}
        onCancel={() =>
          setDeleteAd(null)
        }
        onConfirm={
          handleDelete
        }
      />

    </div>
  );
}


export default AdsManagementPage;