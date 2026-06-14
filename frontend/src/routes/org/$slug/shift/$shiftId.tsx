import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { createRoute, Link } from "@tanstack/react-router"
import { getShift, signupForShift } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Clock, Users, ArrowLeft, CheckCircle2, Loader2, UserCheck } from "lucide-react"
import { Route as SlugRoute } from "../route"

export const Route = createRoute({
  getParentRoute: () => SlugRoute,
  path: "shift/$shiftId",
  component: ShiftDetailPage,
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function ShiftDetailPage() {
  const { slug, shiftId } = Route.useParams()
  const shiftIdNum = Number(shiftId)

  const { data: shift, isLoading, error } = useQuery({
    queryKey: ["shift", slug, shiftId],
    queryFn: () => getShift(slug, shiftIdNum),
  })

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-160px)] bg-paper">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-cream-deep rounded" />
            <div className="h-10 w-3/4 bg-cream-deep rounded-lg" />
            <div className="h-40 bg-white rounded-xl card-shadow" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !shift) {
    return (
      <div className="min-h-[calc(100dvh-160px)] bg-paper">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
          <Card className="p-8 text-center border-cream-deep">
            <h2 className="font-display text-xl font-bold text-ink mb-2">Shift not found</h2>
            <p className="text-sm text-muted-foreground mb-4">This shift may have been removed or the link is incorrect.</p>
            <Link
              to="/org/$slug"
              params={{ slug }}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Back to board
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const signupCount = shift.signupCount ?? 0
  const spotsLeft = shift.capacity - signupCount
  const isFull = spotsLeft <= 0

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
        <Link
          to="/org/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-terracotta transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to board
        </Link>

        {/* Shift Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
              <CalendarDays className="h-3 w-3" />
              {formatDateShort(shift.date)}
            </span>
            {isFull ? (
              <Badge variant="danger">Full</Badge>
            ) : spotsLeft <= 3 ? (
              <Badge variant="warning">{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</Badge>
            ) : (
              <Badge variant="success">Open</Badge>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight text-balance">
            {shift.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <InfoCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Date"
            value={formatDate(shift.date)}
          />
          <InfoCard
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            value={`${shift.startTime} – ${shift.endTime}`}
          />
          <InfoCard
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={shift.location}
          />
        </div>

        {shift.notes && (
          <Card className="mb-8 border-cream-deep p-5 sm:p-6 bg-amber/5 border-amber/20">
            <p className="text-sm text-ink-light leading-relaxed">{shift.notes}</p>
          </Card>
        )}

        <div className="flex items-center gap-2 mb-6">
          <Users className="h-4 w-4 text-ink-muted" />
          <span className="text-sm text-ink-muted">
            <strong className="text-ink">{signupCount}</strong> of <strong className="text-ink">{shift.capacity}</strong> volunteer spots filled
          </span>
        </div>

        {/* Signup Form */}
        {isFull ? (
          <Card className="border-cream-deep p-6 sm:p-8 text-center bg-muted">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-paprika/10">
              <Users className="h-5 w-5 text-paprika" />
            </div>
            <h3 className="font-display font-bold text-lg text-ink mb-2">This shift is full</h3>
            <p className="text-sm text-muted-foreground">
              All {shift.capacity} spots have been taken. Check the board for other available shifts.
            </p>
          </Card>
        ) : (
          <SignupForm slug={slug} shiftId={shiftIdNum} />
        )}
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-cream-deep p-4">
      <div className="flex items-center gap-2 text-ink-muted mb-1.5">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-ink">{value}</p>
    </Card>
  )
}

function SignupForm({ slug, shiftId }: { slug: string; shiftId: number }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: () => signupForShift(slug, shiftId, { volunteerName: name.trim(), volunteerEmail: email.trim() }),
    onSuccess: () => {
      setSubmitted(true)
      setName("")
      setEmail("")
    },
  })

  if (submitted) {
    return (
      <Card className="border-sage border-opacity-30 p-6 sm:p-8 bg-sage/5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/15 flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-sage" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-ink mb-1">You're signed up!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you for volunteering. The organization has been notified of your signup.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-cream-deep">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserCheck className="h-4 w-4 text-terracotta" />
          <h3 className="font-display font-bold text-ink">Sign up for this shift</h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim() || !email.trim()) return
            mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volunteer-name">Your name</Label>
              <Input
                id="volunteer-name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteer-email">Email address</Label>
              <Input
                id="volunteer-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          {mutation.isError && (
            <div className="rounded-md bg-paprika/10 px-3 py-2.5 text-sm text-paprika">
              {mutation.error instanceof Error ? mutation.error.message : "Signup failed. Please try again."}
            </div>
          )}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={mutation.isPending}
            size="lg"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing up...
              </>
            ) : (
              <>Confirm signup</>
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
