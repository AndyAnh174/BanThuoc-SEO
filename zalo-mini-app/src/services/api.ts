/**
 * Base API client for Mini App
 * - Auto-attach Zalo JWT token
 * - Auto-refresh on 401
 * - Base URL: banthuocsi.vn/api/miniapp
 */

const BASE = import.meta.env.VITE_API_BASE_URL || "https://banthuocsi.vn/api/miniapp";

function getToken(): string | null {
  try {
    return localStorage.getItem("zaloAccessToken") || localStorage.getItem("accessToken");
  } catch { return null; }
}
function setToken(t: string) { localStorage.setItem("zaloAccessToken", t); }
function clearToken() { localStorage.removeItem("zaloAccessToken"); localStorage.removeItem("accessToken"); }

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const r = await fetch(`${BASE}/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (r.ok) {
          const data = await r.json();
          setToken(data.access);
          headers["Authorization"] = `Bearer ${data.access}`;
          res = await fetch(url, { ...options, headers });
        }
      } catch { /* refresh failed */ }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw { status: res.status, ...err };
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Convenience methods
export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: any) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(path: string, body?: any) => request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
};
