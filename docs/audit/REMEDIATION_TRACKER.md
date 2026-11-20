# Enterprise remediation — 2026-11-20

## Dependency refresh and authenticated PDF regression

- Fastify 5.12.8, Kysely 0.28.20 and Vite 6.4.6 are locked. Fastify and Vite are deduplicated across the workspace. Audit is down to 11 high and 29 moderate advisories. Expo, Zod and remaining transitive advisories are open.
- The PDF API regression uses a database-backed bearer session against the ordinary server. It verifies authentication, stored bytes, and a status response that omits the document. On-device submission after login remains unverified.
- ADB detected the Pixel emulator. Its installed APK did not contain the Firebase app ID or sender ID resources, and the workspace search found no google-services.json outside dependencies. No live FCM send was attempted. A Firebase-configured development build and matching Expo FCM credentials are required for delivery verification.

## Trust, PDF and push receipts

- Feed trust uses grouped queries across sellers. The database regression verifies distinct listing counts for two sellers.
- Android can select and submit a PDF using the account form. Cache copies are removed after reading. Android bundle export and Pixel startup through Expo Go passed. PDF submission on-device still needs an authenticated test run.
- Expo ticket IDs are persisted by migration 0031. The outbox worker checks delayed receipts, records provider results, expires missing receipts and revokes unregistered tokens. An isolated PostgreSQL test covers a delayed provider error. Real remote delivery still requires a development build with working FCM credentials and a test device token.
- Dependency audit remains open. Attempts to upgrade Kysely and refresh Fastify/Vite did not change locked versions. The current lockfile adds SDK-compatible document picker and filesystem dependencies.

## November 21 follow-up

- An unpublished listing is visible through its detail route to the owner and moderators or admins. Anonymous and unrelated users receive 404. Authorized preview responses are private and are not cached or counted as public views. The isolated PostgreSQL test covers these access boundaries.
- Listing detail now limits related results in SQL. Feed trust lookups are reused per seller within each response. Query batching across distinct sellers remains open.
- Mobile account settings can submit a photo of a national card, birth certificate, or passport for manual review. PDF selection, Android runtime verification, durable push receipt processing, and live device delivery remain open.
- Automatic dependency remediation failed on incompatible Expo peers. Package manifests and the lockfile were preserved. The 42 advisories from the previous audit are still open.

## Follow-up

- OTP verification and session creation now commit together. Failed attempts still commit their counters. The isolated database suite checks rollback of the code and session.
- Both admin review routes persist the decision and database audit event in one transaction. The legacy route requires a pending document for approval or rejection. The account endpoint no longer treats a profile flag as evidence of identity verification.
- The outbox retries when every eligible destination fails and accounts for Expo receipt errors when available. Provider acceptance is distinct from device delivery. Persistent receipt polling, partial delivery retries and real-device checks remain open.
- Authorized unpublished listing preview, batched trust summaries, native document upload and remaining dependency advisories still require work. No production deployment.

## Current increment (supersedes older status below)

User authorized isolated fixture headers, remediation, tests and push to `audit/enterprise-marketplace-transformation`. Explicitly NO server deployment.

- SEC-01: implemented. Ordinary development/test/production servers reject identity/role headers; an explicit test-only factory is required and cannot listen. Five negative regressions pass. Deployment template now requires production configuration.
- AUTH-01: suspended accounts are no longer reactivated by OTP; disabled password login rejected. OTP consumption and attempt increments are conditional atomic updates. Twelve concurrent requests consume a code once and cap wrong attempts at five. OPEN: OTP consumption and session issuance still need one transaction.
- AUTH-02: conditional refresh/session revocation makes twelve competing refresh requests yield one success. Account-state changes during issuance need additional coverage.
- CONTENT-01: public listing, transport, favorite creation and contact entry enforce approved/nondeleted/unexpired content and UUID validation. Eight concurrent favorite requests are idempotent. OPEN: owner/admin preview of unpublished detail needs its own authorized contract.
- PUSH-01: registration and delivery both restrict endpoints to supported HTTPS push providers. Network-level egress controls and delivery-receipt semantics remain open.
- ID-01: verification timestamps preserved on revoke; rejection no longer records revocation in either admin path. Atomic decision/audit, legacy fallback and transition rules remain open.
- MOBILE-01: bodyless requests no longer carry JSON content-type; listing detail and active conversation show server-provided identity badges. Native identity-document submission and real-device regression remain open.
- RELEASE-01: native version derives from Expo config; native release requires external signing credentials. EAS exclusions applied after app inclusion. No APK built or released in this increment.
- PERF-01: redundant full-feed detail lookup removed; trust batching remains open.
- QA: 76/76 source tests passed with isolated PostgreSQL, no skips; workspace build/check, mobile typecheck, bundle budget and six visual cases passed. Cross-browser quality suite found a WebKit button contrast failure; explicit white background corrected it and rerun passed. Dependency changes require a fresh final validation entry.
- DELIVERY-01: empty public repository will receive a reviewed parentless source snapshot on the approved branch; original local history and private QA artifacts stay local. Export excludes env, keys, data, screenshots, binaries and build caches; historical documentation phone numbers are redacted only in the export.

Remaining findings are not waived. This increment is a source handoff, not a production-readiness certification. No hosted migration, destructive cleanup or deployment performed.

### Dependency review

Clean CI visual execution exposed a missing production API default when local env files are absent. Restored the hosted API fallback, made readiness display tolerate missing checks without blanking the page, and isolated all visual API fixtures. Visual harness now starts/stops Vite directly, rejects an occupied QA port and reports browser exceptions. The no-env export passed all six visual cases on its own port after these corrections; the partial health fixture also covers the missing-checks regression.

GitHub CI caught a build-mode mismatch: global NODE_ENV=test retained development output and exceeded the unchanged bundle budget. The web build now explicitly starts Vite with NODE_ENV=production, regardless of the caller's environment. The isolated production rebuild is approximately 365 KiB total JS (largest chunk 269 KiB); CI build also declares production mode. Initial CI passed all 76 tests and fresh migrations before this bundle failure; the correction is tracked in a follow-up commit.

Final verification after dependency resolution: all 76 tests passed without skips, workspace check/build, mobile typecheck, bundle budget, six visual cases and cross-browser quality passed. A separate 388-file source export completed a clean `npm ci --ignore-scripts`, then independently passed build/check, mobile typecheck and all 76 tests against the isolated database. The export has no parent commits, environment secrets, private keys, customer data or QA screenshots. GitHub CI execution is distinct from these local results.

Initial audit: 35 advisories (1 critical, 14 high, 20 moderate). After resolving the Expo peer tree and updating shell-quote to 1.12.0: 42 advisories (0 critical, 14 high, 28 moderate). Counts differ with the resolved dependency tree; this is not a claim that all dependency risk was reduced. Expo is held at the existing 53.0.27 baseline, with no major SDK upgrade. Automatic audit fix encountered peer conflicts. Kysely remains 0.28.8 because the attempted update did not produce a consistent installed/locked tree; do not claim its advisories fixed. Zod/Expo and other remaining advisories block production certification. No forced major upgrade was used.

Authority: master directive attachment 32c4521f. Supersedes audit-only instruction. No production deployment or data mutation authorized without separate approval.

## Discovery

- Local starting commit: 5970bdc; 266 pre-existing dirty/untracked paths; no configured remote.
- GitHub target: AliMahmudi886/4DBazar, public, empty (size 0; no remote refs), default branch metadata main. Authenticated connector identity matches owner; push/admin permissions confirmed.
- Working branch created: audit/enterprise-marketplace-transformation. No push or commit yet.
- Prior audit evidence is historical, not a claim of current production state. See AUDIT-TRACKER.md. Its runtime observations must be dated and revalidated before release.

## Priority queue

| ID | Priority | Issue | Status / exit criterion |
|---|---|---|---|
| SEC-01 | P0 | Header identity/role fallback enabled outside production; deployment template recommends development | Approval requested for policy change; restrict to isolated tests, add negative integration tests, separately approve deploy |
| AUTH-01 | P0 | OTP upsert reactivates account; OTP consumption and session creation separate | Open; preserve disabled state, verify transactions and concurrency with isolated DB |
| AUTH-02 | P0 | Refresh replay race | Open; atomic consume and concurrent integration regression |
| CONTENT-01 | P0 | Public detail lacks publication/deletion filter | Open; separate owner/admin detail from public detail and test all statuses |
| PUSH-01 | P0 | User-controlled push endpoint destination | Open; provider allowlist and network egress policy approval |
| ID-01 | P1 | Revocation timestamp assigned on reject instead of revoke; verification date erased | Local correction implemented; focused tests pending; legacy admin path and transactional audit still open |
| PERF-01 | P1 | Feed trust N+1; full feed fetched twice for detail | Open; batch summaries and bounded related query; measure on staging |
| MOBILE-01 | P1 | Active chat lacks identity badge; native identity flow absent | Open; native/web contract and runtime regression |
| RELEASE-01 | P0 | Native/Expo versions differ; debug release signing | Open; verify signing and artifact manifest, no unverified release |
| DELIVERY-01 | P0 | Public empty target and dirty baseline contain private QA/customer identifiers | Block public bulk upload until sanitized allowlisted snapshot and history reviewed; never git add all |

## Scope and decisions

Nationwide coverage and 10,000 concurrent users are new planning objectives, not current capability. Do not claim readiness from local compilation. Keep modular monolith, existing design system and existing Persian docs; add cross-links instead of duplicating them. No migration, default-branch update, force-push or deployment performed.

## Current safe implementation

ID-01 uses a pure timestamp/reason helper, retaining previous verified_at on revocation and distinguishing revocation from rejection. API response status remains backwards-compatible. No schema change. Four focused tests passed on 2026-11-20. API no-emit typecheck also passed. This does not close identity state-machine, legacy fallback or audit durability gaps.
