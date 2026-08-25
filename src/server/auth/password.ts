import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const passwordVersion = "scrypt-v1";
const saltBytes = 16;
const keyLength = 64;

const weakPasswordParts = ["password", "guzomarket", "letmein", "qwerty", "12345678"];

export const passwordPolicy = {
  minLength: 12,
  maxLength: 128,
};

export function validatePasswordPolicy(password: string): string[] {
  const errors: string[] = [];
  const normalized = password.toLowerCase();

  if (password.length < passwordPolicy.minLength) {
    errors.push(`Use at least ${passwordPolicy.minLength} characters.`);
  }

  if (password.length > passwordPolicy.maxLength) {
    errors.push(`Use no more than ${passwordPolicy.maxLength} characters.`);
  }

  if (weakPasswordParts.some((part) => normalized.includes(part))) {
    errors.push("Choose a less common password.");
  }

  return errors;
}

export async function hashPassword(password: string, salt = cryptoRandomToken(saltBytes)) {
  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;
  return `${passwordVersion}:${salt}:${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) {
    return false;
  }

  const [version, salt, encodedHash] = storedHash.split(":");

  if (version !== passwordVersion || !salt || !encodedHash) {
    return false;
  }

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function cryptoRandomToken(bytes: number) {
  return randomBytes(bytes).toString("base64url");
}
