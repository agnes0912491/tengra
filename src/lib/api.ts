"use client";

/**
 * Centeralized API utility for Tengra Frontend.
 * Handles:
 * 1. Automatic Authorization header injection.
 * 2. Automatic token refresh on 401 Unauthorized status.
 * 3. Request queueing during refresh to prevent multiple refresh calls.
 */

const API_BASE =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    (typeof window === "undefined" ? "http://127.0.0.1:5000" : "http://localhost:5000");

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
}

/**
 * Basic fetch wrapper that adds Authorization header.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const extendedOptions = {
        ...options,
        headers,
    };

    const response = await fetch(url.startsWith("http") ? url : `${API_BASE}${url}`, extendedOptions);

    // If 401, attempt refresh
    if (response.status === 401 && typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            // No refresh token, cant refresh. Probably session expired/invalid.
            return response;
        }

        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    const newToken = data.token;
                    const newRefreshToken = data.refreshToken;

                    if (newToken) {
                        localStorage.setItem("authToken", newToken);
                        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

                        isRefreshing = false;
                        onRefreshed(newToken);
                    } else {
                        throw new Error("No token returned from refresh");
                    }
                } else {
                    throw new Error("Refresh request failed");
                }
            } catch (error) {
                console.error("[API] Token refresh failed:", error);
                isRefreshing = false;

                // Clear tokens and let the app handle logout
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");

                // We can't easily trigger a logout from here without a circular dependency 
                // usually, but we can window.location.href or dispatch a custom event.
                window.dispatchEvent(new CustomEvent("tengra-auth-failure"));

                return response; // Original 401
            }
        }

        // Wait for the refresh to complete
        return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
                // Retry the original request with the new token
                headers.set("Authorization", `Bearer ${newToken}`);
                resolve(fetch(url.startsWith("http") ? url : `${API_BASE}${url}`, {
                    ...options,
                    headers,
                }));
            });
        });
    }

    return response;
}

export const api = {
    get: (url: string, options?: RequestInit) => fetchWithAuth(url, { ...options, method: "GET" }),
    post: (url: string, body?: any, options?: RequestInit) =>
        fetchWithAuth(url, {
            ...options,
            method: "POST",
            headers: { "Content-Type": "application/json", ...options?.headers },
            body: body ? JSON.stringify(body) : undefined
        }),
    put: (url: string, body?: any, options?: RequestInit) =>
        fetchWithAuth(url, {
            ...options,
            method: "PUT",
            headers: { "Content-Type": "application/json", ...options?.headers },
            body: body ? JSON.stringify(body) : undefined
        }),
    delete: (url: string, options?: RequestInit) => fetchWithAuth(url, { ...options, method: "DELETE" }),
    fetch: fetchWithAuth,
};
