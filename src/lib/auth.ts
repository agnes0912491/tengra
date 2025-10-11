import "server-only";

import { Buffer } from "node:buffer";
import crypto from "node:crypto";

const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value || value.length === 0) {
    throw new Error(`Environment variable ${key} is required`);
  }

  return value;
};

const ADMIN_EMAIL = getRequiredEnv("ADMIN_EMAIL");
const ADMIN_PASSWORD = getRequiredEnv("ADMIN_PASSWORD");
const SESSION_SECRET = getRequiredEnv("ADMIN_SESSION_SECRET");

export const ADMIN_SESSION_COOKIE = "admin_session";

export const verifyAdminCredentials = (email: string, password: string) =>
  email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

const TOKEN_DELIMITER = ".";

const createSignature = (nonce: string) =>
  crypto.createHmac("sha256", SESSION_SECRET).update(nonce).digest("hex");

export const createAdminSessionToken = () => {
  const nonce = crypto.randomUUID();
  const signature = createSignature(nonce);

  return `${nonce}${TOKEN_DELIMITER}${signature}`;
};

export const verifyAdminSessionToken = (token: string | undefined | null) => {
  if (!token) {
    return false;
  }

  const [nonce, signature] = token.split(TOKEN_DELIMITER);

  if (!nonce || !signature) {
    return false;
  }

  const expectedSignature = createSignature(nonce);

  let provided: Buffer;
  let expected: Buffer;

  try {
    provided = Buffer.from(signature, "hex");
    expected = Buffer.from(expectedSignature, "hex");
  } catch {
    return false;
  }

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
};

export const clearAdminSessionCookie = () => "";

export const getAdminEmail = () => ADMIN_EMAIL;

