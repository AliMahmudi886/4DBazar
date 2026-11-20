# طراحی اجرایی بازار خدمات و تعرفه انتشار

## وضعیت سند

- وضعیت: Approved for implementation after Sprint 91 exit criteria
- فاز هدف: Development Sprint 92
- وابستگی: تکمیل smoke واقعی Sprint 91، backup media و device QA
- مالک تصمیم قیمت: Product Owner

## مسئله

در مدل دامنه، `service_listing` از `listing` جدا است؛ اما مسیر فعلی `POST /api/v1/listings` همه محتوا را با نوع `listing` ذخیره می‌کند. نتیجه این است که خدمت، کالای دست دوم، وضعیت کالا و قیمت‌گذاری انتشار همگی یک تجربه مشترک و نادرست دارند.

هدف Sprint 92 ساخت یک بازار خدمات مستقل در همان Modular Monolith است، بدون wallet، escrow یا پرداخت صوری.

## مرز محصول

### آگهی کالا

- `content_type=listing`
- دارای وضعیت کالا: نو، در حد نو، کارکرده
- قیمت کالا: ثابت یا توافقی
- پلن پایه پیشنهادی: `goods_basic`

### آگهی ارائه خدمت

- `content_type=service_listing`
- بدون وضعیت کالا
- دارای محدوده خدمت، مدل قیمت، زمان/روزهای پاسخ‌گویی و توضیح تخصص
- مدل قیمت خدمت: `quote`، `fixed`، `starting_at`، `hourly` یا `daily`
- پلن‌های پیشنهادی: `service_basic` و `service_featured`
- پروفایل کسب‌وکار می‌تواند اعتماد بیشتری بسازد، اما تا زمان احراز واقعی نباید badge تایید رسمی نمایش داده شود.

### درخواست خدمت

`service_request` در مدل دامنه باقی می‌ماند، اما در Sprint 92 وارد تعرفه ارائه‌دهنده نمی‌شود. این flow یک سمت تقاضاست و باید در Sprint جدا با سیاست ضداسپم و matching محدود پیاده شود.

## کاتالوگ پلن پیشنهادی

| کد | نوع محتوا | مدت | قابلیت | قیمت عرضه |
|---|---|---:|---|---|
| `goods_basic` | `listing` | ۳۰ روز | انتشار عادی کالا | پیشنهاد اولیه: رایگان |
| `service_basic` | `service_listing` | ۳۰ روز | انتشار عادی خدمت | نیازمند تایید مالک محصول |
| `service_featured` | `service_listing` | ۳۰ روز | ۷ روز اول نمایش ویژه با برچسب شفاف | نیازمند تایید مالک محصول |

مبلغ‌ها نباید در کلاینت hardcode شوند. منبع حقیقت، جدول دیتابیس است. تا قبل از تعیین درگاه، پلن پولی نباید موفقیت ساختگی نشان دهد. دوره آزمایشی فقط با فیلد صریح `is_beta_waived=true` و snapshot مبلغ اصلی مجاز است.

## مدل داده پیشنهادی

### `publication_plans`

- `id uuid primary key`
- `code varchar unique`
- `content_type varchar`
- `title_fa`, `description_fa`
- `price_amount_irr bigint`
- `duration_days int`
- `featured_days int default 0`
- `is_beta_waived boolean default false`
- `is_active boolean`
- `sort_order int`
- timestampها

### `service_listing_details`

- `content_id uuid primary key references market_contents`
- `service_area varchar(160)`
- `pricing_model varchar(32)`
- `availability varchar(160)`
- `experience_years smallint null`

### `content_publications`

- `id uuid primary key`
- `content_id uuid unique`
- `plan_id uuid`
- snapshot کد، عنوان، مبلغ و مدت پلن
- `payment_status`: `free`، `waived`، `pending`، `paid`، `failed`، `refunded`
- `provider`, `provider_reference` به‌صورت nullable
- `starts_at`, `expires_at`, `featured_until`
- timestampها

Snapshot مانع تغییر تاریخچه مالی آگهی‌های قبلی پس از ویرایش تعرفه می‌شود.

## ماشین وضعیت انتشار

1. کاربر نوع محتوا و پلن معتبر همان نوع را انتخاب می‌کند.
2. API سازگاری category با `content_type` و سازگاری plan با همان نوع را کنترل می‌کند.
3. پلن رایگان یا معاف دوره آزمایشی: publication با `free/waived` ثبت و محتوا وارد `submitted` می‌شود.
4. پلن پولی: محتوا و publication در transaction با وضعیت `pending` ساخته می‌شوند؛ محتوا تا callback معتبر وارد moderation نمی‌شود.
5. callback درگاه باید امضا، مبلغ، شناسه سفارش و idempotency را کنترل کند.
6. پس از پرداخت معتبر، محتوا `submitted` می‌شود.
7. پس از تایید moderator، `starts_at` و `expires_at` تنظیم می‌شوند؛ مدت پلن از زمان انتشار محاسبه می‌شود، نه زمان پرداخت.

## قرارداد API هدف

- `GET /api/v1/publication-plans?content_type=listing|service_listing`
- `POST /api/v1/listings` با فیلدهای جدید:
  - `content_type`
  - `publication_plan_code`
  - `service_details` فقط برای `service_listing`
- `GET /api/v1/me/publications/:contentId`
- `POST /api/v1/me/publications/:contentId/checkout` بعد از انتخاب provider
- `POST /api/v1/payments/:provider/callback` فقط پس از threat model و مستند provider

پاسخ ثبت باید `content` و `publication` را جدا برگرداند. کلاینت نباید از HTTP 202 نتیجه بگیرد که پرداخت انجام شده است.

## تجربه وب و موبایل

- ابتدای فرم ثبت، segmented control با دو گزینه «کالا» و «خدمت» قرار گیرد.
- با تغییر نوع، فقط categoryهای سازگار نمایش داده شوند.
- فرم کالا وضعیت کالا را نشان دهد؛ فرم خدمت محدوده، مدل قیمت و زمان پاسخ‌گویی را نشان دهد.
- تعرفه‌ها به‌صورت radio card قابل مقایسه باشند؛ مبلغ، مدت و ویژه‌بودن شفاف نمایش داده شود.
- بازار tab مستقل «همه / کالا / خدمات» داشته باشد و card خدمت برچسب «خدمت» و مدل قیمت مناسب نشان دهد.
- Loading، خطای دریافت تعرفه و حالت بدون پلن فعال باید مانع submit مبهم شوند.
- مبلغ از API دریافت شود و در Web/Mobile hardcode نشود.

## امنیت و یکپارچگی مالی

- مبلغ نهایی فقط از plan دیتابیس خوانده شود؛ مبلغ ارسالی کلاینت نادیده گرفته شود.
- callback باید idempotent باشد و replay را رد کند.
- secret درگاه فقط در API environment باشد.
- تغییر plan نیازمند audit log است.
- هیچ آگهی `pending` نباید وارد feed یا moderation شود.
- featured باید برچسب تبلیغاتی شفاف داشته باشد و جایگاه ارگانیک را مخفیانه دست‌کاری نکند.

## Analytics پایه

- `publication_plan_viewed`
- `publication_plan_selected`
- `checkout_started`
- `payment_succeeded`
- `payment_failed`
- `service_listing_submitted`
- `service_listing_approved`

payload نباید شماره موبایل، متن کامل آگهی یا داده پرداخت حساس داشته باشد.

## تصمیم‌های لازم پیش از فعال‌سازی پرداخت

1. مبلغ `service_basic` به ریال.
2. مبلغ `service_featured` به ریال.
3. مدت نمایش ویژه و سقف ظرفیت هر شهر/دسته.
4. درگاه پرداخت و قرارداد callback آن.
5. سیاست بازپرداخت در صورت رد moderation.
6. صدور فاکتور و الزامات مالی/حقوقی.

## Exit Criteria Sprint 92

- migration و rollback plan بررسی شده باشد.
- API فقط ترکیب معتبر content/category/plan را بپذیرد.
- کالا و خدمت در DB، feed، profile، moderation و analytics قابل تفکیک باشند.
- Web و Mobile فرم و فیلتر مستقل و responsive داشته باشند.
- تعرفه از API خوانده و snapshot شود.
- مسیر free/waived end-to-end تست شود.
- مسیر paid تا قبل از provider با پیام صریح fail-closed بماند.
- تست API، build، quality QA و تست واقعی Android پاس شوند.
- مستند deploy و migration cPanel به‌روز شود.

