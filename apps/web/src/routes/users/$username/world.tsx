import { EmptyState, ErrorPanel, LoadingPanel } from "@commit-quest/ui";
import { createFileRoute } from "@tanstack/react-router";
import { WorldMap } from "../../../components/WorldMap";
import { useGitHubRepositories } from "../../../features/github/hooks";
import { toFriendlyErrorMessage } from "../../../lib/error-messages";

function WorldMapPage() {
  const { username } = Route.useParams();
  const reposQuery = useGitHubRepositories(username);

  if (reposQuery.isPending) {
    return <LoadingPanel />;
  }

  if (reposQuery.isError) {
    return <ErrorPanel message={toFriendlyErrorMessage(reposQuery.error)} onRetry={() => void reposQuery.refetch()} />;
  }

  const repos = reposQuery.data.items;

  if (repos.length === 0) {
    return <EmptyState />;
  }

  return <WorldMap username={username} repos={repos} />;
}

export const Route = createFileRoute("/users/$username/world")({
  component: WorldMapPage,
});
