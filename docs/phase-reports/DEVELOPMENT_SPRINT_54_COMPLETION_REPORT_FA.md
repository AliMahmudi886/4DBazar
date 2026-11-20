# گزارش تکمیل Development Sprint 54

تاریخ: 2026-08-12

## هدف

اتصال قابلیت AI بررسی آگهی به provider واقعی AvalAI بدون انتقال secret به frontend و بدون وابستگی سخت ثبت آگهی به دسترس‌پذیری provider.

## خروجی

- provider جدید `avalai` در config اضافه شد.
- endpoint `POST /api/v1/ai/listing-review` به `https://api.avalai.ir/v1/responses` متصل شد.
- مدل پیش‌فرض `gpt-5.6-luna` است.
- کلید از `AVALAI_API_KEY` یا alias عمومی `AI_API_KEY` در backend خوانده می‌شود.
- پاسخ‌های Responses API و قالب‌های سازگار رایج استخراج و normalize می‌شوند.
- پاسخ JSON دارای code fence یا فیلدهای ناقص، با fallback معتبر تکمیل می‌شود.
- در نبود کلید، خطای شبکه یا پاسخ نامعتبر، موتور rule-based محلی پاسخ می‌دهد.
- AI فقط پیشنهاد می‌دهد و انتشار، حذف یا تصمیم moderation انجام نمی‌دهد.

## تنظیم محیط واقعی

در `D:\Projects\4D\.env` مقدار واقعی قرار گیرد و هرگز در `.env.example`، frontend یا log نوشته نشود:

```env
AI_PROVIDER=avalai
AI_API_URL=https://api.avalai.ir/v1
AI_MODEL=gpt-5.6-luna
AVALAI_API_KEY=کلید-واقعی-اینجا
```

بعد از تغییر env، API باید restart شود.

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- `npm run release:check` موفق
- تست‌های AI محلی و normalize پاسخ موفق
- `npm test`: 33 تست API و 1 تست shared موفق؛ 2 تست قدیمی rate-limit به دلیل خاموش بودن PostgreSQL محلی fail شدند.

## موارد باقی‌مانده

- اجرای smoke واقعی AvalAI با کلید کاربر
- پایش quota، latency و هزینه در pilot
- اضافه‌کردن timeout و telemetry provider در sprint عملیات AI
