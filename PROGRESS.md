# PROGRESS.md

**Deadline:** Nov 30, 2026 11:59 PM
**Current focus:** Requests + matching (C4)
**Last updated:** Nov 28, 2026

## Plan

| Day    | Target                                                     |
| ------ | ---------------------------------------------------------- |
| Nov 26 | C1–C2: setup, models, auth + minimal client login/register |
| Nov 27 | C3–C5: donors, requests, matching, notifications           |
| Nov 28 | C6: client donor + requester pages                         |
| Nov 29 | C7–C8: admin, polish, seed, README                         |
| Nov 30 | Buffer, final testing, submit                              |

## Checklist (each item ends at a commit point)

### C1 — Setup (`chore: scaffold client and server`)

- [x] Repo + folder structure (`/client`, `/server`)
- [x] Server: Express, Mongoose connection, error middleware, `.env.example`
- [x] Client: Vite + React, Router, axios instance
- [x] Docs in repo root: AGENTS.md, SPEC.md, PROGRESS.md, DECISIONS.md

### C2 — Auth + models (`feat: auth, data models and client login`)

- [x] User, Donor, Request, Notification models
- [x] City normalization util (moved here from C4)
- [x] Register / login / me, JWT + role middleware
- [x] Seed script (admin)
- [x] Client Login/Register pages working against the API

### C3 — Donors (`feat: donor profile and search`)

- [x] GET/PATCH `/donors/me`
- [x] GET `/donors/search`

### C4 — Requests + matching (`feat: emergency requests and matching`)

- [ ] Matching service
- [ ] POST `/requests`, GET `/requests/mine`, GET `/requests/:id`, PATCH status

### C5 — Notifications (`feat: email notifications and sms stub`)

- [ ] Nodemailer + Ethereal service
- [ ] SMS stub
- [ ] Notification records + `notifiedCount`

### C6 — Client core (`feat: client donor and requester pages`)

- [ ] Auth context + route guards
- [ ] Donor dashboard
- [ ] Post request, My requests, Request detail, Search

### C7 — Admin (`feat: admin verification and request history`)

- [ ] Admin API: donors list, verify, requests history
- [ ] Admin pages

### C8 — Polish (`docs: readme, seed data, final fixes`)

- [ ] Seed demo data (idempotent)
- [ ] Validation + error messages pass
- [ ] README (setup, env, demo accounts)
- [ ] End-to-end manual test of main flow

## In progress

Nothing.

## Done

- C1 — Setup: `/client` (Vite, React, Router, axios instance) and `/server` (Express, Mongoose connection, error middleware, `/api/health`, `.env.example`). Committed as `chore: scaffold client and server`.
- C2 — Auth + models: User, Donor, Request, Notification models; city normalization util; register/login/me with JWT and role middleware; admin seed (`npm run seed`); client Login/Register pages. Tested manually with Postman against Atlas. Committed as `feat: auth, data models and client login`.
- C3 — Donors: GET/PATCH `/api/donors/me`, GET `/api/donors/search` (verified + available only; name, bloodGroup, city). Tested manually with Postman against Atlas. Committed as `feat: donor profile and search`.

## Known issues

None.
