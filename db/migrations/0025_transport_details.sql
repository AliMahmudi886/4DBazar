create table if not exists transport_details (
  content_id uuid primary key references market_contents(id) on delete cascade,
  mode varchar(16) not null check (mode in ('offer', 'request')),
  origin_label varchar(160) not null,
  destination_label varchar(160) not null,
  origin_city_id uuid references cities(id),
  destination_city_id uuid references cities(id),
  departure_date date not null,
  time_from varchar(5) not null,
  time_to varchar(5),
  seats_available integer,
  passenger_count integer,
  vehicle_type varchar(64),
  price_type varchar(16) not null default 'negotiable' check (price_type in ('fixed', 'negotiable')),
  price_amount bigint,
  lifecycle_status varchar(16) not null default 'active' check (lifecycle_status in ('active', 'expired', 'cancelled', 'completed')),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transport_search_idx on transport_details(lifecycle_status, departure_date, origin_label, destination_label);
insert into categories (id, slug, name_fa, content_types, metadata_schema, sort_order, is_active)
values ('00000000-0000-4000-8000-000000000215', 'local-transport', 'حمل‌ونقل محلی', '["transport_offer","transport_request"]', '[]', 55, true)
on conflict (slug) do update set content_types = excluded.content_types, name_fa = excluded.name_fa, is_active = true;
