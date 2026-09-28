import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Eye,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircle,
  Send,
  Sparkles,
  Type,
  Users,
} from "lucide-react";

import { usePost } from "../../hooks/usePost.js";
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";

import PlatformSelector from "./PlatformSelector.jsx";
import CaptionEditor from "./CaptionEditor.jsx";
import HashtagInput from "./HashtagInput.jsx";
import MediaUploader from "./MediaUploader.jsx";
import SchedulePost from "./SchedulePost.jsx";
import PublishButton from "./PublishButton.jsx";
import PostPreview from "./PostPreview.jsx";

export default function PostEditor({ post = null }) {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [visibility, setVisibility] = useState("Public");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [scheduled, setScheduled] = useState(false);
  const [date, setDate] = useState("");

  const [firstComment, setFirstComment] = useState("");
  const [altText, setAltText] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [activePlatform, setActivePlatform] = useState("");
  const [platformCaptions, setPlatformCaptions] = useState({});

  // Mobile only
  const [activeStep, setActiveStep] = useState(1);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const { addPost, updatePost } = usePost();
  const { accounts = [] } = useSocialAccounts();
  const navigate = useNavigate();

  /* =========================================================
     DERIVED STATE
  ========================================================== */

  const activeCaption =
    platformCaptions[activePlatform] ?? caption;

  const editing = Boolean(post);

  const canEditExistingPost =
    !post ||
    ["Draft", "Scheduled"].includes(post.status);

  const canSaveDraft =
    caption.trim().length > 0 &&
    platforms.length > 0 &&
    canEditExistingPost;

  const canPublish =
    canSaveDraft &&
    (!scheduled || Boolean(date));

  /* =========================================================
     KEEP ONLY CONNECTED PLATFORMS
  ========================================================== */

  useEffect(() => {
    const connectedPlatforms = new Set(
      accounts
        .filter((account) => account?.connected)
        .map((account) => account?.name)
        .filter(Boolean),
    );

    setPlatforms((current) =>
      current.filter((platform) =>
        connectedPlatforms.has(platform),
      ),
    );

    setActivePlatform((current) =>
      connectedPlatforms.has(current)
        ? current
        : [...connectedPlatforms][0] || "",
    );
  }, [accounts]);

  /* =========================================================
     LOAD EXISTING POST
  ========================================================== */

  useEffect(() => {
    if (!post) return;

    const connectedPlatforms = new Set(
      accounts
        .filter((account) => account?.connected)
        .map((account) => account?.name)
        .filter(Boolean),
    );

    const nextPlatforms = String(post.platform || "")
      .split(",")
      .map((item) => item.trim())
      .filter(
        (item) =>
          item &&
          connectedPlatforms.has(item),
      );

    const nextCaption =
      post.caption ||
      post.title ||
      "";

    setCaption(nextCaption);
    setHashtags(post.hashtags || "");
    setPlatforms(nextPlatforms);
    setActivePlatform(nextPlatforms[0] || "");
    setVisibility(post.visibility || "Public");
    setFirstComment(post.firstComment || "");
    setAltText(post.altText || "");
    setScheduled(post.status === "Scheduled");

    setDate(
      post.status === "Scheduled"
        ? post.date || ""
        : "",
    );

    setPlatformCaptions(
      post.platformCaptions || {},
    );
  }, [post, accounts]);

  /* =========================================================
     PLATFORM CHANGE
  ========================================================== */

  function handlePlatformChange(nextPlatforms) {
    const next = Array.isArray(nextPlatforms)
      ? nextPlatforms
      : [];

    setPlatforms(next);

    if (next.length > 0) {
      setActivePlatform((current) =>
        next.includes(current)
          ? current
          : next[0],
      );
    } else {
      setActivePlatform("");
    }
  }

  /* =========================================================
     CAPTION CHANGE
  ========================================================== */

  function handleCaptionChange(value) {
    setCaption(value);

    setPlatformCaptions((current) => ({
      ...current,
      ...(activePlatform
        ? {
            [activePlatform]: value,
          }
        : {}),
    }));
  }

  /* =========================================================
     SAVE / PUBLISH
  ========================================================== */

  async function save(status) {
    const cleanCaption = caption.trim();

    setSubmitError("");

    if (!cleanCaption) {
      setSubmitError(
        "Caption is required before saving or publishing.",
      );
      return;
    }

    if (!platforms.length) {
      setSubmitError(
        "Select at least one connected platform.",
      );
      return;
    }

    if (status === "Scheduled" && !date) {
      setSubmitError(
        "Choose a date and time for the scheduled post.",
      );
      return;
    }

    const finalPlatformCaption =
      platformCaptions[activePlatform]?.trim() ||
      cleanCaption;

    setSubmitting(true);
    setUploadProgress(0);

    try {
      if (editing) {
        await updatePost(
          post.id ?? post._id,
          {
            title: cleanCaption.slice(0, 48),
            caption: finalPlatformCaption,
            platformCaptions,
            hashtags: hashtags.trim(),
            platform: platforms.join(", "),
            visibility,
            status,
            date:
              status === "Scheduled"
                ? date
                : "Not scheduled",
            firstComment:
              firstComment.trim(),
            altText: altText.trim(),
          },
        );

        navigate("/dashboard/posts");
        return;
      }

      await addPost(
        {
          title: cleanCaption.slice(0, 48),
          caption: finalPlatformCaption,
          platformCaptions,
          hashtags: hashtags.trim(),
          platform: platforms.join(", "),
          visibility,
          status,
          date:
            status === "Scheduled"
              ? date
              : status === "Published"
                ? "Just now"
                : "Not scheduled",
          firstComment:
            firstComment.trim(),
          altText: altText.trim(),
          hasMedia: Boolean(file),
          media: file,
          thumbnail,
        },
        (progress) =>
          setUploadProgress(progress),
      );

      navigate("/dashboard");
    } catch (error) {
      setSubmitError(
        error?.message ||
          "Publishing failed. Check the selected platform connections and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        grid
        min-w-0
        items-start
        gap-5
        lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]
        xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]
        2xl:gap-6
      "
    >
      {/* =======================================================
          EDITOR
      ======================================================== */}

      <section
        className="
          relative
          min-w-0
          overflow-hidden
          rounded-[28px]
          border
          border-stone-200/80
          bg-white/[0.70]
          shadow-[0_22px_70px_rgba(15,23,42,0.06)]
          backdrop-blur-2xl
          transition-colors
          duration-300
          dark:border-white/[0.08]
          dark:bg-[#0d1422]/80
          dark:shadow-[0_24px_75px_rgba(0,0,0,0.28)]
        "
      >
       
        {/* <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-10
            h-px
            bg-gradient-to-r
            from-transparent
            via-orange-400/35
            to-transparent
            dark:via-orange-400/20
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-24
            bg-gradient-to-b
            from-white/45
            to-transparent
            dark:from-white/[0.045]
            dark:to-transparent
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-orange-400/[0.10]
            blur-[100px]
            dark:bg-orange-500/[0.05]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-24
            h-64
            w-64
            rounded-full
            bg-cyan-400/[0.06]
            blur-[100px]
            dark:bg-cyan-500/[0.035]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-1/3
            right-1/4
            h-52
            w-52
            rounded-full
            bg-violet-400/[0.035]
            blur-[90px]
            dark:bg-violet-500/[0.025]
          "
        /> */}

        {/* =====================================================
            EDITOR HEADER
        ====================================================== */}

        <div
          className="
            relative
            border-b
            border-stone-200/70
            px-5
            py-5
            dark:border-white/[0.07]
            sm:px-6
            lg:px-7
          "
        >
          <div className="flex items-start gap-3">
            <div className="relative">
              {/* <div
                className="
                  absolute
                  -inset-1
                  rounded-2xl
                  bg-orange-400/10
                  blur-lg
                  dark:bg-orange-500/[0.07]
                "
              /> */}
{/* 
              <div
                className="
                  relative
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-orange-200/80
                  bg-orange-50
                  text-orange-600
                  shadow-sm
                  dark:border-orange-500/20
                  dark:bg-orange-500/10
                  dark:text-orange-400
                "
              >
                <Sparkles
                  size={18}
                  strokeWidth={1.8}
                />
              </div> */}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="
                    text-base
                    font-black
                    tracking-tight
                    text-stone-900
                    dark:text-white
                  "
                >
                  {editing
                    ? "Edit content"
                    : "Create content"}
                </h2>

                {/* <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-emerald-200/70
                    bg-emerald-50/70
                    px-2
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-emerald-600
                    dark:border-emerald-500/20
                    dark:bg-emerald-500/10
                    dark:text-emerald-400
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-500
                      shadow-[0_0_7px_rgba(16,185,129,0.7)]
                    "
                  />

                  Studio
                </span> */}
              </div>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-xs
                  leading-5
                  text-stone-500
                  dark:text-slate-400
                "
              >
                {editing
                  ? "Update supported local post fields. Published platform content is not changed by this editor."
                  : "Build your post, customize each platform, and publish when you're ready."}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE STEP PROGRESS
            IMPORTANT: md:hidden
        ====================================================== */}

        <div
          className="
            relative
            border-b
            border-stone-200/70
            px-5
            py-4
            dark:border-white/[0.07]
            md:hidden
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-stone-400
                  dark:text-slate-500
                "
              >
                Step {activeStep} of 4
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  font-bold
                  text-stone-900
                  dark:text-white
                "
              >
                {
                  [
                    "Select accounts",
                    "Visibility",
                    "Content",
                    "Publishing",
                  ][activeStep - 1]
                }
              </p>
            </div>

            <span
              className="
                shrink-0
                rounded-full
                border
                border-orange-200/70
                bg-orange-50/70
                px-2.5
                py-1
                text-[9px]
                font-black
                text-orange-600
                dark:border-orange-400/15
                dark:bg-orange-400/[0.06]
                dark:text-orange-400
              "
            >
              {Math.round((activeStep / 4) * 100)}%
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                type="button"
                aria-label={`Open step ${step}`}
                onClick={() => setActiveStep(step)}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-200
                  ${
                    step <= activeStep
                      ? "bg-orange-500"
                      : "bg-stone-200 dark:bg-white/[0.08]"
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <div
          className="
            relative
            space-y-7
            px-5
            py-6
            sm:px-6
            lg:px-7
          "
        >
          {/* ===================================================
              SELECT ACCOUNTS
          ==================================================== */}

          <section>
            <StepHeader
              step={1}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              icon={Send}
              title="Select accounts"
              description="Choose where this post should be published."
            />

            <div
              className={`
                mt-4
                ${
                  activeStep === 1
                    ? "block"
                    : "hidden"
                }
                md:block
              `}
            >
              <PlatformSelector
                selected={platforms}
                onChange={handlePlatformChange}
              />
            </div>
          </section>

          {/* ===================================================
              EDIT WARNING
          ==================================================== */}

          {editing && !canEditExistingPost && (
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-amber-200/80
                bg-amber-50/70
                px-4
                py-3
                text-xs
                font-semibold
                leading-5
                text-amber-800
                dark:border-amber-500/20
                dark:bg-amber-500/[0.08]
                dark:text-amber-300
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-24
                  w-24
                  rounded-full
                  bg-amber-400/10
                  blur-2xl
                "
              />

              <div className="relative">
                This post is already published or failed. The
                connected platforms do not provide a safe edit
                integration here, so external content cannot be
                changed. You can view it from Post History.
              </div>
            </div>
          )}

          {/* ===================================================
              VISIBILITY
          ==================================================== */}

          <section
            className="
              border-t
              border-stone-200/70
              pt-7
              dark:border-white/[0.07]
            "
          >
            <StepHeader
              step={2}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              icon={Eye}
              title="Who can see this post?"
              description="Choose the visibility before publishing."
            />

            <div
              className={`
                mt-4
                ${
                  activeStep === 2
                    ? "block"
                    : "hidden"
                }
                md:block
              `}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <VisibilityOption
                  icon={Eye}
                  title="Public"
                  description="Anyone can see it"
                  value="Public"
                  selected={visibility}
                  onChange={setVisibility}
                />

                <VisibilityOption
                  icon={Users}
                  title="Followers"
                  description="Followers or connections"
                  value="Followers"
                  selected={visibility}
                  onChange={setVisibility}
                />

                <VisibilityOption
                  icon={LockKeyhole}
                  title="Private"
                  description="Only you can see it"
                  value="Private"
                  selected={visibility}
                  onChange={setVisibility}
                />
              </div>

              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-stone-400
                  dark:text-slate-500
                "
              >
                Visibility is saved with the post. Some social
                platforms may apply their own privacy rules when
                publishing.
              </p>
            </div>
          </section>

          {/* ===================================================
              CONTENT
          ==================================================== */}

          <section
            className="
              border-t
              border-stone-200/70
              pt-7
              dark:border-white/[0.07]
            "
          >
            <StepHeader
              step={3}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              icon={ImageIcon}
              title="Content"
              description="Add media and write your platform-specific caption."
            />

            <div
              className={`
                mt-5
                ${
                  activeStep === 3
                    ? "block"
                    : "hidden"
                }
                md:block
              `}
            >
              {/* MEDIA */}

              <div>
                <FieldLabel
                  icon={ImageIcon}
                  label="Media"
                />

                <div className="mt-3">
                  <MediaUploader
                    file={file}
                    onChange={setFile}
                  />
                </div>

                {/* YOUTUBE THUMBNAIL */}

                {platforms.includes("YouTube") && (
                  <div
                    className="
                      mt-5
                      overflow-hidden
                      rounded-2xl
                      border
                      border-red-200/80
                      bg-red-50/60
                      p-4
                      dark:border-red-500/20
                      dark:bg-red-500/[0.06]
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div>
                        <p
                          className="
                            text-xs
                            font-black
                            text-stone-800
                            dark:text-white
                          "
                        >
                          YouTube thumbnail
                        </p>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            leading-4
                            text-stone-500
                            dark:text-slate-400
                          "
                        >
                          Optional custom JPG, PNG or GIF
                          thumbnail.
                        </p>
                      </div>

                      <label
                        className="
                          inline-flex
                          cursor-pointer
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-red-200
                          bg-white
                          px-3
                          py-2
                          text-xs
                          font-bold
                          text-red-700
                          transition
                          hover:bg-red-50
                          dark:border-red-500/20
                          dark:bg-[#15131b]
                          dark:text-red-400
                          dark:hover:bg-red-500/10
                        "
                      >
                        {thumbnail
                          ? "Change image"
                          : "Choose image"}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          className="hidden"
                          onChange={(event) =>
                            setThumbnail(
                              event.target.files?.[0] ||
                                null,
                            )
                          }
                        />
                      </label>
                    </div>

                    {thumbnail && (
                      <p
                        className="
                          mt-2
                          truncate
                          text-[10px]
                          font-semibold
                          text-stone-600
                          dark:text-slate-400
                        "
                      >
                        {thumbnail.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CAPTION */}

              <div className="mt-6">
                <div
                  className="
                    mb-3
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <FieldLabel
                    icon={Type}
                    label="Caption"
                  />

                  <span
                    className="
                      rounded-full
                      border
                      border-stone-200/70
                      bg-stone-50/70
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-stone-400
                      dark:border-white/[0.07]
                      dark:bg-white/[0.03]
                      dark:text-slate-500
                    "
                  >
                    {activePlatform || "No platform"}
                  </span>
                </div>

                {platforms.length > 0 ? (
                  <div
                    className="
                      mb-3
                      flex
                      gap-2
                      overflow-x-auto
                      pb-1
                      [scrollbar-width:none]
                    "
                  >
                    {platforms.map((platform) => {
                      const isActive =
                        activePlatform === platform;

                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() =>
                            setActivePlatform(platform)
                          }
                          className={`
                            shrink-0
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-[11px]
                            font-bold
                            transition-all
                            duration-200
                            ${
                              isActive
                                ? "border-stone-900 bg-stone-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950"
                                : "border-stone-200 bg-white/60 text-stone-500 hover:border-stone-300 hover:bg-white hover:text-stone-800 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.06] dark:hover:text-white"
                            }
                          `}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="
                      mb-3
                      rounded-xl
                      border
                      border-dashed
                      border-stone-200
                      bg-stone-50/70
                      px-4
                      py-3
                      text-xs
                      text-stone-400
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:text-slate-500
                    "
                  >
                    Select at least one platform first.
                  </div>
                )}

                <CaptionEditor
                  value={activeCaption}
                  onChange={handleCaptionChange}
                />
              </div>

              {/* HASHTAGS */}

              <div className="mt-6">
                <FieldLabel
                  icon={HashIcon}
                  label="Hashtags"
                  optional
                />

                <div className="mt-3">
                  <HashtagInput
                    value={hashtags}
                    onChange={setHashtags}
                  />
                </div>
              </div>

              {/* FIRST COMMENT */}

              <div className="mt-6">
                <FieldLabel
                  icon={MessageCircle}
                  label="First comment"
                  optional
                />

                <div className="mt-3">
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-stone-200/80
                      bg-white/55
                      backdrop-blur-xl
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
                      transition-all
                      duration-200
                      focus-within:border-orange-300/80
                      focus-within:bg-white/75
                      focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.05)]
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:shadow-none
                      dark:focus-within:border-orange-400/30
                      dark:focus-within:bg-white/[0.04]
                      dark:focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.04)]
                    "
                  >
                    <textarea
                      value={firstComment}
                      onChange={(event) =>
                        setFirstComment(
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Add a comment to start the conversation..."
                      className="
                        block
                        min-h-[92px]
                        w-full
                        resize-y
                        bg-transparent
                        px-4
                        py-3.5
                        text-sm
                        font-medium
                        leading-6
                        text-stone-900
                        outline-none
                        placeholder:text-stone-400
                        dark:text-white
                        dark:placeholder:text-slate-600
                      "
                    />
                  </div>
                </div>
              </div>

              {/* ALT TEXT */}

              <div className="mt-6">
                <FieldLabel
                  icon={ImageIcon}
                  label="Alt text"
                  optional
                  helper="Accessibility"
                />

                <div className="mt-3">
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-stone-200/80
                      bg-white/55
                      backdrop-blur-xl
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
                      transition-all
                      duration-200
                      focus-within:border-orange-300/80
                      focus-within:bg-white/75
                      focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.05)]
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:shadow-none
                      dark:focus-within:border-orange-400/30
                      dark:focus-within:bg-white/[0.04]
                    "
                  >
                    <input
                      type="text"
                      value={altText}
                      onChange={(event) =>
                        setAltText(event.target.value)
                      }
                      placeholder="Describe your image..."
                      className="
                        block
                        w-full
                        bg-transparent
                        px-4
                        py-3.5
                        text-sm
                        font-medium
                        text-stone-900
                        outline-none
                        placeholder:text-stone-400
                        dark:text-white
                        dark:placeholder:text-slate-600
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              PUBLISHING
          ==================================================== */}

          <section
            className="
              border-t
              border-stone-200/70
              pt-7
              dark:border-white/[0.07]
            "
          >
            <StepHeader
              step={4}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              icon={CalendarClock}
              title="Publishing"
              description="Publish now or enable auto-publish for a future date and time."
            />

            <div
              className={`
                mt-5
                ${
                  activeStep === 4
                    ? "block"
                    : "hidden"
                }
                md:block
              `}
            >
              <SchedulePost
                checked={scheduled}
                onChange={setScheduled}
                date={date}
                setDate={setDate}
              />
            </div>
          </section>
        </div>

        {/* =====================================================
            MOBILE STEP NAVIGATION
        ====================================================== */}

        <div
          className="
            border-t
            border-stone-200/70
            bg-white/25
            px-5
            py-4
            dark:border-white/[0.07]
            dark:bg-white/[0.012]
            sm:px-6
            md:hidden
          "
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveStep((step) =>
                  Math.max(1, step - 1),
                )
              }
              disabled={activeStep === 1}
              className="
                inline-flex
                h-11
                flex-1
                items-center
                justify-center
                rounded-xl
                border
                border-stone-200
                bg-white/70
                px-4
                text-sm
                font-bold
                text-stone-600
                transition
                disabled:cursor-not-allowed
                disabled:opacity-40
                dark:border-white/[0.08]
                dark:bg-white/[0.035]
                dark:text-slate-300
              "
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveStep((step) =>
                  Math.min(4, step + 1),
                )
              }
              disabled={activeStep === 4}
              className="
                inline-flex
                h-11
                flex-1
                items-center
                justify-center
                rounded-xl
                bg-stone-900
                px-4
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-stone-800
                disabled:cursor-not-allowed
                disabled:opacity-40
                dark:bg-white
                dark:text-slate-950
                dark:hover:bg-slate-100
              "
            >
              Next step →
            </button>
          </div>
        </div>

        {/* =====================================================
            ACTION FOOTER
        ====================================================== */}

        <div
          className="
            relative
            border-t
            border-stone-200/70
            bg-white/30
            px-5
            py-4
            dark:border-white/[0.07]
            dark:bg-white/[0.015]
            sm:px-6
            lg:px-7
          "
        >
          <div className="flex flex-col gap-4">
            {/* ERROR */}

            {submitError && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-200/80
                  bg-red-50/70
                  px-3
                  py-2.5
                  text-xs
                  font-semibold
                  leading-5
                  text-red-600
                  dark:border-red-500/20
                  dark:bg-red-500/[0.07]
                  dark:text-red-400
                "
                role="alert"
              >
                {submitError}
              </div>
            )}

            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* STATUS */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-stone-400
                  dark:text-slate-500
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-500
                    shadow-[0_0_8px_rgba(16,185,129,0.7)]
                  "
                />

                {submitting
                  ? `Publishing to ${platforms.join(", ")} · ${uploadProgress}%`
                  : `Visibility: ${visibility}`}
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                "
              >
                <button
                  type="button"
                  onClick={() => save("Draft")}
                  disabled={
                    !canSaveDraft ||
                    submitting
                  }
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-stone-200
                    bg-white/75
                    px-4
                    text-sm
                    font-bold
                    text-stone-700
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-stone-300
                    hover:bg-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                    dark:text-slate-200
                    dark:hover:border-white/[0.14]
                    dark:hover:bg-white/[0.06]
                  "
                >
                  <FileText size={16} />
                  Save draft
                </button>

                <PublishButton
                  onClick={() =>
                    save(
                      scheduled
                        ? "Scheduled"
                        : "Published",
                    )
                  }
                  disabled={
                    !canPublish ||
                    submitting
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            UPLOAD PROGRESS
        ====================================================== */}

        {submitting && (
          <div
            className="
              border-t
              border-stone-200/70
              bg-stone-50/80
              px-5
              py-3
              dark:border-white/[0.07]
              dark:bg-white/[0.02]
              sm:px-6
              lg:px-7
            "
          >
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
                text-xs
                font-bold
                text-stone-600
                dark:text-slate-300
              "
            >
              <span className="animate-pulse">
                {uploadProgress < 90
                  ? "Uploading media..."
                  : "Publishing to every selected platform..."}
              </span>

              <span>{uploadProgress}%</span>
            </div>

            <div
              className="
                h-2
                overflow-hidden
                rounded-full
                bg-stone-200
                dark:bg-white/[0.08]
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-orange-500
                  via-pink-500
                  to-violet-500
                  transition-all
                  duration-300
                "
                style={{
                  width: `${Math.max(
                    uploadProgress,
                    5,
                  )}%`,
                }}
              />
            </div>

            <p
              className="
                mt-2
                text-[10px]
                leading-4
                text-stone-400
                dark:text-slate-500
              "
            >
              Publish completes only when every selected
              platform succeeds. If one fails, completed
              uploads are rolled back.
            </p>
          </div>
        )}
      </section>

      {/* =======================================================
          LIVE PREVIEW
      ======================================================== */}

      <aside
        className="
          min-w-0
          lg:sticky
          lg:top-6
          lg:h-fit
        "
      >
        {/* MOBILE PREVIEW TOGGLE */}

        <button
          type="button"
          onClick={() =>
            setShowMobilePreview(
              (current) => !current,
            )
          }
          className="
            mb-3
            flex
            w-full
            items-center
            justify-between
            rounded-2xl
            border
            border-stone-200/80
            bg-white/65
            px-4
            py-3
            text-left
            shadow-sm
            backdrop-blur-xl
            dark:border-white/[0.08]
            dark:bg-white/[0.025]
            md:hidden
          "
          aria-expanded={showMobilePreview}
        >
          <span>
            <span
              className="
                block
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-stone-400
                dark:text-slate-500
              "
            >
              Live preview
            </span>

            <span
              className="
                mt-1
                block
                text-xs
                font-bold
                text-stone-800
                dark:text-slate-200
              "
            >
              {activePlatform ||
                platforms[0] ||
                "Instagram"}
            </span>
          </span>

          <span
            className="
              grid
              h-8
              w-8
              place-items-center
              rounded-full
              border
              border-stone-200
              bg-white
              text-stone-500
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-300
            "
          >
            {showMobilePreview ? "−" : "+"}
          </span>
        </button>

        {/* PREVIEW CONTENT */}

        <div
          className={`
            ${
              showMobilePreview
                ? "block"
                : "hidden"
            }
            md:block
          `}
        >
          <div
            className="
              mb-3
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-stone-400
                  dark:text-slate-500
                "
              >
                Live preview
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  text-stone-700
                  dark:text-slate-300
                "
              >
                {activePlatform ||
                  platforms[0] ||
                  "Instagram"}
              </p>
            </div>

            <div
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-200/70
                bg-emerald-50/70
                px-2.5
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.1em]
                text-emerald-600
                dark:border-emerald-500/20
                dark:bg-emerald-500/10
                dark:text-emerald-400
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-500
                  shadow-[0_0_7px_rgba(16,185,129,0.7)]
                "
              />

              Live
            </div>
          </div>

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-stone-200/80
              bg-white/[0.60]
              p-2
              shadow-[0_22px_70px_rgba(15,23,42,0.07)]
              backdrop-blur-2xl
              dark:border-white/[0.08]
              dark:bg-[#0d1422]/75
              dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]
              sm:p-3
            "
          >
            {/* PREVIEW EDGE */}

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
                dark:via-orange-400/20
              "
            />

            {/* PREVIEW REFLECTION */}

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

            {/* PREVIEW GLOWS */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-48
                w-48
                rounded-full
                bg-orange-400/10
                blur-[80px]
                dark:bg-orange-500/[0.045]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-20
                -left-20
                h-48
                w-48
                rounded-full
                bg-cyan-400/[0.05]
                blur-[80px]
                dark:bg-cyan-500/[0.025]
              "
            />

            <div className="relative">
              <PostPreview
                caption={`${activeCaption || caption}${
                  hashtags.trim()
                    ? ` ${hashtags.trim()}`
                    : ""
                }`}
                file={file}
                platform={
                  activePlatform ||
                  platforms[0] ||
                  "Instagram"
                }
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   RESPONSIVE STEP HEADER

   MOBILE:
   - clickable
   - number visible
   - +/- visible

   DESKTOP:
   - NOT clickable
   - number hidden
   - +/- hidden
   - behaves like normal section heading
========================================================= */

function StepHeader({
  step,
  activeStep,
  setActiveStep,
  icon: Icon,
  title,
  description,
}) {
  const active = activeStep === step;

  return (
    <button
      type="button"
      onClick={() => setActiveStep(step)}
      className="
        group
        flex
        w-full
        items-center
        gap-3
        rounded-2xl
        text-left
        transition-all
        duration-200
        md:pointer-events-none
        md:cursor-default
        md:rounded-none
      "
      aria-expanded={active}
    >
      {/* ICON */}

      <span
        className={`
          relative
          grid
          h-10
          w-10
          shrink-0
          place-items-center
          rounded-xl
          border
          transition-all
          duration-200
          ${
            active
              ? "border-orange-200/80 bg-orange-50 text-orange-600 shadow-sm dark:border-orange-400/15 dark:bg-orange-400/[0.07] dark:text-orange-400"
              : "border-stone-200/80 bg-white/70 text-stone-400 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-500"
          }
        `}
      >
        <Icon
          size={16}
          strokeWidth={1.8}
        />

        {/* MOBILE ONLY STEP NUMBER */}

        <span
          className={`
            absolute
            -right-1
            -top-1
            grid
            h-4
            min-w-4
            place-items-center
            rounded-full
            px-1
            text-[8px]
            font-black
            md:hidden
            ${
              active
                ? "bg-stone-900 text-white dark:bg-white dark:text-slate-950"
                : "bg-stone-200 text-stone-500 dark:bg-white/[0.10] dark:text-slate-400"
            }
          `}
        >
          {step}
        </span>
      </span>

      {/* TEXT */}

      <span className="min-w-0 flex-1">
        <span
          className="
            block
            text-sm
            font-black
            tracking-tight
            text-stone-900
            dark:text-white
          "
        >
          {title}
        </span>

        <span
          className="
            mt-0.5
            block
            text-xs
            leading-5
            text-stone-500
            dark:text-slate-400
          "
        >
          {description}
        </span>
      </span>

      {/* MOBILE +/- ONLY */}

      <span
        className="
          grid
          h-8
          w-8
          shrink-0
          place-items-center
          rounded-full
          border
          border-stone-200
          bg-white
          text-stone-400
          md:hidden
          dark:border-white/[0.08]
          dark:bg-white/[0.035]
          dark:text-slate-500
        "
      >
        {active ? "−" : "+"}
      </span>
    </button>
  );
}

/* =========================================================
   VISIBILITY OPTION
========================================================= */

function VisibilityOption({
  icon: Icon,
  title,
  description,
  value,
  selected,
  onChange,
}) {
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={active}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-4
        text-left
        transition-all
        duration-200
        ${
          active
            ? "border-stone-900 bg-stone-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.14)] dark:border-white dark:bg-white dark:text-slate-950 dark:shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
            : "border-stone-200 bg-white/60 text-stone-800 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-slate-200 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.05]"
        }
      `}
    >
      {active && (
        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-24
            w-24
            rounded-full
            bg-orange-400/20
            blur-2xl
            dark:bg-orange-500/10
          "
        />
      )}

      <span
        className={`
          relative
          mb-3
          grid
          h-9
          w-9
          place-items-center
          rounded-xl
          transition-transform
          duration-200
          group-hover:scale-105
          ${
            active
              ? "bg-white/15 text-white dark:bg-slate-950/[0.08] dark:text-slate-950"
              : "bg-stone-100 text-stone-500 dark:bg-white/[0.06] dark:text-slate-400"
          }
        `}
      >
        <Icon size={17} />
      </span>

      <span className="relative block text-sm font-bold">
        {title}
      </span>

      <span
        className={`
          relative
          mt-1
          block
          text-xs
          ${
            active
              ? "text-white/70 dark:text-slate-600"
              : "text-stone-400 dark:text-slate-500"
          }
        `}
      >
        {description}
      </span>
    </button>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon: Icon,
  label,
  optional = false,
  helper = "",
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          strokeWidth={1.8}
          className="text-stone-400 dark:text-slate-500"
        />

        <span
          className="
            text-xs
            font-black
            text-stone-700
            dark:text-slate-300
          "
        >
          {label}
        </span>
      </div>

      {optional && (
        <span
          className="
            text-[10px]
            font-medium
            text-stone-400
            dark:text-slate-500
          "
        >
          (optional)
        </span>
      )}

      {helper && (
        <span
          className="
            text-[10px]
            text-stone-400
            dark:text-slate-500
          "
        >
          · {helper}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   HASH ICON
========================================================= */

function HashIcon() {
  return (
    <span
      className="
        text-sm
        font-black
        leading-none
        text-stone-400
        dark:text-slate-500
      "
    >
      #
    </span>
  );
}