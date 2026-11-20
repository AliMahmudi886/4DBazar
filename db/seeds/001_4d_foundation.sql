insert into regions (id, code, name_fa, is_active)
values ('00000000-0000-4000-8000-000000000001', '4d', '4D Region', true)
on conflict (code) do update set name_fa = excluded.name_fa, is_active = excluded.is_active;

insert into cities (id, region_id, code, name_fa, is_active)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'garmeh', 'گرمه', true),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'jajarm', 'جاجرم', true),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'eivar', 'ایور', true),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'dorq', 'درق', true)
on conflict (code) do update set name_fa = excluded.name_fa, is_active = excluded.is_active;

insert into categories (id, slug, name_fa, content_types, metadata_schema, sort_order, is_active)
values
  ('00000000-0000-4000-8000-000000000201', 'general-used-goods', 'کالای دست دوم عمومی', '["listing","wanted"]', '[]', 10, true),
  ('00000000-0000-4000-8000-000000000206', 'vehicles', 'وسایل نقلیه', '["listing","wanted"]', '[{"key":"brand","label_fa":"برند","type":"text","placeholder":"مثلاً سایپا"},{"key":"model","label_fa":"مدل","type":"text","placeholder":"مثلاً تیبا ۲"},{"key":"year","label_fa":"سال ساخت","type":"number"},{"key":"mileage","label_fa":"کارکرد (کیلومتر)","type":"number"}]', 15, true),
  ('00000000-0000-4000-8000-000000000207', 'real-estate', 'املاک', '["listing","wanted"]', '[{"key":"property_type","label_fa":"نوع ملک","type":"select","options":[{"value":"apartment","label_fa":"آپارتمان"},{"value":"house","label_fa":"خانه"},{"value":"land","label_fa":"زمین"},{"value":"shop","label_fa":"مغازه"}]},{"key":"area_m2","label_fa":"متراژ (متر)","type":"number"},{"key":"rooms","label_fa":"تعداد اتاق","type":"number"}]', 18, true),
  ('00000000-0000-4000-8000-000000000202', 'mobile-digital', 'موبایل و دیجیتال', '["listing","wanted"]', '[{"key":"brand","label_fa":"برند","type":"text","placeholder":"مثلاً سامسونگ"},{"key":"model","label_fa":"مدل","type":"text","placeholder":"مثلاً A52"},{"key":"storage_gb","label_fa":"حافظه (GB)","type":"number"}]', 20, true),
  ('00000000-0000-4000-8000-000000000203', 'home-kitchen', 'لوازم خانه و آشپزخانه', '["listing","wanted"]', '[{"key":"brand","label_fa":"برند","type":"text"},{"key":"model","label_fa":"مدل","type":"text"}]', 30, true),
  ('00000000-0000-4000-8000-000000000204', 'tools-equipment', 'ابزار و تجهیزات', '["listing","wanted"]', '[{"key":"tool_type","label_fa":"نوع ابزار","type":"text","placeholder":"مثلاً دریل"},{"key":"brand","label_fa":"برند","type":"text"}]', 40, true),
  ('00000000-0000-4000-8000-000000000208', 'personal-fashion', 'پوشاک و لوازم شخصی', '["listing","wanted"]', '[]', 45, true),
  ('00000000-0000-4000-8000-000000000209', 'sports-hobbies', 'ورزش و سرگرمی', '["listing","wanted"]', '[]', 47, true),
  ('00000000-0000-4000-8000-000000000210', 'business-equipment', 'کسب‌وکار و تجهیزات', '["listing","wanted"]', '[]', 49, true),
  ('00000000-0000-4000-8000-000000000205', 'local-services', 'خدمات محلی', '["service_listing","service_request"]', '[{"key":"service_mode","label_fa":"شیوه ارائه","type":"select","options":[{"value":"onsite","label_fa":"حضوری"},{"value":"remote","label_fa":"غیرحضوری"},{"value":"both","label_fa":"هر دو"}]}]', 50, true),
  ('00000000-0000-4000-8000-000000000211', 'jobs', 'استخدام و همکاری', '["service_listing","service_request"]', '[]', 60, true),
  ('00000000-0000-4000-8000-000000000212', 'education', 'آموزش', '["service_listing","service_request"]', '[]', 70, true),
  ('00000000-0000-4000-8000-000000000213', 'beauty-care', 'زیبایی و مراقبت', '["service_listing","service_request"]', '[]', 80, true),
  ('00000000-0000-4000-8000-000000000214', 'agriculture', 'کشاورزی و دامداری', '["listing","wanted","service_listing"]', '[]', 90, true)
  ,('00000000-0000-4000-8000-000000000215', 'local-transport', 'حمل‌ونقل محلی', '["transport_offer","transport_request"]', '[]', 55, true)
on conflict (slug) do update
set name_fa = excluded.name_fa,
    content_types = excluded.content_types,
    metadata_schema = excluded.metadata_schema,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into users (id, phone_number, phone_verified_at, status)
values
  ('00000000-0000-4000-8000-000000000301', '+989000000000', now(), 'active'),
  ('00000000-0000-4000-8000-000000000302', '+989000000001', now(), 'active'),
  ('00000000-0000-4000-8000-000000000303', '+989000000002', now(), 'active')
on conflict (phone_number) do update
set phone_verified_at = excluded.phone_verified_at,
    status = excluded.status;

insert into user_profiles (user_id, display_name, first_name, last_name, primary_city_id, verification_status, profile_completed_at)
values (
  '00000000-0000-4000-8000-000000000301',
  'کاربر توسعه 4D',
  'کاربر',
  'توسعه',
  '00000000-0000-4000-8000-000000000102',
  'profile_complete',
  now()
)
on conflict (user_id) do update
set display_name = excluded.display_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    primary_city_id = excluded.primary_city_id,
    verification_status = excluded.verification_status,
    profile_completed_at = excluded.profile_completed_at,
    updated_at = now();

insert into user_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000301', 'user'),
  ('00000000-0000-4000-8000-000000000301', 'moderator'),
  ('00000000-0000-4000-8000-000000000302', 'user')
on conflict (user_id, role) do nothing;

insert into user_roles (user_id, role)
select id, 'user' from users where phone_number = '+989000000002'
union all
select id, 'moderator' from users where phone_number = '+989000000002'
on conflict (user_id, role) do nothing;

insert into user_profiles (user_id, display_name, first_name, last_name, primary_city_id, verification_status, profile_completed_at)
select
  id,
  'مدیر 4D',
  'مدیر',
  '4D',
  '00000000-0000-4000-8000-000000000102',
  'profile_complete',
  now()
from users
where phone_number = '+989000000002'
on conflict (user_id) do update
set display_name = excluded.display_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    primary_city_id = excluded.primary_city_id,
    verification_status = excluded.verification_status,
    profile_completed_at = excluded.profile_completed_at,
    updated_at = now();

insert into user_profiles (user_id, display_name, first_name, last_name, primary_city_id, verification_status, profile_completed_at)
values (
  '00000000-0000-4000-8000-000000000302',
  'فروشنده نمونه 4D',
  'فروشنده',
  'نمونه',
  '00000000-0000-4000-8000-000000000101',
  'profile_complete',
  now()
)
on conflict (user_id) do update
set display_name = excluded.display_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    primary_city_id = excluded.primary_city_id,
    verification_status = excluded.verification_status,
    profile_completed_at = excluded.profile_completed_at,
    updated_at = now();

insert into market_contents (
  id,
  content_type,
  owner_user_id,
  city_id,
  category_id,
  title,
  description,
  status,
  published_at,
  search_text,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000401',
    'listing',
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000203',
    'کولر آبی سالم',
    'مناسب خانه یا مغازه کوچک، بازدید در جاجرم.',
    'approved',
    now(),
    'کولر آبی سالم مناسب خانه یا مغازه کوچک بازدید در جاجرم',
    now() - interval '3 hours',
    now() - interval '3 hours'
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    'listing',
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000204',
    'دریل و ابزار کارگاهی',
    'چند ابزار سالم برای فروش یکجا یا جداگانه.',
    'approved',
    now(),
    'دریل ابزار کارگاهی سالم فروش یکجا جداگانه',
    now() - interval '5 hours',
    now() - interval '5 hours'
  ),
  (
    '00000000-0000-4000-8000-000000000403',
    'listing',
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000202',
    'گوشی A52 تمیز',
    'جعبه دارد، باتری خوب، تحویل حضوری در ایور.',
    'approved',
    now(),
    'گوشی A52 تمیز جعبه باتری خوب تحویل حضوری ایور',
    now() - interval '1 day',
    now() - interval '1 day'
  )
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    published_at = excluded.published_at,
    search_text = excluded.search_text,
    updated_at = now();

insert into listings (content_id, price_amount, price_type, item_condition)
values
  ('00000000-0000-4000-8000-000000000401', 4200000, 'fixed', 'used'),
  ('00000000-0000-4000-8000-000000000402', null, 'negotiable', 'used'),
  ('00000000-0000-4000-8000-000000000403', 8500000, 'fixed', 'like_new')
on conflict (content_id) do update
set price_amount = excluded.price_amount,
    price_type = excluded.price_type,
    item_condition = excluded.item_condition;
