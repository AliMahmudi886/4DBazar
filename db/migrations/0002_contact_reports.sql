create table if not exists contact_events (
  id uuid primary key,
  content_id uuid not null references market_contents(id) on delete cascade,
  requester_user_id uuid not null references users(id),
  owner_user_id uuid not null references users(id),
  event_type varchar(32) not null,
  status varchar(32) not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key,
  reporter_user_id uuid not null references users(id),
  target_type varchar(64) not null,
  target_id uuid not null,
  reason varchar(64) not null,
  description text,
  status varchar(32) not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists moderation_cases (
  id uuid primary key,
  report_id uuid references reports(id) on delete set null,
  target_type varchar(64) not null,
  target_id uuid not null,
  status varchar(32) not null default 'open',
  priority varchar(32) not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_events_content_idx
  on contact_events(content_id, created_at desc);

create index if not exists contact_events_requester_idx
  on contact_events(requester_user_id, created_at desc);

create index if not exists reports_target_idx
  on reports(target_type, target_id, created_at desc);

create index if not exists moderation_cases_queue_idx
  on moderation_cases(status, priority, created_at desc);
