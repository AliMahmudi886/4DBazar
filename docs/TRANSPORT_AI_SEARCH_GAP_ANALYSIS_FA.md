# تحلیل شکاف و طراحی یکپارچه حمل‌ونقل محلی و جست‌وجوی هوشمند

## مشخصات

- Increment: Development Sprint 102
- تاریخ: ۱۴۰۵/۰۶/۰۲
- وضعیت: طراحی و تثبیت قرارداد؛ آماده ورود به پیاده‌سازی مرحله‌ای
- دامنه: Web، Mobile، API، دیتابیس، moderation، چت و اعلان

## هدف

دو قابلیت جدید باید روی هسته فعلی 4D سوار شوند، نه اینکه مسیر جدا و ناسازگار بسازند:

1. **حمل‌ونقل محلی** برای پیشنهاد سفر و درخواست سفر بین شهرها و روستاهای منطقه 4D.
2. **جست‌وجوی هوشمند** برای تبدیل عبارت فارسی کاربر به intent ساختاریافته و استفاده از همان موتور جست‌وجوی امن موجود.

این سند قبل از هر تغییر schema یا UI، وضعیت واقعی repository، مرز MVP، قراردادها و ترتیب اجرا را تثبیت می‌کند.

## شواهد وضعیت فعلی

| حوزه | مشاهده فعلی |
|---|---|
| معماری | Modular Monolith؛ API در `apps/api` و وب در `apps/web` |
| محتوای بازار | `market_contents` و `listings` برای آگهی، وضعیت moderation و مالکیت |
| دسته‌بندی | catalog و metadata پویا وجود دارد؛ انتخاب‌گر جست‌وجوپذیر هم وجود دارد |
| جست‌وجو | feed و فیلترهای فعلی عمدتاً با داده بارگذاری‌شده و در سمت Web کار می‌کنند |
| هوش مصنوعی | مسیر بازبینی متن آگهی وجود دارد؛ intent search هنوز وجود ندارد |
| اعتماد و تعامل | auth، پروفایل، گزارش، moderation، conversation و notification پایه وجود دارد |
| حمل‌ونقل | مدل، lifecycle، route search و endpoint اختصاصی مشاهده نشد |
| انتشار | release cPanel و migration/seed وجود دارد؛ smoke مقصد باید بخشی از هر release بماند |

## طبقه‌بندی شکاف

### پیاده‌سازی‌شده

- مدل عمومی آگهی، مالک، شهر، دسته و status moderation.
- احراز هویت و الزام‌های اعتماد برای ایجاد محتوا.
- گزارش، تماس/گفتگو، اعلان و مسیرهای مدیریت moderation.
- دسته‌بندی‌های کالا، املاک، خودرو، خدمات و کسب‌وکار.
- metadata پویا برای بخشی از دسته‌ها.
- provider هوش مصنوعی و الگوی کنترل خطای provider در API.
- UI واکنش‌گرا و انتخاب‌گر جست‌وجوپذیر برای فهرست‌های بلند.

### پیاده‌سازی‌شده اما ناقص

- `content_type` عمومی وجود دارد، اما offer/request حمل‌ونقل و اعتبارسنجی اختصاصی آن وجود ندارد.
- feed قابل استفاده است، اما قرارداد جست‌وجوی server-side با pagination و فیلترهای ترکیبی ندارد.
- فیلتر keyword و دسته در Web وجود دارد، اما نتیجه آن به مجموعه feed بارگذاری‌شده محدود است.
- AI فعلاً برای review آگهی است، نه استخراج intent و توضیح‌پذیری جست‌وجو.
- moderation عمومی است و صف/فیلتر اختصاصی سفر ندارد.
- analytics پایه وجود دارد، اما رویدادهای transport و smart-search تعریف نشده‌اند.

### مفقود

- مدل transport offer/request، مبدا، مقصد، زمان، ظرفیت و نوع وسیله.
- جست‌وجو و تطبیق سفر با وضعیت active، expired، cancelled و completed.
- صفحه/فرم اختصاصی «سفر دارم» و «سفر می‌خواهم» در Web و Mobile.
- intent schema برای عبارت محاوره‌ای فارسی و fallback قطعی بدون AI.
- endpoint جست‌وجوی هوشمند که فقط intent اعتبارسنجی‌شده را به search service بدهد.
- chipهای قابل ویرایش، نمایش confidence و فهرست فیلترهای استخراج‌شده.
- پیشنهاد اصلاح query در حالت no-result و ثبت metricهای کیفیت.
- اعلان opt-in برای تطبیق‌های جدید؛ این مورد بعد از هسته جست‌وجوست.

### ریسک یا نیازمند بازطراحی

- جست‌وجوی صرفاً client-side برای داده واقعی و تعداد زیاد قابل اتکا نیست.
- اجرای مستقیم query توسط مدل زبانی ممنوع و از نظر امنیتی پرریسک است.
- provider بیرونی ممکن است timeout، خطا یا پاسخ نامعتبر بدهد؛ نتیجه AI نباید شرط کارکرد جست‌وجو باشد.
- نگه‌داری همه این تغییرات در `apps/web/src/main.tsx` ریسک نگهداشت دارد؛ UI جدید باید تا حد ممکن component جدا داشته باشد.
- schema مقصد cPanel ممکن است از workspace عقب باشد؛ migration باید idempotent و smoke نوشتنی داشته باشد.
- مقصدهای خارج از چهار شهر اصلی نباید به city UUID محدود شوند؛ label مقصد و city اختیاری لازم است.

## مرز MVP حمل‌ونقل

### داخل MVP

- راننده: ثبت «سفر دارم» با مبدا، مقصد، تاریخ، بازه زمان، ظرفیت، نوع وسیله و قیمت/توافقی.
- مسافر: ثبت «سفر می‌خواهم» با همان اطلاعات مورد نیاز و تعداد نفر.
- جست‌وجوی مبدا/مقصد، تاریخ، بازه زمانی، ظرفیت و نوع سفر.
- جزئیات، تماس/چت، گزارش، moderation و مدیریت چرخه عمر.
- انقضای خودکار سفر گذشته و امکان لغو توسط مالک.

### خارج از MVP و deferred

- رزرو قطعی، پرداخت، کیف پول، escrow و کمیسیون.
- ردیابی زنده، نقشه لحظه‌ای، قیمت‌گذاری پویا و dispatch.
- حمل بار به‌عنوان domain مستقل.
- KYC سنگین، امتیازدهی پیچیده و matching توصیه‌گر.

## مدل داده پیشنهادی

به‌جای microservice یا جدول مستقل بدون ارتباط با بازار، یک جدول یک‌به‌یک `transport_details` به `market_contents.id` اضافه می‌شود:

- `content_id` کلید اصلی و foreign key به محتوای بازار.
- `mode`: `offer` یا `request`.
- `origin_label` و `destination_label`؛ به‌همراه city id اختیاری برای شهرهای شناخته‌شده.
- `departure_date`، `time_from`، `time_to` و timezone قراردادی منطقه.
- `seats_available` یا `passenger_count` بر اساس mode.
- `vehicle_type` و فیلدهای اختیاری وسیله.
- `price_type`: `fixed` یا `negotiable` و `price_amount` اختیاری.
- `lifecycle_status`: `active`، `expired`، `cancelled`، `completed`.
- `expires_at`، `cancelled_at` و audit fields.

محتوای عمومی همچنان از status و moderation هسته بازار استفاده می‌کند؛ این جدول فقط جزئیات domain را نگه می‌دارد.

## قرارداد API پیشنهادی

### Transport

- `POST /api/v1/transport/trips`
- `GET /api/v1/transport/search`
- `GET /api/v1/transport/:id`
- `PUT /api/v1/me/transport/:id`
- `POST /api/v1/me/transport/:id/cancel`
- `POST /api/v1/transport/:id/contact`

ایجاد و ویرایش احراز هویت و mobile verification می‌خواهد؛ نتیجه عمومی فقط approved و active را نمایش می‌دهد.

### Smart Search

- `POST /api/v1/search/smart`

ورودی پیشنهادی:

```json
{
  "query": "فردا از جاجرم به گرمه جا برای دو نفر",
  "context": {"city": "جاجرم", "surface": "market"}
}
```

خروجی پیشنهادی:

```json
{
  "intent": "transport_search",
  "confidence": 0.91,
  "filters": {
    "origin": "جاجرم",
    "destination": "گرمه",
    "date": "2026-08-25",
    "seats": 2
  },
  "chips": ["جاجرم", "گرمه", "فردا", "۲ نفر"],
  "unresolved": [],
  "results": [],
  "fallback": false
}
```

مدل هرگز SQL، نام جدول یا query آزاد دریافت نمی‌کند. API پس از normalize و schema validation، intent را به search service داخلی می‌دهد.

## طراحی جست‌وجوی هوشمند

1. نرمال‌سازی قطعی فارسی: ی/ي، ک/ك، اعداد فارسی، فاصله، نیم‌فاصله و نام شهرهای شناخته‌شده.
2. استخراج قطعی موارد روشن مانند شهر، تاریخ نسبی، تعداد نفر و قیمت.
3. در صورت ابهام، provider OpenAI-compatible فعلی با env سمت API فراخوانی می‌شود؛ secret هرگز به Web/Mobile نمی‌رود.
4. پاسخ AI با schema محدود parse و reject می‌شود؛ پاسخ خراب یا timeout به deterministic fallback برمی‌گردد.
5. chipها editable هستند و کاربر قبل از اجرا می‌تواند فیلتر را حذف یا اصلاح کند.
6. no-result با پیشنهاد ساده‌سازی query، حذف یک فیلتر یا نزدیک‌ترین مقصد پاسخ می‌گیرد.

## ترتیب sprintهای بعدی

| Sprint | خروجی اصلی | معیار خروج |
|---|---|---|
| 102 | این سند، قراردادها، تصمیم‌ها و ریسک‌ها | gap analysis و schema/API review ثبت شده |
| 103 | migration و domain حمل‌ونقل | create/detail/cancel و تست lifecycle سبز |
| 104 | search service server-side و normalizer | pagination، فیلتر و no-result سبز |
| 105 | Web UX سفر و smart search | فرم‌های جدا، chip، loading/error/empty و responsive |
| 106 | Mobile UX | navigation، فرم و جزئیات با API production-compatible |
| 107 | moderation، چت و اعلان تطبیق | auth، report، audit و opt-in notification تست شده |
| 108 | امنیت، load test، release و smoke cPanel | check/build/test و smoke نوشتنی مقصد سبز |

## معیار خروج Sprint 102

- این gap analysis در repository ثبت شده است.
- مرز MVP و موارد deferred روشن است.
- مدل داده و قرارداد API بدون وابستگی به provider بیرونی تعریف شده‌اند.
- تصمیم عدم اجرای SQL توسط AI ثبت شده است.
- tracker، status، decision log، risk register و phase report همگام شده‌اند.
- هیچ migration یا UI نیمه‌کاره‌ای در این sprint وارد production نمی‌شود.

