import type { RepositoryDto } from "@commit-quest/types";
import { RpgPanel } from "@commit-quest/ui";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "../lib/use-media-query";
import { HOME_POSITION, useWorldMapState } from "../features/world-map/useWorldMapState";

export type WorldMapProps = {
  username: string;
  repos: RepositoryDto[];
};

const GRID_AREAS = ["nw", "n", "ne", "w", "home", "e", "sw", "s", "se"] as const;
const NODE_AREAS = GRID_AREAS.filter((a) => a !== "home");

// Percentage centers (viewBox 0-100) of each of the 3x3 grid cells, used to
// draw simple connector lines from HOME to each surrounding node, and as the
// character's movement target when a node is selected.
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

const HOME_CENTER: [number, number] = [50, 50];

/** Stable identifier for a Repository within the World Map's client state. */
function repoKey(repo: RepositoryDto): string {
  return `${repo.owner}/${repo.name}`;
}

function MapNode({
  repo,
  selected,
  disabled,
  onSelect,
}: {
  repo: RepositoryDto;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const updated = new Date(repo.updatedAt).toLocaleDateString("ja-JP");

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${repo.name}へ移動`}
      className="motion-safe:transition-transform flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 border-2 border-rpg-border bg-rpg-panel p-2 text-center motion-safe:hover:-translate-y-1 hover:border-rpg-gold disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-rpg-gold"
    >
      <span className="w-full truncate text-xs font-bold text-rpg-text">{repo.name}</span>
      {repo.language ? <span className="text-[10px] text-rpg-text-muted">{repo.language}</span> : null}
      <span className="text-[10px] text-rpg-text-muted">{updated}</span>
    </button>
  );
}

/** RPG world map: HOME node in the center, up to 8 Repository nodes around it (design §7). */
export function WorldMap({ username, repos }: WorldMapProps) {
  const mainRepos = repos.slice(0, 8);
  const overflowRepos = repos.slice(8);
  const { state, selectNode, arrived } = useWorldMapState();

  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDesktopLayout = useMediaQuery("(min-width: 640px)");
  // Only the fixed 3x3 grid has a position for the character to walk to.
  const canAnimate = isDesktopLayout && !prefersReducedMotion;

  const fallbackTimerRef = useRef<number | undefined>(undefined);

  const positionByKey = new Map<string, [number, number]>();
  mainRepos.forEach((repo, i) => {
    const area = NODE_AREAS[i];
    if (area) {
      positionByKey.set(repoKey(repo), NODE_POSITIONS[area]);
    }
  });

  const targetPosition =
    state.playerPosition === HOME_POSITION ? HOME_CENTER : (positionByKey.get(state.playerPosition) ?? HOME_CENTER);

  // While moving, without a CSS transition to rely on (reduced motion, or a
  // node outside the animated grid) arrival happens immediately.
  useEffect(() => {
    if (!state.moving) {
      return;
    }
    if (!canAnimate || !positionByKey.has(state.selectedRepository ?? "")) {
      arrived();
      return;
    }
    fallbackTimerRef.current = window.setTimeout(() => {
      arrived();
    }, 700);
    return () => {
      window.clearTimeout(fallbackTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positionByKey is rebuilt every render from `repos`
  }, [state.moving, state.selectedRepository, canAnimate, arrived]);

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "left") {
      return;
    }
    window.clearTimeout(fallbackTimerRef.current);
    arrived();
  }

  function handleSelect(repo: RepositoryDto) {
    selectNode(repoKey(repo));
  }

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
                key={repoKey(repo)}
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
              <div key={repoKey(repo)} style={{ gridArea: area }}>
                <MapNode
                  repo={repo}
                  selected={state.selectedRepository === repoKey(repo)}
                  disabled={state.moving}
                  onSelect={() => handleSelect(repo)}
                />
              </div>
            );
          })}
        </div>
        {/* Player character: moves from HOME to the selected node via CSS transform/transition. */}
        <div
          role="img"
          aria-label="プレイヤーキャラクター"
          onTransitionEnd={handleTransitionEnd}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-2xl motion-safe:transition-[left,top] motion-safe:duration-[600ms] motion-safe:ease-in-out"
          style={{ left: `${targetPosition[0]}%`, top: `${targetPosition[1]}%` }}
        >
          🧙
        </div>
      </div>

      {/* Mobile fallback: simple vertical list, HOME node first. No movement animation (design improvement §4). */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        <RpgPanel className="text-center text-rpg-gold">
          <span className="font-bold">HOME</span>
          <span className="block text-xs">@{username}</span>
        </RpgPanel>
        {mainRepos.map((repo) => (
          <MapNode
            key={repoKey(repo)}
            repo={repo}
            selected={state.selectedRepository === repoKey(repo)}
            disabled={state.moving}
            onSelect={() => handleSelect(repo)}
          />
        ))}
      </div>

      {overflowRepos.length > 0 ? (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-rpg-gold">Other Areas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overflowRepos.map((repo) => (
              <MapNode
                key={repoKey(repo)}
                repo={repo}
                selected={state.selectedRepository === repoKey(repo)}
                disabled={state.moving}
                onSelect={() => handleSelect(repo)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
