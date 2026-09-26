/**
 * Shared DTO / response types used by both apps/web and apps/api.
 * These types describe the API contract, never GitHub's raw response shapes.
 */

export type GitHubUserDto = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  profileUrl: string;
};

export type RepositoryDto = {
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  htmlUrl: string;
};

/**
 * Repository detail response: adds `commitCount`, which is only fetched
 * for a single repository (never for the list) to avoid an N+1 GitHub API
 * request pattern. Used to derive the Commit Quest XP / Level metrics.
 */
export type RepositoryDetailDto = RepositoryDto & {
  commitCount: number;
};

export type CommitDto = {
  sha: string;
  message: string;
  authorName: string | null;
  authorLogin: string | null;
  committedAt: string;
  htmlUrl: string;
};

export type CommitFileDto = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
};

export type CommitStatsDto = {
  additions: number;
  deletions: number;
  total: number;
};

export type CommitDetailDto = CommitDto & {
  stats: CommitStatsDto;
  files: CommitFileDto[];
};

/**
 * Generic paginated list response.
 * `hasNextPage` is derived from the GitHub `Link` response header.
 */
export type PagedResponse<T> = {
  items: T[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
};

export type RepositoryListResponse = PagedResponse<RepositoryDto>;
export type CommitListResponse = PagedResponse<CommitDto>;

/**
 * Aggregated stats for a GitHub user across all of their repositories.
 * `totalCommits` comes from a single GitHub Search API call (commit search,
 * `author:{username} user:{username}`) to avoid an N+1 request pattern.
 * Per GitHub's search behavior, this only counts commits on each
 * repository's default branch and excludes forks.
 */
export type UserStatsDto = {
  totalCommits: number;
};

export type ErrorCode =
  | "GITHUB_NOT_FOUND"
  | "GITHUB_RATE_LIMIT"
  | "GITHUB_UNAUTHORIZED"
  | "GITHUB_ERROR"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
