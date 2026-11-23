import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiLogin, apiSignup, apiLogout, apiRefresh, apiGetMe } from "../utils/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const data = await apiGetMe();
        if (data.success) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      }
      // Try silent refresh via cookie
      const refreshData = await apiRefresh();
      if (refreshData.success) {
        localStorage.setItem("accessToken", refreshData.accessToken);
        setUser(refreshData.user);
      } else {
        localStorage.removeItem("accessToken");
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiLogin({ email, password });
    if (data.success) {
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
    }
    return data;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const data = await apiSignup({ name, email, password });
    if (data.success) {
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
