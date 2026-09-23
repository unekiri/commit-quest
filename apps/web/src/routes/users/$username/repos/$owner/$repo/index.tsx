import { EmptyState, ErrorPanel, LevelBadge, LoadingPanel, RpgButton, RpgPanel } from "@commit-quest/ui";
import { createFileRoute } from "@tanstack/react-router";
import { CommitQuestCard } from "../../../../../../components/CommitQuestCard";
import { COMMITS_PAGE_SIZE } from "../../../../../../features/github/queries";
import { useGitHubCommits, useGitHubRepository } from "../../../../../../features/github/hooks";
import { levelInfoFromCommitCount, questNumber } from "../../../../../../features/rpg/calculations";
import { toFriendlyErrorMessage } from "../../../../../../lib/error-messages";

type RepoDetailSearch = { page: number };

function parsePage(raw: unknown): number {
  const n = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function RepositoryDetailPage() {
  const { username, owner, repo } = Route.useParams();
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const repoQuery = useGitHubRepository(owner, repo, username);
  const commitsQuery = useGitHubCommits(owner, repo, username, page);

  if (repoQuery.isPending || commitsQuery.isPending) {
    return <LoadingPanel />;
  }

  if (repoQuery.isError) {
    return <ErrorPanel message={toFriendlyErrorMessage(repoQuery.error)} onRetry={() => void repoQuery.refetch()} />;
  }

  if (commitsQuery.isError) {
    return (
      <ErrorPanel message={toFriendlyErrorMessage(commitsQuery.error)} onRetry={() => void commitsQuery.refetch()} />
    );
  }

  const repoData = repoQuery.data;
  const commits = commitsQuery.data.items;
  const { level } = levelInfoFromCommitCount(repoData.commitCount);
  const updated = new Date(repoData.updatedAt).toLocaleString("ja-JP");

  function goToPage(nextPage: number) {
    void navigate({ search: { page: nextPage } });
  }

  return (
    <div className="flex flex-col gap-4">
      <RpgPanel title={repoData.name}>
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={level} />
          {repoData.language ? <span className="text-xs text-rpg-text-muted">{repoData.language}</span> : null}
          <span className="text-xs text-rpg-text-muted">★ {repoData.stars}</span>
          <span className="text-xs text-rpg-text-muted">Forks {repoData.forks}</span>
          <span className="text-xs text-rpg-text-muted">Updated {updated}</span>
          <span className="text-xs text-rpg-text-muted">{repoData.commitCount} commits</span>
        </div>
        {repoData.description ? <p className="mt-2 text-sm text-rpg-text">{repoData.description}</p> : null}
      </RpgPanel>

      <div>
        <h3 className="mb-2 text-sm font-bold text-rpg-gold">Quests</h3>
        {commits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {commits.map((commit, index) => (
              <CommitQuestCard
                key={commit.sha}
                username={username}
                owner={owner}
                repo={repo}
                commit={commit}
                questNumber={questNumber(repoData.commitCount, page, COMMITS_PAGE_SIZE, index)}
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          <RpgButton variant="secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            前へ
          </RpgButton>
          <span className="text-xs text-rpg-text-muted">Page {page}</span>
          <RpgButton
            variant="secondary"
            disabled={!commitsQuery.data.hasNextPage}
            onClick={() => goToPage(page + 1)}
          >
            次へ
          </RpgButton>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/users/$username/repos/$owner/$repo/")({
  validateSearch: (search: Record<string, unknown>): RepoDetailSearch => ({
    page: parsePage(search.page),
  }),
  component: RepositoryDetailPage,
});
