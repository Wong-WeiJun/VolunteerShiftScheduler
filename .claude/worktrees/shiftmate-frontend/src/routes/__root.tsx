import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { Heart, CalendarClock } from "lucide-react"

export const Route = createRootRoute({
  component: RootLayout,
})

export const rootRoute = Route

function RootLayout() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-cream-deep bg-cream/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta text-white shadow-sm">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg font-bold text-ink tracking-tight group-hover:text-terracotta transition-colors">
              ShiftMate
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-cream-deep bg-cream-warm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <Heart className="h-3 w-3 text-paprika" />
          <span>Built for volunteer-run organizations everywhere</span>
        </div>
      </footer>
    </div>
  )
}
