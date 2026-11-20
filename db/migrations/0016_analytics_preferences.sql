create table if not exists analytics_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  allow_personalized_events boolean not null default true,
  updated_at timestamptz not null default now()
);
