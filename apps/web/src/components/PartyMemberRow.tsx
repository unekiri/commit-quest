import type { ContributorDto } from "@commit-quest/types";
import { LevelBadge, XpBar } from "@commit-quest/ui";
import { levelInfoFromCommitCount } from "../features/rpg/calculations";

export type PartyMemberRowProps = {
  contributor: ContributorDto;
};

/** One party member row: RPG-style contributor display for Repository Detail's "Party". */
export function PartyMemberRow({ contributor }: PartyMemberRowProps) {
  const { level, xp, xpInLevel, progress } = levelInfoFromCommitCount(contributor.contributions);

  return (
    <div
      className="flex flex-wrap items-center gap-3 border-2 border-rpg-border p-2"
    >
      <img
        src={contributor.avatarUrl}
        alt={`${contributor.login}のアバター`}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full border-2 border-rpg-border"
      />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-bold text-rpg-text">{contributor.login}</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-rpg-gold">Quest XP</span>
          <LevelBadge level={level} />
          <span className="text-xs text-rpg-text-muted">
            {xp} XP（{contributor.contributions} commits × 10）
          </span>
        </div>
        <XpBar xpInLevel={xpInLevel} progress={progress} className="mt-1 max-w-sm" />
      </div>
    </div>
  );
}
