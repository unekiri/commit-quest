import type { GitHubUserDto } from "@commit-quest/types";
import { RpgPanel } from "@commit-quest/ui";

export type PlayerStatusProps = {
  user: GitHubUserDto;
};

/** Player Dashboard header: avatar and GitHub profile (design §6.2). */
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
    </RpgPanel>
  );
}
