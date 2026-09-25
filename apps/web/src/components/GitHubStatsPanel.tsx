import type { GitHubUserDto, RepositoryDto } from "@commit-quest/types";
import { RpgPanel } from "@commit-quest/ui";

export type GitHubStatsPanelProps = {
  user: GitHubUserDto;
  /** First item of the repos list (sorted by `pushed`), i.e. the most recently active repository. */
  activeRepository: RepositoryDto | null;
};

/**
 * Real GitHub data, shown separately from the game-flavored panels (design
 * improvement §6.2) so it's visually clear which numbers come straight from
 * GitHub and which are Commit Quest's own game metrics. No extra GitHub API
 * calls are made here: it only reuses data already fetched for the Dashboard.
 */
export function GitHubStatsPanel({ user, activeRepository }: GitHubStatsPanelProps) {
  const lastUpdated = activeRepository ? new Date(activeRepository.updatedAt).toLocaleString("ja-JP") : null;

  return (
    <RpgPanel title="GitHub Stats">
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-rpg-text-muted">Public Repositories</dt>
          <dd className="font-bold text-rpg-text">{user.publicRepos}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-rpg-text-muted">Active Repository</dt>
          <dd className="truncate font-bold text-rpg-text">
            {activeRepository ? (
              <a
                href={activeRepository.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rpg-gold underline"
              >
                {activeRepository.name}
              </a>
            ) : (
              "-"
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-rpg-text-muted">Last Updated</dt>
          <dd className="text-right font-bold text-rpg-text">{lastUpdated ?? "-"}</dd>
        </div>
      </dl>
    </RpgPanel>
  );
}
