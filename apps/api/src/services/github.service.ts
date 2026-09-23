import type {
  CommitDetailDto,
  CommitListResponse,
  RepositoryDto,
  RepositoryListResponse,
  GitHubUserDto,
} from "@commit-quest/types";
import { githubFetch } from "../clients/github.client";
import { githubErrorFromResponse } from "../lib/errors";
import { mapCommit, mapCommitDetail, mapRepository, mapUser } from "../mappers/github.mapper";
import type {
  GitHubCommitApi,
  GitHubCommitDetailApi,
  GitHubRepoApi,
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
  const nonForks = raw.filter((repo) => !repo.fork);
  const items = await Promise.all(
    nonForks.map(async (repo) => {
      const commitCount = await getCommitCount(repo.owner.login, repo.name, username, env);
      return mapRepository(repo, commitCount);
    }),
  );
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
): Promise<RepositoryDto> {
  const res = await githubFetch(`/repos/${owner}/${repo}`, env);
  if (!res.ok) {
    throw githubErrorFromResponse(res);
  }
  const raw = await res.json<GitHubRepoApi>();
  const commitCount = await getCommitCount(owner, repo, author, env);
  return mapRepository(raw, commitCount);
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
