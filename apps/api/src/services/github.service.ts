import type {
  CommitDetailDto,
  CommitListResponse,
  RepositoryDetailDto,
  RepositoryListResponse,
  GitHubUserDto,
  UserStatsDto,
} from "@commit-quest/types";
import { githubFetch } from "../clients/github.client";
import { githubErrorFromResponse } from "../lib/errors";
import {
  mapCommit,
  mapCommitDetail,
  mapRepository,
  mapRepositoryDetail,
  mapUser,
  mapUserStats,
} from "../mappers/github.mapper";
import type {
  GitHubCommitApi,
  GitHubCommitDetailApi,
  GitHubRepoApi,
  GitHubSearchCommitsApi,
  GitHubUserApi,
} from "../types/github-api";

/** Extracts the last page number from a GitHub Link header, if present. */
function lastPageFromLinkHeader(link: string | null): number | null {
  if (!link) {
    return null;
  }
  const match = /<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/.exec(link);
  return match?.[1] ? Number(match[1]) : null;
}

function hasNextPage(link: string | null): boolean {
  return link !== null && link.includes('rel="next"');
}

/**
 * Counts commits for a repository (optionally filtered by author) without
 * fetching the full list: uses `per_page=1` and reads the last-page number
 * from the Link header. Empty repositories (GitHub returns 409) count as 0.
 */
export async function getCommitCount(
  owner: string,
  repo: string,
  author: string | undefined,
  env: Env,
): Promise<number> {
  const params = new URLSearchParams({ per_page: "1" });
  if (author) {
    params.set("author", author);
  }
  const res = await githubFetch(`/repos/${owner}/${repo}/commits?${params.toString()}`, env);
  if (res.status === 409) {
    return 0;
  }
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const lastPage = lastPageFromLinkHeader(res.headers.get("link"));
  if (lastPage !== null) {
    return lastPage;
  }
  const items = await res.json<unknown[]>();
  return Array.isArray(items) ? items.length : 0;
}

export async function getUser(username: string, env: Env): Promise<GitHubUserDto> {
  const res = await githubFetch(`/users/${username}`, env);
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubUserApi>();
  return mapUser(raw);
}

export async function getRepositories(
  username: string,
  page: number,
  perPage: number,
  env: Env,
): Promise<RepositoryListResponse> {
  const params = new URLSearchParams({
    type: "owner",
    sort: "pushed",
    page: String(page),
    per_page: String(perPage),
  });
  const res = await githubFetch(`/users/${username}/repos?${params.toString()}`, env);
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubRepoApi[]>();
  // N+1 対策: 一覧取得ではCommit数を取得しない（GitHubへの呼び出しはこの1回のみ）。
  const items = raw.filter((repo) => !repo.fork).map(mapRepository);
  return {
    items,
    page,
    perPage,
    hasNextPage: hasNextPage(res.headers.get("link")),
  };
}

export async function getRepository(
  owner: string,
  repo: string,
  author: string | undefined,
  env: Env,
): Promise<RepositoryDetailDto> {
  const res = await githubFetch(`/repos/${owner}/${repo}`, env);
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubRepoApi>();
  const commitCount = await getCommitCount(owner, repo, author, env);
  return mapRepositoryDetail(raw, commitCount);
}

export async function getCommits(
  owner: string,
  repo: string,
  page: number,
  perPage: number,
  author: string | undefined,
  env: Env,
): Promise<CommitListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (author) {
    params.set("author", author);
  }
  const res = await githubFetch(`/repos/${owner}/${repo}/commits?${params.toString()}`, env);
  if (res.status === 409) {
    return { items: [], page, perPage, hasNextPage: false };
  }
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubCommitApi[]>();
  return {
    items: raw.map(mapCommit),
    page,
    perPage,
    hasNextPage: hasNextPage(res.headers.get("link")),
  };
}

/**
 * Total commits authored by `username` across repositories they own,
 * via a single GitHub Search API call instead of summing per-repository
 * commit counts (which would be an N+1 request pattern). Per GitHub's
 * search behavior this only counts each repository's default branch and
 * excludes forks.
 */
export async function getUserStats(username: string, env: Env): Promise<UserStatsDto> {
  const params = new URLSearchParams({
    q: `author:${username} user:${username}`,
    per_page: "1",
  });
  const res = await githubFetch(`/search/commits?${params.toString()}`, env);
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubSearchCommitsApi>();
  return mapUserStats(raw);
}

export async function getCommitDetail(
  owner: string,
  repo: string,
  sha: string,
  env: Env,
): Promise<CommitDetailDto> {
  const res = await githubFetch(`/repos/${owner}/${repo}/commits/${sha}`, env);
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubCommitDetailApi>();
  return mapCommitDetail(raw);
}
