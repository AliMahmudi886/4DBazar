# گزارش تکمیل Development Sprint 35

## عنوان

Conversation Block Controls

## تاریخ

2026-08-12

## وضعیت

Done

## خروجی‌ها

- migration جدید `0011_conversation_blocks.sql` برای block در سطح گفتگو اضافه شد.
- endpoint `PUT /api/v1/conversations/:conversationId/block` برای block/unblock گفتگو اضافه شد.
- API ارسال پیام در گفتگوی blocked را با خطای `conversation_blocked` رد می‌کند.
- contract مشترک خطاها با `conversation_blocked` به‌روز شد.
- inbox گفتگوها وضعیت blocked را دریافت می‌کند و برچسب «مسدود» نشان می‌دهد.
- drawer چت کنترل block/unblock دارد.
- هنگام blocked بودن گفتگو، input و دکمه ارسال پیام غیرفعال می‌شوند.
- تست validation برای مقدار block نامعتبر اضافه شد.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm run db:migrate`
- `npm test`
- `npm run qa:visual`

همه موارد بالا با موفقیت اجرا شدند. Visual QA از Chrome نصب‌شده روی سیستم استفاده کرد.

## بدهی باقی‌مانده

- block سراسری کاربر در همه گفتگوها
- policy appeal و review برای blockهای حساس
- notification/push واقعی
- read receipt نمایشی کامل
- realtime کامل یا WebSocket
