//import "server-only";

// Use Web Crypto APIs so this module can be used in Edge runtime (middleware)
// This module now only exports the cookie name used for admin session
export const ADMIN_SESSION_COOKIE = "admin_session";

// Some older deployments used different cookie keys when persisting the
// admin auth token (for example `authToken`). We keep a small list of
// aliases so that we can gracefully read sessions that were stored with
// the legacy names without forcing users to login again.
export const LEGACY_ADMIN_SESSION_COOKIES = ["authToken", "auth_token"] as const;

export const ADMIN_SESSION_COOKIE_CANDIDATES = [
  ADMIN_SESSION_COOKIE,
  ...LEGACY_ADMIN_SESSION_COOKIES,
] as const;

type CookieGetter = (name: string) => string | undefined;

export function resolveAdminSessionToken(getCookie: CookieGetter): string | undefined {
  for (const name of ADMIN_SESSION_COOKIE_CANDIDATES) {
    const value = getCookie(name);
    if (value) {
      return value;
    }
  }
  return undefined;
}

// legacy/local helpers removed: authentication and session tokens
// are now handled by the backend service. Frontend should call the
// backend auth endpoints to login and validate sessions.

export const clearAdminSessionCookie = () => "";

