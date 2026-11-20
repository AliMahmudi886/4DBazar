# Test Plan بار همه‌جانبه 4D با 300 کاربر مجازی

تاریخ شروع: ۱۴۰۵/۰۵/۳۰
وضعیت: طرح تکمیل؛ اجرای ramp-up در انتظار محیط تست ایزوله

## هدف

سنجش رفتار واقعی API و دیتابیس 4D در سناریوهای Marketplace با حداکثر ۳۰۰ session مستقل، بدون اجرای تست مخرب یا DoS.

## مرز ایمنی

- تست فقط روی Local/Test با `NODE_ENV=development` و دیتابیس جدا اجرا می‌شود.
- اجرای ramp-up روی `https://4dbazar.ir` یا API production ممنوع است.
- تست stress بعد از ۳۰۰ کاربر فقط تا زمانی ادامه دارد که خطا، فشار DB یا degradation کنترل‌شده باشد.
- upload با فایل‌های کوچک synthetic انجام می‌شود و داده‌ی واقعی یا media production استفاده نمی‌شود.
- endpointهای مالی/پرداخت چون در MVP فعال نیستند، skip می‌شوند.

## محیط هدف

- Backend: Node.js/TypeScript/Fastify در `apps/api`
- Web: React/Vite در `apps/web`
- Mobile: Expo/React Native با همان API عمومی
- Database: PostgreSQL/Kysely
- Auth: OTP/password، session bearer، captcha proof و rate limit
- Storage: local media در محیط تست
- Seed: `db/seeds`

## توزیع کاربران مجازی

| گروه | تعداد | رفتار |
|---|---:|---|
| Browse/Search | 150 | feed، شهر/دسته، جستجو، جزئیات و pagination |
| Buyer | 60 | جستجو، جزئیات، favorite و contact/chat در صورت فعال بودن |
| Seller | 50 | ورود، ساخت آگهی تستی، media کوچک و مشاهده آگهی‌های من |
| Service/Wanted | 20 | جستجوی خدمت و ساخت محتوای service/wanted در صورت فعال بودن |
| Heavy User | 15 | درخواست‌های متوالی search/feed/favorite/chat |
| Admin/Moderator | 5 | queue، users، support و moderation |

## Ramp-up

مراحل اجرا: ۱۰، ۲۵، ۵۰، ۱۰۰، ۱۵۰، ۲۰۰، ۲۵۰ و ۳۰۰ کاربر. در هر مرحله latency، throughput، 4xx، 5xx، timeout و خطاهای دیتابیس ثبت می‌شود.

## اهداف اولیه

- Read API: P95 کمتر از ۵۰۰ms
- Search: P95 کمتر از ۸۰۰ms
- Write API: P95 کمتر از ۱۰۰۰ms
- Chat send: P95 کمتر از ۵۰۰ms
- Error rate: کمتر از ۱٪

این اهداف baseline هستند و در گزارش نهایی با توجه به منابع محیط تست اصلاح یا مستند می‌شوند.

## سناریوهای اجباری

feed، categories، cities، search/filter، detail، auth/session، create listing، upload image، edit/delete، favorite/unfavorite، contact، chat، notification، report، admin moderation، admin users، rate limit، authorization/IDOR و duplicate submission.

## خروجی

نتایج در `docs/testing/LOAD_TEST_300_USERS_FA.md` ثبت می‌شود و شامل محیط، داده، ramp-up، P50/P90/P95/P99، خطاها، concurrency، security، breaking point، fixes و status نهایی PASS / PASS WITH WARNINGS / NOT READY خواهد بود.
