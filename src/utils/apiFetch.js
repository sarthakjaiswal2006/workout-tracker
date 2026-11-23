/**
 * apiFetch — authenticated fetch wrapper for all API calls.
 * Automatically attaches the JWT access token and uses the correct base URL.
 */

const isDevVite = typeof window !== "undefined" && window.location?.protocol !== "file:";
const API_BASE = isDevVite ? "" : "http://localhost:5001";

export default async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  return res;
}
