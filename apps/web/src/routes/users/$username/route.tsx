import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LastVisitedRepositoryProvider } from "../../../features/world-map/LastVisitedRepositoryContext";

// This layout route stays mounted across navigation between World Map
// (index) and Repository Detail (child route), so the character-position
// Context lives here rather than on either child (design: see
// LastVisitedRepositoryContext.tsx).
export const Route = createFileRoute("/users/$username")({
  component: () => (
    <LastVisitedRepositoryProvider>
      <Outlet />
    </LastVisitedRepositoryProvider>
  ),
});
