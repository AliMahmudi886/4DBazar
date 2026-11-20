create table if not exists conversation_blocks (
  conversation_id uuid not null references conversations(id) on delete cascade,
  blocker_user_id uuid not null references users(id) on delete cascade,
  blocked_user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, blocker_user_id),
  constraint conversation_blocks_no_self_block check (blocker_user_id <> blocked_user_id)
);

create index if not exists conversation_blocks_conversation_idx
  on conversation_blocks(conversation_id, created_at desc);

create index if not exists conversation_blocks_blocked_user_idx
  on conversation_blocks(blocked_user_id, created_at desc);
