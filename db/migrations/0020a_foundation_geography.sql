-- Fresh installations must have the parents used by migration 0021.
-- Existing geography is never overwritten.
insert into regions (id, code, name_fa, is_active)
values ('00000000-0000-4000-8000-000000000001', '4d', '4D Region', true)
on conflict do nothing;

insert into cities (id, region_id, code, name_fa, is_active)
values
('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','garmeh','گرمه',true),
('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000001','jajarm','جاجرم',true),
('00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000001','eivar','ایور',true),
('00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000001','dorq','درق',true)
on conflict do nothing;
