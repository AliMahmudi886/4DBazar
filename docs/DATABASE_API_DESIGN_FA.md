# Database & API Design پروژه 4D

## وضعیت سند

- Phase: Phase 7 - Database & API
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: Domain Model، PRD MVP، UX Design

## 1. تصمیم‌های اصلی

### 1.1 Database Engine

پیشنهاد نسخه اول: PostgreSQL

دلایل:

- داده‌های رابطه‌ای، transactionمحور و قابل گزارش‌گیری هستند.
- index، constraint، full-text search پایه و JSONB برای attributeهای پویا دارد.
- برای Modular Monolith و MVP کم‌هزینه و قابل توسعه است.
- migration و backup و tooling بالغ دارد.

این تصمیم در Phase 8 دوباره از منظر hosting و runtime بررسی می‌شود.

### 1.2 Content Modeling

تصمیم نسخه اول:

- table مشترک `market_contents` برای lifecycle، owner، city، category، status، moderation/search مشترک
- tableهای subtype برای جزئیات اختصاصی:
  - `listings`
  - `wanted_listings`
  - `service_listings`
  - `service_requests`

دلایل:

- search، favorites، reports، conversations و moderation فقط با یک target مشترک ساده‌تر می‌شوند.
- business ruleهای اختصاصی هر نوع محتوا در subtypeها حفظ می‌شود.
- از table بسیار بزرگ با ستون‌های nullable زیاد جلوگیری می‌شود.

### 1.3 Chat/Contact

تصمیم نسخه اول:

- MVP از `conversations` و `messages` پشتیبانی طراحی می‌کند.
- اگر در implementation بخواهیم contact سبک‌تر بسازیم، `contact_events` همچنان وجود دارد و می‌تواند بدون message کامل استفاده شود.

دلیل:

PRD و UX به report/block/context نیاز دارند. طراحی message از حالا مانع redesign سنگین می‌شود، حتی اگر UI نسخه اول فقط پیام ساده داشته باشد.

### 1.4 Dynamic Attributes

تصمیم نسخه اول:

- attribute definition در `category_attribute_definitions`
- مقدار attribute در `content_attribute_values`
- مقدارها با ستون‌های typed و `value_json` پشتیبانی می‌شوند.

دلیل:

JSONB تنها برای همه چیز کنترل‌پذیری و filterپذیری را کم می‌کند. EAV کاملاً آزاد هم پیچیده می‌شود. مدل hybrid برای MVP و توسعه آینده متعادل‌تر است.

### 1.5 Search

تصمیم نسخه اول:

- search اولیه با PostgreSQL query و indexهای مناسب طراحی شود.
- ستون `search_text` یا materialized/search vector در `market_contents` در نظر گرفته شود.
- engine جدا مثل Elasticsearch/OpenSearch در MVP لازم نیست.

## 2. Naming و Convention

- tableها: snake_case و plural
- idها: UUID
- timestampها: `created_at`, `updated_at`
- soft delete: `deleted_at` برای entityهای کاربرمحور
- statusها: enum/application constrained string
- currency: price عددی به تومان، بدون formatting
- reference به content مشترک: `content_id`

## 3. Schema اولیه

### 3.1 Identity و Users

#### users

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| phone_number | varchar unique | normalized |
| phone_verified_at | timestamptz nullable | |
| status | varchar | active, suspended, banned |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### user_profiles

| Column | Type | Notes |
|---|---|---|
| user_id | uuid pk/fk users | |
| display_name | varchar | |
| primary_city_id | uuid fk cities nullable | |
| bio | text nullable | future |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### sessions

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk users | |
| token_hash | varchar | raw token ذخیره نشود |
| expires_at | timestamptz | |
| revoked_at | timestamptz nullable | |
| created_at | timestamptz | |

#### role_assignments

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk users | |
| role | varchar | user, moderator, admin |
| assigned_by_user_id | uuid fk users nullable | |
| created_at | timestamptz | |

### 3.2 Geography و Categories

#### regions

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| code | varchar unique | `4d` |
| name_fa | varchar | |
| is_active | boolean | |

#### cities

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| region_id | uuid fk regions | |
| code | varchar unique | garmeh, jajarm, eivar, dorq |
| name_fa | varchar | |
| is_active | boolean | |

#### categories

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| parent_id | uuid fk categories nullable | |
| slug | varchar unique | |
| name_fa | varchar | |
| content_types | jsonb | allowed content types |
| sort_order | int | |
| is_active | boolean | |

#### category_attribute_definitions

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| category_id | uuid fk categories | |
| key | varchar | |
| label_fa | varchar | |
| data_type | varchar | text, number, boolean, enum |
| options_json | jsonb nullable | enum options |
| is_required | boolean | |
| is_filterable | boolean | |
| sort_order | int | |

### 3.3 Market Content

#### market_contents

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| content_type | varchar | listing, wanted, service_listing, service_request |
| owner_user_id | uuid fk users | |
| city_id | uuid fk cities | شهر اصلی |
| category_id | uuid fk categories | |
| title | varchar | |
| description | text | |
| status | varchar | draft, submitted, approved, edit_required, rejected, suspended, expired, deleted_by_owner |
| published_at | timestamptz nullable | |
| expires_at | timestamptz nullable | |
| search_text | text | normalized/fa-ready |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz nullable | |

#### listings

| Column | Type | Notes |
|---|---|---|
| content_id | uuid pk/fk market_contents | content_type=listing |
| price_amount | bigint nullable | تومان |
| price_type | varchar | fixed, negotiable |
| item_condition | varchar nullable | new, used, like_new |

#### wanted_listings

| Column | Type | Notes |
|---|---|---|
| content_id | uuid pk/fk market_contents | content_type=wanted |
| budget_min | bigint nullable | |
| budget_max | bigint nullable | |

#### service_listings

| Column | Type | Notes |
|---|---|---|
| content_id | uuid pk/fk market_contents | content_type=service_listing |
| base_city_id | uuid fk cities | |
| coverage_city_ids | uuid[] | MVP ساده؛ join table در صورت نیاز Phase 7 update |
| availability_note | text nullable | |

#### service_requests

| Column | Type | Notes |
|---|---|---|
| content_id | uuid pk/fk market_contents | content_type=service_request |
| requested_time_note | text nullable | |
| urgency | varchar nullable | normal, urgent |

#### media_assets

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| content_id | uuid fk market_contents | |
| owner_user_id | uuid fk users | |
| media_type | varchar | image |
| storage_key | varchar | |
| alt_text | varchar nullable | |
| sort_order | int | |
| status | varchar | uploaded, approved, rejected |
| created_at | timestamptz | |

#### content_attribute_values

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| content_id | uuid fk market_contents | |
| attribute_definition_id | uuid fk category_attribute_definitions | |
| value_text | text nullable | |
| value_number | numeric nullable | |
| value_boolean | boolean nullable | |
| value_json | jsonb nullable | |

#### content_status_history

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| content_id | uuid fk market_contents | |
| from_status | varchar nullable | |
| to_status | varchar | |
| actor_user_id | uuid fk users nullable | |
| reason | text nullable | |
| created_at | timestamptz | |

### 3.4 Interaction

#### favorites

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk users | |
| content_id | uuid fk market_contents | |
| created_at | timestamptz | |

#### conversations

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| content_id | uuid fk market_contents | context |
| buyer_user_id | uuid fk users | آغازکننده |
| owner_user_id | uuid fk users | owner content |
| status | varchar | active, blocked, archived, closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### messages

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| conversation_id | uuid fk conversations | |
| sender_user_id | uuid fk users | |
| body | text | |
| status | varchar | sent, hidden_by_moderation, deleted_by_sender |
| created_at | timestamptz | |

#### contact_events

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| conversation_id | uuid fk conversations nullable | |
| content_id | uuid fk market_contents | |
| actor_user_id | uuid fk users | |
| event_type | varchar | chat_started, contact_started |
| created_at | timestamptz | |

#### blocks

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| blocker_user_id | uuid fk users | |
| blocked_user_id | uuid fk users | |
| conversation_id | uuid fk conversations nullable | |
| reason | text nullable | |
| created_at | timestamptz | |

### 3.5 Moderation و Audit

#### reports

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| reporter_user_id | uuid fk users | |
| target_type | varchar | content, user, message |
| target_id | uuid | polymorphic |
| reason | varchar | spam, duplicate, fraud_suspicion, inappropriate, wrong_category, other |
| description | text nullable | |
| status | varchar | submitted, reviewed, dismissed, action_taken |
| created_at | timestamptz | |

#### moderation_cases

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| target_type | varchar | content, user, message |
| target_id | uuid | |
| status | varchar | open, assigned, resolved, escalated, reopened |
| assigned_to_user_id | uuid fk users nullable | moderator |
| priority | varchar | low, normal, high |
| automatic_flags_json | jsonb nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### moderation_decisions

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| case_id | uuid fk moderation_cases | |
| actor_user_id | uuid fk users | |
| decision | varchar | approve, reject, edit_required, warning, suspend, ban, escalate |
| reason | text | |
| created_at | timestamptz | |

#### audit_logs

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| actor_user_id | uuid fk users nullable | |
| action | varchar | |
| target_type | varchar | |
| target_id | uuid | |
| metadata_json | jsonb nullable | |
| created_at | timestamptz | |

### 3.6 Analytics و Trust Signals

#### analytics_events

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| event_name | varchar | |
| actor_user_id | uuid fk users nullable | |
| content_id | uuid fk market_contents nullable | |
| city_id | uuid fk cities nullable | |
| category_id | uuid fk categories nullable | |
| metadata_json | jsonb nullable | |
| occurred_at | timestamptz | |

#### user_trust_signals

| Column | Type | Notes |
|---|---|---|
| user_id | uuid pk/fk users | |
| mobile_verified | boolean | denormalized |
| account_age_days | int | computed/cache |
| approved_content_count | int | cache |
| report_count | int | internal |
| response_rate | numeric nullable | future |
| updated_at | timestamptz | |

## 4. Indexes و Constraints

### Constraints مهم

- `users.phone_number` unique
- `cities.code` unique
- `categories.slug` unique
- `favorites(user_id, content_id)` unique
- `conversations(content_id, buyer_user_id, owner_user_id)` unique برای جلوگیری از duplicate conversation
- `market_contents.content_type` باید با subtype متناظر سازگار باشد.
- `market_contents.status` مقدار معتبر داشته باشد.
- `reports.reason` مقدار معتبر داشته باشد.
- content owner نمی‌تواند buyer همان conversation باشد.

### Indexes مهم

| Table | Index | دلیل |
|---|---|---|
| market_contents | `(status, city_id, category_id, created_at desc)` | feed/search |
| market_contents | `(content_type, status, created_at desc)` | feed نوع محتوا |
| market_contents | `search_text` full-text/trigram آینده | keyword search |
| media_assets | `(content_id, sort_order)` | detail page |
| favorites | `(user_id, created_at desc)` | favorites list |
| conversations | `(buyer_user_id, updated_at desc)` | inbox |
| conversations | `(owner_user_id, updated_at desc)` | inbox owner |
| messages | `(conversation_id, created_at)` | conversation detail |
| reports | `(target_type, target_id, created_at desc)` | moderation context |
| moderation_cases | `(status, priority, created_at)` | review queue |
| analytics_events | `(event_name, occurred_at)` | metrics |
| analytics_events | `(city_id, category_id, occurred_at)` | local/category metrics |

## 5. API Principles

- API version: `/api/v1`
- JSON request/response
- auth با bearer token یا session token
- همه timestampها ISO 8601
- pagination cursor-based برای feed/search/listها
- idempotency برای createهای حساس با `Idempotency-Key`
- error contract یکسان
- هیچ endpoint عمومی نباید content غیر approved را نمایش دهد، مگر owner/admin context

## 6. Common API Contracts

### Pagination

Request query:

```text
limit=20&cursor=opaque_cursor
```

Response:

```json
{
  "data": [],
  "page": {
    "next_cursor": "opaque",
    "has_more": true
  }
}
```

### Error Contract

```json
{
  "error": {
    "code": "validation_failed",
    "message": "اطلاعات واردشده معتبر نیست.",
    "fields": {
      "title": ["عنوان اجباری است."]
    },
    "request_id": "req_..."
  }
}
```

کدهای پایه:

- `unauthorized`
- `forbidden`
- `not_found`
- `validation_failed`
- `rate_limited`
- `conflict`
- `content_not_public`
- `moderation_required`
- `internal_error`

### Filtering و Sorting

لیست‌های عمومی:

```text
city=garmeh|jajarm|eivar|dorq|all
content_type=listing|wanted|service_listing|service_request|all
category=mobile
price_min=1000000
price_max=20000000
sort=newest
```

## 7. API Endpoints

### Auth

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/otp/request` | درخواست OTP | No |
| POST | `/api/v1/auth/otp/verify` | تایید OTP و دریافت token | No |
| POST | `/api/v1/auth/logout` | خروج | Yes |
| GET | `/api/v1/me` | اطلاعات کاربر فعلی | Yes |
| PATCH | `/api/v1/me/profile` | ویرایش profile | Yes |

### Geography و Categories

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| GET | `/api/v1/regions/4d/cities` | شهرهای 4D | No |
| GET | `/api/v1/categories` | دسته‌های فعال | No |
| GET | `/api/v1/categories/{id}/attributes` | attributeهای category | No |

### Feed و Search

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| GET | `/api/v1/feed` | feed محتوای approved | Optional |
| GET | `/api/v1/search` | جستجو | Optional |

### Content Create

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| POST | `/api/v1/listings` | ثبت آگهی کالا | Yes + mobile verified |
| POST | `/api/v1/wanted-listings` | ثبت درخواست خرید | Yes + mobile verified |
| POST | `/api/v1/service-listings` | ثبت خدمت | Yes + mobile verified |
| POST | `/api/v1/service-requests` | ثبت درخواست خدمت | Yes + mobile verified |

همه createها status `submitted` برمی‌گردانند.

### Content Read

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| GET | `/api/v1/contents/{content_id}` | detail مشترک با subtype payload | Optional |
| GET | `/api/v1/me/contents` | محتوای من | Yes |
| PATCH | `/api/v1/contents/{content_id}` | ویرایش owner قبل/بعد از edit_required | Yes owner |
| DELETE | `/api/v1/contents/{content_id}` | حذف توسط owner | Yes owner |

### Media

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| POST | `/api/v1/media/uploads` | درخواست upload URL/key | Yes |
| POST | `/api/v1/contents/{content_id}/media` | اتصال media به content | Yes owner |
| DELETE | `/api/v1/media/{media_id}` | حذف media | Yes owner |

### Favorites

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| GET | `/api/v1/me/favorites` | لیست favorites | Yes |
| POST | `/api/v1/contents/{content_id}/favorite` | افزودن favorite | Yes |
| DELETE | `/api/v1/contents/{content_id}/favorite` | حذف favorite | Yes |

### Contact/Chat

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| POST | `/api/v1/contents/{content_id}/conversations` | شروع conversation contextدار | Yes |
| GET | `/api/v1/conversations` | inbox | Yes |
| GET | `/api/v1/conversations/{id}` | detail conversation | Yes participant |
| POST | `/api/v1/conversations/{id}/messages` | ارسال پیام | Yes participant |
| POST | `/api/v1/conversations/{id}/block` | block context | Yes participant |

### Reports

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| POST | `/api/v1/reports` | ثبت گزارش | Yes |

### Moderator/Admin

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| GET | `/api/v1/admin/moderation/cases` | review queue | Moderator |
| GET | `/api/v1/admin/moderation/cases/{id}` | detail case | Moderator |
| POST | `/api/v1/admin/moderation/cases/{id}/decisions` | ثبت decision | Moderator |
| GET | `/api/v1/admin/audit-logs` | audit logs | Admin |
| GET | `/api/v1/admin/users/{id}` | user context | Moderator |

### Analytics Internal

| Method | Endpoint | شرح | Auth |
|---|---|---|---|
| POST | `/api/v1/internal/analytics/events` | ثبت event client/server | Internal/Auth |

## 8. نمونه Payloadها

### Create Listing Request

```json
{
  "title": "گوشی سامسونگ A52",
  "description": "تمیز، بدون خط و خش، جعبه دارد.",
  "city_id": "uuid",
  "category_id": "uuid",
  "price_amount": 8500000,
  "price_type": "fixed",
  "item_condition": "used",
  "media_ids": ["uuid"],
  "attributes": {
    "brand": "Samsung",
    "storage": "128GB"
  }
}
```

### Content Detail Response

```json
{
  "id": "uuid",
  "content_type": "listing",
  "title": "گوشی سامسونگ A52",
  "description": "تمیز، بدون خط و خش، جعبه دارد.",
  "status": "approved",
  "city": { "id": "uuid", "code": "jajarm", "name_fa": "جاجرم" },
  "category": { "id": "uuid", "slug": "mobile", "name_fa": "موبایل و دیجیتال" },
  "media": [],
  "owner": {
    "id": "uuid",
    "display_name": "علی",
    "signals": {
      "mobile_verified": true,
      "account_age_days": 120
    }
  },
  "listing": {
    "price_amount": 8500000,
    "price_type": "fixed",
    "item_condition": "used"
  },
  "actions": {
    "can_favorite": true,
    "can_contact": true,
    "can_report": true
  },
  "created_at": "2026-08-11T10:00:00Z"
}
```

### Moderation Decision Request

```json
{
  "decision": "approve",
  "reason": "محتوا با قوانین انتشار سازگار است."
}
```

## 9. API Security

### Authentication

- endpointهای create، favorite، contact، report، profile نیازمند auth هستند.
- create content نیازمند mobile verified است.
- admin/moderator endpointها نیازمند role هستند.

### Authorization

- owner فقط محتوای خودش را ویرایش/حذف می‌کند.
- participant فقط conversation خودش را می‌بیند.
- moderator به moderation cases دسترسی دارد.
- admin به role assignment و audit گسترده دسترسی دارد.

### Idempotency

برای endpointهای زیر `Idempotency-Key` توصیه/الزام می‌شود:

- create content
- start conversation
- create report
- moderation decision
- media attach

### Rate Limit

Rate limit لازم برای:

- OTP request
- create content
- reports
- messages
- search در صورت abuse

## 10. Validation و Edge Cases

- content بدون city/category رد شود.
- content owner نتواند با محتوای خودش conversation عادی شروع کند.
- content غیر approved در feed/search عمومی نمایش داده نشود.
- favorite روی content غیر approved رد شود.
- duplicate favorite conflict بدهد یا idempotent حذف/اضافه شود.
- report بدون reason رد شود.
- moderation decision بدون reason رد شود.
- message روی conversation blocked/closed رد شود.
- expired Wanted/ServiceRequest در search عمومی نمایش داده نشود.

## 11. Exit Criteria Phase 7

| معیار | وضعیت |
|---|---|
| schema اولیه با tableها طراحی شده است | Done |
| indexها و constraintهای مهم مشخص شده‌اند | Done |
| تصمیم content modeling گرفته شده است | Done |
| API contract نسخه اول نوشته شده است | Done |
| error contract تعریف شده است | Done |
| pagination/filtering/sorting تعریف شده است | Done |
| security سطح API تعریف شده است | Done |
