import { createRoute, Outlet } from "@tanstack/react-router"
import { rootRoute } from "../__root"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "org",
  component: () => <Outlet />,
})
