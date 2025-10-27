import { AuthUserPayload, AuthOtpChallengePayload } from "@/types/auth";
import {
  authenticateUserWithPassword,
  getAllUsers,
  getUserWithToken,
  verifyAdminOtp,
} from "../db";

export type Role = "admin" | "user";

export type User = {
  id: string; 
  email: string;
  role: Role;
  username?: string;
  displayName?: string | null;
  avatar?: string | null;
};

type AuthenticatedUser = { authToken: AuthUserPayload; user: User };

export type AdminAuthenticationResult =
  | { status: "authenticated"; auth: AuthenticatedUser }
  | { status: "otpRequired"; challenge: AuthOtpChallengePayload }
  | null;

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticatedUser | null> {
  const authToken = await authenticateUserWithPassword(email, password);
  if (!authToken || typeof authToken !== "object" || !("token" in authToken)) {
    return null;
  }

  const tokenPayload = authToken as AuthUserPayload;

  if (!tokenPayload?.token) {
    return null;
  }

  const user = await getUserWithToken(tokenPayload.token);

  if (!user) {
    return null;
  }

  return { authToken: tokenPayload, user };
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminAuthenticationResult> {
  const authToken = await authenticateUserWithPassword(email, password);
  if (!authToken) {
    return null;
  }

  if (typeof authToken === "object" && "otpRequired" in authToken) {
    const challenge = authToken as AuthOtpChallengePayload;
    if (challenge.otpRequired && challenge.otpToken) {
      return { status: "otpRequired", challenge };
    }
    return null;
  }

  const tokenPayload = authToken as AuthUserPayload;

  if (!tokenPayload?.token) {
    return null;
  }

  const user = await getUserWithToken(tokenPayload.token);

  if (!user || user.role !== "admin") {
    return null;
  }

  return { status: "authenticated", auth: { authToken: tokenPayload, user } };
}

export async function completeAdminLoginWithOtp(
  email: string,
  otpCode: string,
  otpToken: string,
  temporaryToken?: string
): Promise<AuthenticatedUser | null> {
  const authToken = await verifyAdminOtp(
    email,
    otpCode,
    otpToken,
    temporaryToken
  );

  if (!authToken?.token) {
    return null;
  }

  const user = await getUserWithToken(authToken.token);

  if (!user || user.role !== "admin") {
    return null;
  }

  return { authToken, user };
}

export async function getUsers(token: string): Promise<User[]> {
  const users = await getAllUsers(token);
  return users;
}
