// Auth API helpers — bcrypt + JWT based authentication
//
// In dev (Vite), the page is served from http://127.0.0.1:5173.
// Vite proxies /api/* → http://localhost:5001, so we use relative URLs.
//
// In production Electron (file:// origin), Vite proxy is not available,
// so we fall back to the absolute server URL.

const isDevVite = typeof window !== "undefined" && window.location?.protocol !== "file:";
const API_BASE = isDevVite ? "" : "http://localhost:5001";

function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export async function apiSignup({ name, email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function apiRefresh() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return res.json();
  } catch {
    return { success: false };
  }
}

export async function apiLogout() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
    });
    localStorage.removeItem("accessToken");
    return res.json();
  } catch {
    localStorage.removeItem("accessToken");
    return { success: true };
  }
}

export async function apiGetMe() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: authHeaders(),
      credentials: "include",
    });
    return res.json();
  } catch {
    return { success: false };
  }
}
