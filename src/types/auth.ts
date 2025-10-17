export interface AuthUserPayload {
    csrfToken: string;
    refreshToken: string;
    success: boolean;
    token: string;
}