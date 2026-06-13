import { useQuery } from "@tanstack/react-query"
import { createRoute, Link } from "@tanstack/react-router"
import { getOrg } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Clock, Users, ArrowRight, CalendarX } from "lucide-react"
import { Route as SlugRoute } from "./route"

export const Route = createRoute({
  getParentRoute: () => SlugRoute,
  path: "/",
  component: OrgPublicBoard,
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function timeDisplay(start: string, end: string) {
  return `${start} – ${end}`
}

function OrgPublicBoard() {
  const { slug } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ["org", slug],
    queryFn: () => getOrg(slug),
  })

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState />
  }

  const org = data!
  const upcoming = org.shifts.filter((s) => new Date(s.date) >= new Date(new Date().toDateString()))
  const past = org.shifts.filter((s) => new Date(s.date) < new Date(new Date().toDateString()))

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Org header */}
        <div className="mb-10 sm:mb-14">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight text-balance">
            {org.name}
          </h1>
          <p className="mt-2 text-ink-muted text-sm sm:text-base">
            {upcoming.length} upcoming shift{upcoming.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Shifts grid */}
        {upcoming.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((shift, i) => {
              const spotsLeft = shift.capacity - shift.signupCount
              const isFull = spotsLeft <= 0
              return (
                <Link
                  key={shift.id}
                  to="/org/$slug/shift/$shiftId"
                  params={{ slug, shiftId: String(shift.id) }}
                  className={`group block rounded-xl bg-white shift-card-variant-${i % 6} card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="font-display font-bold text-ink text-lg leading-tight group-hover:text-terracotta transition-colors">
                        {shift.title}
                      </h2>
                      <ArrowRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-ink-muted">
                        <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatDate(shift.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-muted">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{timeDisplay(shift.startTime, shift.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-muted">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{shift.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-cream-deep">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-sage" />
                        <span className="text-sm font-medium text-ink-light">
                          {shift.signupCount}/{shift.capacity}
                        </span>
                      </div>
                      {isFull ? (
                        <Badge variant="danger">Full</Badge>
                      ) : spotsLeft <= 3 ? (
                        <Badge variant="warning">{spotsLeft} left</Badge>
                      ) : (
                        <Badge variant="success">Open</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Past shifts */}
        {past.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-lg text-ink-muted mb-4">Past shifts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
              {past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((shift, i) => (
                <Link
                  key={shift.id}
                  to="/org/$slug/shift/$shiftId"
                  params={{ slug, shiftId: String(shift.id) }}
                  className={`block rounded-xl bg-white shift-card-variant-${i % 6} card-shadow`}
                >
                  <div className="p-5">
                    <h2 className="font-display font-bold text-ink text-base mb-2">{shift.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-ink-muted">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(shift.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Users className="h-3.5 w-3.5 text-ink-muted" />
                      <span className="text-sm text-ink-muted">{shift.signupCount} signed up</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-[calc(100dvh-160px)] bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="h-10 w-48 bg-cream-deep rounded-lg animate-pulse mb-4" />
        <div className="h-5 w-32 bg-cream-deep rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-white rounded-xl card-shadow animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="min-h-[calc(100dvh-160px)] bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
        <Card className="mx-auto max-w-md text-center p-10 border-cream-deep">
          <h2 className="font-display text-xl font-bold text-ink mb-2">Could not load shifts</h2>
          <p className="text-sm text-muted-foreground">This organization may not exist yet, or the server might be down.</p>
        </Card>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md text-center py-12">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep mb-4">
        <CalendarX className="h-6 w-6 text-ink-muted" />
      </div>
      <h2 className="font-display text-lg font-bold text-ink mb-1.5">No upcoming shifts yet</h2>
      <p className="text-sm text-muted-foreground">Check back later — the organization will post shifts here soon.</p>
    </div>
  )
}
