# دستور آماده برای Agent بعدی پروژه 4D

متن داخل بلوک زیر را کامل به Agent یا اکانت بعدی بده:

```text
تو Agent اجرایی پروژه 4D در مسیر D:\Projects\4D هستی. کار را از وضعیت واقعی repository ادامه بده و هیچ تغییر موجودی را بدون بررسی revert نکن.

قبل از هر تغییر، به‌ترتیب این فایل‌ها را بخوان:
1. AGENTS.md
2. README.md
3. PROJECT_STATUS_FA.md
4. docs/HANDOFF_FA.md
5. docs/NEW_ACCOUNT_START_HERE_FA.md
6. docs/RELEASE_READINESS_AUDIT_FA.md
7. docs/phase-reports/DEVELOPMENT_SPRINT_91_QUALITY_AUDIT_PROGRESS_FA.md
8. docs/ROADMAP_FA.md
9. docs/TRACKER_FA.md
10. docs/DECISION_LOG_FA.md
11. docs/RISK_REGISTER_FA.md
12. docs/SERVICE_MARKETPLACE_TARIFFS_FA.md

سپس `git status --short` را بررسی کن. worktree ممکن است شامل تغییرهای تاییدنشده مالک پروژه باشد؛ از reset/checkout/revert و پاک‌کردن فایل‌های نامرتبط خودداری کن.

وضعیت تحویل:
- Sprint 90 کامل است.
- Sprint 91 در حال اجراست و gateهای محلی پاس شده‌اند.
- preview APK Build 2 ساخته شده، ولی smoke واقعی هاست، backup/restore پوشه media و device QA روی گوشی واقعی باید با evidence بسته شوند.
- Web production: https://4dbazar.ir
- API production: https://api.4dbazar.ir
- OTP موبایل دارای OS Autofill hint و verify خودکار پس از تکمیل ۶ رقم است؛ READ_SMS/RECEIVE_SMS نباید اضافه شود.
- فاز محصول بعدی پس از بسته‌شدن Sprint 91، Sprint 92: Service Marketplace & Publication Tariffs است.

اول Sprint 91 را کامل کن:
1. artifactهای تازه cPanel را طبق docs/CPANEL_DEPLOYMENT_FA.md منتشر کن یا از مالک evidence انتشار را بگیر.
2. health/live و health/ready را بررسی کن.
3. smoke واقعی OTP، ورود با رمز، ثبت/ویرایش آگهی، عکس، پروفایل، moderation و چت را ثبت کن.
4. از data/media backup بگیر و یک restore آزمایشی مستند کن.
5. preview APK را روی حداقل یک گوشی واقعی نصب و login، OTP Autofill، upload، deep link و chat را تست کن.
6. فقط پس از برآورده‌شدن exit criteria، Sprint 91 را در status/tracker/report کامل اعلام کن.

بعد Sprint 92 را طبق docs/SERVICE_MARKETPLACE_TARIFFS_FA.md پیاده کن:
1. قبل از کدنویسی، taskها را در tracker ثبت کن و plan مرحله‌ای بده.
2. migrationهای publication_plans، service_listing_details و content_publications را اضافه کن.
3. content_type واقعی listing/service_listing، validation category و snapshot تعرفه را در API پیاده کن.
4. endpoint عمومی planها و مسیر free/waived را با تست بساز.
5. تا تعیین provider، پرداخت پولی باید fail-closed باشد؛ success یا receipt ساختگی ممنوع است.
6. فرم و فیلتر مستقل کالا/خدمت و انتخاب تعرفه را در Web و Mobile پیاده کن.
7. card/detail/profile/moderation/analytics را با نوع خدمت سازگار کن.
8. مبلغ تعرفه را از DB/API بخوان؛ در کلاینت hardcode نکن.
9. رقم نهایی تعرفه و provider را از مالک محصول بگیر؛ از تعیین خودسرانه قیمت واقعی خودداری کن.
10. check، build، test، bundle budget، quality QA، Expo Doctor و Android export را اجرا کن.

قواعد کیفیت:
- معماری Modular Monolith و الگوهای موجود Fastify/Kysely/React/Expo را حفظ کن.
- feature جدید بدون migration، test، error/loading/empty state و مستند deploy کامل نیست.
- داده demo یا موفقیت ساختگی وارد production نکن.
- secret، شماره کامل کاربر، OTP و credential را log یا commit نکن.
- هر تصمیم بنیادین را در DECISION_LOG، هر ریسک را در RISK_REGISTER و هر بدهی را در TECH_DEBT ثبت کن.
- در پایان، فایل‌های دقیق تغییرکرده، commandهای validation و فایل‌های لازم برای upload وب/API و rebuild موبایل را گزارش کن.
```

## نکته مالک پروژه

پیش از فعال‌سازی پرداخت، مبلغ ریالی دو پلن خدماتی، درگاه پرداخت، مدت featured و سیاست بازپرداخت آگهی ردشده باید تصمیم‌گیری شوند. تا آن زمان فقط مسیر رایگان یا `is_beta_waived` مجاز است.

