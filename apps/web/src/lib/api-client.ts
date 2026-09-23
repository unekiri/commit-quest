import type { ErrorCode, ErrorResponse } from "@commit-quest/types";

/**
 * Thrown by apiClient for any non-ok HTTP response.
 * Carries the structured ErrorCode from the API so features can render
 * a friendly, code-specific message instead of the raw GitHub error text.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function parseErrorBody(res: Response): Promise<{ code: ErrorCode; message: string }> {
  try {
    const body = (await res.json()) as ErrorResponse;
    return body.error;
  } catch {
    return { code: "INTERNAL_ERROR", message: "Unexpected error." };
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) {
    const { code, message } = await parseErrorBody(res);
    throw new ApiError(code, res.status, message);
  }
  return (await res.json()) as T;
}

/** Minimal fetch wrapper for the same-origin `/api` backend. */
export const apiClient = { get };
