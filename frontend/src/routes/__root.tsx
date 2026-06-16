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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Heart className="h-3 w-3 text-paprika" />
            <span>Built for volunteer-run organizations everywhere</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Wong-WeiJun"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition-colors"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.74.4-1.26.72-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .3.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5Z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/wei-jun-wong-507069357/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition-colors"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
