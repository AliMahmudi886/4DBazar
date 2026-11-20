create table if not exists otp_challenges (
  id uuid primary key,
  phone_number varchar(32) not null,
  purpose varchar(32) not null default 'login',
  code_hash varchar(128) not null,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_challenges_phone_active
  on otp_challenges (phone_number, purpose, created_at desc)
  where consumed_at is null;

create index if not exists idx_otp_challenges_expires_at
  on otp_challenges (expires_at);
