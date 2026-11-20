create table if not exists favorites (
  user_id uuid not null references users(id) on delete cascade,
  content_id uuid not null references market_contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index if not exists favorites_user_idx on favorites (user_id, created_at desc);
create index if not exists favorites_content_idx on favorites (content_id);
