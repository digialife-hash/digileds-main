
import React, {
  useEffect,
  useState,
} from "react";

import {
  UserRound,
  Pencil,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  CalendarDays,
  X,
} from "lucide-react";

import {
  Link,
  Navigate,
} from "react-router-dom";


/* =========================================================
   API
========================================================= */

const SITE_API =
  import.meta.env.VITE_SITE_API_URL || "";


/* =========================================================
   PROFILE PAGE
========================================================= */

function Profile() {
  const [
    authenticatedUser,
    setAuthenticatedUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    logoutLoading,
    setLogoutLoading,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    profileMessageType,
    setProfileMessageType,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    phone: "",
  });

  const [
    isDark,
    setIsDark,
  ] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.getAttribute(
        "data-theme"
      ) === "dark"
  );


  /* =======================================================
     LOAD AUTH SESSION
  ======================================================= */

  const loadAuthUser = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${SITE_API}/api/auth/session`,
        {
          credentials: "include",
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !result?.success ||
        !result?.user
      ) {
        setAuthenticatedUser(null);
        return;
      }

      const user =
        result.user;

      setAuthenticatedUser(user);

      setForm({
        name:
          user?.name ||
          user?.fullName ||
          user?.username ||
          "",
        phone:
          user?.phone ||
          user?.mobile ||
          user?.contact ||
          "",
      });
    } catch (error) {
      console.error(
        "Profile session error:",
        error
      );

      setAuthenticatedUser(null);
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadAuthUser();

    const handleFocus = () => {
      loadAuthUser();
    };

    const handleStorage = () => {
      loadAuthUser();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  /* =======================================================
     THEME SYNC
  ======================================================= */

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(
        document.documentElement.getAttribute(
          "data-theme"
        ) === "dark"
      );
    };

    syncTheme();

    const observer =
      new MutationObserver(
        syncTheme
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "data-theme",
        ],
      }
    );

    window.addEventListener(
      "themechange",
      syncTheme
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "themechange",
        syncTheme
      );
    };
  }, []);


  /* =======================================================
     MESSAGE
  ======================================================= */

  const showMessage = (
    message,
    type = "success"
  ) => {
    setProfileMessage(message);
    setProfileMessageType(type);

    window.setTimeout(() => {
      setProfileMessage("");
      setProfileMessageType("");
    }, 4500);
  };


  /* =======================================================
     USER DATA
  ======================================================= */

  const userName =
    authenticatedUser?.name ||
    authenticatedUser?.fullName ||
    authenticatedUser?.username ||
    "User";

  const userEmail =
    authenticatedUser?.email ||
    "Not available";

  const userPhone =
    authenticatedUser?.phone ||
    authenticatedUser?.mobile ||
    authenticatedUser?.contact ||
    "Not added";

  const userRole =
    authenticatedUser?.role ||
    "user";

  const joinedDate =
    authenticatedUser?.createdAt ||
    authenticatedUser?.created_at ||
    null;

  const formattedJoinedDate =
    joinedDate &&
    !Number.isNaN(
      new Date(joinedDate).getTime()
    )
      ? new Date(
          joinedDate
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )
      : "Not available";

  const avatarLetter =
    String(userName)
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";


  /* =======================================================
     EDIT HANDLERS
  ======================================================= */

  const handleEditOpen = () => {
    setForm({
      name:
        authenticatedUser?.name ||
        authenticatedUser?.fullName ||
        authenticatedUser?.username ||
        "",
      phone:
        authenticatedUser?.phone ||
        authenticatedUser?.mobile ||
        authenticatedUser?.contact ||
        "",
    });

    setProfileMessage("");
    setProfileMessageType("");

    setEditing(true);
  };


  const handleEditClose = () => {
    if (saving) {
      return;
    }

    setEditing(false);

    setForm({
      name:
        authenticatedUser?.name ||
        authenticatedUser?.fullName ||
        authenticatedUser?.username ||
        "",
      phone:
        authenticatedUser?.phone ||
        authenticatedUser?.mobile ||
        authenticatedUser?.contact ||
        "",
    });
  };


  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSaveProfile = async (
    event
  ) => {
    event.preventDefault();

    const cleanName =
      form.name.trim();

    const cleanPhone =
      form.phone.trim();

    if (!cleanName) {
      showMessage(
        "Please enter your name.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${SITE_API}/api/auth/profile`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
              phone: cleanPhone,
            }),
          }
        );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to update your profile."
        );
      }

      const updatedUser =
        result?.user ||
        result?.data?.user ||
        {
          ...authenticatedUser,
          name: cleanName,
          phone: cleanPhone,
        };

      setAuthenticatedUser(
        updatedUser
      );

      setForm({
        name:
          updatedUser?.name ||
          cleanName,
        phone:
          updatedUser?.phone ||
          cleanPhone,
      });

      setEditing(false);

      showMessage(
        "Your profile has been updated.",
        "success"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      showMessage(
        error?.message ||
          "Unable to update your profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await fetch(
        `${SITE_API}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept:
              "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      localStorage.removeItem(
        "demo_admin_user"
      );

      localStorage.removeItem(
        "office_user"
      );

      setAuthenticatedUser(null);
      setLogoutLoading(false);

      window.location.assign("/");
    }
  };


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
          ${
            isDark
              ? "bg-slate-950 text-white"
              : "bg-[#F7FAF9] text-slate-900"
          }
        `}
      >
        <div className="text-center">

          <div
            className={`
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-emerald-500/10"
                  : "bg-emerald-50"
              }
            `}
          >
            <Loader2
              size={24}
              className="
                animate-spin
                text-emerald-600
              "
            />
          </div>

          <p
            className={`
              mt-4
              text-sm
              font-medium
              ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            `}
          >
            Loading profile...
          </p>

        </div>
      </main>
    );
  }


  /* =======================================================
     LOGIN REQUIRED
  ======================================================= */

  if (!authenticatedUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* =======================================================
     MAIN UI
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
        ${
          isDark
            ? "bg-slate-950 text-white"
            : "bg-[#F7FAF9] text-slate-900"
        }
      `}
    >

      {/* ===================================================
          MESSAGE
      =================================================== */}

      {profileMessage && (
        <div
          className="
            fixed
            right-4
            top-5
            z-[9999]
            w-[calc(100%-2rem)]
            max-w-sm
          "
        >
          <div
            className={`
              flex
              items-start
              gap-3
              border
              px-4
              py-3.5
              shadow-lg
              ${
                profileMessageType ===
                "success"
                  ? isDark
                    ? `
                      border-emerald-500/20
                      bg-slate-900
                      text-emerald-300
                    `
                    : `
                      border-emerald-200
                      bg-white
                      text-emerald-700
                    `
                  : isDark
                    ? `
                      border-red-500/20
                      bg-slate-900
                      text-red-300
                    `
                    : `
                      border-red-200
                      bg-white
                      text-red-700
                    `
              }
            `}
          >
            {profileMessageType ===
            "success" ? (
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <XCircle
                size={19}
                className="mt-0.5 shrink-0"
              />
            )}

            <p className="text-sm font-medium leading-6">
              {profileMessage}
            </p>

          </div>
        </div>
      )}


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          mx-auto
          max-w-5xl
        "
      >

        {/* =================================================
            PAGE HEADER
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

            <p
              className="
                text-sm
                font-semibold
                text-emerald-600
                dark:text-emerald-400
              "
            >
              My Account
            </p>

            <h1
              className="
                mt-1
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
              "
            >
              Profile
            </h1>

            <p
              className={`
                mt-2
                max-w-xl
                text-sm
                leading-6
                ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }
              `}
            >
              View and manage your personal
              account information.
            </p>

          </div>


          <Link
            to="/"
            className={`
              inline-flex
              w-fit
              items-center
              justify-center
              px-4
              py-2.5
              text-sm
              font-semibold
              transition-colors
              ${
                isDark
                  ? "text-slate-300 hover:text-emerald-300"
                  : "text-slate-600 hover:text-emerald-600"
              }
            `}
          >
            Back to Home
          </Link>

        </div>


        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section
          className={`
            overflow-hidden
            border
            ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >

          <div
            className="
              flex
              flex-col
              gap-6
              p-6
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-8
            "
          >

            {/* USER IDENTITY */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-4
                sm:gap-5
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EAF6F0]
                  text-xl
                  font-bold
                  text-[#227955]
                  dark:bg-emerald-500/10
                  dark:text-emerald-300
                  sm:h-20
                  sm:w-20
                  sm:text-2xl
                "
              >
                {avatarLetter}
              </div>


              <div className="min-w-0">

                <h2
                  className="
                    truncate
                    text-xl
                    font-bold
                    sm:text-2xl
                  "
                >
                  {userName}
                </h2>

                <p
                  className={`
                    mt-1
                    truncate
                    text-sm
                    ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  {userEmail}
                </p>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    text-xs
                    font-medium
                  "
                >
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-emerald-600
                      dark:text-emerald-400
                    "
                  >
                    <CheckCircle2
                      size={14}
                    />

                    Account active
                  </span>

                  <span
                    className={`
                      hidden
                      h-1
                      w-1
                      rounded-full
                      sm:block
                      ${
                        isDark
                          ? "bg-slate-700"
                          : "bg-slate-300"
                      }
                    `}
                  />

                  <span
                    className={
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  >
                    {userRole === "user"
                      ? "Customer account"
                      : userRole}
                  </span>

                </div>

              </div>

            </div>


            {/* EDIT BUTTON */}

            <button
              type="button"
              onClick={handleEditOpen}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                bg-[#10284A]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#0B1E38]
                sm:w-auto
              "
            >
              <Pencil size={16} />

              Edit Profile
            </button>

          </div>

        </section>


        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2
              className="
                text-lg
                font-bold
                sm:text-xl
              "
            >
              Personal information
            </h2>

            <p
              className={`
                mt-1
                text-sm
                ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }
              `}
            >
              Your account information
              currently saved with us.
            </p>

          </div>


          <div
            className={`
              divide-y
              border
              ${
                isDark
                  ? "divide-slate-800 border-slate-800 bg-slate-900"
                  : "divide-slate-100 border-slate-200 bg-white"
              }
            `}
          >

            {/* EMAIL */}

            <div
              className="
                flex
                flex-col
                gap-3
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  <Mail size={18} />
                </div>

                <div>

                  <p
                    className={`
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    Email address
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {userEmail}
                  </p>

                </div>

              </div>

              <span
                className={`
                  text-xs
                  ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }
                `}
              >
                Cannot be changed here
              </span>

            </div>


            {/* PHONE */}

            <div
              className="
                flex
                flex-col
                gap-3
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500/10
                    text-emerald-600
                    dark:text-emerald-400
                  "
                >
                  <Phone size={18} />
                </div>

                <div>

                  <p
                    className={`
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    Phone number
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {userPhone}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleEditOpen}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-emerald-600
                  transition
                  hover:text-emerald-700
                  dark:text-emerald-400
                  dark:hover:text-emerald-300
                "
              >
                <Pencil size={14} />

                Edit
              </button>

            </div>


            {/* MEMBER SINCE */}

            <div
              className="
                flex
                flex-col
                gap-3
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-500/10
                    text-violet-600
                    dark:text-violet-400
                  "
                >
                  <CalendarDays
                    size={18}
                  />
                </div>

                <div>

                  <p
                    className={`
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    Member since
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {formattedJoinedDate}
                  </p>

                </div>

              </div>

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                `}
              >
                <ShieldCheck
                  size={15}
                  className="text-emerald-500"
                />

                {userRole === "user"
                  ? "Standard account"
                  : "Account protected"}

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ACCOUNT ACTIVITY
        ================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2
              className="
                text-lg
                font-bold
                sm:text-xl
              "
            >
              Account activity
            </h2>

            <p
              className={`
                mt-1
                text-sm
                ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }
              `}
            >
              Quickly access your purchases
              and payment records.
            </p>

          </div>


          <div
            className={`
              divide-y
              border
              ${
                isDark
                  ? "divide-slate-800 border-slate-800 bg-slate-900"
                  : "divide-slate-200 border-slate-200 bg-white"
              }
            `}
          >

            {/* PURCHASES */}

            <Link
              to="/profile/purchases"
              className="
                group
                flex
                items-center
                gap-4
                p-5
                transition
                hover:bg-emerald-50/60
                dark:hover:bg-slate-800/70
                sm:px-6
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                <ShoppingBag
                  size={20}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-bold">
                  My Purchases
                </p>

                <p
                  className={`
                    mt-1
                    text-sm
                    ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  See the products and services
                  you have purchased.
                </p>

              </div>

              <ChevronRight
                size={19}
                className="
                  shrink-0
                  text-slate-400
                  transition
                  group-hover:translate-x-1
                  group-hover:text-emerald-500
                "
              />

            </Link>


            {/* PAYMENTS */}

            <Link
              to="/profile/payments"
              className="
                group
                flex
                items-center
                gap-4
                p-5
                transition
                hover:bg-blue-50/60
                dark:hover:bg-slate-800/70
                sm:px-6
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-blue-600
                  dark:text-blue-400
                "
              >
                <CreditCard
                  size={20}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-bold">
                  Payment History
                </p>

                <p
                  className={`
                    mt-1
                    text-sm
                    ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  Check your payment
                  transactions and statuses.
                </p>

              </div>

              <ChevronRight
                size={19}
                className="
                  shrink-0
                  text-slate-400
                  transition
                  group-hover:translate-x-1
                  group-hover:text-blue-500
                "
              />

            </Link>

          </div>

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <section
          className={`
            mt-8
            border
            p-5
            sm:p-6
            ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >

          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h3 className="text-sm font-bold">
                Sign out of your account
              </h3>

              <p
                className={`
                  mt-1
                  text-sm
                  leading-6
                  ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                `}
              >
                You can sign in again anytime
                using your account.
              </p>

            </div>


            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                border
                border-red-200
                bg-red-50
                px-5
                py-2.5
                text-sm
                font-semibold
                text-red-600
                transition
                hover:bg-red-100
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-red-500/20
                dark:bg-red-500/10
                dark:text-red-300
                dark:hover:bg-red-500/20
              "
            >
              {logoutLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Signing out...
                </>
              ) : (
                <>
                  <LogOut size={16} />

                  Logout
                </>
              )}
            </button>

          </div>

        </section>

      </div>


      {/* ===================================================
          EDIT PROFILE MODAL
      =================================================== */}

      {editing && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-slate-950/45
            px-4
            py-6
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              handleEditClose();
            }
          }}
        >

          <div
            className={`
              w-full
              max-w-lg
              overflow-hidden
              border
              shadow-2xl
              ${
                isDark
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }
            `}
          >

            {/* MODAL HEADER */}

            <div
              className={`
                flex
                items-center
                justify-between
                border-b
                px-5
                py-4
                sm:px-6
                ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-100"
                }
              `}
            >

              <div>

                <h2 className="text-lg font-bold">
                  Edit Profile
                </h2>

                <p
                  className={`
                    mt-1
                    text-xs
                    ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  Update your personal
                  information.
                </p>

              </div>


              <button
                type="button"
                onClick={handleEditClose}
                disabled={saving}
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  transition
                  ${
                    isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }
                `}
                aria-label="Close edit profile"
              >
                <X size={19} />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSaveProfile
              }
              className="p-5 sm:p-6"
            >

              {/* NAME */}

              <div>

                <label
                  htmlFor="profile-name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                  "
                >
                  Full name
                </label>

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  disabled={saving}
                  className={`
                    w-full
                    border
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    ${
                      isDark
                        ? `
                          border-slate-700
                          bg-slate-950
                          text-white
                          placeholder:text-slate-600
                          focus:border-emerald-500
                        `
                        : `
                          border-slate-200
                          bg-white
                          text-slate-900
                          placeholder:text-slate-400
                          focus:border-emerald-500
                        `
                    }
                  `}
                />

              </div>


              {/* EMAIL */}

              <div className="mt-5">

                <label
                  htmlFor="profile-email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                  "
                >
                  Email address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={userEmail}
                  disabled
                  className={`
                    w-full
                    border
                    px-4
                    py-3
                    text-sm
                    ${
                      isDark
                        ? `
                          border-slate-800
                          bg-slate-950/60
                          text-slate-500
                        `
                        : `
                          border-slate-100
                          bg-slate-50
                          text-slate-400
                        `
                    }
                  `}
                />

                <p
                  className={`
                    mt-2
                    text-xs
                    ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                    }
                  `}
                >
                  Your login email is kept
                  unchanged here.
                </p>

              </div>


              {/* PHONE */}

              <div className="mt-5">

                <label
                  htmlFor="profile-phone"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                  "
                >
                  Phone number
                </label>

                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  disabled={saving}
                  className={`
                    w-full
                    border
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    ${
                      isDark
                        ? `
                          border-slate-700
                          bg-slate-950
                          text-white
                          placeholder:text-slate-600
                          focus:border-emerald-500
                        `
                        : `
                          border-slate-200
                          bg-white
                          text-slate-900
                          placeholder:text-slate-400
                          focus:border-emerald-500
                        `
                    }
                  `}
                />

              </div>


              {/* ACTIONS */}

              <div
                className="
                  mt-7
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >

                <button
                  type="button"
                  onClick={
                    handleEditClose
                  }
                  disabled={saving}
                  className={`
                    border
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    transition
                    ${
                      isDark
                        ? `
                          border-slate-700
                          text-slate-300
                          hover:bg-slate-800
                        `
                        : `
                          border-slate-200
                          text-slate-600
                          hover:bg-slate-50
                        `
                    }
                  `}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    bg-[#2E9E6D]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#227955]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}


export default Profile;

