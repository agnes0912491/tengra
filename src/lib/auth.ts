//import "server-only";

// Use Web Crypto APIs so this module can be used in Edge runtime (middleware)
// This module now only exports the cookie name used for admin session
export const ADMIN_SESSION_COOKIE = "admin_session";

// legacy/local helpers removed: authentication and session tokens
// are now handled by the backend service. Frontend should call the
// backend auth endpoints to login and validate sessions.

export const clearAdminSessionCookie = () => "";

