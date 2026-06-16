import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { Heart, CalendarClock, Github, Linkedin } from "lucide-react"

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
        {/* Changed justify-center to justify-between */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
          
          {/* Left/Center Text block (Wrapped in an items-center flex container) */}
          <div className="flex items-center gap-2">
            <Heart className="h-3 w-3 text-paprika" />
            <span>Built for volunteer-run organizations everywhere</span>
          </div>

          {/* Right side social links block */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Wong-WeiJun" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-ink transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a 
              href="https://www.linkedin.com/in/wei-jun-wong-507069357/" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-ink transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

        </div>
      </footer>
    </div>
  )
}
