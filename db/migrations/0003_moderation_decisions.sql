create table if not exists moderation_decisions (
  id uuid primary key,
  case_id uuid not null references moderation_cases(id) on delete cascade,
  actor_user_id uuid not null references users(id),
  decision varchar(64) not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists moderation_decisions_case_idx
  on moderation_decisions(case_id, created_at desc);
