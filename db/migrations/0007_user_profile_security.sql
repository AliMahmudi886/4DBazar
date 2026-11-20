alter table users
  add column if not exists password_hash text;

alter table user_profiles
  add column if not exists first_name varchar(80),
  add column if not exists last_name varchar(80),
  add column if not exists verification_status varchar(32) not null default 'profile_incomplete',
  add column if not exists profile_completed_at timestamptz;

update user_profiles
set first_name = coalesce(first_name, display_name),
    last_name = coalesce(last_name, '4D'),
    verification_status = 'profile_complete',
    profile_completed_at = coalesce(profile_completed_at, now())
where display_name <> 'کاربر 4D';
