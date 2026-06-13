import { createRoute, Outlet } from "@tanstack/react-router"
import { Route as OrgRoute } from "../route"

export const Route = createRoute({
  getParentRoute: () => OrgRoute,
  path: "$slug",
  component: () => <Outlet />,
})
