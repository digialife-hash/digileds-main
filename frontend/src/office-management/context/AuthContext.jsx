import { useCallback, useEffect, useState, useMemo } from "react";
import {
  getMeApi,
  loginApi,
  logoutApi,
  logoutAllDevicesApi,
  registerClientApi,
  registerPartnerApi,
  verifySuperAdminLogin2FAApi,
} from "../services/authService";
import { AuthContext } from "./authStore";

const USER_KEY = "office_user";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
  }

  return null;
};

const buildStoredUser = (authData, fallbackUser = null) => {
  const nextUser = authData?.user || authData?.data?.user || authData;

  if (!nextUser) return null;

  const token =
    authData?.token ||
    authData?.data?.token ||
    nextUser.token ||
    fallbackUser?.token;
  return token ? { ...nextUser, token } : nextUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(true);

  const saveAuth = useCallback((authData) => {
    setUser((prevUser) => {
      const nextUser = buildStoredUser(authData, prevUser || getSavedUser());

      if (!nextUser) {
        localStorage.removeItem(USER_KEY);
        return null;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const updateUser = useCallback((userData) => {
    if (!userData) return;
    setUser((prevUser) => {
      if (!prevUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return userData;
      }
      let hasChanged = false;
      for (const key in userData) {
        if (prevUser[key] !== userData[key]) {
          hasChanged = true;
          break;
        }
      }
      if (!hasChanged) return prevUser;

      const updated = { ...prevUser, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = useCallback(async (formData) => {
    const result = await loginApi(formData);

    if (
      result.data?.requiresTwoFactor ||
      result.mfaRequired ||
      result.passkeyRequired
    ) {
      return result;
    }

    saveAuth(result.data || result);
    return result;
  }, [saveAuth]);

  const verifySuperAdminLogin2FA = useCallback(async (payload) => {
    const result = await verifySuperAdminLogin2FAApi(payload);

    saveAuth(result.data || result);
    return result;
  }, [saveAuth]);

  const registerClient = useCallback(async (formData) => {
    const result = await registerClientApi(formData);
    return result;
  }, []);

  const registerPartner = useCallback(async (formData) => {
    const result = await registerPartnerApi(formData);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Local cleanup still completes even if the server logout endpoint fails.
    } finally {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await logoutAllDevicesApi();
    } catch {
      // Local cleanup completes even if server call fails
    } finally {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const result = await getMeApi();

      const sessionUser = result?.data?.user || result?.user;
      if (sessionUser) saveAuth({ user: sessionUser });
    } catch {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        await refreshUser();
      } catch {
        // Errors handled in refreshUser
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  // Sync state across multiple browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === USER_KEY) {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUser);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const authValue = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      loading,
      isAuthenticated: Boolean(user),
      login,
      verifySuperAdminLogin2FA,
      registerClient,
      registerPartner,
      logout,
      logoutAll,
      refreshUser,
    }),
    [user, updateUser, loading, login, verifySuperAdminLogin2FA, registerClient, registerPartner, logout, logoutAll, refreshUser]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
