import { useEffect } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import ConnectedAccounts from "../social/ConnectedAccounts.jsx";
import ConnectAccount from "../social/ConnectAccount.jsx";
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";

export default function SocialAccounts() {
  const { setError, setNotice, refreshAccounts } = useSocialAccounts();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const connected = params.get("social_connected");
    const error = params.get("social_error");
    const platform = connected || "social account";

    if (error) {
      const message = error.toLowerCase();

      if (
        message.includes("feature unavailable") ||
        message.includes("temporarily unavailable")
      ) {
        setError(
          "Facebook is not allowing this connection yet. Check the app mode, tester role, and Facebook Login settings in Meta Developer Dashboard."
        );
      } else if (
        message.includes("client secret") ||
        message.includes("invalid oauth")
      ) {
        setError(
          "The OAuth client secret is invalid. Update the correct provider secret in Backend/.env and restart the backend."
        );
      } else if (message.includes("cancel")) {
        setError(
          `The ${platform} connection was cancelled. No account was connected.`
        );
      } else {
        setError(`Could not connect ${platform}: ${error}`);
      }
    }

    if (connected) {
      setNotice({
        type: "success",
        message: `${connected} connected successfully.`,
      });

      refreshAccounts();
    }

    if (connected || error) {
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${window.location.hash}`
      );
    }
  }, [setError, setNotice, refreshAccounts]);

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#f6f7fb]
        text-slate-900
        dark:bg-[#070b14]
        dark:text-white
      "
    >
      {/* =====================================================
          PAGE AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -right-32
            -top-32
            h-96
            w-96
            rounded-full
            bg-orange-400/[0.06]
            blur-[120px]
            dark:bg-orange-500/[0.045]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -left-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-400/[0.05]
            blur-[130px]
            dark:bg-cyan-400/[0.035]
          "
        />
      </div>

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[1600px]
          px-3
          py-4
          sm:px-5
          sm:py-6
          md:px-6
          lg:px-8
          lg:py-8
          xl:px-10
          2xl:px-12
        "
      >
        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="min-w-0">
          <PageHeader
            eyebrow="Connections"
            title="Social accounts"
            description="Connect your publishing channels and manage where your content gets published."
          />
        </div>

        {/* ===================================================
            MAIN CONNECTION PANEL
        ==================================================== */}

        <section
          className="
            relative
            mt-6
            w-full
            min-w-0
            overflow-hidden
            rounded-[24px]
            border
            border-stone-200/80
            bg-white/75
            shadow-[0_18px_60px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            sm:rounded-[28px]
            dark:border-white/[0.08]
            dark:bg-[#0d1422]/80
            dark:shadow-[0_22px_70px_rgba(0,0,0,0.3)]
          "
        >
          {/* =================================================
              PANEL AMBIENT GLOW
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-28
              h-72
              w-72
              rounded-full
              bg-orange-400/[0.08]
              blur-[100px]
              dark:bg-orange-500/[0.055]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              left-1/3
              h-56
              w-56
              rounded-full
              bg-blue-400/[0.05]
              blur-[90px]
              dark:bg-blue-500/[0.04]
            "
          />

          {/* =================================================
              TOP EDGE
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-10
              h-px
              bg-gradient-to-r
              from-transparent
              via-orange-400/30
              to-transparent
              dark:via-orange-400/20
            "
          />

          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              relative
              w-full
              min-w-0
              overflow-hidden
              border-b
              border-stone-200/70
              bg-gradient-to-br
              from-white
              via-white/90
              to-stone-50/80
              px-4
              py-5
              sm:px-6
              sm:py-6
              lg:px-7
              dark:border-white/[0.07]
              dark:from-[#101827]
              dark:via-[#0d1422]
              dark:to-[#0b1220]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-24
                h-64
                w-64
                rounded-full
                bg-orange-400/[0.07]
                blur-3xl
                dark:bg-orange-500/[0.055]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                left-1/3
                h-48
                w-48
                rounded-full
                bg-blue-400/[0.05]
                blur-3xl
                dark:bg-blue-500/[0.035]
              "
            />

            <div
              className="
                relative
                flex
                min-w-0
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* Header title */}

              <div className="flex min-w-0 max-w-full items-start gap-3 sm:gap-4">
                <div
                  className="
                    relative
                    grid
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    border
                    border-stone-200/80
                    bg-stone-950
                    text-white
                    shadow-[0_8px_25px_rgba(15,23,42,0.14)]
                    dark:border-white/[0.08]
                    dark:bg-white
                    dark:text-slate-950
                    dark:shadow-[0_8px_25px_rgba(255,255,255,0.05)]
                  "
                >
                  <span
                    className="
                      pointer-events-none
                      absolute
                      -inset-1
                      rounded-3xl
                      bg-orange-400/10
                      blur-lg
                      dark:bg-orange-400/[0.07]
                    "
                  />

                  <ShieldCheck
                    size={18}
                    strokeWidth={1.9}
                    className="relative z-10"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2
                      className="
                        min-w-0
                        break-words
                        text-sm
                        font-black
                        tracking-tight
                        text-stone-950
                        sm:text-base
                        dark:text-white
                      "
                    >
                      Publishing connections
                    </h2>

                    <span
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-emerald-200/70
                        bg-emerald-50/80
                        px-2
                        py-1
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-emerald-700
                        sm:text-[9px]
                        dark:border-emerald-400/15
                        dark:bg-emerald-400/[0.08]
                        dark:text-emerald-400
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-500
                          shadow-[0_0_7px_rgba(16,185,129,0.5)]
                          dark:bg-emerald-400
                        "
                      />

                      Secure
                    </span>
                  </div>

                  <p
                    className="
                      mt-1.5
                      max-w-2xl
                      break-words
                      text-xs
                      leading-5
                      text-stone-500
                      sm:text-sm
                      dark:text-slate-400
                    "
                  >
                    Connect and manage the social platforms used by your
                    publishing workflow.
                  </p>
                </div>
              </div>

              {/* OAuth badge */}

              <div className="flex shrink-0">
                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-stone-200/80
                    bg-white/70
                    px-3
                    py-2
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-stone-500
                    shadow-sm
                    backdrop-blur-sm
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-400
                  "
                >
                  <Sparkles
                    size={11}
                    className="shrink-0 text-orange-500 dark:text-orange-400"
                  />

                  OAuth protected
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              MAIN
          ================================================== */}

          <div
            className="
              grid
              min-w-0
              w-full
              grid-cols-1
              lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)]
            "
          >
            {/* =================================================
                CONNECTED ACCOUNTS
            ================================================== */}

            <div
              className="
                min-w-0
                w-full
                overflow-hidden
                border-b
                border-stone-200/80
                p-4
                sm:p-6
                lg:border-b-0
                lg:border-r
                lg:p-7
                dark:border-white/[0.07]
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-stone-400
                    sm:text-[10px]
                    dark:text-slate-500
                  "
                >
                  Connected
                </p>

                <h3
                  className="
                    mt-1
                    break-words
                    text-base
                    font-black
                    tracking-tight
                    text-stone-950
                    sm:text-lg
                    dark:text-white
                  "
                >
                  Your social accounts
                </h3>

                <p
                  className="
                    mt-1.5
                    max-w-2xl
                    break-words
                    text-xs
                    leading-5
                    text-stone-500
                    sm:text-sm
                    dark:text-slate-400
                  "
                >
                  View, reconnect or disconnect the accounts already linked to
                  your publishing workspace.
                </p>
              </div>

              <div className="mt-5 w-full min-w-0 max-w-full overflow-hidden">
                <ConnectedAccounts />
              </div>
            </div>

            {/* =================================================
                CONNECT NEW ACCOUNT
            ================================================== */}

            <div
              className="
                relative
                min-w-0
                w-full
                overflow-hidden
                bg-stone-50/60
                p-4
                sm:p-6
                lg:p-7
                dark:bg-[#0a111e]/70
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  top-1/3
                  h-44
                  w-44
                  rounded-full
                  bg-emerald-400/[0.04]
                  blur-[80px]
                  dark:bg-emerald-500/[0.035]
                "
              />

              <div className="relative min-w-0">
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-stone-400
                    sm:text-[10px]
                    dark:text-slate-500
                  "
                >
                  Add channel
                </p>

                <h3
                  className="
                    mt-1
                    break-words
                    text-base
                    font-black
                    tracking-tight
                    text-stone-950
                    sm:text-lg
                    dark:text-white
                  "
                >
                  Connect an account
                </h3>

                <p
                  className="
                    mt-1.5
                    max-w-xl
                    break-words
                    text-xs
                    leading-5
                    text-stone-500
                    sm:text-sm
                    dark:text-slate-400
                  "
                >
                  Connect another platform to expand where your content can be
                  published.
                </p>
              </div>

              <div className="relative mt-5 w-full min-w-0 max-w-full overflow-hidden">
                <ConnectAccount />
              </div>

              {/* =================================================
                  SECURITY NOTE
              ================================================== */}

              <div
                className="
                  relative
                  mt-4
                  w-full
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-stone-200/80
                  bg-white/70
                  px-3.5
                  py-3.5
                  shadow-sm
                  backdrop-blur-sm
                  sm:px-4
                  dark:border-white/[0.07]
                  dark:bg-white/[0.035]
                  dark:shadow-none
                "
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className="
                      mt-1.5
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-emerald-500
                      shadow-[0_0_7px_rgba(16,185,129,0.5)]
                      dark:bg-emerald-400
                    "
                  />

                  <p
                    className="
                      min-w-0
                      break-words
                      text-[10px]
                      leading-5
                      text-stone-400
                      sm:text-xs
                      dark:text-slate-500
                    "
                  >
                    Authorization is handled securely through the selected
                    platform&apos;s OAuth flow. Disconnecting an account does
                    not delete your existing posts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER META
        ====================================================== */}

        <div
          className="
            mt-3
            flex
            min-w-0
            flex-col
            gap-1
            px-1
            text-[10px]
            leading-5
            text-stone-400
            sm:flex-row
            sm:items-center
            sm:justify-between
            dark:text-slate-600
          "
        >
          <span>Social publishing workspace</span>
          <span>Secure OAuth authorization</span>
        </div>
      </div>
    </div>
  );
}