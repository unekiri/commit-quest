import type { RepositoryDto } from "@commit-quest/types";
import { RpgPanel } from "@commit-quest/ui";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export type CommandWindowProps = {
  username: string;
  repo: RepositoryDto;
  onClose: () => void;
};

type MenuKey = "adventure" | "info" | "back";

const MENU_ITEMS: { key: MenuKey; label: string }[] = [
  { key: "adventure", label: "冒険する" },
  { key: "info", label: "Repository情報" },
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
  const [cursor, setCursor] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const infoBackRef = useRef<HTMLButtonElement | null>(null);

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
    if (showInfo) {
      infoBackRef.current?.focus();
    } else {
      itemRefs.current[cursor]?.focus();
    }
  }, [showInfo, cursor]);

  function activate(key: MenuKey) {
    if (key === "adventure") {
      void navigate({
        to: "/users/$username/repos/$owner/$repo",
        params: { username, owner: repo.owner, repo: repo.name },
        search: { page: 1 },
      });
      return;
    }
    if (key === "info") {
      setShowInfo(true);
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

  function handleInfoKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter") {
      e.preventDefault();
      setShowInfo(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
      onKeyDown={showInfo ? handleInfoKeyDown : handleMenuKeyDown}
    >
      <RpgPanel
        title={repo.name}
        role="dialog"
        aria-modal="true"
        aria-label={`${repo.name} コマンドウィンドウ`}
        className="w-full max-w-sm"
      >
        {showInfo ? (
          <div className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-rpg-text-muted">Description</dt>
              <dd className="text-rpg-text">{repo.description ?? "-"}</dd>
              <dt className="text-rpg-text-muted">Language</dt>
              <dd className="text-rpg-text">{repo.language ?? "-"}</dd>
              <dt className="text-rpg-text-muted">Stars</dt>
              <dd className="text-rpg-text">★ {repo.stars}</dd>
              <dt className="text-rpg-text-muted">Forks</dt>
              <dd className="text-rpg-text">{repo.forks}</dd>
              <dt className="text-rpg-text-muted">Updated</dt>
              <dd className="text-rpg-text">{new Date(repo.updatedAt).toLocaleString("ja-JP")}</dd>
            </dl>
            <button
              type="button"
              ref={infoBackRef}
              onClick={() => setShowInfo(false)}
              className="cursor-pointer self-start border-2 border-rpg-border bg-rpg-bg px-3 py-1 text-left text-sm text-rpg-text hover:border-rpg-gold"
            >
              戻る
            </button>
          </div>
        ) : (
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
        )}
      </RpgPanel>
    </div>
  );
}
