import type { CommitDto } from "@commit-quest/types";
import { RpgPanel } from "@commit-quest/ui";
import { Link } from "@tanstack/react-router";

export type CommitQuestCardProps = {
  username: string;
  owner: string;
  repo: string;
  commit: CommitDto;
  questNumber: number;
};

/** RPG-styled card for a single Commit, rendered as a Quest entry (design §8). */
export function CommitQuestCard({ username, owner, repo, commit, questNumber }: CommitQuestCardProps) {
  const title = commit.message.split("\n")[0];
  const date = new Date(commit.committedAt).toLocaleString("ja-JP");

  return (
    <RpgPanel title={`Quest #${questNumber}`} className="motion-safe:transition-transform motion-safe:hover:-translate-y-1">
      <p className="font-bold text-rpg-text">{title}</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 text-xs text-rpg-text-muted">
        <dt>Author</dt>
        <dd>{commit.authorName ?? commit.authorLogin ?? "unknown"}</dd>
        <dt>Date</dt>
        <dd>{date}</dd>
      </dl>
      <Link
        to="/users/$username/repos/$owner/$repo/commits/$sha"
        params={{ username, owner, repo, sha: commit.sha }}
        className="motion-safe:transition-transform mt-3 inline-block cursor-pointer border-2 border-rpg-border bg-rpg-bg px-4 py-2 text-sm font-bold tracking-wide text-rpg-text motion-safe:hover:-translate-y-0.5 hover:bg-rpg-panel"
      >
        詳細を見る
      </Link>
    </RpgPanel>
  );
}
