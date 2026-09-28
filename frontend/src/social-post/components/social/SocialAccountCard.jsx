import { useState } from "react";
import {
  CheckCircle2,
  Link2,
  LoaderCircle,
  RefreshCw,
  Unlink,
} from "lucide-react";
import Button from "../common/Button.jsx";

export default function SocialAccountCard({
  account = {},
  onConnect,
  onDisconnect,
  onReconnect,
  onLocationChange,
}) {
  const [busy, setBusy] = useState(false);

  const connected = Boolean(account?.connected);
  const needsReconnect = Boolean(account?.needsReconnect);

  const name =
    account?.name ||
    account?.platform ||
    "Social account";

  const handle =
    account?.handle ||
    account?.username ||
    account?.profileName ||
    "";

  const displayHandle = connected
    ? handle || "Connected and ready"
    : "Not connected";

  const locationTitle = account?.providerData?.locationTitle;
  const locations = account?.providerData?.locations || [];
  const selectedLocation = account?.providerData?.locationName || "";

  const color = account?.color || "#475569";
  const icon = account?.icon || "•";

  const handleClick = async () => {
    if (busy) return;

    setBusy(true);

    try {
      if (connected && needsReconnect) {
        await onReconnect?.(name);
      } else if (connected) {
        await onDisconnect?.(name);
      } else {
        await onConnect?.(name);
      }
    } catch (error) {
      console.error(
        `${connected ? "Disconnect" : "Connect"} failed for ${name}:`,
        error
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className="
        group
        relative
        flex
        w-full
        min-w-0
        max-w-full
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-stone-200/80
        bg-white/75
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-stone-300
        hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
        dark:hover:border-white/[0.13]
        dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.34)]
      "
    >
      {/* =====================================================
          AMBIENT GLOWS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-16
          -top-16
          h-36
          w-36
          rounded-full
          bg-orange-400/[0.07]
          blur-3xl
          transition-opacity
          duration-300
          group-hover:bg-orange-400/[0.10]
          dark:bg-orange-400/[0.045]
          dark:group-hover:bg-orange-400/[0.065]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -right-16
          h-40
          w-40
          rounded-full
          bg-cyan-400/[0.055]
          blur-3xl
          dark:bg-cyan-400/[0.035]
        "
      />

      {/* =====================================================
          TOP EDGE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-20
          h-px
          bg-gradient-to-r
          from-transparent
          via-orange-400/30
          to-transparent
          dark:via-orange-400/20
        "
      />

      {/* =====================================================
          GLASS REFLECTION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-20
          bg-gradient-to-b
          from-white/45
          to-transparent
          dark:from-white/[0.045]
          dark:to-transparent
        "
      />

      {/* =====================================================
          CARD BODY
      ====================================================== */}

      <div className="relative z-10 flex min-w-0 items-start gap-3 p-4 sm:p-5">
        {/* Platform icon */}
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
            bg-white/85
            text-xl
            font-bold
            shadow-[0_10px_25px_rgba(15,23,42,0.055)]
            ring-1
            ring-black/[0.02]
            transition-all
            duration-300
            group-hover:-translate-y-0.5
            group-hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]
            dark:border-white/[0.08]
            dark:bg-white/[0.045]
            dark:ring-white/[0.025]
            dark:shadow-[0_10px_28px_rgba(0,0,0,0.20)]
          "
          style={{ color }}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Account info */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className="
                  min-w-0
                  max-w-full
                  truncate
                  text-sm
                  font-black
                  tracking-tight
                  text-stone-950
                  dark:text-white
                "
                title={name}
              >
                {name}
              </h3>

              <p
                className="
                  mt-1
                  min-w-0
                  max-w-full
                  truncate
                  text-[10px]
                  font-medium
                  text-stone-400
                  dark:text-slate-500
                "
                title={displayHandle}
              >
                {displayHandle}
              </p>

              {/* Google Business location */}
              {name === "Google Business" && connected && locationTitle && (
                <div
                  className="
                    mt-1.5
                    flex
                    min-w-0
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-blue-500
                      shadow-[0_0_8px_rgba(59,130,246,0.45)]
                      dark:bg-blue-400
                    "
                  />

                  <p
                    className="
                      min-w-0
                      truncate
                      text-[10px]
                      font-semibold
                      text-blue-600
                      dark:text-blue-400
                    "
                    title={locationTitle}
                  >
                    Location: {locationTitle}
                  </p>
                </div>
              )}

              {/* Google Business location selector */}
              {name === "Google Business" &&
                connected &&
                locations.length > 1 && (
                  <label className="mt-2.5 block">
                    <span className="sr-only">
                      Publishing location
                    </span>

                    <select
                      value={selectedLocation}
                      onChange={async (event) => {
                        setBusy(true);

                        try {
                          await onLocationChange?.(
                            name,
                            event.target.value
                          );
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      className="
                        w-full
                        max-w-full
                        cursor-pointer
                        appearance-none
                        rounded-xl
                        border
                        border-stone-200/80
                        bg-white/80
                        px-2.5
                        py-2
                        pr-7
                        text-[10px]
                        font-semibold
                        text-stone-700
                        outline-none
                        shadow-sm
                        transition-all
                        duration-200
                        hover:border-blue-200
                        focus:border-blue-400
                        focus:ring-2
                        focus:ring-blue-400/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:border-white/[0.08]
                        dark:bg-white/[0.045]
                        dark:text-slate-300
                        dark:hover:border-blue-400/[0.20]
                        dark:focus:border-blue-400/50
                        dark:focus:ring-blue-400/10
                      "
                    >
                      {locations.map((location) => (
                        <option
                          key={location.name}
                          value={location.name}
                        >
                          Publish to: {location.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
            </div>

            {/* Status */}
            <span
              className={`
                mt-1.5
                h-2
                w-2
                shrink-0
                rounded-full
                shadow-[0_0_9px_currentColor]
                ${
                  connected && !needsReconnect
                    ? "bg-emerald-500 text-emerald-400 dark:bg-emerald-400"
                    : "bg-amber-500 text-amber-400 dark:bg-amber-400"
                }
              `}
              title={connected ? "Connected" : "Not connected"}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          STATUS
      ====================================================== */}

      <div className="relative z-10 px-4 pb-4 sm:px-5">
        <div
          className={`
            flex
            min-w-0
            items-start
            gap-2.5
            rounded-xl
            border
            px-3
            py-2.5
            backdrop-blur-sm
            ${
              connected && !needsReconnect
                ? `
                  border-emerald-200/70
                  bg-emerald-50/70
                  dark:border-emerald-400/[0.14]
                  dark:bg-emerald-400/[0.055]
                `
                : `
                  border-amber-200/70
                  bg-amber-50/70
                  dark:border-amber-400/[0.14]
                  dark:bg-amber-400/[0.055]
                `
            }
          `}
        >
          {connected && !needsReconnect ? (
            <CheckCircle2
              size={14}
              strokeWidth={2}
              className="
                mt-0.5
                shrink-0
                text-emerald-600
                dark:text-emerald-400
              "
            />
          ) : (
            <Link2
              size={14}
              strokeWidth={2}
              className="
                mt-0.5
                shrink-0
                text-amber-600
                dark:text-amber-400
              "
            />
          )}

          <p
            className={`
              min-w-0
              flex-1
              break-words
              text-[10px]
              leading-4
              ${
                connected
                  ? "text-emerald-800/80 dark:text-emerald-300/80"
                  : "text-amber-800/80 dark:text-amber-300/80"
              }
            `}
          >
            {connected && !needsReconnect
              ? name === "Google Business"
                ? "Google Business posts, photos, local post deletion, and customer reviews are available where the official API permits."
                : "This account is connected and ready for publishing."
              : needsReconnect
              ? "Google Business authorization expired. Reconnect to restore automatic token refresh."
              : "Connect this account before publishing content."}
          </p>
        </div>
      </div>

      {/* =====================================================
          ACTION
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mt-auto
          w-full
          border-t
          border-stone-200/70
          bg-stone-50/55
          p-3
          dark:border-white/[0.07]
          dark:bg-white/[0.025]
        "
      >
        <Button
          disabled={busy}
          variant={connected && !needsReconnect ? "ghost" : "primary"}
          onClick={handleClick}
          className="
            !inline-flex
            !h-10
            !w-full
            !min-w-0
            !items-center
            !justify-center
            !gap-2
            !rounded-xl
            !border
            !px-3
            !text-xs
            !font-bold
            !transition-all
            !duration-200
            hover:!shadow-md
            dark:!border-white/[0.08]
          "
        >
          {busy ? (
            <>
              <LoaderCircle
                size={14}
                strokeWidth={2}
                className="shrink-0 animate-spin"
              />

              <span className="truncate">
                Please wait...
              </span>
            </>
          ) : connected && needsReconnect ? (
            <>
              <RefreshCw
                size={14}
                strokeWidth={2}
                className="shrink-0"
              />

              <span className="truncate">
                Reconnect
              </span>
            </>
          ) : connected ? (
            <>
              <Unlink
                size={14}
                strokeWidth={2}
                className="shrink-0"
              />

              <span className="truncate">
                Disconnect
              </span>
            </>
          ) : (
            <>
              <Link2
                size={14}
                strokeWidth={2}
                className="shrink-0"
              />

              <span className="truncate">
                Connect
              </span>
            </>
          )}
        </Button>
      </div>
    </article>
  );
}