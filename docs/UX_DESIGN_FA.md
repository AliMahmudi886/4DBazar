# UX Design پروژه 4D

## وضعیت سند

- Phase: Phase 5 - UX
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: PRD MVP، Product Strategy، Product Discovery

## 1. اصول تجربه کاربری

- صفحه اول باید خود محصول باشد: feed و search محلی، نه landing page تبلیغاتی.
- تجربه پیش‌فرض بر اساس «شهر من» و «کل 4D» باشد.
- ثبت آگهی، Wanted، Service Listing و Service Request باید از یک نقطه ورود ساده شروع شود.
- برای MVP، contact/chat به‌عنوان یک مسیر سبک طراحی می‌شود؛ جزئیات فنی در Phase 7 قطعی می‌شود.
- هر محتوای عمومی باید report داشته باشد.
- moderation و admin از UX کاربر عادی جدا باشد.

## 2. Sitemap

### User App - Web/Mobile

```text
/
├─ Feed / Home
│  ├─ City Switcher
│  ├─ Search Bar
│  ├─ Category Tabs
│  └─ Listing/Service/Wanted Cards
├─ Search Results
│  ├─ Keyword
│  ├─ Filters
│  ├─ Sort
│  ├─ Results
│  └─ Empty State
├─ Detail
│  ├─ Listing Detail
│  ├─ Wanted Detail
│  ├─ Service Listing Detail
│  └─ Service Request Detail
├─ Create
│  ├─ Create Listing
│  ├─ Create Wanted
│  ├─ Create Service Listing
│  └─ Create Service Request
├─ Messages / Contacts
│  ├─ Conversation List
│  └─ Conversation Detail
├─ Favorites
├─ Profile
│  ├─ My Content
│  ├─ My Favorites
│  ├─ Account Signals
│  └─ Settings
├─ Auth
│  ├─ Mobile Entry
│  ├─ OTP Verification
│  └─ Basic Profile Setup
└─ Report
   └─ Report Modal / Sheet
```

### Admin/Moderator Panel

```text
/admin
├─ Dashboard
├─ Review Queue
│  ├─ Submitted Content
│  ├─ Reported Content
│  └─ Suspicious/Duplicate Candidates
├─ Review Detail
│  ├─ Content Preview
│  ├─ User Signals
│  ├─ Report Context
│  ├─ Decision Form
│  └─ Audit History
├─ Users
├─ Reports
└─ Audit Log
```

## 3. Navigation

### Mobile Navigation

Bottom navigation پیشنهادی:

| Tab | نقش |
|---|---|
| خانه | feed، city switcher، category، search |
| جستجو | search results و فیلترها |
| ثبت | انتخاب نوع محتوا و شروع create flow |
| پیام‌ها | contact/chatهای شروع‌شده |
| حساب من | profile، محتوای من، favorites، تنظیمات |

### Web Navigation

Top navigation پیشنهادی:

| بخش | نقش |
|---|---|
| لوگو 4D | بازگشت به feed |
| city switcher | شهر من، کل 4D، چهار شهر |
| search | جستجوی اصلی |
| ثبت آگهی/درخواست | create hub |
| پیام‌ها | conversation/contact |
| حساب من | profile و settings |

## 4. Screen List

| Screen | هدف | نقش در MVP |
|---|---|---|
| Home Feed | نمایش محتوای محلی تازه | discovery اصلی |
| Search Results | پیدا کردن مورد مشخص | demand capture |
| Filter Sheet/Page | محدود کردن نتایج | UX و relevance |
| Listing Detail | تصمیم برای contact | connection |
| Wanted Detail | پاسخ فروشنده به نیاز | demand visibility |
| Service Detail | تماس با خدمت‌دهنده | service utility |
| Service Request Detail | پاسخ خدمت‌دهنده به درخواست | service demand |
| Create Hub | انتخاب نوع محتوا | کاهش سردرگمی |
| Create Listing | ثبت کالای فروش | supply |
| Create Wanted | ثبت درخواست خرید | demand |
| Create Service Listing | معرفی خدمت | service supply |
| Create Service Request | ثبت نیاز خدمت | service demand |
| Review Status | نمایش وضعیت submitted/approved/rejected/edit required | شفافیت |
| Messages/Contacts | دیدن ارتباط‌ها | retention و trust |
| Conversation Detail | ارتباط زمینه‌دار | connection |
| Favorites | ذخیره و برگشت | retention |
| Profile | trust signals و محتوای من | trust و مدیریت |
| Auth/OTP | ورود و تایید موبایل | trust |
| Report Modal | گزارش محتوا | safety |
| Admin Queue | بررسی محتوا و گزارش‌ها | moderation |
| Admin Review Detail | تصمیم moderation | quality |

## 5. Home و Feed

### اجزای صفحه

- city switcher در بالای صفحه
- search bar همیشه قابل مشاهده
- category tabs برای P0
- بخش «تازه‌های شهر من»
- بخش «درخواست‌ها»
- بخش «خدمات محلی»
- cards یکپارچه اما با label نوع محتوا: آگهی، درخواست خرید، خدمت، درخواست خدمت

### Empty State

اگر در شهر انتخابی نتیجه کم است:

- پیشنهاد نمایش «کل 4D»
- نمایش action ثبت Wanted یا Service Request
- نمایش categoryهای فعال‌تر

متن پیشنهادی:

> فعلاً مورد زیادی در این شهر نیست. کل 4D را ببین یا نیازت را ثبت کن تا دیگران پیشنهاد بدهند.

## 6. Create Hub

کاربر با انتخاب «ثبت» چهار گزینه می‌بیند:

| گزینه | توضیح کوتاه |
|---|---|
| فروش کالا | برای ثبت آگهی فروش |
| درخواست خرید | وقتی چیزی را پیدا نکرده‌ام |
| معرفی خدمت | برای خدمت‌دهندگان محلی |
| درخواست خدمت | وقتی به خدمت‌دهنده نیاز دارم |

قانون UX:

کاربر نباید مجبور شود ابتدا category پیچیده انتخاب کند. ابتدا نیت را انتخاب می‌کند، بعد فرم متناسب باز می‌شود.

## 7. Listing Flow

```text
Create Hub
→ فروش کالا
→ فرم آگهی
→ پیش‌نمایش
→ ارسال برای بررسی
→ وضعیت submitted
→ approve توسط moderation
→ نمایش در feed/search
→ خریدار detail را می‌بیند
→ contact/chat شروع می‌شود
```

### فرم آگهی

فیلدها:

- عنوان
- دسته
- شهر
- قیمت یا توافقی
- توضیح
- وضعیت کالا
- عکس‌ها

### وضعیت‌ها برای کاربر

| وضعیت | متن UX |
|---|---|
| submitted | آگهی برای بررسی ارسال شد. |
| approved | آگهی منتشر شد. |
| edit_required | برای انتشار، چند مورد باید اصلاح شود. |
| rejected | آگهی منتشر نشد. دلیل را ببینید. |
| suspended | آگهی موقتاً از نمایش خارج شد. |

## 8. Wanted Flow

```text
Search بدون نتیجه یا Create Hub
→ درخواست خرید
→ فرم Wanted
→ ارسال برای بررسی
→ نمایش پس از approve
→ فروشنده/کاربر پاسخ یا contact شروع می‌کند
→ expiry در صورت بی‌پاسخ ماندن
```

### UX Fallback برای Wanted بی‌پاسخ

در MVP:

- expiry پیش‌فرض پیشنهادی: 30 روز
- قبل از expiry، کاربر بتواند درخواست را تمدید یا ویرایش کند.
- اگر پاسخ نگرفت، سیستم پیشنهاد دهد جستجو را در کل 4D انجام دهد یا category/بودجه را اصلاح کند.

## 9. Service Flow

### Service Listing

```text
Create Hub
→ معرفی خدمت
→ فرم خدمت
→ ارسال برای بررسی
→ انتشار
→ مشتری detail را می‌بیند
→ contact/chat
```

فیلدها:

- عنوان خدمت
- دسته خدمت
- شهر پایه
- شهرهای قابل پوشش
- توضیح
- زمان پاسخ‌گویی یا توضیح دسترسی، optional

### Service Request

```text
Create Hub یا Service Empty State
→ درخواست خدمت
→ فرم درخواست
→ ارسال برای بررسی
→ انتشار
→ خدمت‌دهنده contact شروع می‌کند
→ expiry
```

expiry پیش‌فرض پیشنهادی:

- درخواست خدمت فوری/زمان‌دار: 7 روز
- درخواست عادی: 14 روز

اگر در MVP فوریت پیاده‌سازی نشود، expiry پیش‌فرض 14 روز باشد.

## 10. Search Flow

```text
Home/Search
→ وارد کردن keyword
→ results
→ فیلتر city/category/price/sort
→ detail
→ favorite یا contact
```

### فیلترهای MVP

- city: شهر من، کل 4D، گرمه، جاجرم، ایور، درق
- content type: همه، آگهی، Wanted، خدمت، درخواست خدمت
- category
- price min/max برای کالا و Wanted
- sort: جدیدترین

### Empty Stateها

| حالت | رفتار |
|---|---|
| بدون نتیجه در شهر من | پیشنهاد کل 4D |
| بدون نتیجه در کل 4D | پیشنهاد ثبت Wanted یا Service Request |
| فیلتر خیلی محدود | پیشنهاد حذف فیلتر |

## 11. Chat/Contact Flow

برای MVP، UX به شکل `contextual contact` طراحی می‌شود:

```text
Detail
→ دکمه تماس/پیام
→ اگر login نیست: Auth/OTP
→ شروع conversation با context entity
→ event ثبت می‌شود
→ امکان report/block
```

### تصمیم UX نسخه اول

- متن پیام اول می‌تواند prefilled باشد: «سلام، درباره این آگهی پیام می‌دهم...»
- conversation همیشه به entity مربوط وصل است.
- شماره موبایل عمومی نمایش داده نمی‌شود مگر strategy تماس مستقیم در Phase 7 تصویب شود.

## 12. Report Flow

```text
Detail یا Conversation
→ Report
→ انتخاب دلیل
→ توضیح optional
→ ارسال
→ پیام تایید
→ ورود به moderation context
```

دلایل گزارش:

- spam
- duplicate
- fraud suspicion
- inappropriate
- wrong category
- other

UX باید تأکید کند گزارش کاربر دریافت شده، اما نتیجه moderation فوراً وعده داده نشود.

## 13. Moderation Flow

```text
Content submitted
→ automatic checks ساده
→ اگر سالم: review queue یا auto-approve مشروط
→ moderator review
→ approve / reject / edit_required / suspend
→ audit log
→ notification/status برای کاربر
```

### تصمیم UX نسخه اول

برای MVP، تجربه کاربر بر مبنای pre-publication review طراحی می‌شود، چون trust در شروع حیاتی است. تصمیم نهایی operational در Phase 7 و 9 تثبیت می‌شود.

## 14. Subscription Flow

در MVP paid subscription وجود ندارد. UX فقط جایگاه آینده را در profile/account در نظر می‌گیرد:

- وضعیت حساب: Free
- متن بدون CTA پرداخت: «قابلیت‌های ویژه فروشندگان و کسب‌وکارها بعداً اضافه می‌شود.»

هیچ paywall برای buyer flow پایه طراحی نمی‌شود.

## 15. Accessibility و زبان

- UI فارسی و راست‌به‌چپ باشد.
- اعداد قیمت در نمایش می‌توانند فارسی باشند، اما مدل داده عددی استاندارد بماند.
- دکمه‌های اصلی باید فعل روشن داشته باشند: ثبت آگهی، ارسال درخواست، شروع پیام.
- خطاها باید قابل اصلاح باشند، نه سرزنش‌گر.
- فرم‌ها باید مرحله‌ای و کوتاه باشند.

## 16. خروجی برای Phase 6

UX این entityها و مفهوم‌ها را برای Domain Model برجسته می‌کند:

- User
- Profile
- City
- Category
- Listing
- WantedListing
- ServiceListing
- ServiceRequest
- Conversation
- Message یا ContactEvent
- Favorite
- Report
- ModerationCase
- AuditLog
- AnalyticsEvent

## 17. Exit Criteria Phase 5

| معیار | وضعیت |
|---|---|
| Sitemap طراحی شده است | Done |
| Navigation طراحی شده است | Done |
| Screen List نوشته شده است | Done |
| Listing Flow طراحی شده است | Done |
| Wanted Flow طراحی شده است | Done |
| Service Flow طراحی شده است | Done |
| Search Flow طراحی شده است | Done |
| Chat/Contact Flow طراحی شده است | Done |
| Report Flow طراحی شده است | Done |
| Subscription Flow به‌عنوان آینده و خارج از MVP مشخص شده است | Done |
