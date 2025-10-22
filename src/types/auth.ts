export interface AuthUserPayload {
    csrfToken: string;
    refreshToken: string;
    success: boolean;
    token: string;
}

export interface AuthOtpChallengePayload {
    success: boolean;
    otpRequired: boolean;
    otpToken: string;
    temporaryToken?: string;
    expiresAt?: string;
    expiresInSeconds?: number;
    message?: string;
}
