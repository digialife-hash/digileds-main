import React, {
  useRef,
  useState,
} from "react";

import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  Package,
  Save,
  Eye,
} from "lucide-react";


const API_BASE =
  import.meta.env.VITE_SITE_API_URL || "";

const ADS_API =
  `${API_BASE}/api/ads`;

const UPLOAD_API =
  `${API_BASE}/api/ads/upload`;

const MAX_FILE_SIZE =
  50 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];


const emptyProduct = () => ({
  id: "",
  name: "",
  description: "",
  image: "",
  price: "",
  type: "product",
});


/* =========================================================
   IMAGE UPLOADER
========================================================= */

function ImageUploader({
  label,
  value,
  onChange,
  icon: Icon = ImageIcon,
  required = false,
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const uploadImage = async (file) => {
    if (!file) return;

    setError("");

    /* ---------------------------------------------
       TYPE
    --------------------------------------------- */

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, JPEG, PNG, WEBP and AVIF images are allowed."
      );

      return;
    }


    /* ---------------------------------------------
       SIZE
    --------------------------------------------- */

    if (
      file.size > MAX_FILE_SIZE
    ) {
      setError(
        "Image size must be 50 MB or less."
      );

      return;
    }


    /* ---------------------------------------------
       UPLOAD
    --------------------------------------------- */

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );


      const response =
        await fetch(
          UPLOAD_API,
          {
            method: "POST",
            body: formData,
          }
        );


      let result = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }


      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Image upload failed."
        );
      }


      const uploadedUrl =
        result?.url ||
        result?.data?.url ||
        result?.data?.path;


      if (!uploadedUrl) {
        throw new Error(
          "Server did not return image URL."
        );
      }


      onChange(
        uploadedUrl
      );
    } catch (uploadError) {
      console.error(
        "Image upload error:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  };


  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (file) {
      uploadImage(file);
    }

    event.target.value = "";
  };


  const removeImage = () => {
    setError("");
    onChange("");
  };


  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between gap-3">

        <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Max 50 MB
        </span>

      </div>


      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">

          <div className="aspect-video w-full overflow-hidden">

            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />

          </div>


          <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-700">

            <div className="flex min-w-0 items-center gap-2">

              <CheckCircle2
                size={17}
                className="shrink-0 text-emerald-500"
              />

              <span className="truncate text-xs text-slate-600 dark:text-slate-300">
                Image uploaded successfully
              </span>

            </div>


            <div className="flex shrink-0 gap-2">

              <button
                type="button"
                onClick={() =>
                  inputRef.current?.click()
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Replace
              </button>


              <button
                type="button"
                onClick={
                  removeImage
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
              >
                <X size={16} />
              </button>

            </div>

          </div>

        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() =>
            inputRef.current?.click()
          }
          className="group flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
        >

          {uploading ? (
            <>
              <Loader2
                size={32}
                className="mb-3 animate-spin text-emerald-500"
              />

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Uploading image...
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Please wait
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition group-hover:scale-105 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Icon size={25} />
              </div>

              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Click to upload image
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                JPG, JPEG, PNG, WEBP or AVIF
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Maximum 50 MB
              </p>
            </>
          )}

        </button>
      )}


      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">

          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error}
          </span>

        </div>
      )}


      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        onChange={
          handleFileChange
        }
        className="hidden"
      />

    </div>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

function AddAdvertisementPage() {
  const [form, setForm] =
    useState({
      heading: "",
      description: "",
      image: "",
      mobileImage: "",
      label: "Explore More",
      position: "center",
      active: true,
      sortOrder: 0,
      startAt: "",
      endAt: "",
      products: [],
    });


  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");


  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const addProduct = () => {
    setForm((previous) => ({
      ...previous,

      products: [
        ...previous.products,
        emptyProduct(),
      ],
    }));
  };


  const updateProduct = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      products:
        previous.products.map(
          (product, productIndex) =>
            productIndex === index
              ? {
                  ...product,
                  [field]: value,
                }
              : product
        ),
    }));
  };


  const removeProduct = (
    index
  ) => {
    setForm((previous) => ({
      ...previous,

      products:
        previous.products.filter(
          (_, productIndex) =>
            productIndex !== index
        ),
    }));
  };


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSuccess("");
    setError("");


    /* ---------------------------------------------
       VALIDATION
    --------------------------------------------- */

    if (
      !form.heading.trim()
    ) {
      setError(
        "Advertisement heading is required."
      );

      return;
    }


    if (!form.image) {
      setError(
        "Please upload the desktop advertisement image."
      );

      return;
    }


    if (
      form.startAt &&
      form.endAt &&
      new Date(form.startAt) >=
        new Date(form.endAt)
    ) {
      setError(
        "End date/time must be after start date/time."
      );

      return;
    }


    /* ---------------------------------------------
       PRODUCT VALIDATION
    --------------------------------------------- */

    const invalidProduct =
      form.products.find(
        (product) =>
          !product.id.trim() ||
          !product.name.trim()
      );


    if (invalidProduct) {
      setError(
        "Every product/service must have an ID and name."
      );

      return;
    }


    try {
      setSaving(true);


      const payload = {
        heading:
          form.heading.trim(),

        description:
          form.description,

        image:
          form.image,

        mobileImage:
          form.mobileImage,

        label:
          form.label.trim() ||
          "Explore More",

        position:
          form.position,

        active:
          Boolean(form.active),

        sortOrder:
          Number(form.sortOrder) || 0,

        startAt:
          form.startAt || null,

        endAt:
          form.endAt || null,

        products:
          form.products.map(
            (product) => ({
              id:
                product.id.trim(),

              name:
                product.name.trim(),

              description:
                product.description,

              image:
                product.image,

              price:
                product.price.trim(),

              type:
                product.type,
            })
          ),
      };


      const response =
        await fetch(
          ADS_API,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to create advertisement."
        );
      }


      setSuccess(
        "Advertisement created successfully."
      );


      /* ---------------------------------------------
         RESET
      --------------------------------------------- */

      setForm({
        heading: "",
        description: "",
        image: "",
        mobileImage: "",
        label: "Explore More",
        position: "center",
        active: true,
        sortOrder: 0,
        startAt: "",
        endAt: "",
        products: [],
      });

    } catch (submitError) {
      console.error(
        "Create advertisement error:",
        submitError
      );

      setError(
        submitError?.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>


            <h1 className="!text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Add Advertisement
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Create a responsive advertisement with
              desktop/mobile artwork and optional
              products or services.
            </p>

          </div>

        </div>


        {/* =================================================
            ALERTS
        ================================================= */}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">

            <CheckCircle2
              size={18}
            />

            {success}

          </div>
        )}


        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            {error}

          </div>
        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Advertisement Information
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add the main content displayed inside
                the advertisement.
              </p>

            </div>


            <div className="space-y-5">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Heading
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    form.heading
                  }
                  onChange={(event) =>
                    updateField(
                      "heading",
                      event.target.value
                    )
                  }
                  placeholder="Build Something Extraordinary"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Write a short description for this advertisement..."
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              DESKTOP IMAGE
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6 flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Monitor
                  size={21}
                />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Desktop Advertisement
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This image will be displayed on
                  desktop and larger screens.
                </p>

              </div>

            </div>


            <ImageUploader
              label="Desktop Advertisement Image"
              value={
                form.image
              }
              onChange={(value) =>
                updateField(
                  "image",
                  value
                )
              }
              icon={Monitor}
              required
            />

          </section>


          {/* =================================================
              MOBILE IMAGE
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6 flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <Smartphone
                  size={21}
                />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mobile Advertisement
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Optional mobile-specific image.
                  If empty, desktop image can be used.
                </p>

              </div>

            </div>


            <ImageUploader
              label="Mobile Advertisement Image"
              value={
                form.mobileImage
              }
              onChange={(value) =>
                updateField(
                  "mobileImage",
                  value
                )
              }
              icon={Smartphone}
            />

          </section>


          {/* =================================================
              DISPLAY SETTINGS
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Display Settings
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Configure how this advertisement
                behaves in the hero slider.
              </p>

            </div>


            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Button Label
                </label>

                <input
                  type="text"
                  value={
                    form.label
                  }
                  onChange={(event) =>
                    updateField(
                      "label",
                      event.target.value
                    )
                  }
                  placeholder="Explore More"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.sortOrder
                  }
                  onChange={(event) =>
                    updateField(
                      "sortOrder",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Text Position
                </label>

                <select
                  value={
                    form.position
                  }
                  onChange={(event) =>
                    updateField(
                      "position",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="left">
                    Left
                  </option>

                  <option value="center">
                    Center
                  </option>

                  <option value="right">
                    Right
                  </option>

                </select>

              </div>


              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-slate-700 dark:bg-slate-950">

                <div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Advertisement Active
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Show this advertisement
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "active",
                      !form.active
                    )
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    form.active
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >

                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      form.active
                        ? "left-6"
                        : "left-1"
                    }`}
                  />

                </button>

              </div>

            </div>

          </section>


          {/* =================================================
              SCHEDULE
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Advertisement Schedule
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Leave empty if the advertisement
                should remain available without a
                schedule.
              </p>

            </div>


            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Start Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.startAt
                  }
                  onChange={(event) =>
                    updateField(
                      "startAt",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  End Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.endAt
                  }
                  onChange={(event) =>
                    updateField(
                      "endAt",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              PRODUCTS
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Package
                    size={21}
                  />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Advertisement Products
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Optional products or services
                    displayed on the advertisement
                    detail page.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  addProduct
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Plus
                  size={17}
                />

                Add Product
              </button>

            </div>


            {form.products.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-950/60">

                <Package
                  size={30}
                  className="mx-auto mb-3 text-slate-400"
                />

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No products added
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Products are optional.
                </p>

              </div>
            ) : (
              <div className="space-y-5">

                {form.products.map(
                  (
                    product,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950"
                    >

                      <div className="mb-5 flex items-center justify-between">

                        <div>

                          <h3 className="font-bold text-slate-900 dark:text-white">
                            Product #
                            {index + 1}
                          </h3>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            removeProduct(
                              index
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </div>


                      <div className="grid gap-5 lg:grid-cols-2">

                        <div>

                          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Product ID
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="text"
                            value={
                              product.id
                            }
                            onChange={(event) =>
                              updateProduct(
                                index,
                                "id",
                                event.target.value
                              )
                            }
                            placeholder="web-development"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />

                        </div>


                        <div>

                          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Product Name
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="text"
                            value={
                              product.name
                            }
                            onChange={(event) =>
                              updateProduct(
                                index,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="Web Development"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />

                        </div>


                        <div>

                          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Price
                          </label>

                          <input
                            type="text"
                            value={
                              product.price
                            }
                            onChange={(event) =>
                              updateProduct(
                                index,
                                "price",
                                event.target.value
                              )
                            }
                            placeholder="Starting ₹15,000"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />

                        </div>


                        <div>

                          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Type
                          </label>

                          <select
                            value={
                              product.type
                            }
                            onChange={(event) =>
                              updateProduct(
                                index,
                                "type",
                                event.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="product">
                              Product
                            </option>

                            <option value="service">
                              Service
                            </option>

                          </select>

                        </div>


                        <div className="lg:col-span-2">

                          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Description
                          </label>

                          <textarea
                            rows={3}
                            value={
                              product.description
                            }
                            onChange={(event) =>
                              updateProduct(
                                index,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Describe this product or service..."
                            className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />

                        </div>


                        <div className="lg:col-span-2">

                          <ImageUploader
                            label="Product Image"
                            value={
                              product.image
                            }
                            onChange={(value) =>
                              updateProduct(
                                index,
                                "image",
                                value
                              )
                            }
                            icon={
                              Package
                            }
                          />

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                window.history.back()
              }
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Creating...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                  />

                  Create Advertisement
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   SMALL ICON
========================================================= */

function SparklesIcon() {
  return (
    <span className="text-emerald-500">
      ✦
    </span>
  );
}


export default AddAdvertisementPage;