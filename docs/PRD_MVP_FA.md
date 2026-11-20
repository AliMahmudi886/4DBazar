# PRD + MVP پروژه 4D

## وضعیت سند

- Phase: Phase 4 - PRD + MVP
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: Product Discovery، Market Research، Product Strategy

## 1. خلاصه محصول

4D یک بازار محلی برای گرمه، جاجرم، ایور و درق است که به کاربران کمک می‌کند کالا، درخواست خرید، خدمات و درخواست خدمات را در محدوده نزدیک‌تر پیدا کنند و سریع‌تر ارتباط بگیرند. MVP باید کوچک، قابل launch، قابل سنجش و قابل توسعه باشد.

## 2. هدف MVP

هدف MVP اثبات این فرض است:

> اگر supply واقعی و تجربه محلی ساده فراهم شود، کاربران 4D برای پیدا کردن کالا و خدمات نزدیک، سریع‌تر از کانال‌های پراکنده محلی به ارتباط معنادار می‌رسند.

## 3. کاربران هدف MVP

| کاربر | هدف اصلی در MVP |
|---|---|
| خریدار محلی | جستجو و تماس با فروشنده نزدیک |
| فروشنده عادی | ثبت آگهی و دریافت تماس/چت |
| درخواست‌دهنده کالا | ثبت Wanted و دریافت پیشنهاد |
| خدمت‌دهنده | معرفی خدمت و دریافت درخواست |
| درخواست‌دهنده خدمت | ثبت نیاز خدمت و دریافت پاسخ |
| moderator/admin | بررسی گزارش‌ها و کنترل کیفیت |

## 4. اصول Scope

- Local-first: شهر و کل 4D در مرکز تجربه هستند.
- Liquidity قبل از رشد: تبلیغ گسترده قبل از supply واقعی ممنوع است.
- Trust ساده: signalها جدا هستند و TrustScore ترکیبی نداریم.
- Buyer پایه رایگان است.
- هر feature باید به supply، demand، liquidity، trust، retention، UX، monetization یا operational efficiency کمک کند.

## 5. MVP Scope

### P0 - ضروری برای Launch

| Feature | شرح | هدف |
|---|---|---|
| Account پایه با تایید موبایل | ثبت‌نام/ورود با شماره موبایل و وضعیت mobile verified | Trust |
| Profile پایه کاربر | نام نمایشی، شهر اصلی، تاریخ عضویت، signalهای پایه | Trust و UX |
| Location ساده | شهر من، کل 4D، گرمه، جاجرم، ایور، درق | Local |
| Category P0 | کالاهای عمومی، موبایل و دیجیتال، خانه و آشپزخانه، ابزار و تجهیزات، خدمات محلی | Liquidity |
| ثبت آگهی کالا | عنوان، توضیح، قیمت، شهر، category، عکس، وضعیت کالا | Supply |
| لیست و جزئیات آگهی | مشاهده آگهی‌ها، عکس، قیمت، شهر، توضیح، seller signal | Demand |
| جستجو و فیلتر پایه | keyword، category، city، price range، sort جدیدترین | Demand و UX |
| Wanted Listing | ثبت درخواست خرید با عنوان، بودجه، شهر، توضیح | Demand visibility |
| Service Listing | ثبت خدمت با عنوان، category خدمت، شهرهای قابل پوشش، توضیح | Supply خدمات |
| Service Request | ثبت نیاز خدمت با شهر، زمان تقریبی، توضیح | Demand خدمات |
| Contact/Chat پایه | شروع ارتباط از آگهی/درخواست و ثبت event تماس | Connection |
| Favorites | ذخیره آگهی یا خدمت برای مراجعه بعدی | Retention |
| Report | گزارش آگهی، درخواست، کاربر یا پیام | Trust و moderation |
| Moderation پایه | وضعیت submitted، approved، rejected، review queue | Quality |
| Admin/Moderator پایه | مشاهده queue، تصمیم approve/reject/edit required، audit log | Operations |
| Analytics Events پایه | ثبت listing view، search، chat start، report، moderation decision | Metrics |

### P1 - مهم بعد از Launch

| Feature | دلیل defer |
|---|---|
| Business Profile پایه | نیازمند validation willingness و فرآیند verification |
| Saved Search | بعد از مشاهده رفتار search |
| Response Rate نمایشی | نیازمند داده کافی |
| Notification بهتر | بعد از مشخص شدن channel و رفتار کاربران |
| خودرو و موتورسیکلت سبک | فقط اگر supply واقعی باشد |
| آمار ساده seller | بعد از ثبت eventهای کافی |

### P2 - Growth و Monetization

| Feature | دلیل defer |
|---|---|
| Premium Seller | بعد از liquidity |
| Business Subscription | بعد از lead واقعی |
| Boost / Highlight / فوری | بعد از شکل‌گیری supply رقابتی |
| Local Trending | بعد از داده کافی |
| Featured Seller | بعد از trust و moderation پایدار |

### P3 - Future

| Feature | دلیل defer |
|---|---|
| پرداخت امن و escrow | پیچیدگی مالی، حقوقی و عملیاتی |
| ارسال و logistics | خارج از MVP محلی |
| مزایده | افزایش ریسک abuse و پیچیدگی |
| recommendation پیچیده | نیازمند داده زیاد |
| geo radius و nearby | فعلاً location ساده کافی است |
| KYC سنگین و face recognition | friction بالا و خارج از نیاز MVP |
| microservices | over-engineering برای شروع |

## 6. Non-goals MVP

MVP عمداً شامل این موارد نیست:

- پرداخت داخل محصول
- ارسال و رهگیری
- کیف پول
- escrow
- auction
- social feed
- live streaming
- املاک کامل
- استخدام کامل
- فروشگاه‌ساز کامل
- TrustScore ترکیبی
- recommendation engine پیچیده
- semantic search پیچیده
- microservices یا Kubernetes

## 7. User Stories و Acceptance Criteria برای P0

### 7.1 Account پایه با تایید موبایل

User Story:

به‌عنوان کاربر، می‌خواهم با شماره موبایل وارد شوم تا بتوانم آگهی ثبت کنم و با دیگران ارتباط بگیرم.

Acceptance Criteria:

- کاربر بدون شماره موبایل تاییدشده نمی‌تواند آگهی، Wanted، Service Listing یا Service Request ثبت کند.
- وضعیت `mobile_verified` در profile و moderation قابل استفاده باشد.
- شماره موبایل به‌صورت عمومی نمایش داده نشود مگر contact strategy در UX/API چنین تصمیمی بگیرد.

### 7.2 Profile پایه

User Story:

به‌عنوان خریدار، می‌خواهم اطلاعات پایه فروشنده را ببینم تا اعتماد اولیه داشته باشم.

Acceptance Criteria:

- profile شامل نام نمایشی، شهر اصلی، تاریخ عضویت و وضعیت موبایل تاییدشده باشد.
- تعداد آگهی‌های فعال/قبلی در صورت وجود قابل نمایش باشد.
- report history عمومی نمایش داده نشود و فقط برای moderation استفاده شود.

### 7.3 Location ساده

User Story:

به‌عنوان کاربر، می‌خواهم بین شهر خودم و کل 4D جابه‌جا شوم تا نتایج نزدیک‌تر ببینم.

Acceptance Criteria:

- هر آگهی یا درخواست باید دقیقاً یک شهر از گرمه، جاجرم، ایور یا درق داشته باشد.
- feed و search بتوانند با city یا all 4D فیلتر شوند.
- neighbourhood، radius و GPS در MVP اجباری نیستند.

### 7.4 ثبت آگهی کالا

User Story:

به‌عنوان فروشنده، می‌خواهم کالایم را سریع ثبت کنم تا خریداران محلی آن را ببینند.

Acceptance Criteria:

- فیلدهای ضروری: title، category، city، description، price یا توافقی، حداقل یک عکس مگر category اجازه دهد.
- آگهی جدید ابتدا وضعیت `submitted` داشته باشد.
- automatic checks ساده برای فیلدهای خالی، متن خیلی کوتاه، محتوای ممنوع و duplicate احتمالی در طراحی moderation لحاظ شود.
- پس از approve، آگهی در feed/search قابل مشاهده باشد.

### 7.5 لیست و جزئیات آگهی

User Story:

به‌عنوان خریدار، می‌خواهم آگهی‌ها را با اطلاعات کافی ببینم تا تصمیم بگیرم تماس بگیرم یا نه.

Acceptance Criteria:

- card آگهی شامل عکس، عنوان، قیمت، شهر و زمان انتشار باشد.
- صفحه جزئیات شامل توضیح، عکس‌ها، seller signal، report و contact action باشد.
- آگهی rejected یا suspended برای کاربران عمومی نمایش داده نشود.

### 7.6 جستجو و فیلتر پایه

User Story:

به‌عنوان خریدار، می‌خواهم با کلمه، دسته، شهر و قیمت جستجو کنم تا سریع‌تر گزینه مرتبط پیدا کنم.

Acceptance Criteria:

- keyword search برای title و description طراحی شود.
- normalization فارسی/عربی در طراحی فنی بعدی الزام محسوب شود.
- فیلترهای MVP: city، category، price min/max، sort by newest.
- رویداد search و تعداد نتیجه ثبت شود.

### 7.7 Wanted Listing

User Story:

به‌عنوان خریدار، می‌خواهم وقتی کالایی پیدا نمی‌کنم درخواست خرید ثبت کنم.

Acceptance Criteria:

- فیلدهای ضروری: title، city، budget optional، description.
- Wanted باید قابل report و moderation باشد.
- فروشنده بتواند از Wanted مسیر contact/start conversation داشته باشد.
- Wantedهای بی‌پاسخ باید در UX آینده fallback داشته باشند؛ در MVP حداقل status و expiry داشته باشند.

### 7.8 Service Listing

User Story:

به‌عنوان خدمت‌دهنده، می‌خواهم خدمت خود را معرفی کنم تا مشتریان محلی من را پیدا کنند.

Acceptance Criteria:

- فیلدهای ضروری: title، service category، city یا شهرهای قابل پوشش، description.
- contact action از صفحه خدمت وجود داشته باشد.
- service listing قابل report و moderation باشد.

### 7.9 Service Request

User Story:

به‌عنوان مشتری، می‌خواهم نیاز خدمتی خود را ثبت کنم تا خدمت‌دهندگان پاسخ دهند.

Acceptance Criteria:

- فیلدهای ضروری: title، city، description، زمان تقریبی optional.
- service provider بتواند پاسخ/contact شروع کند.
- request دارای status و expiry باشد.
- request قابل report و moderation باشد.

### 7.10 Contact/Chat پایه

User Story:

به‌عنوان خریدار یا درخواست‌دهنده، می‌خواهم از داخل آگهی یا درخواست ارتباط را شروع کنم.

Acceptance Criteria:

- شروع contact/chat به آگهی، Wanted، Service Listing یا Service Request وصل باشد.
- `chat_start` یا `contact_start` event ثبت شود.
- block/report از context ارتباط قابل دسترسی باشد.
- جزئیات پیاده‌سازی chat در Phase 7 مشخص شود؛ PRD فقط نیاز محصولی را قطعی می‌کند.

### 7.11 Favorites

User Story:

به‌عنوان کاربر، می‌خواهم آگهی یا خدمت را ذخیره کنم تا بعداً برگردم.

Acceptance Criteria:

- کاربر login شده بتواند favorite اضافه/حذف کند.
- favoriteها در profile یا بخش جداگانه قابل مشاهده باشند.
- آگهی حذف‌شده یا rejected در favorite عمومی باز نشود.

### 7.12 Report

User Story:

به‌عنوان کاربر، می‌خواهم محتوای مشکوک یا نامناسب را گزارش کنم.

Acceptance Criteria:

- report reasonهای پایه وجود داشته باشند: spam، duplicate، fraud suspicion، inappropriate، wrong category، other.
- report به entity مربوط وصل شود.
- report در moderation queue یا review context قابل مشاهده باشد.
- report کردن نباید بلافاصله محتوای معتبر را حذف کند مگر rule مشخصی در moderation تعریف شود.

### 7.13 Moderation پایه

User Story:

به‌عنوان moderator، می‌خواهم محتوای جدید و گزارش‌شده را بررسی کنم تا کیفیت بازار حفظ شود.

Acceptance Criteria:

- وضعیت‌های پایه: submitted، approved، rejected، edit_required، suspended.
- تصمیم‌های moderator باید audit log داشته باشند.
- moderator بتواند دلیل تصمیم را ثبت کند.
- محتوای rejected/suspended عمومی نمایش داده نشود.

### 7.14 Admin/Moderator پایه

User Story:

به‌عنوان admin، می‌خواهم queue و تصمیم‌های moderation را مدیریت کنم.

Acceptance Criteria:

- panel پایه برای لیست موارد pending/reported وجود داشته باشد.
- roleهای admin و moderator از کاربر عادی جدا باشند.
- عملیات حساس audit log داشته باشند.

### 7.15 Analytics Events پایه

User Story:

به‌عنوان تیم محصول، می‌خواهم رفتارهای کلیدی ثبت شوند تا بفهمیم MVP کار می‌کند یا نه.

Acceptance Criteria:

- eventهای MVP: signup، listing_created، listing_approved، search_performed، listing_viewed، favorite_added، chat_started/contact_started، report_created، moderation_decision.
- eventها city و category مرتبط را در صورت وجود داشته باشند.
- metricها برای کل 4D، شهر و category قابل تحلیل باشند.

## 8. Success Metrics

### قبل از Public Launch

- 300 تا 500 supply واقعی در کل 4D
- حداقل 5 category/service فعال
- نرخ تایید محتوای اولیه قابل قبول و queue قابل مدیریت
- search result rate قابل قبول در categoryهای P0

### Closed Beta

- signup
- listing creation
- search
- listing view
- chat/contact start
- seller response
- report rate
- returning users

### North Star Candidate

`Qualified Local Connections`

تعریف MVP:

شروع contact/chat بین دو کاربر 4D روی یک entity approved که ظرف بازه کوتاه report فوری یا moderation invalidation نگیرد.

## 9. Constraints

- مستندات اصلی فارسی باشند.
- کدنویسی feature تا تکمیل Phase 5 تا 9 شروع نشود.
- دیتابیس و API physical قبل از Phase 7 قطعی نشوند.
- معماری قبل از Phase 8 قطعی نشود.
- monetization قبل از liquidity فعال نشود.

## 10. Open Questions برای فازهای بعد

| سؤال | فاز پاسخ |
|---|---|
| chat داخلی کامل لازم است یا contact flow سبک کافی است؟ | Phase 5 و 7 |
| عکس برای همه categoryها اجباری باشد؟ | Phase 5 و 7 |
| expiry پیش‌فرض برای Wanted و Service Request چند روز باشد؟ | Phase 5 |
| moderation pre-approval باشد یا post-approval با review؟ | Phase 7 و 9 |
| Business Profile در P1 دقیقاً چه حداقلی دارد؟ | Phase 4 update یا Phase 5 |

## 11. Exit Criteria Phase 4

| معیار | وضعیت |
|---|---|
| PRD نسخه اول نوشته شده است | Done |
| MVP Scope به P0/P1/P2/P3 تقسیم شده است | Done |
| Acceptance Criteria برای P0ها نوشته شده است | Done |
| Non-goals ثبت شده‌اند | Done |
| Success Metrics تعریف شده‌اند | Done |
| Constraints و open questions ثبت شده‌اند | Done |
