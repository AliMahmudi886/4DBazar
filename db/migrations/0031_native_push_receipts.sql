create table native_push_receipts (
  ticket_id text primary key,
  token_id uuid not null references native_push_tokens(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'error', 'expired')),
  provider_error text,
  next_check_at timestamptz not null,
  expires_at timestamptz not null
);
create index native_push_receipts_pending_idx on native_push_receipts(next_check_at) where status = 'pending';
