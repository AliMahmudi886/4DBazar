# Product Strategy پروژه 4D

## وضعیت سند

- Phase: Phase 3 - Product Strategy
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: Product Discovery و Market Research

## 1. Positioning

4D یک classified عمومی دیگر نیست. جایگاه پیشنهادی:

> 4D بازار محلی چهار منطقه گرمه، جاجرم، ایور و درق برای پیدا کردن سریع‌تر کالا، درخواست، خدمات و کسب‌وکارهای نزدیک و قابل اعتماد است.

### ضدجایگاه‌ها

4D فعلاً این‌ها نیست:

- جایگزین کامل دیوار در همه دسته‌ها
- شبکه اجتماعی محلی
- پلتفرم پرداخت و ارسال
- سیستم رزرو خدمات پیچیده
- فروشگاه‌ساز برای کسب‌وکارها

## 2. Differentiation

| تمایز | معنی اجرایی | سنجه |
|---|---|---|
| Local by default | تجربه با شهر من و کل 4D شروع می‌شود | درصد sessionهای دارای فیلتر شهر |
| Demand visibility | Wanted و Service Request در کنار فروش عادی وجود دارند | تعداد درخواست‌ها و response rate |
| Simple trust | signalهای کم‌هزینه و قابل فهم | report rate، verified users، response rate |
| Service utility | خدمات محلی فقط یک category گم‌شده نیست | service request completion proxy |
| Cold start discipline | تبلیغ جدی بعد از supply واقعی | active listings قبل از campaign |

## 3. Category Strategy

### P0

- کالای دست دوم عمومی
- موبایل و دیجیتال
- لوازم خانه و آشپزخانه
- ابزار و تجهیزات
- خدمات محلی
- Wanted
- Service Request

دلیل: این دسته‌ها احتمال نیاز روزمره، معامله حضوری و ارتباط محلی بالاتری دارند.

### P1

- کسب‌وکارهای محلی با Business Profile پایه
- خودرو و موتورسیکلت سبک در صورت supply واقعی
- خدمات حرفه‌ای
- Saved Search

### P2

- املاک
- استخدام
- فروشگاه رسمی پیشرفته
- Boost و Featured Seller

### P3

- پرداخت امن
- ارسال
- مزایده
- recommendation پیشرفته
- verification سنگین

## 4. Local Strategy

MVP فقط سه سطح location لازم دارد:

1. شهر من
2. کل 4D
3. انتخاب دستی یکی از چهار شهر: گرمه، جاجرم، ایور، درق

موارد deferred:

- neighbourhood
- latitude/longitude
- radius search
- nearby
- expansion به استان یا region جدید

قانون توسعه جغرافیایی:

شهر جدید فقط زمانی اضافه شود که حداقل supply، moderation capacity و کانال جذب محلی آن مشخص باشد.

## 5. Cold Start Strategy

### هدف اولیه

قبل از تبلیغ عمومی، 300 تا 500 آگهی و خدمت واقعی در کل 4D تامین شود.

### مسیر تامین supply

| منبع supply | اقدام | Priority |
|---|---|---|
| فروشندگان عادی | onboarding دستی و کمک در ثبت آگهی | P0 |
| خدمت‌دهندگان | فهرست اولیه برقکار، مکانیک، تعمیرکار، بنا، مدرس و خدمات خانگی | P0 |
| کسب‌وکارها | دعوت محدود برای پروفایل ساده یا آگهی محصولات | P1 |
| Wanted واقعی | جمع‌آوری نیازهای واقعی از کاربران اولیه | P0 |

### توزیع پیشنهادی supply

- گرمه: 25 تا 30 درصد
- جاجرم: 35 تا 40 درصد
- ایور: 15 تا 20 درصد
- درق: 15 تا 20 درصد

این نسبت‌ها فرض اولیه هستند و باید با داده جمعیت، رفتار رفت‌وآمد و ظرفیت supply اصلاح شوند.

## 6. Trust Strategy

در MVP TrustScore ترکیبی ساخته نمی‌شود. به‌جای آن signalهای جداگانه نمایش داده می‌شوند:

- موبایل تاییدشده
- عمر حساب
- تعداد آگهی فعال/قبلی
- response rate ساده
- report history داخلی برای moderation
- business badge فقط بعد از verification سبک

قانون مهم:

Trust signal نباید وعده امنیت قطعی بدهد. متن محصول باید نشان دهد این‌ها «نشانه» هستند، نه تضمین.

## 7. Monetization Strategy

Buyer flows پایه رایگان می‌مانند:

- مشاهده آگهی
- جستجوی پایه
- تماس یا چت پایه
- ثبت Wanted پایه در حد کنترل‌شده

درآمد اولیه باید از سمت seller/business بیاید، اما بعد از ایجاد liquidity.

### مسیر درآمدی پیشنهادی

| مرحله | قابلیت | زمان |
|---|---|---|
| Free launch | ثبت محدود آگهی و خدمات | MVP |
| Premium seller | تعداد آگهی بیشتر، refresh، آمار ساده | بعد از liquidity |
| Business | پروفایل کسب‌وکار، badge، چند آگهی فعال | P1/P2 |
| Boost | نمایش بهتر، فوری، highlight | P2 |

Pricing فعلاً تعیین نمی‌شود.

## 8. Growth Strategy

### قبل از launch

- جذب supply واقعی
- دعوت فروشندگان و خدمت‌دهندگان کلیدی
- ایجاد نمونه‌های موفق کوچک
- تست search و contact با کاربران محدود

### Closed Beta

- دعوت شهر به شهر
- تمرکز روی چند category
- اندازه‌گیری جستجوهای بی‌نتیجه
- اصلاح copy و flow ثبت آگهی

### Public Regional Release

- تبلیغ محلی فقط بعد از فعال بودن supply
- استفاده از کانال‌های محلی برای معرفی
- همکاری با کسب‌وکارهای معتبر

## 9. Metrics Strategy

North Star پیشنهادی برای بررسی بیشتر:

`Qualified Local Connections`

تعریف کاری نسخه اول:

ارتباطی که بین دو کاربر داخل 4D روی یک آگهی، Wanted، Service Listing یا Service Request معتبر شروع شود و spam/report فوری نگیرد.

### Metric Tree

| سطح | Metric |
|---|---|
| Supply | active listings، active service providers، active sellers |
| Demand | searches، wanted listings، service requests |
| Match | search result rate، listing views، request responses |
| Connection | chat starts، contacts، seller responses |
| Trust | report rate، moderation reject rate، verified mobile rate |
| Retention | returning users، saved searches، repeat contacts |

## 10. Strategic Risks

- اگر supply قبل از demand ساخته نشود، launch شکست می‌خورد.
- اگر Wanted و Service Request پاسخ نگیرند، به تجربه منفی تبدیل می‌شوند.
- اگر monetization زود فعال شود، فروشنده‌های اولیه کم می‌شوند.
- اگر trust بیش از حد پیچیده شود، هم کاربر گیج می‌شود هم تیم کند.
- اگر categoryهای زیاد باز شوند، liquidity هر دسته کم می‌شود.

## 11. ورودی‌های Phase 4

Phase 4 باید PRD و MVP Scope را بر اساس این strategy محدود کند:

- P0 فقط flowهای اصلی marketplace، location ساده، trust پایه، report و moderation اولیه
- P1 برای Business Profile و Saved Search
- P2 برای monetization جدی
- P3 برای پرداخت، ارسال، auction و featureهای سنگین

## 12. Exit Criteria Phase 3

| معیار | وضعیت |
|---|---|
| Positioning تعریف شده است | Done |
| Differentiation اجرایی شده است | Done |
| Category Strategy مشخص است | Done |
| Local Strategy مشخص است | Done |
| Cold Start Strategy نسخه اول آماده است | Done |
| Monetization Strategy بدون paywall buyer تعریف شده است | Done |
| Trust Strategy سطح strategy تعریف شده است | Done |
| Growth Strategy تعریف شده است | Done |
| Metrics Strategy و North Star candidate مشخص شده است | Done |
