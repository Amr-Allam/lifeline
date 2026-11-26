# AGENTS.md

Project: **LifeLine — Blood Donation and Emergency Help Network**
Repo: `Amr-Allam/lifeline` (branch `main`).
Donors register with blood group + city; patients post urgent requests; matching donors are emailed (test mode).

## Before every task

1. Inspect the latest available project state. Use the first method that works:
   a. Local access (agent on the user's PC): read from the working tree and run `git status` and `git log --oneline -10`. Local uncommitted changes count as the latest state.
   b. GitHub connector, if its tools are available.
   c. Sandbox clone: `git clone https://github.com/Amr-Allam/lifeline.git`, then read the files and `git log --oneline -10`.
   d. Files pasted by the user, if all of the above fail.
   Tell the user which method you used, and tell them when a method failed or is not the most accurate one. If you cannot access the repo, say so and ask for the files; never pretend. When using GitHub or a clone, report the commit SHA inspected. A GitHub read or clone cannot show uncommitted local changes. Do not run `git pull` or overwrite local work unless asked. Do not use `web_fetch` on github.com. Never claim something was verified without having read it from the repo or run it.
2. Read `SPEC.md` (what we build, source of truth for intended behavior), `PROGRESS.md` (current state), `DECISIONS.md` (settled choices).
3. If SPEC.md, PROGRESS.md and the code disagree, point out the discrepancy. Do not silently pick one.
4. Copies of these files in chat or Project knowledge may be stale. The repo wins.

## Stack (fixed)

- Client: React (Vite), plain JavaScript, React Router, axios
- Server: Node.js + Express, Mongoose, MongoDB
- Auth: JWT (Bearer header) + bcrypt
- Validation: zod
- Email: Nodemailer with Ethereal (test mode). SMS is a log-only stub.
- No TypeScript. No new dependencies without asking the user.

## Structure

```
/client   React app (src/pages, src/components, src/api, src/context)
/server   Express API (src/models, src/routes, src/controllers, src/middleware, src/services, src/utils)
SPEC.md  PROGRESS.md  DECISIONS.md  AGENTS.md
```

## Conventions

- API prefix `/api`. All successful responses are `{ data }` (login: `{ data: { token, user } }`). Failures: `{ error: "message" }` with the correct HTTP status.
- Controllers stay thin; matching and notification logic lives in `server/src/services`.
- City is always stored as `city` (display) and `cityNormalized` (trim, lowercase, collapse spaces). Match on `cityNormalized`.
- Phone lives only on `User`. `Donor` holds bloodGroup, city, cityNormalized, available, verified.
- `notifiedCount` = number of unique donors notified, not the number of Notification records.
- Never expose donor email/phone in search results or notification history.
- Secrets only in `.env`; keep `.env.example` up to date.
- Small, focused changes. Match existing code style. No unrelated refactors.

## Security rules

- Hash passwords with bcrypt; never store or return plaintext or `passwordHash`.
- Validate all incoming data with zod.
- Enforce authorization on the server; frontend route guards are UX only.
- Register accepts only role `donor` or `requester`; never trust a client-supplied role for privileged actions.
- Users may only access or modify resources they own (admin excepted). Non-owners get 404 on other users' requests.
- JWT secret and SMTP credentials live only in environment variables.

## Workflow rules

- Work only on the task the user gave. If it conflicts with `SPEC.md` or `DECISIONS.md`, stop and say so.
- Out of scope (do not build): compatibility matrix, geolocation/radius search, real SMS, donation cooldown.
- Ask before significant decisions not already in `DECISIONS.md` (API contracts, data models, dependencies, folder structure, business rules, auth/security): state the problem, options, your recommendation and trade-offs, then wait for approval. Decide routine details yourself.
- After finishing a task, give a short explanation (3–5 lines) of the key code and any architectural choices.
- Report each task's status as Implemented, Tested successfully, Not tested, or Blocked. Never mark work done in `PROGRESS.md` before it is tested.
- Tell the user exactly what to change in `PROGRESS.md` (and `SPEC.md` / `DECISIONS.md` if affected). Do not silently edit them unless asked.
- Tell the user when a logical chunk is ready to commit (see commit points in `PROGRESS.md`). Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`. Do not commit unless asked.
- At the end of each session, give a short `PROGRESS.md` update: done, next, any spec changes.
- If something is ambiguous, ask one short question rather than guessing.
