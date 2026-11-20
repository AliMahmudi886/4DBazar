# راهنمای Agentها برای پروژه 4D

این فایل برای بازیابی سریع context و ادامه کنترل‌شده پروژه نوشته شده است. اسناد اصلی پروژه فارسی هستند؛ نام‌های فنی می‌توانند انگلیسی باشند.

## وضعیت شروع

برای ادامه کار، ابتدا این فایل‌ها را بخوان:

1. `README.md`
2. `PROJECT_STATUS_FA.md`
3. `docs/ROADMAP_FA.md`
4. `docs/TRACKER_FA.md`
5. `docs/DECISION_LOG_FA.md`
6. `docs/RISK_REGISTER_FA.md`
7. `docs/UNKNOWNS_FA.md`

## قواعد اجرایی

- بدون بررسی وضعیت فعلی و tracker وارد فاز بعدی نشو.
- هر phase فقط وقتی شروع می‌شود که exit criteria فاز قبلی برآورده شده باشد.
- تا پایان Phase 9، کدنویسی feature محصول ممنوع است مگر برای prototype مستند و محدود.
- هر تصمیم بنیادین باید در `docs/DECISION_LOG_FA.md` ثبت شود.
- هر تغییر مهم باید سند مرتبط را sync کند.
- هر feature جدید ابتدا در tracker یا backlog ثبت و اولویت‌بندی می‌شود.
- مستندات باید تصمیم‌محور، قابل اجرا و کم‌تکرار باشند.

## تصمیم‌های Foundation

- سبک معماری فعلاً hypothesis است: Modular Monolith.
- دیتابیس پیشنهادی هنوز قطعی نیست، اما relational database فرض اولیه معقول است.
- محصول باید ابتدا برای 4D Region عرضه شود: گرمه، جاجرم، ایور، درق.
- MVP نباید شامل wallet، escrow، logistics، auction، microservices، KYC سنگین یا recommendation پیچیده باشد.

## Definition of Done برای Phaseها

هر phase باید این خروجی‌ها را داشته باشد:

- سند یا اسناد اصلی همان phase
- به‌روزرسانی `PROJECT_STATUS_FA.md`
- به‌روزرسانی `docs/TRACKER_FA.md`
- ثبت تصمیم‌های مهم
- ثبت ریسک‌ها، بدهی‌ها یا موارد deferred
- گزارش تکمیل phase در `docs/phase-reports`

## وضعیت فعلی ادامه کار

Phase 0 تا Phase 10 تکمیل شده‌اند. پروژه وارد مرحله توسعه feature شده است.

فاز/اسپرینت جاری:

Development Sprint 116 - Hosted API Origin and Cache Hardening

خروجی این increment:

- داده demo دیگر با feed واقعی ادغام نمی‌شود و production در زمان قطع API داده ساختگی نشان نمی‌دهد
- خطای query مربوط به feed با stack واقعی در log سرور ثبت می‌شود
- فرمان محافظت‌شده `db:cleanup:market` برای حذف transactional همه آگهی‌ها و وابستگی‌های منطقی اضافه شد
- فایل‌های فیزیکی رسانه در پاک‌سازی حفظ می‌شوند
- check، build، ۵۸ تست workspace و bundle budget سبز
- fallback production وب به `https://api.4dbazar.ir` قطعی شد و داده demo فقط در development باقی می‌ماند
- Service Worker با cache key `four-d-shell-v9` منتشر شد تا bundle قدیمی پس از deploy باقی نماند
- release جفت `v0.1.34-2026-08-25` و manifest checksum ساخته شد

وضعیت کدنویسی و تست محلی تکمیل شده؛ deploy جفت وب/API و smoke مقصد cPanel هنوز باز هستند. گزارش: `docs/phase-reports/DEVELOPMENT_SPRINT_116_HOSTED_API_ORIGIN_CACHE_FA.md`.
## وضعیت handoff به‌روز

آخرین increment اجرایی Sprint 116 است. برای ادامه، ابتدا `docs/HANDOFF_FA.md`، `docs/NEW_ACCOUNT_START_HERE_FA.md` و `docs/BRAND_GUIDELINES_FA.md` را بخوان. گام بعدی مصوب: deploy جفت release `v0.1.34`، پاک‌سازی cache مرورگر، health/feed smoke و سپس ثبت یک آگهی آزمایشی در cPanel است.
## مرجع ادامه برای اکانت جدید

برای انتقال پروژه به اکانت یا agent جدید، ابتدا `docs/NEW_ACCOUNT_START_HERE_FA.md` را بخوان. این سند ترتیب مطالعه همه اسناد، وضعیت فازهای انجام‌شده، قواعد اجرای phase و مسیر پیشنهادی ادامه را مشخص می‌کند.
