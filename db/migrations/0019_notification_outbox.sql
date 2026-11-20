create table if not exists notification_outbox (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  channel varchar(24) not null,
  title varchar(180) not null,
  body varchar(1000) not null,
  tag varchar(160) not null,
  url varchar(500),
  status varchar(24) not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  last_error varchar(500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_outbox_pending_idx
  on notification_outbox(status, available_at, created_at);
