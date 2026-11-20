# گزارش تکمیل Development Sprint 78

تاریخ: 2026-08-13

## خروجی

- دکمه انتخاب تصویر در thread موبایل
- درخواست permission گالری
- فشرده‌سازی اولیه با quality `0.75`
- upload از مسیر `/api/v1/media/listing-images`
- ارسال URL تصویر به endpoint پیام
- نمایش پیام تصویری با اندازه ثابت و قابل اسکن
- حفظ polling، read receipt و safety controls فازهای قبلی

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- `npm run typecheck -w @four-d/mobile` موفق
- `npx expo export --platform android` موفق

## محدودیت

برای MVP، تصویر چت با همان media contract فعلی ارسال می‌شود و attachment domain جداگانه ندارد. در hardening release باید محدودیت اندازه، thumbnail و cleanup اختصاصی پیام تصویری اضافه شود.

## گام بعد

deep link به گفتگو از push، push polish و media hardening اختصاصی چت.
