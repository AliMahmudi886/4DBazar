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
on conflict do nothing;
