import { AuthUserPayload } from "@/types/auth";
import {
  authenticateUserWithPassword,
  getAllUsers,
  getUserWithToken,
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

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ authToken: AuthUserPayload; user: User } | null> {
  const authToken = await authenticateUserWithPassword(email, password);
  if (!authToken?.token) {
    return null;
  }

  const user = await getUserWithToken(authToken.token);

  if (!user) {
    return null;
  }

  return { authToken, user };
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ authToken: AuthUserPayload; user: User } | null> {
  const authToken = await authenticateUserWithPassword(email, password);
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
