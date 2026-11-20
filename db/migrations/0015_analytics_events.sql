create table if not exists analytics_events (
  id uuid primary key,
  actor_user_id uuid references users(id) on delete set null,
  event_name varchar(80) not null,
  target_type varchar(80),
  target_id uuid,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created_idx on analytics_events(event_name, created_at desc);
create index if not exists analytics_events_actor_created_idx on analytics_events(actor_user_id, created_at desc);
create index if not exists analytics_events_target_idx on analytics_events(target_type, target_id, created_at desc);
