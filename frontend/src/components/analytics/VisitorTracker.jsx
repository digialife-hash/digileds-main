import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_SITE_API_URL || "";

function getId(key) {
  const stored = window.localStorage.getItem(key);
  if (stored) return stored;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

function getSessionId() {
  const stored = window.sessionStorage.getItem("site.visitor.session");
  if (stored) return stored;
  const value = crypto.randomUUID();
  window.sessionStorage.setItem("site.visitor.session", value);
  return value;
}

export default function VisitorTracker() {
  const location = useLocation();
  const [consent, setConsent] = useState(
    () => window.localStorage.getItem("cookie-consent") || "",
  );
  const sessionId = useRef(null);
  const firstPage = useRef(true);

  useEffect(() => {
    const handleConsentChange = (event) => {
      setConsent(event.detail || "");
    };
    window.addEventListener("cookie-consent-changed", handleConsentChange);
    return () => {
      window.removeEventListener(
        "cookie-consent-changed",
        handleConsentChange,
      );
    };
  }, []);

  useEffect(() => {
    if (consent !== "accepted") {
      return undefined;
    }

    if (
      location.pathname.startsWith("/login") ||
      location.pathname.startsWith("/forgot-password") ||
      location.pathname.startsWith("/reset-password")
    ) {
      return undefined;
    }

    const visitorId = getId("site.visitor.id");
    sessionId.current = sessionId.current || getSessionId();

    const send = (event, online = navigator.onLine, isRefresh = false) => {
      const payload = JSON.stringify({
        visitorId,
        sessionId: sessionId.current,
        event,
        isRefresh,
        path: `${location.pathname}${location.search}`,
        title: document.title,
        referrer: document.referrer,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        vendor: navigator.vendor,
        cpuCores: navigator.hardwareConcurrency || 0,
        memoryGb: navigator.deviceMemory || 0,
        touchPoints: navigator.maxTouchPoints || 0,
        online,
      });

      if (event === "heartbeat" && navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API_URL}/api/analytics/track`,
          new Blob([payload], { type: "application/json" }),
        );
        return;
      }

      fetch(`${API_URL}/api/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: event === "page_view",
      }).catch(() => {});
    };

    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isRefresh = firstPage.current && navigationEntry?.type === "reload";
    send("page_view", navigator.onLine, isRefresh);
    firstPage.current = false;
    const intervalId = window.setInterval(() => send("heartbeat"), 30000);
    const updateOnlineStatus = () => send("heartbeat");
    const markOffline = () => send("offline", false);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    window.addEventListener("pagehide", markOffline);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("pagehide", markOffline);
    };
  }, [consent, location.pathname, location.search]);

  return null;
}
