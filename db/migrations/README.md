# Migration Foundation

Migrationهای واقعی با SQL شفاف و runner داخلی اجرا می‌شوند. ابزار query در Sprint 1 برابر Kysely + pg است.

قواعد:

- هر migration باید reversible یا دارای rollback plan باشد.
- schema باید با `docs/DATABASE_API_DESIGN_FA.md` sync بماند.
- seed داده‌های پایه شهرها و categoryهای MVP باید idempotent باشد.
