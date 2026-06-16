const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

function getToken(): string | null {
  return localStorage.getItem("shiftmate_admin_token")
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || res.statusText)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

export interface Org {
  id: string
  slug: string
  name: string
  adminEmail: string
  adminToken: string
  createdAt: string
}

export interface Shift {
  id: string
  orgId: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  notes: string | null
  createdAt: string
  signupCount: number
}

export interface OrgWithShifts extends Org {
  shifts: Shift[]
}

export interface CreateOrgInput {
  orgName: string
  email: string
}

export interface CreateShiftInput {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  notes: string
}

export interface SignupInput {
  name: string
  email: string
}

export interface Signup {
  id: string
  name: string
  email: string
  shiftId: string
  createdAt: string
  shift?: { id: string; title: string }
}

export function createOrg(data: CreateOrgInput) {
  return api<Org>("/orgs/", { method: "POST", body: JSON.stringify(data) })
}

export function getOrg(slug: string) {
  return api<OrgWithShifts>(`/orgs/${slug}`)
}

export function getShift(slug: string, shiftId: string) {
  return api<Shift>(`/orgs/${slug}/shifts/${shiftId}`)
}

export function createShift(slug: string, data: CreateShiftInput) {
  return api<Shift>(`/orgs/${slug}/shifts`, { method: "POST", body: JSON.stringify(data) })
}

export function signupForShift(slug: string, shiftId: string, data: SignupInput) {
  return api<Signup>(`/orgs/${slug}/shifts/${shiftId}/signup`, { method: "POST", body: JSON.stringify(data) })
}

export function getSignups(slug: string) {
  return api<Signup[]>(`/orgs/${slug}/signups`)
}
