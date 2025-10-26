export interface AuthUserPayload {
    csrfToken?: string;
    refreshToken?: string;
    success: boolean;
    token?: string;
    // When the backend requires 2FA, these fields may be present
    requires2FA?: boolean;
    tempToken?: string;
    challengeId?: string;
    message?: string;
    error?: string;
    expiresIn?: number;
    // Absolute expiry timestamp (seconds since epoch). Preferred over expiresIn.
    expiresAt?: number;
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
