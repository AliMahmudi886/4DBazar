create table if not exists push_subscriptions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null,
  p256dh text,
  auth text,
  user_agent text,
  status varchar(32) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx
  on push_subscriptions (user_id, status, updated_at desc);
