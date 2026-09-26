import { EmptyState, LevelBadge, LoadingPanel, RpgButton, RpgPanel, XpBar } from "@commit-quest/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CommitQuestCard } from "../../../../../../components/CommitQuestCard";
import { PartyMemberRow } from "../../../../../../components/PartyMemberRow";
import { RouteErrorPanel } from "../../../../../../components/RouteErrorPanel";
import {
  COMMITS_PAGE_SIZE,
  commitsQueryOptions,
  contributorsQueryOptions,
  repositoryQueryOptions,
} from "../../../../../../features/github/queries";
import { levelInfoFromCommitCount, questNumber } from "../../../../../../features/rpg/calculations";

type RepoDetailSearch = { page: number };

function parsePage(raw: unknown): number {
  const n = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function RepositoryDetailPage() {
  const { username, owner, repo } = Route.useParams();
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Data for this page was already fetched (or is currently in flight) by
  // the route's loader via `queryClient.ensureQueryData`, so this only
  // reads the cache: Suspense/pendingComponent already covered the wait.
  const repoQuery = useSuspenseQuery(repositoryQueryOptions(owner, repo, username));
  const commitsQuery = useSuspenseQuery(commitsQueryOptions(owner, repo, username, page));
  const contributorsQuery = useSuspenseQuery(contributorsQueryOptions(owner, repo));

  const repoData = repoQuery.data;
  const commits = commitsQuery.data.items;
  const contributors = [...contributorsQuery.data.items].sort((a, b) => b.contributions - a.contributions);
  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
  const { level, xp, xpInLevel, progress } = levelInfoFromCommitCount(repoData.commitCount);

  function goToPage(nextPage: number) {
    void navigate({ search: { page: nextPage } });
  }

  return (
    <div className="flex flex-col gap-4">
      <RpgPanel title={repoData.name}>
        {repoData.description ? <p className="text-sm text-rpg-text">{repoData.description}</p> : null}

        <div className="mt-4">
          <h3 className="mb-2 text-xs font-bold text-rpg-gold">Party</h3>
          {contributors.length === 0 ? (
            <EmptyState message="NO PARTY MEMBERS FOUND" />
          ) : (
            <div className="flex flex-col gap-2">
              {contributors.map((contributor) => (
                <PartyMemberRow
                  key={contributor.login}
                  contributor={contributor}
                  totalContributions={totalContributions}
                  isCurrentUser={contributor.login.toLowerCase() === username.toLowerCase()}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-rpg-gold">Quest XP</span>
          <LevelBadge level={level} />
          <span className="text-xs text-rpg-text-muted">{xp} XP（{repoData.commitCount} commits × 10）</span>
        </div>
        <XpBar xpInLevel={xpInLevel} progress={progress} className="mt-2 max-w-sm" />
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

      <Link to="/users/$username" params={{ username }} className="self-start text-sm text-rpg-gold underline">
        ← World Mapへ戻る
      </Link>
    </div>
  );
}

function RepositoryDetailErrorComponent({ error }: { error: unknown }) {
  const { username, owner, repo } = Route.useParams();
  const { page } = Route.useSearch();
  const { queryClient } = Route.useRouteContext();

  return (
    <RouteErrorPanel
      error={error}
      queryClient={queryClient}
      queryKeys={[
        repositoryQueryOptions(owner, repo, username).queryKey,
        commitsQueryOptions(owner, repo, username, page).queryKey,
        contributorsQueryOptions(owner, repo).queryKey,
      ]}
    />
  );
}

export const Route = createFileRoute("/users/$username/repos/$owner/$repo/")({
  validateSearch: (search: Record<string, unknown>): RepoDetailSearch => ({
    page: parsePage(search.page),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(repositoryQueryOptions(params.owner, params.repo, params.username)),
      context.queryClient.ensureQueryData(commitsQueryOptions(params.owner, params.repo, params.username, deps.page)),
      context.queryClient.ensureQueryData(contributorsQueryOptions(params.owner, params.repo)),
    ]);
  },
  pendingComponent: LoadingPanel,
  errorComponent: RepositoryDetailErrorComponent,
  component: RepositoryDetailPage,
});
