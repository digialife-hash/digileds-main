import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routs/Routers";
import "./App.css";
import SitePopup from "./components/ui/SitePopup";
import CookieConsent from "./components/ui/CookieConsent";
import { TenantProvider } from "./context/TenantContext.jsx";

const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme-mode");
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function App() {
  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = getStoredTheme();
      const root = document.documentElement;
      const isDark = nextTheme === "dark";

      root.setAttribute("data-theme", nextTheme);
      root.classList.toggle("dark", isDark);
    };

    syncTheme();

    const onThemeChange = () => syncTheme();
    window.addEventListener("themechange", onThemeChange);

    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const storedTheme = getStoredTheme();
      if (currentTheme !== storedTheme) {
        syncTheme();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("themechange", onThemeChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_SITE_API_URL || ""}/api/site-settings`,
    )
      .then((response) => {
        if (!response.ok)
          throw new Error(`Settings request failed: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        const row = result?.data?.find(
          (item) => item.key_name === "site_config",
        );
        const config = row?.value;
        if (!config || typeof config !== "object") return;
        if (config.site?.name) document.title = config.site.name;
        if (config.assets?.favicon) {
          const favicon =
            document.querySelector('link[rel="icon"]') ||
            document.createElement("link");
          favicon.rel = "icon";
          favicon.href = /^https?:\/\//i.test(config.assets.favicon)
            ? config.assets.favicon
            : `${import.meta.env.VITE_SITE_API_URL || ""}/${config.assets.favicon.replace(/^\/+/, "")}`;
          document.head.appendChild(favicon);
        }
        if (config.assets?.og_image) {
          const meta =
            document.querySelector('meta[property="og:image"]') ||
            document.createElement("meta");
          meta.setAttribute("property", "og:image");
          meta.content = config.assets.og_image;
          document.head.appendChild(meta);
        }
      })
      .catch((error) =>
        console.error("Site settings bootstrap failed:", error),
      );
  }, []);

  return (
    <TenantProvider>
      <RouterProvider router={router} />
      <SitePopup />
      <CookieConsent />
    </TenantProvider>
  );
}

export default App;
