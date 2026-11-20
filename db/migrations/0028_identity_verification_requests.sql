create table if not exists identity_verification_requests (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  document_type varchar(32) not null,
  national_id_last4 varchar(4) not null,
  document_mime_type varchar(64) not null,
  document_data bytea not null,
  status varchar(32) not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  verification_method varchar(32) not null default 'manual_admin',
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists identity_verification_pending_user_idx
  on identity_verification_requests(user_id) where status = 'pending';
create index if not exists identity_verification_status_idx
  on identity_verification_requests(status, created_at desc);
