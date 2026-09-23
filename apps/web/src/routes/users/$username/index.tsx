import { EmptyState, ErrorPanel, LoadingPanel } from "@commit-quest/ui";
import { createFileRoute } from "@tanstack/react-router";
import { RepositoryCard } from "../../../components/RepositoryCard";
import { GitHubStatsPanel } from "../../../components/GitHubStatsPanel";
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
  const activeRepository = repos[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <PlayerStatus user={userQuery.data} />
      <GitHubStatsPanel user={userQuery.data} activeRepository={activeRepository} />
      <div>
        <h3 className="mb-2 text-sm font-bold text-rpg-gold">Repositories</h3>
        {repos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <RepositoryCard key={repo.owner + repo.name} username={username} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/users/$username/")({
  component: DashboardPage,
});
