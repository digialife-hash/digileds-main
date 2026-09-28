import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TenantContext = createContext({
  tenant: null,
  loading: true,
  error: "",
});

function applyTenantBranding(tenant) {
  const branding = tenant?.branding || {};
  const root = document.documentElement;
  const variables = {
    "--tenant-primary": branding.primaryColor,
    "--tenant-secondary": branding.secondaryColor,
  };

  Object.entries(variables).forEach(([name, value]) => {
    if (value) root.style.setProperty(name, value);
  });

  if (branding.title) document.title = branding.title;
  if (branding.favicon) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.favicon;
  }

  if (branding.logo) {
    document
      .querySelectorAll("[data-tenant-logo]")
      .forEach((element) => {
        element.src = branding.logo;
      });
  }
}

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tenant/current", {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Tenant configuration unavailable.");
        }
        return data.tenant;
      })
      .then((currentTenant) => {
        if (cancelled) return;
        setTenant(currentTenant);
        applyTenantBranding(currentTenant);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ tenant, loading, error }),
    [tenant, loading, error],
  );
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext);
}
