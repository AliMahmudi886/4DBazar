alter table listings add column if not exists service_area text;
alter table listings add column if not exists pricing_model text;
alter table listings add column if not exists availability text;
alter table listings add column if not exists experience_years integer;

create index if not exists listings_service_pricing_idx
  on listings(pricing_model) where pricing_model is not null;
