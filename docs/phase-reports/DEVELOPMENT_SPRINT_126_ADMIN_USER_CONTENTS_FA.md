# Development Sprint 126 — Admin User Contents

## هدف

نمایش آگهی‌های واقعی کاربر انتخاب‌شده در User Detail پنل ادمین.

## تغییرات

- مسیر محافظت‌شده `GET /api/v1/admin/users/:userId/contents` اضافه شد.
- مسیر فقط با نقش `admin` قابل استفاده است.
- داده از repository موجود `listUserContents` خوانده می‌شود و آگهی‌های حذف‌شده نمایش داده نمی‌شوند.
- User Detail فهرست آگهی‌ها، عنوان، توضیح کوتاه و وضعیت را نشان می‌دهد.
- منطق ثبت، ویرایش، حذف، moderation و دیتابیس خارج از این scope باقی ماند.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run test -w @four-d/api`: PASS — ۵۶ تست
- `npm run build -w @four-d/web`: PASS

## موارد باز

جزئیات کامل هر آگهی در پنل، کنترل‌های moderation از User Detail، تفکیک کامل auth/verification و E2E نقش admin برای فازهای بعد باقی هستند.
