import { authenticateUserWithPassword, getAllUsers, getUserWithToken } from "../db";

export type Role = "admin" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
}; 

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const authToken = await authenticateUserWithPassword(email, password);
  if (!authToken) {
    return null;
  }

  const user = await getUserWithToken(authToken.token);

  if (!user) {
    return null;
  }

  return user;
}

export async function getUsers(token: string): Promise<User[]> {
  const users = await getAllUsers(token);
  return users;
}
