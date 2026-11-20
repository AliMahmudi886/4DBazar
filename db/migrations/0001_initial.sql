create table if not exists schema_migrations (
  id varchar(128) primary key,
  applied_at timestamptz not null default now()
);

create table if not exists regions (
  id uuid primary key,
  code varchar(32) not null unique,
  name_fa varchar(128) not null,
  is_active boolean not null default true
);

create table if not exists cities (
  id uuid primary key,
  region_id uuid not null references regions(id),
  code varchar(32) not null unique,
  name_fa varchar(128) not null,
  is_active boolean not null default true
);

create table if not exists categories (
  id uuid primary key,
  parent_id uuid references categories(id),
  slug varchar(96) not null unique,
  name_fa varchar(128) not null,
  content_types jsonb not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists users (
  id uuid primary key,
  phone_number varchar(32) not null unique,
  phone_verified_at timestamptz,
  status varchar(32) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  user_id uuid primary key references users(id),
  display_name varchar(128) not null,
  primary_city_id uuid references cities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key,
  user_id uuid not null references users(id),
  token_hash varchar(256) not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists market_contents (
  id uuid primary key,
  content_type varchar(32) not null,
  owner_user_id uuid not null references users(id),
  city_id uuid not null references cities(id),
  category_id uuid not null references categories(id),
  title varchar(160) not null,
  description text not null,
  status varchar(32) not null default 'submitted',
  published_at timestamptz,
  expires_at timestamptz,
  search_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists listings (
  content_id uuid primary key references market_contents(id) on delete cascade,
  price_amount bigint,
  price_type varchar(32) not null,
  item_condition varchar(32)
);

create table if not exists content_status_history (
  id uuid primary key,
  content_id uuid not null references market_contents(id) on delete cascade,
  from_status varchar(32),
  to_status varchar(32) not null,
  actor_user_id uuid references users(id),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key,
  actor_user_id uuid references users(id),
  action varchar(128) not null,
  target_type varchar(64) not null,
  target_id uuid not null,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists market_contents_feed_idx
  on market_contents(status, city_id, category_id, created_at desc);

create index if not exists market_contents_type_status_idx
  on market_contents(content_type, status, created_at desc);

create index if not exists sessions_user_idx
  on sessions(user_id, expires_at desc);
