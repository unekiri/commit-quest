import type { ErrorCode } from "@commit-quest/types";
import { ApiError } from "./api-client";

const MESSAGES: Record<ErrorCode, string> = {
  GITHUB_NOT_FOUND: "ユーザーまたはリポジトリが見つかりませんでした。",
  GITHUB_RATE_LIMIT: "GitHub APIの利用上限に達しました。しばらく待ってから再度お試しください。",
  GITHUB_UNAUTHORIZED: "GitHubへの認証に失敗しました。時間をおいて再度お試しください。",
  GITHUB_ERROR: "GitHubとの通信に失敗しました。時間をおいて再度お試しください。",
  VALIDATION_ERROR: "入力内容を確認してください。",
  INTERNAL_ERROR: "予期しないエラーが発生しました。",
  TOO_MANY_REQUESTS: "アクセスが集中しています。1分ほど待ってから再度お試しください。",
};

/** Maps an unknown error to a friendly, Japanese, never-raw message for ErrorPanel. */
export function toFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code];
  }
  return MESSAGES.INTERNAL_ERROR;
}
