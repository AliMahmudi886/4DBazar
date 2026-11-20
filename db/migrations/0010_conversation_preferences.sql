create table if not exists conversation_preferences (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  is_muted boolean not null default false,
  muted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_preferences_user_idx
  on conversation_preferences(user_id, is_muted, updated_at desc);
