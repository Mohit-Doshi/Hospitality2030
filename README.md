# Rosewood Intelligence — Hospitality 2030

AI-powered hospitality memory and orchestration platform for **Rosewood Sand Hill**. Helps luxury hotel staff deliver deeply personalized, emotionally intelligent service — not a chatbot.

> *"Rosewood remembers emotional context, not just preferences."*

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Prisma ORM |
| Database | SQLite (local demo); swap to PostgreSQL in `prisma/schema.prisma` |
| AI | Anthropic Claude (optional — graceful fallbacks without API key) |

## Quick start

```bash
# From Hospitality2030/
npm run setup

# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — Web
cd frontend && npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000/api/health  

Optional: set `ANTHROPIC_API_KEY` in `backend/.env` for live narrative generation.

## Demo flow (hackathon)

1. **Arrivals** — View today's guests with narratives, risk flags, and recommendations.
2. **Scenario Simulator** (`/simulate`) — **Single guest** or **Property-wide** mode (WiFi outage, pool/gym closure, weather, etc.) — broadcasts personalized intelligence to all guests.
3. **Live Signals** (`/scenarios`) — Staff view polls every 5s; shows AI analysis, diagnosis, and affinity-based remedies.
4. **Guest profile** — Active scenarios appear at top; new recommendations added from scenario.
5. **Simulate flight delay** — On a guest profile, triggers orchestration timeline updates.
6. **Refresh intelligence** — Regenerates narrative + recommendations (Claude or fallback).
7. **Service Recovery** — Review billing and operational friction with recovery guidance.
8. **Staff Intelligence** — See Elena ↔ guest affinity matches.
9. **Orchestration** — Cross-guest event timeline (T-24h → Arrival).

### Scenario demo script

1. Open **Scenario Simulator** → select **Richard Pemberton** → paste: *"Guest upset about incorrect minibar charges on folio."* → **Send to staff console** (wait ~3–5s for Claude).
2. Send a **second** scenario for the same guest — intelligence uses prior live signals + pending recommendations (escalation, no duplicate outreach).
3. Open **Live Signals** — see complaint classification, recovery diagnosis, staff assignment.
4. Open Richard's **guest profile** — live banner + new recommendations at top.

## Modules

- Guest Memory Engine  
- Dynamic Guest Narrative Engine  
- Arrival Orchestration Dashboard  
- AI Recommendations Engine  
- Service Recovery Intelligence  
- Staff Affinity Routing  
- Hospitality Archetype Engine  
- Invisible Concierge Layer (orchestration events)  

## Project structure

```
backend/          Express API + Prisma + Anthropic services
frontend/         Next.js luxury staff interface
```

## PostgreSQL (production)

In `backend/prisma/schema.prisma`, change provider to `postgresql` and set:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/rosewood"
```

Then run `npx prisma migrate dev`.

---

*Cerebral Valley Hospitality 2030 — Rosewood Sand Hill Hackathon*
