import type {
  CommitDetailDto,
  CommitDto,
  ContributorDto,
  GitHubUserDto,
  RepositoryDetailDto,
  RepositoryDto,
  UserStatsDto,
} from "@commit-quest/types";
import type {
  GitHubCommitApi,
  GitHubCommitDetailApi,
  GitHubContributorApi,
  GitHubRepoApi,
  GitHubSearchCommitsApi,
  GitHubUserApi,
} from "../types/github-api";

export function mapUser(raw: GitHubUserApi): GitHubUserDto {
  return {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    publicRepos: raw.public_repos,
    profileUrl: raw.html_url,
  };
}

export function mapRepository(raw: GitHubRepoApi): RepositoryDto {
  return {
    owner: raw.owner.login,
    name: raw.name,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    updatedAt: raw.updated_at,
    htmlUrl: raw.html_url,
  };
}

export function mapRepositoryDetail(raw: GitHubRepoApi, commitCount: number): RepositoryDetailDto {
  return {
    ...mapRepository(raw),
    commitCount,
  };
}

export function mapCommit(raw: GitHubCommitApi): CommitDto {
  return {
    sha: raw.sha,
    message: raw.commit.message,
    authorName: raw.commit.author?.name ?? null,
    authorLogin: raw.author?.login ?? null,
    committedAt: raw.commit.author?.date ?? "",
    htmlUrl: raw.html_url,
  };
}

export function mapUserStats(raw: GitHubSearchCommitsApi): UserStatsDto {
  return {
    totalCommits: raw.total_count,
  };
}

export function mapContributor(raw: GitHubContributorApi): ContributorDto {
  return {
    login: raw.login,
    avatarUrl: raw.avatar_url,
    contributions: raw.contributions,
    htmlUrl: raw.html_url,
  };
}

export function mapCommitDetail(raw: GitHubCommitDetailApi): CommitDetailDto {
  return {
    ...mapCommit(raw),
    stats: {
      additions: raw.stats?.additions ?? 0,
      deletions: raw.stats?.deletions ?? 0,
      total: raw.stats?.total ?? 0,
    },
    files: (raw.files ?? []).map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
    })),
  };
}
