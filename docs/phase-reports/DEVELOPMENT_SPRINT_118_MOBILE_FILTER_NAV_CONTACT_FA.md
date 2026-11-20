# Development Sprint 118 — Mobile Filter, Navigation and Secure Contact Fix

## اصلاحات

- فیلتر بازار موبایل به‌صورت پیش‌فرض جمع‌شده شد و فقط خلاصه‌ی وضعیت را نشان می‌دهد.
- ارتفاع و جایگاه آیکن‌های Bottom Navigation یکسان شد؛ FAB ثبت آگهی دیگر با margin منفی از ردیف خارج نمی‌شود.
- مسیر تماس امن در صورت نبودن شناسه‌ی گفتگو در پاسخ اولیه، گفت‌وگوی متناظر را از endpoint گفتگوها بازیابی می‌کند.

## اعتبارسنجی

- Mobile typecheck: موفق
- APK release build: موفق
- نصب روی Pixel Emulator: موفق
- نسخه: `0.1.9`، build `13`
- لاگ runtime پس از اجرا: بدون crash، `Invariant Violation` یا خطای fatal

## خروجی

- `release/mobile/4d-bazar-mobile-v0.1.9-build13-local.apk`
- SHA-256: `95AD4FDDCCA620D75A57F02A256134711AE98030F5618F23D357EFDF644DD24C`
