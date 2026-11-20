create table if not exists storefronts (
  id uuid primary key,
  owner_user_id uuid not null unique references users(id) on delete cascade,
  category_id uuid not null references categories(id),
  city_id uuid not null references cities(id),
  name varchar(160) not null,
  slug varchar(80) not null unique,
  short_description varchar(240) not null,
  description text not null,
  business_type varchar(100) not null,
  address varchar(240),
  phone varchar(32),
  secondary_phone varchar(32),
  working_hours jsonb not null default '{}'::jsonb,
  logo_asset_id uuid references media_assets(id) on delete set null,
  cover_asset_id uuid references media_assets(id) on delete set null,
  status varchar(24) not null default 'draft',
  rejection_reason varchar(500),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_status_check check (status in ('draft','pending_review','active','suspended','archived'))
);

alter table market_contents add column if not exists storefront_id uuid references storefronts(id) on delete set null;
create index if not exists storefronts_status_city_idx on storefronts(status, city_id, updated_at desc);
create index if not exists market_contents_storefront_idx on market_contents(storefront_id, status, created_at desc);
