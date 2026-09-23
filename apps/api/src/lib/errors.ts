import type { ErrorCode } from "@commit-quest/types";

/** HTTP status codes this API ever returns for an AppError. */
export type AppErrorStatus = 400 | 401 | 404 | 429 | 500 | 502;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: AppErrorStatus;

  constructor(code: ErrorCode, status: AppErrorStatus, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Maps a non-ok GitHub REST API response to an AppError, per design §11.
 * GitHub's own error body is intentionally never forwarded to the caller.
 */
export function githubErrorFromResponse(res: Response): AppError {
  if (res.status === 404) {
    return new AppError("GITHUB_NOT_FOUND", 404, "GitHub resource was not found.");
  }
  if (res.status === 401) {
    return new AppError("GITHUB_UNAUTHORIZED", 401, "GitHub authentication failed.");
  }
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (res.status === 429 || (res.status === 403 && remaining === "0")) {
    return new AppError("GITHUB_RATE_LIMIT", 429, "GitHub API rate limit exceeded.");
  }
  return new AppError("GITHUB_ERROR", 502, "GitHub API request failed.");
}
