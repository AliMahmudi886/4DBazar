alter table categories
  add column if not exists metadata_schema jsonb not null default '[]'::jsonb;
