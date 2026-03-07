import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Attempt a silent token refresh. Returns true if the new tokens were set. */
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // De-duplicate concurrent refresh attempts into a single request
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${env.apiUrl}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    credentials: "include", // send httpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  // Access token expired → try to refresh once, then replay the request
  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, init, true /* isRetry */);
    }
    // Refresh failed — clear the session marker and redirect to login
    if (typeof window !== "undefined") {
      const { pathname } = window.location;
      const isAuthRoute = pathname === "/login" || pathname === "/signup";
      if (!isAuthRoute) {
        document.cookie = "session=; path=/; max-age=0";
        window.location.href = "/login";
      }
    }
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (body as { message?: string | string[] }).message ?? res.statusText;
    throw new ApiError(
      res.status,
      Array.isArray(message) ? message.join(", ") : message,
      body,
    );
  }

  // Backend wraps responses: { success, data }
  return ((body as { data?: T }).data ?? body) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" }),
};
