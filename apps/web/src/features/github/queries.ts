import type {
  CommitDetailDto,
  CommitListResponse,
  ContributorsResponse,
  GitHubUserDto,
  RepositoryDetailDto,
  RepositoryListResponse,
  UserStatsDto,
} from "@commit-quest/types";
import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

/** Repositories are always loaded as a single "first page" per design §6.2 / §7. */
export const REPOS_PAGE_SIZE = 30;

/** Commits are paginated per Repository Detail page, per design §8. */
export const COMMITS_PAGE_SIZE = 10;

export function userQueryOptions(username: string) {
  return queryOptions({
    queryKey: ["github", "user", username] as const,
    queryFn: () => apiClient.get<GitHubUserDto>(`/github/users/${encodeURIComponent(username)}`),
  });
}

export function userStatsQueryOptions(username: string) {
  return queryOptions({
    queryKey: ["github", "userStats", username] as const,
    queryFn: () => apiClient.get<UserStatsDto>(`/github/users/${encodeURIComponent(username)}/stats`),
  });
}

export function reposQueryOptions(username: string) {
  return queryOptions({
    queryKey: ["github", "repos", username] as const,
    queryFn: () =>
      apiClient.get<RepositoryListResponse>(
        `/github/users/${encodeURIComponent(username)}/repos?page=1&perPage=${REPOS_PAGE_SIZE}`,
      ),
  });
}

export function repositoryQueryOptions(owner: string, repo: string, author: string) {
  return queryOptions({
    queryKey: ["github", "repo", owner, repo, { author }] as const,
    queryFn: () =>
      apiClient.get<RepositoryDetailDto>(
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?author=${encodeURIComponent(author)}`,
      ),
  });
}

export function contributorsQueryOptions(owner: string, repo: string) {
  return queryOptions({
    queryKey: ["github", "contributors", owner, repo] as const,
    queryFn: () =>
      apiClient.get<ContributorsResponse>(
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`,
      ),
  });
}

export function commitsQueryOptions(owner: string, repo: string, author: string, page: number) {
  return queryOptions({
    queryKey: ["github", "commits", owner, repo, { author, page }] as const,
    queryFn: () =>
      apiClient.get<CommitListResponse>(
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits` +
          `?page=${page}&perPage=${COMMITS_PAGE_SIZE}&author=${encodeURIComponent(author)}`,
      ),
  });
}

export function commitDetailQueryOptions(owner: string, repo: string, sha: string) {
  return queryOptions({
    queryKey: ["github", "commit", owner, repo, sha] as const,
    queryFn: () =>
      apiClient.get<CommitDetailDto>(
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`,
      ),
  });
}
