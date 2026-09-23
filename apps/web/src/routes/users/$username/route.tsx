import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

const TAB_CLASS =
  "border-2 border-rpg-border px-4 py-2 text-sm font-bold tracking-wide text-rpg-text-muted hover:text-rpg-text";
const ACTIVE_TAB_CLASS = "border-rpg-gold bg-rpg-gold/10 text-rpg-gold";

function UserLayout() {
  const { username } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isWorld = pathname.endsWith("/world");

  return (
    <div>
      <nav className="mb-4 flex gap-2">
        <Link
          to="/users/$username"
          params={{ username }}
          className={`${TAB_CLASS} ${!isWorld ? ACTIVE_TAB_CLASS : ""}`}
        >
          Dashboard
        </Link>
        <Link
          to="/users/$username/world"
          params={{ username }}
          className={`${TAB_CLASS} ${isWorld ? ACTIVE_TAB_CLASS : ""}`}
        >
          World Map
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/users/$username")({
  component: UserLayout,
});
