# گزارش تکمیل Development Sprint 77

تاریخ: 2026-08-13

## خروجی

- خواندن participant دیگر گفتگو در repository
- محاسبه `read_by_recipient` با `conversation_reads.last_read_at`
- حفظ mark-read کاربر هنگام بازکردن thread
- نمایش وضعیت فارسی «ارسال شد» و «خوانده شد» برای پیام‌های خود کاربر
- سازگاری با polling پانزده‌ثانیه‌ای و کنترل‌های mute/block/report

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- تست API با ۴۰ تست موفق
- `npm run typecheck -w @four-d/mobile` موفق
- `npx expo export --platform android` موفق

## گام بعد

پیوست تصویر در چت، سپس بهبود اعلان‌های push و deep link به گفتگو.
