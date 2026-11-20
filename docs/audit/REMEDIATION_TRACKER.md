# Enterprise remediation — 2026-11-20

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
