create table if not exists business_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  business_name varchar(160) not null,
  business_type varchar(80) not null,
  bio varchar(500),
  service_area text not null default '',
  opening_hours varchar(160) not null default '',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_profiles_public_idx on business_profiles(is_public, updated_at desc);
