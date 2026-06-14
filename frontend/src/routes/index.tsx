import { useState } from "react"
import { createRoute, useNavigate } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { createOrg } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, Users, CalendarDays, ArrowRight, Loader2 } from "lucide-react"
import { rootRoute } from "./__root"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()
  const [orgName, setOrgName] = useState("")
  const [admin_email, setAdminEmail] = useState("")

  const mutation = useMutation({
    mutationFn: createOrg,
    onSuccess: (data) => {
      navigate({ to: "/org/$slug/admin", params: { slug: data.slug }, search: { token: data.admin_token } })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim() || !admin_email.trim()) return
    mutation.mutate({ name: orgName.trim(), admin_email: admin_email.trim() })
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-4 py-1.5 text-xs font-medium text-terracotta mb-8">
              <Heart className="h-3 w-3" />
              Free for all nonprofits
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight text-balance leading-[1.1] mb-6">
              Organize volunteers
              <br />
              without the
              <br />
              <span className="text-terracotta">hassle</span>
            </h1>
            <p className="text-base sm:text-lg text-ink-muted max-w-md mx-auto leading-relaxed">
              Create a shareable shift board for your NGO in seconds. No accounts, no subscriptions — just a link you share with your community.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream-deep to-transparent" />
      </section>

      {/* Features */}
      <section className="border-b border-cream-deep">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CalendarDays className="h-5 w-5 text-terracotta" />}
              title="Post shifts"
              body="Add volunteer shifts with times, dates, and locations. Dozens or hundreds — no limits."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5 text-sage" />}
              title="Volunteers sign up"
              body="Share your public board link. Volunteers pick shifts without needing to create accounts."
            />
            <FeatureCard
              icon={<Heart className="h-5 w-5 text-paprika" />}
              title="Track everything"
              body="See who's signed up for what at a glance. Export your volunteer list as CSV anytime."
            />
          </div>
        </div>
      </section>

      {/* Create Form */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card className="mx-auto max-w-lg border-cream-deep">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-display text-ink">Create your organization</CardTitle>
              <CardDescription>
                You'll get a shareable shift board link and an admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g. Downtown Food Bank"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Your email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="you@organization.org"
                    value={admin_email}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This is where we'll send your admin link.
                  </p>
                </div>
                {mutation.isError && (
                  <div className="rounded-md bg-paprika/10 px-3 py-2.5 text-sm text-paprika">
                    {mutation.error instanceof Error ? mutation.error.message : "Something went wrong. Please try again."}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create board
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-deep">
        {icon}
      </div>
      <h3 className="font-display font-bold text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  )
}
