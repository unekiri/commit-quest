import type { GitHubUserDto } from "@commit-quest/types";
import { LevelBadge, RpgButton, RpgPanel, XpBar } from "@commit-quest/ui";
import { useGitHubUserStats } from "../features/github/hooks";
import { levelInfoFromCommitCount } from "../features/rpg/calculations";

export type PlayerStatusProps = {
  user: GitHubUserDto;
};

/**
 * Quest XP section: aggregated across every repository the user owns
 * (design's "全リポジトリ合計"). Fetched independently from the user /
 * repos data so a slow or failed aggregate never blocks the rest of the
 * Player Dashboard.
 */
function QuestXpSummary({ username }: { username: string }) {
  const statsQuery = useGitHubUserStats(username);

  if (statsQuery.isPending) {
    return <p className="text-xs text-rpg-text-muted">集計中...</p>;
  }

  if (statsQuery.isError) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-rpg-text-muted">Quest XPを取得できませんでした。</p>
        <RpgButton variant="secondary" onClick={() => void statsQuery.refetch()}>
          Retry
        </RpgButton>
      </div>
    );
  }

  const { level, xp, xpInLevel, progress } = levelInfoFromCommitCount(statsQuery.data.totalCommits);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-rpg-gold">Quest XP</span>
        <LevelBadge level={level} />
        <span className="text-xs text-rpg-text-muted">
          {xp} XP（{statsQuery.data.totalCommits} commits × 10）
        </span>
      </div>
      <XpBar xpInLevel={xpInLevel} progress={progress} className="mt-2 max-w-sm" />
    </>
  );
}

/** Player Dashboard header: avatar, GitHub profile, and aggregate Quest XP (design §6.2). */
export function PlayerStatus({ user }: PlayerStatusProps) {
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
          <h2 className="text-lg font-bold text-rpg-gold">{user.name ?? user.login}</h2>
          <p className="text-sm text-rpg-text-muted">@{user.login}</p>
          {user.bio ? <p className="mt-2 text-sm text-rpg-text">{user.bio}</p> : null}
        </div>
      </div>

      <div className="mt-4 border-t-2 border-rpg-border pt-4">
        <QuestXpSummary username={user.login} />
      </div>
    </RpgPanel>
  );
}
