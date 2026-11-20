alter table market_contents
  add column if not exists updated_at timestamptz not null default now();

alter table market_contents
  add column if not exists deleted_at timestamptz;

create index if not exists market_contents_owner_active_idx
  on market_contents (owner_user_id, created_at desc)
  where deleted_at is null;
