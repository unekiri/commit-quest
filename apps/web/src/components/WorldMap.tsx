import type { RepositoryDto } from "@commit-quest/types";
import { LevelBadge, RpgPanel } from "@commit-quest/ui";
import { Link } from "@tanstack/react-router";
import { levelInfoFromCommitCount } from "../features/rpg/calculations";

export type WorldMapProps = {
  username: string;
  repos: RepositoryDto[];
};

const GRID_AREAS = ["nw", "n", "ne", "w", "home", "e", "sw", "s", "se"] as const;
const NODE_AREAS = GRID_AREAS.filter((a) => a !== "home");

// Percentage centers (viewBox 0-100) of each of the 3x3 grid cells, used to
// draw simple connector lines from HOME to each surrounding node.
const NODE_POSITIONS: Record<(typeof NODE_AREAS)[number], [number, number]> = {
  nw: [16.6, 16.6],
  n: [50, 16.6],
  ne: [83.3, 16.6],
  w: [16.6, 50],
  e: [83.3, 50],
  sw: [16.6, 83.3],
  s: [50, 83.3],
  se: [83.3, 83.3],
};

function MapNode({ username, repo }: { username: string; repo: RepositoryDto }) {
  const { level, progress } = levelInfoFromCommitCount(repo.commitCount);
  const updated = new Date(repo.updatedAt).toLocaleDateString("ja-JP");

  return (
    <Link
      to="/users/$username/repos/$owner/$repo"
      params={{ username, owner: repo.owner, repo: repo.name }}
      search={{ page: 1 }}
      className="motion-safe:transition-transform flex h-full flex-col items-center justify-center gap-1 border-2 border-rpg-border bg-rpg-panel p-2 text-center motion-safe:hover:-translate-y-1 hover:border-rpg-gold"
    >
      <span className="w-full truncate text-xs font-bold text-rpg-text">{repo.name}</span>
      <LevelBadge level={level} />
      <span className="text-[10px] text-rpg-text-muted">{repo.commitCount} commits</span>
      <span className="text-[10px] text-rpg-text-muted">{updated}</span>
      <div className="h-1.5 w-full border border-rpg-border bg-rpg-bg">
        <div className="h-full bg-rpg-xp" style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }} />
      </div>
    </Link>
  );
}

/** RPG world map: HOME node in the center, up to 8 Repository nodes around it (design §7). */
export function WorldMap({ username, repos }: WorldMapProps) {
  const mainRepos = repos.slice(0, 8);
  const overflowRepos = repos.slice(8);

  return (
    <div>
      {/* Desktop/tablet: fixed 3x3 layout with HOME centered. Falls back to a list below sm. */}
      <div className="relative hidden aspect-square w-full max-w-2xl mx-auto sm:block">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {mainRepos.map((repo, i) => {
            const area = NODE_AREAS[i];
            if (!area) return null;
            const [x, y] = NODE_POSITIONS[area];
            return (
              <line
                key={repo.owner + repo.name}
                x1={50}
                y1={50}
                x2={x}
                y2={y}
                stroke="var(--color-rpg-border)"
                strokeWidth={0.6}
              />
            );
          })}
        </svg>
        <div
          className="relative grid h-full w-full grid-cols-3 grid-rows-3 gap-3"
          style={{ gridTemplateAreas: '"nw n ne" "w home e" "sw s se"' }}
        >
          <div
            style={{ gridArea: "home" }}
            className="flex flex-col items-center justify-center border-2 border-rpg-gold bg-rpg-gold/10 text-rpg-gold"
          >
            <span className="text-sm font-bold">HOME</span>
            <span className="text-[10px]">@{username}</span>
          </div>
          {mainRepos.map((repo, i) => {
            const area = NODE_AREAS[i];
            if (!area) return null;
            return (
              <div key={repo.owner + repo.name} style={{ gridArea: area }}>
                <MapNode username={username} repo={repo} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile fallback: simple vertical list, HOME node first. */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        <RpgPanel className="text-center text-rpg-gold">
          <span className="font-bold">HOME</span>
          <span className="block text-xs">@{username}</span>
        </RpgPanel>
        {mainRepos.map((repo) => (
          <MapNode key={repo.owner + repo.name} username={username} repo={repo} />
        ))}
      </div>

      {overflowRepos.length > 0 ? (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-rpg-gold">Other Areas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overflowRepos.map((repo) => (
              <MapNode key={repo.owner + repo.name} username={username} repo={repo} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
