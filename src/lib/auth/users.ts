export type Role = "admin" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type StoredUser = User & {
  password: string;
};

const users: StoredUser[] = [
  {
    id: "1",
    name: "Admin Kullanıcı",
    email: "admin@tengra.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    name: "Stüdyo Üyesi",
    email: "uye@tengra.com",
    password: "uye123",
    role: "user",
  },
];

export function authenticateUser(email: string, password: string): User | null {
  const match = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );

  if (!match) {
    return null;
  }

  const { id, name, role } = match;

  return {
    id,
    name,
    email: match.email,
    role,
  } satisfies User;
}

export function getUsers(): User[] {
  return users.map(({ id, name, email, role }) => ({
    id,
    name,
    email,
    role,
  }));
}
