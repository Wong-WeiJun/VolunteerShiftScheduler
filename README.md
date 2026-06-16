# ShiftMate

> **Zero-friction volunteer shift scheduling for nonprofits.**
>
> Create a shareable shift board in seconds — no user accounts, no subscriptions.


[![Python](https://img.shields.io/badge/python-3.13-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Quick Links

| | Link |
|---|---|
| 🚀 **Live Demo** | [https://shiftmate.vercel.app](https://shiftmate-project.vercel.app/) |
| 📖 **API Docs** | [https://shiftmate-backend.onrender.com/docs](https://shiftmate-backend.onrender.com/docs) |
| 🏗️ **Backend** | Render + FastAPI |
| 🎨 **Frontend** | Vercel + React + Vite |
| 🗄️ **Database** | Neon (Serverless PostgreSQL) |

---

## What is ShiftMate?

ShiftMate is a full-stack web application that lets volunteer coordinators create shift boards and share them with their community. No login required for volunteers — they sign up with their name and email. The coordinator gets an admin dashboard with:

- A **public board link** to share anywhere
- An **admin dashboard** with bearer-token auth
- **Email confirmations** with calendar invites (ICS attachments)
- **CSV export** of all signups

I built this to solve a real problem: nonprofits juggling spreadsheets and WhatsApp groups to coordinate volunteers.

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        SHIFTMATE                             │
├────────────────────┬────────────────────┬───────────────────┤
│    Frontend        │     Backend        │    Infrastructure │
├────────────────────┼────────────────────┼───────────────────┤
│ React 19           │ FastAPI 0.128      │ Vercel (CDN)      │
│ TypeScript         │ Uvicorn (ASGI)     │ Render (Web Svcs) │
│ Vite               │ SQLModel + SQLA 2  │ Neon (Postgres)   │
│ TanStack Router    │ Alembic Migrations │ Resend (Email)    │
│ TanStack Query     │ Pydantic v2        │ Docker (local)    │
│ Tailwind CSS v4    │ Pytest + asyncio   │ GitHub Actions    │
│ Lucide Icons       │                    │                   │
└────────────────────┴────────────────────┴───────────────────┘
```

---

## Key Features

### For Volunteer Coordinators (Admin)
- ⚡ **Instant board creation** — organization name + email → public board link
- 🔐 **Token-based admin access** — no passwords to remember; admin link auto-authenticates via `Bearer` token
- 📅 **Create shifts** with date, time, location, capacity, and notes
- 📊 **Real-time signup tracking** — see how full each shift is
- 📥 **Export volunteer list as CSV** — name, email, shift, timestamp
- 📧 **Automated confirmation emails** — volunteers receive ICS calendar invites on signup (via Resend)

### For Volunteers
- 🔗 **One-click signup** — no account creation, just name + email
- 📅 **Calendar invites** — ICS file attached to confirmation email
- 🗺️ **Public board** — clean, mobile-friendly shift grid
- ⚠️ **Capacity enforcement** — prevents overbooking, shows "Full" / spots left

### Engineering
- 🔄 **Async everything** — `async` SQLAlchemy + FastAPI for concurrent request handling
- 🧪 **18 automated tests** — 96%+ coverage on API routes (pytest + in-memory SQLite)
- 🐳 **Docker Compose** — one-command local dev environment
- 🚀 **CI/CD** — GitHub Actions runs tests + build on every PR
- 🔗 **CORS configured** — production-safe origin allowlist
- ♻️ **Auto schema migration** — tables created on startup + Alembic for versioned migrations

---

## Architecture Decisions

### Why FastAPI + SQLModel?
Pydantic models act as both schema validation *and* ORM models. One source of truth for `Org`, `Shift`, and `SignUp` — no drift between API contract and database. Async SQLAlchemy means one backend worker can handle many concurrent requests without blocking.

### Why TanStack Router + Query?
Type-safe routing with full TypeScript inference. Query caching eliminates redundant API calls — the public board and admin dashboard share the same `org` cache. Route-based code splitting keeps bundle size minimal.

### Why Neon (Serverless Postgres)?
Neon auto-suspends on inactivity (free tier friendly). `pool_pre_ping=True` reconnects transparently after wake-up — volunteers don't experience cold-start delays.

### Why no traditional user auth?
For this use case, passwords and login flows add friction. A cryptographically random `admin_token` (32-byte hex) stored in `localStorage` provides stateless, shareable admin access. The tradeoff is acceptable because there's no PII beyond name + email.

---

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Node.js 24+ (for local frontend dev without Docker)
- Python 3.13+ (for local backend dev without Docker)

### One-line local setup (Docker)

```bash
git clone https://github.com/wongweijun/shiftmate.git
cd shiftmate
cp .env.example .env
# Edit .env with your values, then:
docker compose up -d
docker compose logs -f backend  # wait for "Uvicorn running"
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:8000
- API Docs → http://localhost:8000/docs

### Running tests

```bash
# Backend (in-memory SQLite, no Docker needed)
cd backend
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx aiosqlite
cd .. && pytest -v

# Frontend type check + build
cd frontend
npm ci
npm run build
```

### Adding a database migration

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

---

## Project Structure

```
shiftmate/
├── .github/workflows/ci.yml      # GitHub Actions: tests + build + docker smoke
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic Settings (env var validation)
│   │   │   ├── database.py       # Async engine + dependency injection
│   │   │   └── schemas.py        # CamelCase request/response models
│   │   ├── models.py             # SQLModel ORM (Org, Shift, SignUp)
│   │   ├── routes/org.py         # All API endpoints (6 routes)
│   │   ├── utils.py              # ICS calendar generation + Resend email
│   │   └── main.py               # FastAPI app factory + lifespan
│   ├── alembic/                  # Database migrations
│   ├── tests/
│   │   ├── conftest.py           # SQLite test DB + async fixtures
│   │   └── test_org.py           # 18 API tests (CRUD + auth + edge cases)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── Procfile                  # Render start command
├── frontend/
│   ├── src/
│   │   ├── lib/api.ts            # Typed fetch wrapper + API functions
│   │   ├── routes/               # TanStack Router file-based routes
│   │   │   ├── index.tsx         # Landing page + org creation
│   │   │   └── org/
│   │   │       ├── $slug/        # Public board
│   │   │       ├── $slug/admin.tsx
│   │   │       └── $slug/shift/$shiftId.tsx
│   │   └── components/ui/        # shadcn/radix primitives
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json               # SPA rewrite rules
├── docker-compose.yml
├── render.yaml                   # Render Blueprint (infra-as-code)
├── DEPLOY.md                     # Step-by-step deployment guide
└── README.md                     # You are here
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orgs/` | — | Create organization (returns slug + admin token) |
| `GET` | `/orgs/{slug}` | — | Public board data (org + shifts + signup counts) |
| `POST` | `/orgs/{slug}/shifts` | — | Add a new shift |
| `GET` | `/orgs/{slug}/shifts/{id}` | — | Single shift detail |
| `POST` | `/orgs/{slug}/shifts/{id}/signup` | — | Volunteer signup (triggers confirmation email) |
| `GET` | `/orgs/{slug}/signups` | Bearer token | Admin: list all signups with shift info |

Full interactive docs available at `/docs` (Swagger) or `/redoc` (ReDoc) when running.

---

## Challenges & What I Learned

**Async database testing was tricky.** Pytest fixtures are sync by default; `pytest-asyncio` with transactional isolation per test required careful fixture nesting. The `conftest.py` setup uses `connection.begin()` + rollback to give each test a clean database state without recreating tables — 18 tests run in ~0.16s.

**Email delivery is unreliable without verification.** Resend requires domain verification for non-sandbox sends. Instead of hard-failing, the app gracefully skips email sending when `RESEND_KEY` is unset — the core signup flow still works.

**TypeScript ↔ Pydantic serialization mismatch.** SQLModel uses snake_case for DB columns but the frontend API uses camelCase. I wrote a `CamelModel` base with `alias_generator=to_camel` and `populate_by_name=True` so Pydantic handles both directions automatically.

---

## Future Improvements

- [ ] **Recurring shifts** — weekly/monthly shift templates
- [ ] **Waitlist** — auto-promote when a spot opens up
- [ ] **Email reminders** — 24h before shift via cron job
- [ ] **Shift categories/tags** — filter by skill or role
- [ ] **i18n** — support for multilingual volunteer communities
- [ ] **PWA** — offline board viewing + push notifications

---

## License

MIT — free for nonprofits and personal use.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Wong-WeiJun/">Wei Jun</a>
</p>
