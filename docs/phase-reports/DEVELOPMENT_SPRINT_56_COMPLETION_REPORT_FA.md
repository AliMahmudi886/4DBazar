# گزارش تکمیل Development Sprint 56

## کیفیت تصویر و ویژگی‌های هوشمند آگهی

- metadata عکس شامل عرض، ارتفاع، حجم و MIME type از frontend استخراج می‌شود.
- metadata همراه متن آگهی به endpoint AI ارسال می‌شود؛ خود عکس به provider خارجی ارسال نمی‌شود.
- fallback محلی برای کیفیت عکس، کادر عمودی، ابعاد کم و حجم بالا فعال شد.
- AI اکنون علاوه بر عنوان و توضیحات، ویژگی‌های پیشنهادی کالا و راهنمای تصویر برمی‌گرداند.
- ویژگی‌ها و توصیه‌های تصویر در Copilot فرم ثبت آگهی نمایش داده می‌شوند.
- اطلاعات پیشنهادی همچنان فقط advisory است و بدون تأیید کاربر انتشار یا moderation انجام نمی‌شود.

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- تست API: 39 تست موفق

## فاز موبایل

Native mobile هنوز شروع نشده است. پس از تثبیت search/analytics، production media و pilot، scaffold `apps/mobile` با React Native + Expo شروع می‌شود.
