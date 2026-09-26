import type { RepositoryDto } from "@commit-quest/types";
import { RpgPanel } from "@commit-quest/ui";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLastVisitedRepository } from "../features/world-map/LastVisitedRepositoryContext";

export type CommandWindowProps = {
  username: string;
  repo: RepositoryDto;
  onClose: () => void;
};

type MenuKey = "adventure" | "back";

const MENU_ITEMS: { key: MenuKey; label: string }[] = [
  { key: "adventure", label: "冒険する" },
  { key: "back", label: "戻る" },
];

/**
 * RPG command window shown once the player character arrives at a
 * Repository node (design improvement §4.3). Menu items are plain buttons;
 * navigation to Repository Detail happens imperatively via the router so
 * every menu entry shares the same keyboard-activation path.
 */
export function CommandWindow({ username, repo, onClose }: CommandWindowProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const { setLastVisited } = useLastVisitedRepository();
  const [cursor, setCursor] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus the first menu item as soon as the window opens.
  useEffect(() => {
    itemRefs.current[0]?.focus();
  }, []);

  // This component only mounts once selectedRepository is confirmed and the
  // window is open, so this is the natural point to warm the Repository
  // Detail cache for "冒険する" — it runs the route's own loader
  // (ensureQueryData), so no Query key is duplicated here, and a failure is
  // safe to ignore since navigation would surface it via errorComponent.
  useEffect(() => {
    void router.preloadRoute({
      to: "/users/$username/repos/$owner/$repo",
      params: { username, owner: repo.owner, repo: repo.name },
      search: { page: 1 },
    });
  }, [router, username, repo.owner, repo.name]);

  useEffect(() => {
    itemRefs.current[cursor]?.focus();
  }, [cursor]);

  function activate(key: MenuKey) {
    if (key === "adventure") {
      // Remember which node the character was on so returning to World Map
      // (link or browser Back) restores the character here instead of HOME.
      setLastVisited({ username, repoKey: `${repo.owner}/${repo.name}` });
      void navigate({
        to: "/users/$username/repos/$owner/$repo",
        params: { username, owner: repo.owner, repo: repo.name },
        search: { page: 1 },
      });
      return;
    }
    onClose();
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % MENU_ITEMS.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = MENU_ITEMS[cursor];
      if (item) {
        activate(item.key);
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
      onKeyDown={handleMenuKeyDown}
    >
      <RpgPanel
        title={repo.name}
        role="dialog"
        aria-modal="true"
        aria-label={`${repo.name} コマンドウィンドウ`}
        className="w-full max-w-sm"
      >
        <ul className="flex flex-col gap-1">
          {MENU_ITEMS.map((item, i) => (
            <li key={item.key}>
              <button
                type="button"
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onClick={() => {
                  setCursor(i);
                  activate(item.key);
                }}
                onFocus={() => setCursor(i)}
                aria-current={cursor === i}
                className="block w-full cursor-pointer border-2 border-transparent px-2 py-1 text-left text-sm text-rpg-text hover:border-rpg-gold aria-[current=true]:border-rpg-gold"
              >
                {cursor === i ? "▶ " : "  "}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </RpgPanel>
    </div>
  );
}
