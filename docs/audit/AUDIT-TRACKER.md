# Audit tracker — 2026-09-06

Scope: attachment ad96ea29; AUDIT ONLY. No product changes, migrations, commits, deployments or new releases.

## Evidence already collected

- Source tests: 63/63 pass using `node --import tsx --test` on all seven source test files. Initial sandbox loader failed (Windows userInfo ENOMEM); elevated local run passed.
- Mobile typecheck passed. API/web no-emit typecheck passed with composite/incremental disabled. Initial no-emit command rejected composite configuration; this was a command issue, not a product failure.
- Repository is extensively dirty before audit. Preserve all pre-existing changes.
- Local API 4000 refused; local HTTP 5173 responds (identity of service not yet verified).
- Hosted network checks denied EACCES in sandbox; elevated read-only check pending.
- ADB sandbox startup failed; device inventory pending.

## Confirmed source leads (not yet final finding IDs)

- cPanel release template prescribes NODE_ENV=development; server enables spoofable identity/role headers whenever not production.
- OTP upsert resets existing account status to active. OTP consumption precedes session creation; concurrency updates do not verify affected rows.
- Refresh reads before transaction, revokes without conditional lock: replay race.
- Public content detail lacks status/deleted/expiry restriction. Public transport detail lacks publication restriction.
- Push endpoint accepts arbitrary HTTPS/internal URLs, then web-push sends to them.
- Identity revoke sets revoked_at on reject, not revoke. Legacy profile fallback remains; multiple sources disagree.
- Feed adds eight trust queries per item; detail loads full feed twice. Inbox adds six queries per conversation, history returns oldest 100 and marks all read.
- Local media response always an image MIME; WebM ASCII comparison suspect.
- Mobile active chat is V3; badges added to inactive V1/V2. Detail badge requires business profile; no native identity submission.
- Native Gradle 0.1.14/code18 differs Expo 0.1.15/code19; release signing uses debug config.
- Readiness always HTTP200, object_storage hardcoded not_configured; favorites/analytics swallow DB failures.
- SEO canonical/OG/sitemap static home. Support overwrites reply, no history/assignment model.

## Remaining

Finish focused source scan, safe browser/API probes and responsive checks, mobile environment check, dependency audit, evidence verification, sixteen requested reports and prioritized roadmap. Do not re-scan completed areas. Runtime workflows needing isolated DB/real device/credentials must be explicitly BLOCKED, not PASS.
