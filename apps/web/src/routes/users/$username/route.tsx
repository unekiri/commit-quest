import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$username")({
  component: Outlet,
});
