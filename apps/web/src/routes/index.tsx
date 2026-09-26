import { RpgButton, RpgPanel } from "@commit-quest/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

const USERNAME_PATTERN = /^[A-Za-z0-9-]{1,39}$/;

function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!USERNAME_PATTERN.test(trimmed)) {
      setError("GitHubのusernameとして正しい形式で入力してください（英数字とハイフン、1〜39文字）。");
      return;
    }
    setError(null);
    void navigate({ to: "/users/$username", params: { username: trimmed } });
  }

  return (
    <div className="mx-auto max-w-xl">
      <RpgPanel title="Commit Quest">
        <p className="text-sm text-rpg-text-muted">GitHub上の開発活動を冒険に見立てて可視化します。</p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label htmlFor="username" className="text-xs font-bold text-rpg-gold">
            GitHub Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="octocat"
            className="border-2 border-rpg-border bg-rpg-bg px-3 py-2 text-rpg-text outline-none focus:border-rpg-gold"
          />
          {error ? <p className="text-xs text-rpg-hp">{error}</p> : null}
          <RpgButton type="submit">冒険を始める</RpgButton>
        </form>
      </RpgPanel>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
