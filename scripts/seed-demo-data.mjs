import "dotenv/config";
import pg from "pg";

const { Client } = pg;
const count = Math.max(1, Math.min(300, Number(process.env.DEMO_USERS ?? 300)));
const nodeEnv = process.env.NODE_ENV ?? "development";
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:55432/four_d";

if (nodeEnv === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(databaseUrl).hostname) || process.env.ALLOW_DEMO_SEED !== "true") {
  throw new Error("Demo data seeding requires a local database, non-production mode and ALLOW_DEMO_SEED=true.");
}

const uuid = (prefix, index) => `00000000-0000-${prefix}-8000-${index.toString(16).padStart(12, "0")}`;
const userId = (index) => uuid("4d01", index);
const contentId = (index) => uuid("4d02", index);
const storefrontId = (index) => uuid("4d03", index);
const ticketId = (index) => uuid("4d04", index);
const conversationId = (index) => uuid("4d05", index);
const messageId = (index) => uuid("4d06", index);
const phoneFor = (index) => `+989100${index.toString().padStart(6, "0")}`;
const pick = (items, index) => items[index % items.length];

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query("begin");
  const { rows: cities } = await client.query("select id, name_fa from cities where is_active = true and is_village = false order by code");
  const { rows: categories } = await client.query("select id, slug, name_fa from categories where is_active = true order by sort_order, slug");
  if (cities.length < 4 || categories.length < 3) throw new Error("Run migrations and the normal seed first.");

  const listingCategories = categories.filter((category) => !["local-services", "jobs", "education", "beauty-care", "local-transport"].includes(category.slug));
  const serviceCategories = categories.filter((category) => ["local-services", "jobs", "education", "beauty-care", "agriculture"].includes(category.slug));
  const transportCategory = categories.find((category) => category.slug === "local-transport") ?? categories[0];
  const demoNames = ["مهدی", "سارا", "رضا", "نگار", "علی", "مریم", "امیر", "الهام"];
  const demoLastNames = ["رضایی", "حسینی", "محمدی", "کریمی", "اکبری", "احمدی"];

  for (let index = 1; index <= count; index += 1) {
    const id = userId(index);
    const city = pick(cities, index - 1);
    const displayName = `${pick(demoNames, index)} ${pick(demoLastNames, index * 3)}`;
    await client.query(`
      insert into users (id, phone_number, phone_verified_at, status)
      values ($1, $2, now(), 'active')
      on conflict (id) do update set phone_number = excluded.phone_number, phone_verified_at = excluded.phone_verified_at, status = 'active', updated_at = now()
    `, [id, phoneFor(index)]);
    await client.query(`
      insert into user_profiles (user_id, display_name, first_name, last_name, primary_city_id, verification_status, profile_completed_at)
      values ($1, $2, $3, $4, $5, 'profile_complete', now())
      on conflict (user_id) do update set display_name = excluded.display_name, first_name = excluded.first_name, last_name = excluded.last_name, primary_city_id = excluded.primary_city_id, verification_status = 'profile_complete', profile_completed_at = coalesce(user_profiles.profile_completed_at, now()), updated_at = now()
    `, [id, displayName, pick(demoNames, index), pick(demoLastNames, index * 3), city.id]);
    await client.query("insert into user_roles (user_id, role) values ($1, 'user') on conflict do nothing", [id]);

    const listingCategory = pick(listingCategories.length ? listingCategories : categories, index);
    const serviceCategory = pick(serviceCategories.length ? serviceCategories : categories, index + 1);
    const listingId = contentId(index * 3 - 2);
    const serviceId = contentId(index * 3 - 1);
    const transportId = contentId(index * 3);
    const listingStatus = index % 17 === 0 ? "submitted" : "published";
    const serviceStatus = index % 19 === 0 ? "submitted" : "published";
    const transportStatus = index % 23 === 0 ? "submitted" : "published";
    const publishedAt = (status) => status === "published" ? "now()" : "null";

    await client.query(`
      insert into market_contents (id, content_type, owner_user_id, city_id, category_id, title, description, status, published_at, search_text, metadata_json)
      values ($1, 'listing', $2, $3, $4, $5::varchar, $6::text, $7::varchar, ${publishedAt(listingStatus)}, $5::text || ' ' || $6::text, $8::jsonb)
      on conflict (id) do update set owner_user_id = excluded.owner_user_id, city_id = excluded.city_id, category_id = excluded.category_id, title = excluded.title, description = excluded.description, status = excluded.status, published_at = excluded.published_at, search_text = excluded.search_text, metadata_json = excluded.metadata_json, deleted_at = null, updated_at = now()
    `, [listingId, id, city.id, listingCategory.id, `${listingCategory.name_fa} محلی ${index}`, `آگهی آزمایشی ${index} برای تست جست‌وجو، فیلتر، تماس و جزئیات آگهی در 4D.`, listingStatus, JSON.stringify({ demo: true, index, brand: pick(["سامسونگ", "ایران خودرو", "ال جی", "دریل", "محصول محلی"], index) })]);
    await client.query(`insert into listings (content_id, price_amount, price_type, item_condition, pricing_model) values ($1, $2, 'fixed', $3, 'fixed') on conflict (content_id) do update set price_amount = excluded.price_amount, price_type = excluded.price_type, item_condition = excluded.item_condition, pricing_model = excluded.pricing_model`, [listingId, (index + 1) * 125000, pick(["new", "used", "like_new"], index)]);

    await client.query(`
      insert into market_contents (id, content_type, owner_user_id, city_id, category_id, title, description, status, published_at, search_text, metadata_json)
      values ($1, 'service_listing', $2, $3, $4, $5::varchar, $6::text, $7::varchar, ${publishedAt(serviceStatus)}, $5::text || ' ' || $6::text, $8::jsonb)
      on conflict (id) do update set owner_user_id = excluded.owner_user_id, city_id = excluded.city_id, category_id = excluded.category_id, title = excluded.title, description = excluded.description, status = excluded.status, published_at = excluded.published_at, search_text = excluded.search_text, metadata_json = excluded.metadata_json, deleted_at = null, updated_at = now()
    `, [serviceId, id, city.id, serviceCategory.id, `${serviceCategory.name_fa} حرفه‌ای ${index}`, `ارائه خدمت آزمایشی ${index} در ${city.name_fa} با امکان هماهنگی داخل برنامه و مشاهده اطلاعات ارائه‌دهنده.`, serviceStatus, JSON.stringify({ demo: true, index, service_mode: index % 2 ? "onsite" : "both" })]);
    await client.query(`insert into listings (content_id, price_amount, price_type, item_condition, service_area, pricing_model, availability, experience_years) values ($1, $2, 'negotiable', null, $3, 'negotiable', $4, $5) on conflict (content_id) do update set price_amount = excluded.price_amount, price_type = excluded.price_type, service_area = excluded.service_area, pricing_model = excluded.pricing_model, availability = excluded.availability, experience_years = excluded.experience_years`, [serviceId, null, city.name_fa, "هر روز ۹ تا ۱۸", (index % 12) + 1]);

    const origin = pick(cities, index - 1);
    const destination = pick(cities, index + 1);
    const date = new Date(Date.now() + ((index % 14) + 1) * 86400000).toISOString().slice(0, 10);
    await client.query(`
      insert into market_contents (id, content_type, owner_user_id, city_id, category_id, title, description, status, published_at, search_text, metadata_json)
      values ($1, $2::varchar, $3, $4, $5, $6::varchar, $7::text, $8::varchar, ${publishedAt(transportStatus)}, $6::text || ' ' || $7::text, '{}'::jsonb)
      on conflict (id) do update set content_type = excluded.content_type, owner_user_id = excluded.owner_user_id, city_id = excluded.city_id, category_id = excluded.category_id, title = excluded.title, description = excluded.description, status = excluded.status, published_at = excluded.published_at, search_text = excluded.search_text, deleted_at = null, updated_at = now()
    `, [transportId, index % 2 ? "transport_offer" : "transport_request", id, origin.id, transportCategory.id, `مسیر ${origin.name_fa} به ${destination.name_fa} ${index}`, `مسیر آزمایشی ${index} برای بررسی جست‌وجو و هماهنگی حمل‌ونقل محلی.`, transportStatus]);
    await client.query(`
      insert into transport_details (content_id, mode, origin_label, destination_label, origin_city_id, destination_city_id, departure_date, time_from, time_to, seats_available, passenger_count, vehicle_type, price_type, price_amount, lifecycle_status)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'negotiable', null, 'active')
      on conflict (content_id) do update set mode = excluded.mode, origin_label = excluded.origin_label, destination_label = excluded.destination_label, origin_city_id = excluded.origin_city_id, destination_city_id = excluded.destination_city_id, departure_date = excluded.departure_date, time_from = excluded.time_from, time_to = excluded.time_to, seats_available = excluded.seats_available, passenger_count = excluded.passenger_count, vehicle_type = excluded.vehicle_type, lifecycle_status = 'active', updated_at = now()
    `, [transportId, index % 2 ? "offer" : "request", origin.name_fa, destination.name_fa, origin.id, destination.id, date, `${String(7 + (index % 10)).padStart(2, "0")}:30`, "18:00", index % 2 ? (index % 4) + 1 : null, index % 2 ? null : (index % 3) + 1, pick(["سواری", "وانت", "مینی‌بوس"], index)]);
  }

  const serviceCategory = serviceCategories[0] ?? categories[0];
  for (let index = 1; index <= Math.min(24, count); index += 1) {
    const id = userId(index);
    await client.query(`
      insert into storefronts (id, owner_user_id, category_id, city_id, name, slug, short_description, description, business_type, address, phone, status)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      on conflict (owner_user_id) do update set category_id = excluded.category_id, city_id = excluded.city_id, name = excluded.name, slug = excluded.slug, short_description = excluded.short_description, description = excluded.description, business_type = excluded.business_type, address = excluded.address, phone = excluded.phone, status = excluded.status, updated_at = now()
    `, [storefrontId(index), id, serviceCategory.id, pick(cities, index - 1).id, `غرفه آزمایشی ${index}`, `demo-store-${index}`, `خدمات و محصولات محلی برای تست غرفه`, `غرفه آزمایشی شماره ${index} برای تست نمایش عمومی، جست‌وجو و مدیریت ادمین.`, "کسب‌وکار محلی", `مرکز ${pick(cities, index - 1).name_fa}`, phoneFor(index), index % 7 === 0 ? "pending_review" : "active"]);
  }

  for (let index = 1; index <= Math.min(120, count); index += 1) {
    const favoriteUser = userId(index);
    const favoriteContent = contentId(((index * 7) % count) * 3 + 1);
    await client.query("insert into favorites (user_id, content_id) values ($1, $2) on conflict do nothing", [favoriteUser, favoriteContent]);
    if (index % 3 === 0) {
      await client.query(`
        insert into support_tickets (id, user_id, subject, message, status, admin_reply)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (id) do update set subject = excluded.subject, message = excluded.message, status = excluded.status, admin_reply = excluded.admin_reply, updated_at = now()
      `, [ticketId(index), favoriteUser, `پرسش آزمایشی ${index}`, "این تیکت برای بررسی تجربه پشتیبانی و صف ادمین ساخته شده است.", index % 5 === 0 ? "resolved" : "open", index % 5 === 0 ? "درخواست شما بررسی شد." : null]);
    }
    if (index < count && index % 2 === 0) {
      const seller = userId(index);
      const buyer = userId(index + 1);
      const conversation = conversationId(index);
      await client.query(`
        insert into conversations (id, content_id, buyer_user_id, seller_user_id, status)
        values ($1, $2, $3, $4, 'open')
        on conflict (content_id, buyer_user_id, seller_user_id) do update set status = 'open', updated_at = now()
      `, [conversation, contentId(index * 3 - 2), buyer, seller]);
      await client.query(`
        insert into conversation_messages (id, conversation_id, sender_user_id, body)
        values ($1, $2, $3, $4)
        on conflict (id) do update set body = excluded.body
      `, [messageId(index), conversation, buyer, "سلام، برای این آگهی آزمایشی هنوز موجود است؟"]);
    }
  }

  await client.query("commit");
  console.info(`Demo data ready: ${count} users, ${count * 3} contents, ${Math.min(24, count)} storefronts, interactions seeded.`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
