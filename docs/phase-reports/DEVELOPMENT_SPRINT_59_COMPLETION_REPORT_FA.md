# گزارش تکمیل Development Sprint 59

## موضوع

Business Profile و Public Trust Layer برای ایجاد context قابل اتکا برای فروشنده و خریدار.

## خروجی‌های انجام‌شده

- migration `0014_business_profiles.sql` برای ذخیره مستقل پروفایل کسب‌وکار اضافه شد.
- repository خواندن و upsert با trim و محدودیت طول فیلدها اضافه شد.
- endpointهای احراز‌شده برای خواندن و ویرایش پروفایل کسب‌وکار اضافه شدند.
- endpoint عمومی `GET /api/v1/business-profiles/:userId` فقط در حالت `is_public` داده را برمی‌گرداند.
- `owner_user_id` به feed و آگهی‌های کاربر اضافه شد تا seller context قابل اتصال باشد.
- در جزئیات آگهی، نام کسب‌وکار، نوع فعالیت، محدوده خدمت و ساعات کاری نمایش داده می‌شود.
- در workspace پروفایل، فرم کامل اطلاعات کسب‌وکار و وضعیت public/private اضافه شد.
- `/api/v1/me` خلاصه پروفایل کسب‌وکار را هم برمی‌گرداند.

## Validation

- `npm run check` موفق
- `npm run build` موفق
- API tests: 40 passed, 0 failed
- `npm run db:migrate` موفق و migration `0014` روی PostgreSQL محلی اعمال شد

## تصمیم‌ها و ریسک‌ها

- تصمیم `D-059` در `docs/DECISION_LOG_FA.md` ثبت شد.
- ریسک ادعاهای تأییدنشده کسب‌وکار در `R-015` ثبت شد.
- badge، review و verification تجاری تا زمان وجود evidence واقعی deferred هستند.

## فاز بعد

Evidence-backed trust signals و analytics پایه، سپس آماده‌سازی production media storage.
