"use client";

import { useAdminToken } from './use-admin-token';

export function useAuth() {
    const { token } = useAdminToken();
    // Basic implementation: if token exists, assume admin user for dashboard access.
    // In a real app, this should decode the token or fetch user profile.
    const user = token ? { isAdmin: true, id: 'admin', username: 'Admin' } : null;

    return { user, token };
}
