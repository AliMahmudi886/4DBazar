-- Repair migration for cPanel databases whose migration ledger is ahead of the
-- actual schema after an interrupted or partial release upload.
alter table market_contents add column if not exists storefront_id uuid;
alter table market_contents add column if not exists metadata_json jsonb not null default '{}'::jsonb;
alter table listings add column if not exists image_data_url text;
alter table listings add column if not exists service_area text;
alter table listings add column if not exists pricing_model text;
alter table listings add column if not exists availability text;
alter table listings add column if not exists experience_years integer;

create table if not exists media_assets (
  id uuid primary key,
  owner_user_id uuid not null references users(id) on delete cascade,
  storage_key varchar(500) not null unique,
  public_url varchar(1000) not null,
  mime_type varchar(80) not null,
  size_bytes integer not null,
  checksum_sha256 varchar(64) not null,
  created_at timestamptz not null default now()
);

create table if not exists listing_media (
  content_id uuid not null references market_contents(id) on delete cascade,
  asset_id uuid not null references media_assets(id) on delete cascade,
  media_role varchar(16) not null default 'image',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (content_id, asset_id)
);

create index if not exists media_assets_owner_created_idx on media_assets(owner_user_id, created_at desc);
create index if not exists listing_media_content_order_idx on listing_media(content_id, sort_order);

-- storefront_id is optional for ordinary listings. Add its FK only when the
-- storefront table exists, keeping this repair safe on older installations.
do $$
begin
  if to_regclass('public.storefronts') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'market_contents_storefront_id_fkey'
     ) then
    alter table market_contents
      add constraint market_contents_storefront_id_fkey
      foreign key (storefront_id) references storefronts(id) on delete set null;
  end if;
end $$;
