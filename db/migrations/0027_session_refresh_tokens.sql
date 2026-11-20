create table if not exists session_refresh_tokens (
  id uuid primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  token_hash varchar(128) not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists session_refresh_tokens_active_idx
  on session_refresh_tokens(token_hash, expires_at)
  where revoked_at is null;
