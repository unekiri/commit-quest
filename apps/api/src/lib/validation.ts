import { AppError } from "./errors";

const USERNAME_RE = /^[A-Za-z0-9-]{1,39}$/;
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;
const SHA_RE = /^[0-9a-fA-F]{7,40}$/;

export function assertUsername(value: string | undefined, field = "username"): string {
  if (value === undefined || !USERNAME_RE.test(value)) {
    throw new AppError("VALIDATION_ERROR", 400, `Invalid ${field}.`);
  }
  return value;
}

export function assertRepo(value: string | undefined): string {
  if (value === undefined || !REPO_RE.test(value) || value === "." || value === "..") {
    throw new AppError("VALIDATION_ERROR", 400, "Invalid repository name.");
  }
  return value;
}

export function assertSha(value: string | undefined): string {
  if (value === undefined || !SHA_RE.test(value)) {
    throw new AppError("VALIDATION_ERROR", 400, "Invalid commit sha.");
  }
  return value;
}

export function parsePage(value: string | undefined): number {
  if (value === undefined) {
    return 1;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError("VALIDATION_ERROR", 400, "page must be an integer >= 1.");
  }
  return n;
}

export function parsePerPage(value: string | undefined, max = 30, def = 30): number {
  if (value === undefined) {
    return def;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > max) {
    throw new AppError("VALIDATION_ERROR", 400, `perPage must be an integer between 1 and ${max}.`);
  }
  return n;
}
