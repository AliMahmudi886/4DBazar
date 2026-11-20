# Unknowns و Assumptions پروژه 4D

## Assumptions اولیه

| ID | فرض | دلیل | نیاز به اعتبارسنجی |
|---|---|---|---|
| A-001 | تمرکز اولیه روی گرمه، جاجرم، ایور و درق کافی است | تعریف محصول 4D بر همین cluster است | Phase 2 |
| A-002 | 300 تا 500 آگهی واقعی قبل از تبلیغ جدی عدد شروع معقولی است | درخواست اولیه به‌عنوان فرض مطرح کرده است | Phase 2 و Phase 3 |
| A-003 | buyer نباید برای مشاهده، جستجوی پایه و چت پایه paywall شود | marketplace liquidity به دسترسی buyer وابسته است | Phase 3 و PRD |
| A-004 | relational database گزینه پیش‌فرض معقول است | داده‌ها رابطه‌ای، قابل گزارش‌گیری و transactionمحور هستند | Phase 7 |
| A-005 | Modular Monolith برای MVP محتمل‌ترین گزینه است | کاهش پیچیدگی عملیاتی و سرعت توسعه | Phase 8 |

## Unknowns

| ID | سؤال باز | اثر روی پروژه | زمان پاسخ |
|---|---|---|---|
| U-001 | جمعیت دقیق و رفتار رفت‌وآمد بین چهار منطقه چیست؟ | geography strategy و cold start | Phase 2 |
| U-002 | دسته‌های پرتکرار واقعی در بازار محلی چیست؟ | category strategy و MVP scope | Phase 2 |
| U-003 | کانال‌های جذب اولیه کاربران کدامند؟ | growth و cold start | Phase 2 و 3 |
| U-004 | اعتماد محلی بیشتر بر موبایل تاییدشده، آشنایی محلی، کسب‌وکار رسمی یا moderation متکی است؟ | trust strategy | Phase 1 و 9 |
| U-005 | آیا کسب‌وکارهای محلی حاضر به پرداخت subscription هستند؟ | monetization | Phase 3 |
| U-006 | حداقل تجربه chat برای MVP چیست؟ | UX، API و moderation | Phase 4 تا 7 |
| U-007 | نیاز owner به web-first، mobile-first یا همزمان چیست؟ | technology و delivery plan | Phase 3 تا 5 |
| U-008 | تعریف دقیق Qualified Local Connection چیست؟ | North Star و analytics | Phase 3 و 4 |
| U-009 | چه UX fallbackی برای درخواست‌های بی‌پاسخ لازم است؟ | retention و trust | Phase 4 و 5 |
| U-010 | در گروه‌ها و صفحات محلی 4D واقعاً کدام categoryها پرتکرارتر هستند؟ | MVP Scope و cold start | قبل از launch |
| U-011 | هر شهر حداقل چه سهمی از 300 تا 500 آگهی اولیه باید داشته باشد؟ | supply plan | Phase 3 و قبل از pilot |
| U-012 | در MVP chat داخلی کامل لازم است یا contact flow سبک کافی است؟ | UX، API، moderation | Phase 5 و 7 |
| U-013 | expiry پیش‌فرض Wanted و Service Request چند روز باشد؟ | UX و retention | Phase 5 |
| U-014 | moderation پیش از انتشار باشد یا پس از انتشار همراه با review؟ | UX، operations، security | Phase 7 و 9 |
| U-015 | آیا wireframe تصویری قبل از Domain Model لازم است یا پس از architecture انجام شود؟ | UX و delivery | قبل از UI implementation |
| U-016 | چهار content type در database table جدا باشند یا یک table مشترک با subtype؟ | Database design و query complexity | پاسخ داده شد در Phase 7: table مشترک + subtype |
| U-017 | MVP به Message کامل نیاز دارد یا ContactEvent سبک کافی است؟ | API، moderation، UX | پاسخ داده شد در Phase 7: هر دو طراحی می‌شوند؛ UI می‌تواند سبک شروع کند |
| U-018 | CategoryAttributeValue با JSON، EAV کنترل‌شده یا table جدا مدل شود؟ | Database design | پاسخ داده شد در Phase 7: مدل hybrid |
| U-019 | backend framework و runtime deployment چه باشد؟ | Architecture و توسعه | Phase 8 |
| U-020 | media storage provider چه باشد؟ | Architecture و هزینه | Phase 8 |
| U-021 | provider پیامک OTP چه باشد؟ | Security، هزینه، قابلیت اطمینان | Phase 10 یا قبل از implementation |
| U-022 | آیا pre-publication moderation در pilot قابل تحمل است؟ | Trust و operations | Phase 9 و beta |
