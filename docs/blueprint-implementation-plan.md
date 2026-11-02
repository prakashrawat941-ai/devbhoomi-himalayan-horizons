# Blueprint implementation plan

Source of truth: DevBhoomi Himalayan Horizons Master Project Blueprint v1.0 (25 October 2026).

## Guardrails
- Work only on `feature/blueprint-alignment`; do not merge to `main` or deploy without explicit owner approval.
- Preserve the current TanStack Start, React, TypeScript, Vite, and Supabase architecture unless the owner explicitly approves a migration.
- Never put service-role keys, provider secrets, or private personal data in client code or committed files.
- Do not claim live availability, fares, weather, road status, or booking confirmation without verified provider data.
- Treat database migrations as additive and reviewed; do not run migrations against production during this implementation.
- Keep homestay images private and use signed URLs; verify bucket configuration before changing storage policies.

## Delivery phases and exit gates

### Phase 0 — Baseline and safety
- [x] Read current repository structure and key source files.
- [x] Create isolated branch from `main`.
- [ ] Capture baseline build, lint, and test results.
- [ ] Review every route, migration, workflow, environment file, and deployment mapping.
- [ ] Record existing defects before changing behavior.

### Phase 1 — Foundation and security
- [ ] Validate environment variables and ensure secrets are not tracked.
- [ ] Resolve storage access policy against the private-bucket requirement.
- [ ] Verify role grants and RLS boundaries for customer, partner, driver, and admin.
- [ ] Enforce allowed status transitions in database/server-side logic.
- [ ] Review audit logging and authorization for sensitive actions.
- [ ] Align CI workflows with Bun/Vite/TanStack Start and run checks.

### Phase 2 — Public discovery experience
- [ ] Align global navigation and homepage with the editorial, village-first blueprint.
- [ ] Keep the hero free of a search bar; avoid duplicate oversized cab promotions.
- [ ] Complete responsive village, culture, homestay, and workation discovery.
- [ ] Add clear freshness/verification labels and empty/error/loading states.
- [ ] Verify accessibility, metadata, bilingual-ready content, and mobile navigation.

### Phase 3 — Trip planning and reports
- [ ] Validate itinerary and budget calculations and label estimates clearly.
- [ ] Add save/load, report, print/export/share workflows with safe fallbacks.
- [ ] Integrate external routing/weather only after provider and usage decisions are confirmed.
- [ ] Never present estimated or stale data as verified live data.

### Phase 4 — Cab request workflow
- [ ] Keep launch corridor restricted to supported Delhi/Chandigarh–Almora routes.
- [ ] Verify customer, driver, and admin permissions and lifecycle transitions.
- [ ] Distinguish request received, driver assigned, fare confirmed, cancelled, and completed.
- [ ] Add duplicate submission/idempotency and operational error handling where applicable.

### Phase 5 — Partner, admin, and operational workflows
- [ ] Verify partner application, review, approval, listing, and image workflows.
- [ ] Verify admin screens use real protected data, not placeholder metrics.
- [ ] Add moderation, settings, notification, and audit views only where backend support exists.
- [ ] Defer payments and other provider-dependent services until business/provider decisions are approved.

### Phase 6 — QA and release
- [ ] Run build, lint, unit tests, and security checks.
- [ ] Run authenticated and unauthenticated acceptance tests for each role.
- [ ] Test RLS with cross-user access attempts and invalid state transitions.
- [ ] Verify staging smoke tests, production commit mapping, rollback plan, and monitoring.
- [ ] Open a reviewable pull request; merge/deploy only after owner approval.

## Status
This file is a work tracker, not evidence that the listed features are implemented. All unchecked items remain open until verified with code/test evidence.
