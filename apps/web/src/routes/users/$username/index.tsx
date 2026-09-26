import { EmptyState, ErrorPanel, LoadingPanel } from "@commit-quest/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { WorldMap } from "../../../components/WorldMap";
import { PlayerStatus } from "../../../components/PlayerStatus";
import { useGitHubRepositories, useGitHubUser } from "../../../features/github/hooks";
import { toFriendlyErrorMessage } from "../../../lib/error-messages";

function DashboardPage() {
  const { username } = Route.useParams();
  const userQuery = useGitHubUser(username);
  const reposQuery = useGitHubRepositories(username);

  if (userQuery.isPending || reposQuery.isPending) {
    return <LoadingPanel />;
  }

  if (userQuery.isError) {
    return <ErrorPanel message={toFriendlyErrorMessage(userQuery.error)} onRetry={() => void userQuery.refetch()} />;
  }

  if (reposQuery.isError) {
    return <ErrorPanel message={toFriendlyErrorMessage(reposQuery.error)} onRetry={() => void reposQuery.refetch()} />;
  }

  const repos = reposQuery.data.items;

  return (
    <div className="flex flex-col gap-4">
      <PlayerStatus user={userQuery.data} />
      <div>
        <h3 className="mb-2 text-sm font-bold text-rpg-gold">World Map</h3>
        {repos.length === 0 ? <EmptyState /> : <WorldMap username={username} repos={repos} />}
      </div>

      <Link to="/" className="self-start text-sm text-rpg-gold underline">
        ← ユーザー名入力へ戻る
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/users/$username/")({
  component: DashboardPage,
});
