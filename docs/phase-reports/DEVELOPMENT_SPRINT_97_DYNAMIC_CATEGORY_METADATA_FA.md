# گزارش Development Sprint 97 - فرم و فیلتر اختصاصی دسته‌ها

تاریخ: ۱۴۰۵/۰۶/۳۱

## هدف

تکمیل scope عقب‌مانده‌ی Sprint 97: تعریف metadata پویا برای دسته‌ها و استفاده‌ی یکسان از آن در API، فرم ثبت آگهی و فیلتر بازار.

## خروجی‌ها

- ستون `categories.metadata_schema` با migration `0023_category_metadata_schema.sql` اضافه شد.
- دسته‌های خودرو، املاک، موبایل و دیجیتال، خانه، ابزار و خدمات محلی schema فارسی و قابل توسعه دارند.
- API هنگام ثبت و ویرایش آگهی metadata را normalize و validate می‌کند.
- فرم وب با تغییر دسته، فیلدهای اختصاصی همان دسته را نشان می‌دهد و فیلدهای نامرتبط را پاک می‌کند.
- فیلتر بازار برای دسته‌ی انتخاب‌شده کنترل‌های اختصاصی text/number/select نشان می‌دهد.
- metadata در feed، detail، آگهی‌های کاربر و صف بررسی برمی‌گردد.
- تست واحد normalize/validation اضافه شد.

## محدودیت

schema دسته‌ها فعلاً از seed کنترل می‌شود؛ پنل مدیریت schema برای ادمین و range تخصصی فیلترهای عددی در backlog بعدی هستند.

## معیار خروج

`npm run check`، `npm run build` و workspace tests سبز هستند. پس از deploy باید migration و seed روی PostgreSQL cPanel اجرا و وب/API هم‌نسخه منتشر شوند.
