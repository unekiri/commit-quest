import { ErrorPanel } from "@commit-quest/ui";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toFriendlyErrorMessage } from "../lib/error-messages";

export type RouteErrorPanelProps = {
  error: unknown;
  queryClient: QueryClient;
  queryKeys: QueryKey[];
};

/**
 * Shared retry behavior for a route's `errorComponent`: reset the cached
 * queries so they're refetched (not just re-read as an errored cache
 * entry), then re-run the route's loader via `router.invalidate()`.
 * Used by Repository Detail and Commit Detail (both loader + Query cache
 * backed routes).
 */
export function RouteErrorPanel({ error, queryClient, queryKeys }: RouteErrorPanelProps) {
  const router = useRouter();

  function handleRetry() {
    for (const queryKey of queryKeys) {
      void queryClient.resetQueries({ queryKey });
    }
    void router.invalidate();
  }

  return <ErrorPanel message={toFriendlyErrorMessage(error)} onRetry={handleRetry} />;
}
