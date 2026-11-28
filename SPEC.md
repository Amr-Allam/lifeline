# SPEC.md

## Goal

Let patients/requesters post urgent blood requests and automatically notify matching, verified, available donors in the same city. Admins verify donors and review request history.

## Roles

| Role      | Can do                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| donor     | Register, log in, edit profile, toggle availability                                                                  |
| requester | Register, log in, post requests, view own requests + notification history, search donors, cancel/fulfil own requests |
| admin     | View all system data, verify/unverify donors, update request status. Seeded via script, not self-registered.         |

## Features (MVP)

1. **Auth** — register (role: donor or requester), login, `me`. JWT.
2. **Donor registration** — name, email, password, phone, blood group, city, availability.
3. **Emergency request** — patient name, blood group, units, city, hospital, contact phone, urgency (`critical` | `urgent` | `normal`), notes.
4. **Matching** — see Matching Logic.
5. **Search** — requesters/admin search donors by blood group + city (verified and available only; limited fields).
6. **Notifications** — email via Nodemailer/Ethereal (preview URL stored). SMS = stub that logs and records a notification.
7. **Admin** — verify donors, list all requests (history), see notified donors per request.

Out of scope: compatibility matrix, geolocation/radius, real SMS, donation cooldown.

## Data Models (Mongoose)

**User**: `name`, `email` (unique, lowercase), `passwordHash` (never returned by the API), `phone` (required at registration, optional in the schema so the seeded admin needs none), `role` (`donor|requester|admin`), `createdAt`

**Donor**: `user` (ref User, unique), `bloodGroup` (`A+|A-|B+|B-|AB+|AB-|O+|O-`), `city`, `cityNormalized`, `available` (bool, default true), `verified` (bool, default false), `verifiedAt`, `verifiedBy` (ref User), timestamps

Phone lives only on User. Donor holds bloodGroup, city, cityNormalized, available, verified. `PATCH /donors/me` updates `User.phone` and the Donor fields, and recomputes `cityNormalized` when `city` changes.

**Request**: `requester` (ref User), `patientName`, `bloodGroup`, `unitsNeeded` (int ≥1), `city`, `cityNormalized`, `hospital`, `contactPhone`, `urgency`, `notes`, `status` (`open|fulfilled|cancelled`, default open), `notifiedCount`, timestamps

**Notification**: `request` (ref), `donor` (ref Donor), `channel` (`email|sms`), `status` (`sent|failed`), `previewUrl`, `error`, `sentAt`

Indexes: Donor `{bloodGroup, cityNormalized, available, verified}`; Request `{status, createdAt}`.

## Matching Logic

Given a request, select donors where:

- `bloodGroup` equals the request's `bloodGroup` (exact)
- `cityNormalized` equals the request's `cityNormalized`
- `available === true`
- `verified === true`

City normalization: `trim().toLowerCase().replace(/\s+/g, " ")`.

On request creation: save request → find matches → send email + SMS stub per donor → save a `Notification` per channel per donor → set `notifiedCount` → return request with count. Zero matches is valid (`notifiedCount: 0`).

`notifiedCount` = number of unique donors notified, not the number of Notification records (5 matching donors = `notifiedCount: 5`, even though 10 records are created).

## API

Base `/api`. Auth header: `Authorization: Bearer <token>`.
All successful responses are wrapped in `{ data }`. Login returns `{ data: { token, user } }`. Errors return `{ error: "message" }`.

| Method | Path                             | Access                                    | Purpose                                                                                                           |
| ------ | -------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| POST   | /auth/register                   | public                                    | Register donor or requester (donor fields required if role=donor). Returns `201 { data: { token, user } }`        |
| POST   | /auth/login                      | public                                    | Returns `{ data: { token, user } }`                                                                               |
| GET    | /auth/me                         | auth                                      | Returns `{ data: { user, donor } }`; `donor` is `null` for non-donors                                             |
| GET    | /donors/me                       | donor                                     | Own donor profile                                                                                                 |
| PATCH  | /donors/me                       | donor                                     | Update phone, city, availability                                                                                  |
| GET    | /donors/search?bloodGroup=&city= | requester, admin                          | Verified + available donors; returns name, bloodGroup, city only                                                  |
| POST   | /requests                        | requester                                 | Create request, run matching, notify                                                                              |
| GET    | /requests/mine                   | requester                                 | Own requests                                                                                                      |
| GET    | /requests/:id                    | owner or admin only; anyone else gets 404 | Request + notification history (donor name, blood group, channel, status, previewUrl; never donor email or phone) |
| PATCH  | /requests/:id/status             | owner, admin                              | Set `fulfilled` or `cancelled`                                                                                    |
| GET    | /admin/donors?verified=          | admin                                     | List donors, filter by verification                                                                               |
| PATCH  | /admin/donors/:id/verify         | admin                                     | Body `{ verified: boolean }`                                                                                      |
| GET    | /admin/requests?status=&urgency= | admin                                     | Request history with notification counts                                                                          |

### Auth rules

- Only `donor` and `requester` can self-register; any other role (including `admin`) returns 400.
- Password: 8–72 characters (bcrypt ignores bytes past 72).
- Status codes: 400 validation, 401 missing/invalid token or bad credentials, 403 wrong role, 409 duplicate email.
- Login returns the same message for an unknown email and a wrong password.
- JWT payload: `sub` (user id) and `role`. The server reloads the user on every authenticated request.

## Client Pages

- `/login`, `/register` (role choice)
- Donor: `/donor` dashboard (profile, availability toggle, verification status)
- Requester: `/requests/new`, `/requests` (own list), `/requests/:id` (detail + notified donors + email preview links; admin can also open any request), `/search`
- Admin: `/admin/donors`, `/admin/requests`
- Route guards by role (UX only; the server enforces authorization); redirect unauthenticated users to `/login`.

## Environment Variables

Server: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, optional `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (if absent, auto-create an Ethereal test account). Seed only: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
Client: `VITE_API_URL`.

## Seed

`npm run seed` (server). Idempotent (upsert by email), safe to run repeatedly.

- C2: creates the admin from `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Re-running with the same email updates that admin (including the password). Changing `ADMIN_EMAIL` creates a new admin. If the email belongs to a non-admin user, the seed fails.
- C8: also creates sample donors as User + linked Donor documents, and a few sample requests.
