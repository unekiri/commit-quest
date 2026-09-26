import type { ContributorDto } from "@commit-quest/types";
import { LevelBadge, XpBar } from "@commit-quest/ui";
import { levelInfoFromCommitCount } from "../features/rpg/calculations";

export type PartyMemberRowProps = {
  contributor: ContributorDto;
  totalContributions: number;
};

/** One party member row: RPG-style contributor display for Repository Detail's "Party". */
export function PartyMemberRow({ contributor, totalContributions }: PartyMemberRowProps) {
  const { level, xpInLevel, progress } = levelInfoFromCommitCount(contributor.contributions);
  const share = totalContributions > 0 ? Math.round((contributor.contributions / totalContributions) * 100) : 0;

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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-rpg-text">{contributor.login}</span>
          <LevelBadge level={level} />
          <span className="text-xs text-rpg-text-muted">
            {contributor.contributions} commits（{share}%）
          </span>
        </div>
        <XpBar xpInLevel={xpInLevel} progress={progress} className="mt-1 max-w-sm" />
      </div>
    </div>
  );
}
