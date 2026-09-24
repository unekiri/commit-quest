import { LoadingPanel, RpgPanel } from "@commit-quest/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteErrorPanel } from "../../../../../../../components/RouteErrorPanel";
import { commitDetailQueryOptions } from "../../../../../../../features/github/queries";
import { COMMIT_DETAIL_XP } from "../../../../../../../features/rpg/calculations";

function CommitDetailPage() {
  const { username, owner, repo, sha } = Route.useParams();

  // Data for this page was already fetched (or is currently in flight) by
  // the route's loader via `queryClient.ensureQueryData`, so this only
  // reads the cache: Suspense/pendingComponent already covered the wait.
  const commitQuery = useSuspenseQuery(commitDetailQueryOptions(owner, repo, sha));

  const commit = commitQuery.data;
  const title = commit.message.split("\n")[0];
  const date = new Date(commit.committedAt).toLocaleString("ja-JP");

  return (
    <div className="flex flex-col gap-4">
      <RpgPanel className="animate-quest-clear text-center">
        <p className="text-2xl font-bold text-rpg-gold">QUEST CLEAR!</p>
        <p className="mt-2 text-lg font-bold text-rpg-text">{title}</p>
        <p className="mt-1 text-rpg-xp">+{COMMIT_DETAIL_XP} XP</p>
      </RpgPanel>

      <RpgPanel title="Quest Log">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-rpg-text-muted">SHA</dt>
          <dd className="break-all text-rpg-text">{commit.sha}</dd>
          <dt className="text-rpg-text-muted">Author</dt>
          <dd className="text-rpg-text">{commit.authorName ?? commit.authorLogin ?? "unknown"}</dd>
          <dt className="text-rpg-text-muted">Date</dt>
          <dd className="text-rpg-text">{date}</dd>
          <dt className="text-rpg-text-muted">GitHub</dt>
          <dd>
            <a
              href={commit.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rpg-gold underline"
            >
              {commit.htmlUrl}
            </a>
          </dd>
        </dl>
        <p className="mt-3 whitespace-pre-wrap border-t-2 border-rpg-border pt-3 text-sm text-rpg-text">
          {commit.message}
        </p>
      </RpgPanel>

      <RpgPanel title={`Stats (+${commit.stats.additions} / -${commit.stats.deletions})`}>
        {commit.files.length === 0 ? (
          <p className="text-sm text-rpg-text-muted">No file changes.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {commit.files.map((file) => (
              <li key={file.filename} className="flex flex-wrap items-center gap-2 border-b border-rpg-border/50 py-1">
                <span className="truncate text-rpg-text">{file.filename}</span>
                <span className="text-xs text-rpg-text-muted">{file.status}</span>
                <span className="text-xs text-rpg-xp">+{file.additions}</span>
                <span className="text-xs text-rpg-hp">-{file.deletions}</span>
              </li>
            ))}
          </ul>
        )}
      </RpgPanel>

      <Link
        to="/users/$username/repos/$owner/$repo"
        params={{ username, owner, repo }}
        search={{ page: 1 }}
        className="self-start text-sm text-rpg-gold underline"
      >
        ← Repositoryへ戻る
      </Link>
    </div>
  );
}

function CommitDetailErrorComponent({ error }: { error: unknown }) {
  const { owner, repo, sha } = Route.useParams();
  const { queryClient } = Route.useRouteContext();

  return (
    <RouteErrorPanel error={error} queryClient={queryClient} queryKeys={[commitDetailQueryOptions(owner, repo, sha).queryKey]} />
  );
}

export const Route = createFileRoute("/users/$username/repos/$owner/$repo/commits/$sha")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(commitDetailQueryOptions(params.owner, params.repo, params.sha)),
  pendingComponent: LoadingPanel,
  errorComponent: CommitDetailErrorComponent,
  component: CommitDetailPage,
});
