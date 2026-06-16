import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createRoute, Link } from "@tanstack/react-router"
import { getOrg, getSignups, createShift } from "@/lib/api"
import type { CreateShiftInput } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  CalendarDays, MapPin, Clock, Users, Plus, X, Copy, Check,
  ExternalLink, Download, Loader2, ArrowLeft,
} from "lucide-react"
import { Route as SlugRoute } from "./route"

export const Route = createRoute({
  getParentRoute: () => SlugRoute,
  path: "/admin",
  component: AdminDashboard,
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function formatDateTime(isoStr: string) {
  const d = new Date(isoStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function AdminDashboard() {
  const { slug } = Route.useParams()
  const search = Route.useSearch() as { token?: string }
  const [activeTab, setActiveTab] = useState("shifts")

  // Store token from URL query param
  useEffect(() => {
    if (search.token) {
      localStorage.setItem("shiftmate_admin_token", search.token)
    }
  }, [search.token])

  const { data: org, isLoading: orgLoading, error: orgError } = useQuery({
    queryKey: ["org", slug],
    queryFn: () => getOrg(slug),
  })

  const { data: signups, isLoading: signupsLoading } = useQuery({
    queryKey: ["signups", slug],
    queryFn: () => getSignups(slug),
    enabled: orgLoading === false && orgError === null,
  })

  if (orgLoading) {
    return (
      <div className="min-h-[calc(100dvh-160px)] bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-cream-deep rounded-lg" />
            <div className="h-32 bg-white rounded-xl card-shadow" />
          </div>
        </div>
      </div>
    )
  }

  if (orgError || !org) {
    return (
      <div className="min-h-[calc(100dvh-160px)] bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
          <Card className="p-8 text-center border-cream-deep">
            <h2 className="font-display text-xl font-bold text-ink mb-2">Organization not found</h2>
            <p className="text-sm text-muted-foreground">This organization doesn't exist or there was a problem loading it.</p>
          </Card>
        </div>
      </div>
    )
  }

  const publicBoardUrl = `${window.location.origin}/org/${slug}`
  const adminUrl = `${window.location.origin}/org/${slug}/admin?token=${search.token || localStorage.getItem("shiftmate_admin_token") || ""}`

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/org/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-terracotta transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            View public board
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                {org.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Admin dashboard</p>
            </div>
            <CopyLinkButton label="Copy board link" url={publicBoardUrl} />
          </div>
        </div>

        {/* Share Links */}
        <Card className="mb-8 border-cream-deep bg-white">
          <div className="p-4 sm:p-5">
            <h2 className="font-display font-bold text-sm mb-3 text-ink">Share links (please copy down the adminlink)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShareLinkRow label="Public board" url={publicBoardUrl} />
              <ShareLinkRow label="Admin link" url={adminUrl} />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs>
          <TabsList className="mb-6">
            <TabsTrigger isActive={activeTab === "shifts"} onClick={() => setActiveTab("shifts")}>
              Shifts
            </TabsTrigger>
            <TabsTrigger isActive={activeTab === "signups"} onClick={() => setActiveTab("signups")}>
              Signups
              {signups && signups.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {signups.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent isActive={activeTab === "shifts"}>
            <ShiftsTab slug={slug} shifts={org.shifts} />
          </TabsContent>

          <TabsContent isActive={activeTab === "signups"}>
            <SignupsTab signups={signups} isLoading={signupsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function CopyLinkButton({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-sage" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied" : label}
    </Button>
  )
}

function ShareLinkRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 bg-cream-warm rounded-lg px-3 py-2.5">
      <span className="text-xs font-medium text-ink-muted shrink-0 w-20">{label}</span>
      <code className="text-xs text-ink truncate flex-1 font-mono bg-transparent">{url}</code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        className="shrink-0 text-ink-muted hover:text-terracotta transition-colors"
        title="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-sage" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-ink-muted hover:text-terracotta transition-colors"
        title="Open"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

function ShiftsTab({ slug, shifts }: { slug: string; shifts: { id: string; title: string; date: string; startTime: string; endTime: string; location: string; capacity: number; signupCount: number }[] }) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CreateShiftInput>({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: 10,
    notes: "",
  })

  const mutation = useMutation({
    mutationFn: () => createShift(slug, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", slug] })
      setFormData({ title: "", date: "", startTime: "", endTime: "", location: "", capacity: 10, notes: "" })
      setShowForm(false)
    },
  })

  const upcoming = shifts.filter((s) => new Date(s.date) >= new Date(new Date().toDateString()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-ink">
          {upcoming.length} upcoming shift{upcoming.length !== 1 ? "s" : ""}
        </h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
          {showForm ? "Cancel" : "New shift"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-cream-deep">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            className="p-5 sm:p-6 space-y-4"
          >
            <h3 className="font-display font-bold text-base text-ink">Create a new shift</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shift-title">Shift title</Label>
                <Input
                  id="shift-title"
                  placeholder="e.g. Morning Outreach"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-date">Date</Label>
                <Input
                  id="shift-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-location">Location</Label>
                <Input
                  id="shift-location"
                  placeholder="Where?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-start">Start time</Label>
                <Input
                  id="shift-start"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-end">End time</Label>
                <Input
                  id="shift-end"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-capacity">Capacity</Label>
                <Input
                  id="shift-capacity"
                  type="number"
                  min={1}
                  max={999}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shift-notes">Notes (optional)</Label>
                <Textarea
                  id="shift-notes"
                  placeholder="Any extra info volunteers should know..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            {mutation.isError && (
              <div className="rounded-md bg-paprika/10 px-3 py-2.5 text-sm text-paprika">
                {mutation.error instanceof Error ? mutation.error.message : "Failed to create shift"}
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create shift"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Shifts list */}
      {upcoming.length === 0 ? (
        <Card className="p-8 text-center border-cream-deep">
          <p className="text-sm text-muted-foreground">No shifts yet. Create one above to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((shift) => {
            const spotsLeft = shift.capacity - shift.signupCount
            return (
              <Card key={shift.id} className="border-cream-deep">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="font-display font-bold text-ink">{shift.title}</h3>
                      <Link
                        to="/org/$slug/shift/$shiftId"
                        params={{ slug, shiftId: String(shift.id) }}
                        className="text-ink-muted hover:text-terracotta transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(shift.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {shift.startTime} – {shift.endTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {shift.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="h-3.5 w-3.5 text-sage" />
                      <span className="font-medium text-ink">{shift.signupCount}/{shift.capacity}</span>
                      <span className="text-ink-muted">filled</span>
                    </div>
                    {spotsLeft <= 0 ? (
                      <Badge variant="danger">Full</Badge>
                    ) : (
                      <Badge variant="success">{spotsLeft} left</Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SignupsTab({ signups, isLoading }: { signups?: { id: string; name: string; email: string; createdAt: string; shift?: { id: string; title: string } }[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-white rounded-lg card-shadow" />
        ))}
      </div>
    )
  }

  if (!signups || signups.length === 0) {
    return (
      <Card className="p-8 text-center border-cream-deep">
        <p className="text-sm text-muted-foreground">No one has signed up yet. Share your board link to get volunteers on board.</p>
      </Card>
    )
  }

  const exportCsv = () => {
    const headers = ["Name", "Email", "Shift", "Signed Up At"]
    const rows = signups.map((s) => [
      s.name,
      s.email,
      s.shift?.title || "–",
      formatDateTime(s.createdAt),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "volunteer-signups.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-ink">{signups.length} volunteer{signups.length !== 1 ? "s" : ""}</h2>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>
      <Card className="border-cream-deep overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Signed up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-ink">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.shift?.title || "–"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(s.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
