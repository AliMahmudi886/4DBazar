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

create index if not exists media_assets_owner_created_idx on media_assets(owner_user_id, created_at desc);
