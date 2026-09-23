import { EmptyState } from "@commit-quest/ui";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <EmptyState message="NO QUESTS FOUND" />
      <p className="mt-4 text-center text-sm text-rpg-text-muted">
        <Link to="/" className="text-rpg-gold underline">
          ホームへ戻る
        </Link>
      </p>
    </div>
  );
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-rpg-bg text-rpg-text">
      <header className="border-b-2 border-rpg-border bg-rpg-panel px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-wide text-rpg-gold">
          Commit Quest
        </Link>
      </header>
      <main className="animate-page-fade-in mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
