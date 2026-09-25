import { createFileRoute, redirect } from "@tanstack/react-router";

// Dashboard and World Map were merged into a single screen at
// `/users/$username`. This route is kept (rather than removed) so existing
// links/bookmarks to `/users/$username/world` still resolve.
export const Route = createFileRoute("/users/$username/world")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/users/$username", params, replace: true });
  },
});
