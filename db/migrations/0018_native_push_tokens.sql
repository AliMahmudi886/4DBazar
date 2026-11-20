create table if not exists native_push_tokens (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  token text not null,
  platform varchar(24) not null,
  provider varchar(24) not null default 'expo',
  status varchar(24) not null default 'active',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists native_push_tokens_user_idx
  on native_push_tokens (user_id, status, updated_at desc);
