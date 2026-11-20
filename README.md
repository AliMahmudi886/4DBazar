# 4D

> وضعیت جاری ممیزی و محدودیت‌های شناخته‌شده در [گزارش اصلاحات](docs/audit/REMEDIATION_TRACKER.md) است. این شاخه تحویل سورس بررسی‌شده است و تأیید انتشار production محسوب نمی‌شود. تاریخچه وضعیت پایین سند قدیمی است.

برای تست کامل سورس: `npm run check`، `npm run build`، `npm test`، `npm run typecheck -w @four-d/mobile`، `npm run bundle:check`، `npm run qa:visual` و `npm run qa:quality`. تست دیتابیس فقط با `FOURD_TEST_DATABASE_URL` به دیتابیس محلی مستقل به نام `fourd_audit` فعال می‌شود؛ بدون آن دو تست دیتابیس skipped هستند. ابتدا migrationها را روی همان دیتابیس مستقل اجرا کنید. برای seed نمایشی محلی `ALLOW_DEMO_SEED=true` لازم است. هیچ‌یک از این فرمان‌ها را به دیتابیس واقعی متصل نکنید.

4D یک پلتفرم Hyperlocal Commerce برای چهار منطقه گرمه، جاجرم، ایور و درق است. هدف نسخه اول، ساخت یک بازار محلی کوچک، قابل عرضه و قابل سنجش برای خرید، فروش، درخواست کالا، خدمات و درخواست خدمات است؛ نه ساخت یک clone عمومی از دیوار یا شیپور.

## وضعیت فعلی

- فاز فعلی: Development Sprint 42 - Web Bundle Performance Pass
- وضعیت کلی: Phase 0 تا Phase 10 و sprintهای اجرایی اصلی auth، SMS، moderation، persisted OTP، rate limit، beta UX polish، deploy readiness، final access pass، signup/media/captcha، workspace/chat polish، PWA/mobile readiness، media storage baseline، server-side captcha proof، password login abuse guard، captcha UX polish، conversation inbox/unread، گزارش پیام چت، mute/block گفتگو، اعلان سبک وب، baseline ثبت Push، ارسال best-effort Push، ابزار ساخت VAPID، تست Push، اصلاح env وب و pass اولیه performance وب تکمیل شده‌اند.
- Git: در زمان ارزیابی اولیه، این پوشه repository گیت نبود.
- کد اپلیکیشن: API، web/admin shell، ورود واقعی OTP و رمز عبور با محدودیت تلاش ناموفق، captcha proof سمت سرور با کپچای پازلی polished، PostgreSQL migrations/seeds، SMS OTP با Kavenegar، moderation flow، profile workspace، آپلود عکس آگهی با local media URL، چت داخل برنامه، پایه PWA موبایل و visual QA وجود دارد.

جزئیات وضعیت در [PROJECT_STATUS_FA.md](PROJECT_STATUS_FA.md) نگهداری می‌شود.

## اصل راهنما

هر تصمیم محصول باید به این سؤال پاسخ دهد:

> چرا کاربر باید 4D را به‌جای دیوار، شیپور، اینستاگرام، تلگرام یا روش‌های سنتی محلی استفاده کند؟

اگر پاسخ روشن نباشد، آن تصمیم یا feature باید دوباره بررسی شود.

## اسناد اصلی

- [AGENTS.md](AGENTS.md): راهنمای ادامه کار برای agentها
- [PROJECT_STATUS_FA.md](PROJECT_STATUS_FA.md): وضعیت زنده پروژه
- [docs/ROADMAP_FA.md](docs/ROADMAP_FA.md): نقشه راه فازها
- [docs/TRACKER_FA.md](docs/TRACKER_FA.md): tracker اجرایی
- [docs/RISK_REGISTER_FA.md](docs/RISK_REGISTER_FA.md): ثبت ریسک‌ها
- [docs/DECISION_LOG_FA.md](docs/DECISION_LOG_FA.md): ثبت تصمیم‌ها
- [docs/TECH_DEBT_FA.md](docs/TECH_DEBT_FA.md): ثبت بدهی فنی و محصولی
- [docs/UNKNOWNS_FA.md](docs/UNKNOWNS_FA.md): ناشناخته‌ها و فرضیات
- [docs/DOCUMENTATION_ARCHITECTURE_FA.md](docs/DOCUMENTATION_ARCHITECTURE_FA.md): معماری مستندات
- [docs/DEVELOPMENT_FOUNDATION_FA.md](docs/DEVELOPMENT_FOUNDATION_FA.md): foundation اجرایی
- [docs/TECHNICAL_OVERVIEW_FA.md](docs/TECHNICAL_OVERVIEW_FA.md): معرفی فنی اپلیکیشن، stack و معماری اجرایی
- [docs/MOBILE_APP_STRATEGY_FA.md](docs/MOBILE_APP_STRATEGY_FA.md): استراتژی اپ موبایل، زمان شروع native و مسیر PWA
- [docs/RUN_LOCAL_FA.md](docs/RUN_LOCAL_FA.md): راهنمای اجرای محلی
- [docs/PRODUCTION_READINESS_FA.md](docs/PRODUCTION_READINESS_FA.md): چک‌لیست production/deploy
- [docs/phase-reports/PHASE_0_COMPLETION_REPORT_FA.md](docs/phase-reports/PHASE_0_COMPLETION_REPORT_FA.md): گزارش تکمیل Phase 0

## اجرای سریع

```powershell
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

اعتبارسنجی کامل محلی:

```powershell
npm run ci:local
```

## قانون شروع کدنویسی

Phaseهای طراحی تا Phase 9 و foundation اجرایی Phase 10 تکمیل شده‌اند. توسعه featureها اکنون در sprintهای اجرایی بعد از foundation ادامه دارد و وضعیت زنده در tracker ثبت می‌شود.
