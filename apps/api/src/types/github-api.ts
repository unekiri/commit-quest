/**
 * Raw GitHub REST API response shapes (subset actually used by this app).
 * These types never leave apps/api — routes/services return DTOs from
 * @commit-quest/types instead.
 */

export type GitHubUserApi = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  html_url: string;
};

export type GitHubRepoApi = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  fork: boolean;
  owner: {
    login: string;
  };
};

export type GitHubCommitApi = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string | null;
      date: string;
    } | null;
  };
  author: {
    login: string;
  } | null;
};

export type GitHubCommitFileApi = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
};

export type GitHubCommitDetailApi = GitHubCommitApi & {
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: GitHubCommitFileApi[];
};

/** Response shape of `GET /search/commits` (subset actually used). */
export type GitHubSearchCommitsApi = {
  total_count: number;
};
