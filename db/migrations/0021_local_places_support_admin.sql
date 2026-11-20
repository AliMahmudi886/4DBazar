alter table cities add column if not exists is_village boolean not null default false;
alter table cities add column if not exists parent_city_id uuid references cities(id);

create index if not exists cities_region_active_name_idx on cities(region_id, is_active, name_fa);

create table if not exists listing_media (
  content_id uuid not null references market_contents(id) on delete cascade,
  asset_id uuid not null references media_assets(id) on delete cascade,
  media_role varchar(16) not null default 'image',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (content_id, asset_id),
  constraint listing_media_role_check check (media_role in ('image', 'video'))
);

create index if not exists listing_media_content_order_idx on listing_media(content_id, sort_order);

create table if not exists support_tickets (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  subject varchar(160) not null,
  message text not null,
  status varchar(24) not null default 'open',
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_status_idx on support_tickets(user_id, status, created_at desc);
create index if not exists support_tickets_status_idx on support_tickets(status, created_at desc);

insert into cities (id, region_id, code, name_fa, is_active, is_village, parent_city_id)
values
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000001', 'village-robat-qarabil', 'رباط قره‌بیل', true, true, '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000001', 'village-qarabil', 'قره‌بیل', true, true, '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000001', 'village-amirabad', 'امیرآباد', true, true, '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000001', 'village-dasht', 'دشت', true, true, '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000000001', 'village-tabar', 'طبر', true, true, '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000001006', '00000000-0000-4000-8000-000000000001', 'village-karaf', 'کرف', true, true, '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000001007', '00000000-0000-4000-8000-000000000001', 'village-qoli', 'قلی', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001008', '00000000-0000-4000-8000-000000000001', 'village-asgharabad', 'اصغرآباد', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001009', '00000000-0000-4000-8000-000000000001', 'village-robate-ishq', 'رباط عشق', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001010', '00000000-0000-4000-8000-000000000001', 'village-jorbat', 'جربت', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001011', '00000000-0000-4000-8000-000000000001', 'village-jorbat-olya', 'جربت علیا', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001012', '00000000-0000-4000-8000-000000000001', 'village-shahabad-olya', 'شاه‌آباد علیا', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001013', '00000000-0000-4000-8000-000000000001', 'village-shahabad-sofla', 'شاه‌آباد سفلی', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001014', '00000000-0000-4000-8000-000000000001', 'village-eslamabad', 'اسلام‌آباد', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001015', '00000000-0000-4000-8000-000000000001', 'village-jalalabad', 'جلال‌آباد', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001016', '00000000-0000-4000-8000-000000000001', 'village-saeedabad', 'سعیدآباد', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001017', '00000000-0000-4000-8000-000000000001', 'village-shork', 'شورک', true, true, '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000001018', '00000000-0000-4000-8000-000000000001', 'village-kalate-eivar', 'کلاته ایور', true, true, '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000001019', '00000000-0000-4000-8000-000000000001', 'village-kalate-baqer', 'کلاته باقر', true, true, '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000001020', '00000000-0000-4000-8000-000000000001', 'village-kalate-hajji', 'کلاته حاجی', true, true, '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000001021', '00000000-0000-4000-8000-000000000001', 'village-mian-dasht', 'میان‌دشت', true, true, '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000001022', '00000000-0000-4000-8000-000000000001', 'village-kalate-nou', 'کلاته نو', true, true, '00000000-0000-4000-8000-000000000104'),
  ('00000000-0000-4000-8000-000000001023', '00000000-0000-4000-8000-000000000001', 'village-moftahabad', 'مفتاح‌آباد', true, true, '00000000-0000-4000-8000-000000000104'),
  ('00000000-0000-4000-8000-000000001024', '00000000-0000-4000-8000-000000000001', 'village-harounabad', 'هارون‌آباد', true, true, '00000000-0000-4000-8000-000000000104')
on conflict (code) do update set name_fa = excluded.name_fa, is_active = true, is_village = true, parent_city_id = excluded.parent_city_id;
