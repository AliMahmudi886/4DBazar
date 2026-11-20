alter table identity_verification_requests add column if not exists verification_method varchar(32) not null default 'manual_admin';
alter table identity_verification_requests add column if not exists verified_at timestamptz;
alter table identity_verification_requests add column if not exists revoked_at timestamptz;
