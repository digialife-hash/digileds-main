import { useEffect, useMemo, useState } from "react";

import {
  Check,
  Edit3,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Users,
  BriefcaseBusiness,
  MapPin,
  Mail,
  FileText,
  Quote,
  UserRound,
  Eye,
  EyeOff,
  GripVertical,
  Search,
  RefreshCw,
} from "lucide-react";

import { FaLinkedinIn, FaTwitter } from "react-icons/fa";

import { SITE_API } from "../utils.js";

const EMPTY = {
  name: "",
  designation: "",
  department: "Team",
  image: "",
  description: "",
  quote: "",
  bio: "",
  experience: "",
  location: "",
  linkedin: "",
  twitter: "",
  email: "",
  group: "team",
  isActive: true,
  sortOrder: 0,
};

const DESIGNATIONS = [
  "CEO & Founder",
  "Co-Founder & Director",
  "Project Manager",
  "UI/UX Designer",
  "MERN Full Stack Developer",
  "Mobile App Developer",
  "Digital Marketing Specialist",
  "SEO Specialist",
  "Graphic Designer",
  "Other",
];

const DEPARTMENTS = [
  "Leadership",
  "Development",
  "Design",
  "Marketing",
  "Management",
  "Team",
];

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(value) {
  const image = String(value || "").trim();

  if (!image) {
    return "";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${SITE_API}${image}`;
  }

  return `${SITE_API}/${image}`;
}

function FieldLabel({ htmlFor, children, required = false }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
    >
      {children}

      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-black text-slate-900 dark:text-white">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function TextInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required = false,
  min,
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      )}

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className={[
          "h-11 w-full rounded-xl border border-slate-200",
          "bg-white text-sm text-slate-900 outline-none",
          "transition placeholder:text-slate-400",
          "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-white",
          Icon ? "pl-10 pr-3" : "px-3",
        ].join(" ")}
      />
    </div>
  );
}

function TextArea({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  icon: Icon,
  italic = false,
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
        />
      )}

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={[
          "min-h-[110px] w-full resize-y rounded-xl border border-slate-200",
          "bg-white py-3 text-sm leading-6 text-slate-900 outline-none",
          "transition placeholder:text-slate-400",
          "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-white",
          Icon ? "pl-10 pr-3" : "px-3",
          italic ? "italic" : "",
        ].join(" ")}
      />
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[9px] font-black uppercase tracking-wider",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
      />

      {active ? "Active" : "Hidden"}
    </span>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY);

  const [editingId, setEditingId] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [imageFile, setImageFile] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* =====================================================
     LOAD
  ====================================================== */

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/team`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Team could not be loaded.");
      }

      setMembers(Array.isArray(result.data) ? result.data : []);
    } catch (loadError) {
      setError(loadError?.message || "Team could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* =====================================================
     FORM UPDATE
  ====================================================== */

  function update(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  /* =====================================================
     RESET
  ====================================================== */

  function reset() {
    setForm({
      ...EMPTY,
      sortOrder: members.length,
    });

    setEditingId("");
    setImageFile(null);
  }

  /* =====================================================
     DESIGNATION
  ====================================================== */

  function handleDesignationChange(event) {
    const designation = event.target.value;

    const leadershipDesignations = ["CEO & Founder", "Co-Founder & Director"];

    const isLeadership = leadershipDesignations.includes(designation);

    setForm((current) => ({
      ...current,
      designation,

      group: isLeadership ? "leadership" : current.group,

      department: isLeadership
        ? "Leadership"
        : current.department === "Leadership"
          ? "Team"
          : current.department,
    }));
  }

  /* =====================================================
     IMAGE UPLOAD
  ====================================================== */

  async function uploadImage() {
    if (!imageFile) {
      return;
    }

    setUploadingImage(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("field", "team_image");

      formData.append("asset", imageFile);

      const response = await fetch(
        `${SITE_API}/api/demo-proxy/settings/assets`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.message || "Team photo upload failed.");
      }

      setForm((current) => ({
        ...current,
        image: result.url,
      }));

      setImageFile(null);

      setMessage("Photo uploaded successfully. Save the member to apply it.");
    } catch (uploadError) {
      setError(uploadError?.message || "Team photo upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  /* =====================================================
     CREATE / UPDATE
  ====================================================== */

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const endpoint = editingId
        ? `${SITE_API}/api/demo-proxy/team/${editingId}`
        : `${SITE_API}/api/demo-proxy/team`;

      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Team member could not be saved.");
      }

      if (editingId) {
        setMembers((current) =>
          current.map((item) => (item.id === editingId ? result.data : item)),
        );
      } else {
        setMembers((current) => [result.data, ...current]);
      }

      const wasEditing = Boolean(editingId);

      setEditingId("");

      setForm({
        ...EMPTY,
        sortOrder: members.length + 1,
      });

      setImageFile(null);

      setMessage(
        wasEditing
          ? "Team member updated successfully."
          : "Team member created successfully.",
      );
    } catch (saveError) {
      setError(saveError?.message || "Team member could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  /* =====================================================
     EDIT
  ====================================================== */

  function edit(member) {
    setEditingId(member.id);

    setForm({
      ...EMPTY,
      ...member,

      isActive: member.isActive !== false,

      image: member.image || "",

      linkedin: member.linkedin || "",

      twitter: member.twitter || "",

      group: member.group || "team",

      sortOrder: member.sortOrder ?? 0,
    });

    setImageFile(null);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     DELETE
  ====================================================== */

  async function remove(id) {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this team member? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/team/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Team member could not be deleted.");
      }

      setMembers((current) => current.filter((item) => item.id !== id));

      if (editingId === id) {
        reset();
      }

      setMessage("Team member deleted successfully.");
    } catch (deleteError) {
      setError(deleteError?.message || "Team member could not be deleted.");
    }
  }

  /* =====================================================
     DERIVED DATA
  ====================================================== */

  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : getImageUrl(form.image);

  const activeCount = members.filter(
    (member) => member.isActive !== false,
  ).length;

  const leadershipCount = members.filter(
    (member) => member.group === "leadership",
  ).length;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const searchable = [
        member.name,
        member.designation,
        member.department,
        member.location,
        member.experience,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && member.isActive !== false) ||
        (filter === "hidden" && member.isActive === false) ||
        (filter === "leadership" && member.group === "leadership") ||
        (filter === "team" && member.group !== "leadership");

      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  /* =====================================================
     UI
  ====================================================== */

  return (
    <section className="min-w-0 space-y-6 pb-10">
      {/* =================================================
          HEADER
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {editingId ? "Edit team member" : "Team members"}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage team profiles, roles, photos, professional details and
              social links from one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total
              </p>

              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {members.length}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active
              </p>

              <p className="mt-1 text-xl font-black text-emerald-700 dark:text-emerald-400">
                {activeCount}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-1 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Leadership
              </p>

              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {leadershipCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MESSAGE
      ================================================== */}

      {(error || message) && (
        <div
          className={[
            "flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm",
            error
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
          ].join(" ")}
        >
          {error ? (
            <X size={17} className="mt-0.5 shrink-0" />
          ) : (
            <Check size={17} className="mt-0.5 shrink-0" />
          )}

          <span className="min-w-0 flex-1 leading-6">{error || message}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
            }}
            className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
            aria-label="Close message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =================================================
          FORM
      ================================================== */}

      <form
        onSubmit={submit}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        {/* FORM HEADER */}

        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {editingId ? <Edit3 size={17} /> : <Plus size={18} />}
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingId ? "Edit team member" : "Add new team member"}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the information that should appear on the public team
                profile.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          {/* =================================================
              BASIC
          ================================================== */}

          <div>
            <SectionTitle
              title="Basic Information"
              description="Add the member's name, designation and team category."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="team-name" required>
                  Name
                </FieldLabel>

                <TextInput
                  id="team-name"
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="Enter full name"
                  icon={UserRound}
                  required
                />
              </div>

              <div>
                <FieldLabel htmlFor="team-designation" required>
                  Designation
                </FieldLabel>

                <select
                  id="team-designation"
                  required
                  value={form.designation}
                  onChange={handleDesignationChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Select designation</option>

                  {DESIGNATIONS.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="team-department">Department</FieldLabel>

                <select
                  id="team-department"
                  name="department"
                  value={form.department}
                  onChange={update}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="team-group">Team Group</FieldLabel>

                <select
                  id="team-group"
                  name="group"
                  value={form.group}
                  onChange={update}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="team">Our Team</option>

                  <option value="leadership">Leadership</option>
                </select>
              </div>
            </div>
          </div>

          {/* =================================================
              PHOTO
          ================================================== */}

          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <SectionTitle
              title="Team Photo"
              description="Use a professional profile photo with a clear and consistent aspect ratio."
            />

            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                <div className="aspect-square">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Team member preview"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";

                        const fallback =
                          event.currentTarget.parentElement?.querySelector(
                            "[data-photo-fallback]",
                          );

                        if (fallback) {
                          fallback.classList.remove("hidden");

                          fallback.classList.add("flex");
                        }
                      }}
                    />
                  ) : null}

                  <div
                    data-photo-fallback
                    className={[
                      "h-full w-full items-center justify-center",
                      previewImage ? "hidden" : "flex",
                    ].join(" ")}
                  >
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-950">
                        <ImageIcon size={24} className="text-slate-400" />
                      </div>

                      <p className="mt-3 text-xs font-bold text-slate-500">
                        No image selected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <FieldLabel htmlFor="team-photo">Upload Photo</FieldLabel>

                  <label
                    htmlFor="team-photo"
                    className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-500/50"
                  >
                    <UploadCloud
                      size={23}
                      className="text-emerald-600 dark:text-emerald-400"
                    />

                    <span className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to choose image
                    </span>

                    <span className="mt-1 text-[10px] text-slate-400">
                      PNG, JPG, WEBP or SVG
                    </span>

                    <input
                      id="team-photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(event) =>
                        setImageFile(event.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>

                  {imageFile && (
                    <p className="mt-2 truncate text-[11px] font-medium text-slate-500">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={uploadImage}
                  disabled={!imageFile || uploadingImage}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {uploadingImage ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <UploadCloud size={15} />
                  )}

                  {uploadingImage ? "Uploading..." : "Upload Photo"}
                </button>

                <div>
                  <FieldLabel htmlFor="team-image-url">
                    Image URL / Path
                  </FieldLabel>

                  <TextInput
                    id="team-image-url"
                    name="image"
                    value={form.image}
                    onChange={update}
                    placeholder="/uploads/team-member.jpg"
                  />

                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Complete URL and relative backend paths are supported.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PROFESSIONAL
          ================================================== */}

          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <SectionTitle
              title="Professional Details"
              description="Add location, experience and contact information."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="team-experience">Experience</FieldLabel>

                <TextInput
                  id="team-experience"
                  name="experience"
                  value={form.experience}
                  onChange={update}
                  placeholder="e.g. 5+ Years"
                  icon={BriefcaseBusiness}
                />
              </div>

              <div>
                <FieldLabel htmlFor="team-location">Location</FieldLabel>

                <TextInput
                  id="team-location"
                  name="location"
                  value={form.location}
                  onChange={update}
                  placeholder="e.g. Prayagraj, India"
                  icon={MapPin}
                />
              </div>

              <div>
                <FieldLabel htmlFor="team-email">Email</FieldLabel>

                <TextInput
                  id="team-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="name@example.com"
                  icon={Mail}
                />
              </div>

              <div>
                <FieldLabel htmlFor="team-sort">Sort Order</FieldLabel>

                <TextInput
                  id="team-sort"
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={update}
                  placeholder="0"
                  icon={GripVertical}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              PROFILE CONTENT
          ================================================== */}

          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <SectionTitle
              title="Profile Content"
              description="Professional content that can be displayed on the public profile."
            />

            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="team-description">
                  Short Description
                </FieldLabel>

                <TextArea
                  id="team-description"
                  name="description"
                  value={form.description}
                  onChange={update}
                  rows={4}
                  placeholder="Write a short professional description..."
                  icon={FileText}
                />
              </div>

              <div>
                <FieldLabel htmlFor="team-quote">Professional Quote</FieldLabel>

                <TextArea
                  id="team-quote"
                  name="quote"
                  value={form.quote}
                  onChange={update}
                  rows={4}
                  placeholder="Add a meaningful professional quote..."
                  icon={Quote}
                  italic
                />
              </div>

              <div>
                <FieldLabel htmlFor="team-bio">Biography</FieldLabel>

                <textarea
                  id="team-bio"
                  name="bio"
                  value={form.bio}
                  onChange={update}
                  rows={7}
                  placeholder="Write the complete professional biography..."
                  className="min-h-[160px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              SOCIAL
          ================================================== */}

          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <SectionTitle
              title="Social & Contact"
              description="Add profile links for the public team page."
            />

            <div className="grid gap-5 md:grid-cols-2">
              {/* LINKEDIN */}

              <div>
                <FieldLabel htmlFor="team-linkedin">LinkedIn URL</FieldLabel>

                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-[#0A66C2] text-white">
                    <FaLinkedinIn size={11} />
                  </div>

                  <input
                    id="team-linkedin"
                    name="linkedin"
                    type="url"
                    value={form.linkedin}
                    onChange={update}
                    placeholder="https://linkedin.com/in/username"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* X / TWITTER */}

              <div>
                <FieldLabel htmlFor="team-twitter">X / Twitter URL</FieldLabel>

                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-black text-white dark:bg-white dark:text-black">
                    <FaTwitter size={10} />
                  </div>

                  <input
                    id="team-twitter"
                    name="twitter"
                    type="url"
                    value={form.twitter}
                    onChange={update}
                    placeholder="https://x.com/username"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              VISIBILITY
          ================================================== */}

          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <label
              htmlFor="team-active"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 dark:bg-slate-950 dark:text-emerald-400">
                  {form.isActive ? <Eye size={17} /> : <EyeOff size={17} />}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Show on public team page
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {form.isActive
                      ? "This member is visible publicly."
                      : "This member is currently hidden."}
                  </p>
                </div>
              </div>

              <input
                id="team-active"
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={update}
                className="h-5 w-5 shrink-0 accent-emerald-600"
              />
            </label>
          </div>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 sm:w-auto"
            >
              {busy ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : editingId ? (
                <Edit3 size={16} />
              ) : (
                <Plus size={16} />
              )}

              {busy
                ? "Saving..."
                : editingId
                  ? "Update Member"
                  : "Create Member"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* =====================================================
          TEAM LIST
      ====================================================== */}

      <section>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Team Members
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage people displayed on the public team page.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1 sm:w-[260px] lg:flex-none">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search team member..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* FILTER */}

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All members</option>

              <option value="active">Active</option>

              <option value="hidden">Hidden</option>

              <option value="leadership">Leadership</option>

              <option value="team">Our Team</option>
            </select>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {!loading && (
          <div className="mb-4 text-[11px] font-semibold text-slate-400">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-100 dark:bg-slate-900" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMembers.map((member) => {
              const image = getImageUrl(member.image);

              return (
                <article
                  key={member.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                >
                  {/* IMAGE */}

                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {image ? (
                      <img
                        src={image}
                        alt={member.name || "Team member"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          const fallback =
                            event.currentTarget.parentElement?.querySelector(
                              "[data-card-fallback]",
                            );

                          if (fallback) {
                            fallback.classList.remove("hidden");

                            fallback.classList.add("flex");
                          }
                        }}
                      />
                    ) : null}

                    <div
                      data-card-fallback
                      className={[
                        "absolute inset-0 items-center justify-center bg-slate-100 dark:bg-slate-900",
                        image ? "hidden" : "flex",
                      ].join(" ")}
                    >
                      <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-950">
                          <UserRound className="text-slate-400" />
                        </div>

                        <p className="mt-2 text-xs font-bold text-slate-500">
                          No Photo
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}

                    <div className="absolute left-3 top-3">
                      <StatusBadge active={member.isActive !== false} />
                    </div>

                    {/* GROUP */}

                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        {member.group === "leadership" ? "Leadership" : "Team"}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* CARD BODY */}

                  <div className="p-5">
                    <h3 className="truncate text-lg font-black text-slate-900 dark:text-white">
                      {member.name || "Unnamed member"}
                    </h3>

                    <p className="mt-1 truncate text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {member.designation || "Team Member"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {member.department || "Team"}
                    </p>

                    {/* META */}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.experience && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                          {member.experience}
                        </span>
                      )}

                      {member.location && (
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                          <MapPin size={10} />

                          <span className="max-w-[160px] truncate">
                            {member.location}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* DESCRIPTION */}

                    {member.description && (
                      <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {member.description}
                      </p>
                    )}

                    {/* SOCIAL */}

                    {(member.linkedin || member.twitter || member.email) && (
                      <div className="mt-4 flex items-center gap-2">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A66C2] text-white transition hover:scale-105 hover:shadow-md"
                            aria-label="LinkedIn profile"
                          >
                            <FaLinkedinIn size={13} />
                          </a>
                        )}

                        {member.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white transition hover:scale-105 hover:shadow-md dark:bg-white dark:text-black"
                            aria-label="X / Twitter profile"
                          >
                            <FaTwitter size={12} />
                          </a>
                        )}

                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            onClick={(event) => event.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:scale-105 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label="Email"
                          >
                            <Mail size={14} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => edit(member)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(member.id)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* EMPTY */

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-950">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
              {search ? (
                <Search size={24} className="text-slate-400" />
              ) : (
                <Users size={24} className="text-slate-400" />
              )}
            </div>

            <h3 className="mt-4 text-base font-black text-slate-800 dark:text-slate-200">
              {search ? "No matching members" : "No team members yet"}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try another name, designation or location."
                : "Create your first team member using the form above."}
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
