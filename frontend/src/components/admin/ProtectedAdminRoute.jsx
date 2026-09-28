import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasDashboardPermission } from "../../office-management/utils/canShowMenu";

const SESSION_TIMEOUT_MS = 10000;

export default function ProtectedAdminRoute({ children }) {
  const location = useLocation();

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, SESSION_TIMEOUT_MS);

    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
            ...(() => {
              try {
                const savedUser = JSON.parse(localStorage.getItem("demo_admin_user") || "null");
                return savedUser?.token
                  ? { Authorization: `Bearer ${savedUser.token}` }
                  : {};
              } catch {
                return {};
              }
            })(),
          },
          signal: controller.signal,
        });

        if (!active) {
          return;
        }

        if (!response.ok) {
          setStatus("unauthorized");
          return;
        }

        let data;
        try {
          data = await response.json();
        } catch {
          data = { success: false };
        }

        if (!active) {
          return;
        }

        const user = data?.data?.user || data?.user;
        const allowedRoles = new Set([
          "admin",
          "super_admin",
          "employee",
          "client",
          "referral_partner",
          "hr",
        ]);
        const canOpenDashboard =
          hasDashboardPermission(user, "admin") ||
          hasDashboardPermission(user, "social") ||
          hasDashboardPermission(user, "office");
        if (data?.success === true && allowedRoles.has(user?.role) && canOpenDashboard) {
          if (user) {
            const storedUser = data?.data?.token
              ? { ...user, token: data.data.token }
              : user;
            localStorage.setItem("demo_admin_user", JSON.stringify(storedUser));
            localStorage.setItem("office_user", JSON.stringify(storedUser));
          }
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } catch (error) {
        if (!active) {
          return;
        }

        /*
         * If session API fails or times out,
         * do NOT expose the protected dashboard.
         */
        setStatus("unauthorized");
      } finally {
        if (active) {
          window.clearTimeout(timeoutId);
        }
      }
    };

    verifySession();

    return () => {
      active = false;

      controller.abort();

      window.clearTimeout(timeoutId);
    };
  }, []);

  /* =========================================================
     SESSION CHECKING
  ========================================================== */

  if (status === "checking") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-emerald-50 px-4 py-8">
        {/* Background */}

        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#10284A_1px,transparent_1px),linear-gradient(to_bottom,#10284A_1px,transparent_1px)] [background-size:32px_32px]" />

        {/* Loading Card */}

        <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          </div>

          <p className="text-lg font-bold text-slate-800">
            Checking session...
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Verifying your admin access.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UNAUTHORIZED
  ========================================================== */

  if (status === "unauthorized") {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /* =========================================================
     AUTHORIZED
  ========================================================== */

  return children;
}
