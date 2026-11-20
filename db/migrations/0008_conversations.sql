create table if not exists conversations (
  id uuid primary key,
  content_id uuid not null references market_contents(id) on delete cascade,
  buyer_user_id uuid not null references users(id),
  seller_user_id uuid not null references users(id),
  status varchar(32) not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversation_messages (
  id uuid primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists conversations_unique_pair_idx
  on conversations(content_id, buyer_user_id, seller_user_id);

create index if not exists conversations_buyer_idx
  on conversations(buyer_user_id, updated_at desc);

create index if not exists conversations_seller_idx
  on conversations(seller_user_id, updated_at desc);

create index if not exists conversation_messages_conversation_idx
  on conversation_messages(conversation_id, created_at asc);
