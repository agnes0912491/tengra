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

// When the backend responds that an OTP/challenge is required for admin
// authentication we model that shape separately. It is similar to
// AuthUserPayload but explicitly carries the OTP challenge token and
// a flag indicating an OTP is required.
export interface AuthOtpChallengePayload {
    success: boolean;
    // Indicates the server requires an OTP to complete authentication
    otpRequired: true;
    // Short-lived token used by the client to present the OTP to the server
    otpToken?: string;
    // A temporary auth token that may be returned for resend flows
    tempToken?: string;
    // Optional human-readable message
    message?: string;
    // Optional machine-readable error code
    error?: string;
    // Absolute expiry timestamp (seconds since epoch)
    expiresAt?: number;
}