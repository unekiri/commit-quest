import type { RepositoryDto } from "@commit-quest/types";
import { LevelBadge } from "@commit-quest/ui";
import { Link } from "@tanstack/react-router";
import { levelInfoFromCommitCount } from "../features/rpg/calculations";

export type RepositoryCardProps = {
  username: string;
  repo: RepositoryDto;
};

/** RPG-styled card for a single Repository, used in the Dashboard's Repository list. */
export function RepositoryCard({ username, repo }: RepositoryCardProps) {
  const { level } = levelInfoFromCommitCount(repo.commitCount);

  return (
    <Link
      to="/users/$username/repos/$owner/$repo"
      params={{ username, owner: repo.owner, repo: repo.name }}
      search={{ page: 1 }}
      className="motion-safe:transition-transform block border-2 border-rpg-border bg-rpg-panel p-3 motion-safe:hover:-translate-y-1 hover:border-rpg-gold"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-rpg-text">{repo.name}</span>
        <LevelBadge level={level} />
      </div>
      {repo.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-rpg-text-muted">{repo.description}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-rpg-text-muted">
        {repo.language ? <span>{repo.language}</span> : null}
        <span>★ {repo.stars}</span>
        <span>{repo.commitCount} commits</span>
      </div>
    </Link>
  );
}
