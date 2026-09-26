import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/** The last Repository the player chose "冒険する" for, scoped to a username. */
export type LastVisitedRepository = {
  username: string;
  repoKey: string;
} | null;

type LastVisitedRepositoryContextValue = {
  lastVisited: LastVisitedRepository;
  setLastVisited: (value: LastVisitedRepository) => void;
};

const LastVisitedRepositoryContext = createContext<LastVisitedRepositoryContextValue | undefined>(undefined);

/**
 * Keeps track of the Repository node the character was standing on when the
 * player left World Map for Repository Detail, so that returning to World
 * Map (via the "← World Mapへ戻る" link or the browser Back button) can put
 * the character back on that node instead of resetting to HOME.
 *
 * This is intentionally plain React state, not URL State: character
 * position is a presentation detail of World Map, not something that
 * should be shareable/bookmarkable via the URL. It lives on the
 * `/users/$username` layout route (`route.tsx`), which stays mounted while
 * navigating between the World Map and Repository Detail child routes, so
 * the value survives that navigation and is cleared again on a full reload.
 */
export function LastVisitedRepositoryProvider({ children }: { children: ReactNode }) {
  const [lastVisited, setLastVisited] = useState<LastVisitedRepository>(null);

  const value = useMemo(() => ({ lastVisited, setLastVisited }), [lastVisited]);

  return <LastVisitedRepositoryContext.Provider value={value}>{children}</LastVisitedRepositoryContext.Provider>;
}

export function useLastVisitedRepository() {
  const context = useContext(LastVisitedRepositoryContext);
  if (!context) {
    throw new Error("useLastVisitedRepository must be used within a LastVisitedRepositoryProvider");
  }
  return context;
}
