import { useQuery } from "@tanstack/react-query";
import {
  commitDetailQueryOptions,
  commitsQueryOptions,
  repositoryQueryOptions,
  reposQueryOptions,
  userQueryOptions,
} from "./queries";

export function useGitHubUser(username: string) {
  return useQuery(userQueryOptions(username));
}

export function useGitHubRepositories(username: string) {
  return useQuery(reposQueryOptions(username));
}

export function useGitHubRepository(owner: string, repo: string, author: string) {
  return useQuery(repositoryQueryOptions(owner, repo, author));
}

export function useGitHubCommits(owner: string, repo: string, author: string, page: number) {
  return useQuery(commitsQueryOptions(owner, repo, author, page));
}

export function useGitHubCommitDetail(owner: string, repo: string, sha: string) {
  return useQuery(commitDetailQueryOptions(owner, repo, sha));
}
