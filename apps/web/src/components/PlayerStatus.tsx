import type { GitHubUserDto } from "@commit-quest/types";
import { LevelBadge, RpgPanel, XpBar } from "@commit-quest/ui";
import { levelInfoFromCommitCount } from "../features/rpg/calculations";

export type PlayerStatusProps = {
  user: GitHubUserDto;
  /** Sum of commitCount across the fetched (first page of) repositories. */
  totalCommitCount: number;
};

/** Player Dashboard header: avatar, profile, Level and XP bar (design §6.2). */
export function PlayerStatus({ user, totalCommitCount }: PlayerStatusProps) {
  const { level, xpInLevel, progress } = levelInfoFromCommitCount(totalCommitCount);

  return (
    <RpgPanel title="Player Status">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <img
          src={user.avatarUrl}
          alt={`${user.login}のアバター`}
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 border-2 border-rpg-border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-rpg-gold">{user.name ?? user.login}</h2>
            <LevelBadge level={level} />
          </div>
          <p className="text-sm text-rpg-text-muted">@{user.login}</p>
          {user.bio ? <p className="mt-2 text-sm text-rpg-text">{user.bio}</p> : null}
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-rpg-text-muted">
            <div className="flex gap-1">
              <dt>Public Repos</dt>
              <dd className="font-bold text-rpg-text">{user.publicRepos}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Total Commit</dt>
              <dd className="font-bold text-rpg-text">{totalCommitCount}</dd>
            </div>
          </dl>
          <p className="mt-1 text-[11px] text-rpg-text-muted">
            ※ Total Commitは取得可能範囲内（最初のRepository一覧ページ）の集計値です。
          </p>
          <XpBar xpInLevel={xpInLevel} progress={progress} className="mt-3 max-w-sm" />
        </div>
      </div>
    </RpgPanel>
  );
}
