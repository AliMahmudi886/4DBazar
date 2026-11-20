# Domain Model پروژه 4D

## وضعیت سند

- Phase: Phase 6 - Domain Model
- وضعیت: نسخه اول تکمیل شد
- تاریخ: 2026-08-11
- ورودی‌ها: PRD MVP و UX Design

## 1. اصول مدل دامنه

- 4D در MVP یک marketplace محلی با چهار interaction اصلی است.
- `Listing`، `WantedListing`، `ServiceListing` و `ServiceRequest` entityهای جدا هستند، اما lifecycle مشترک دارند.
- برای اشتراک lifecycle، moderation، report و analytics از مفهوم دامنه‌ای `MarketContent` استفاده می‌شود؛ این الزاماً table فیزیکی نیست و در Phase 7 تصمیم‌گیری می‌شود.
- `TrustScore` ترکیبی در MVP نداریم؛ signalها جداگانه مدل می‌شوند.
- `City` در MVP ساده است و فقط چهار شهر 4D را پوشش می‌دهد.
- payment، logistics، auction، subscription paid و business profile کامل خارج از MVP هستند.

## 2. Domain Boundaries

| Boundary | مسئولیت | وابستگی مجاز |
|---|---|---|
| Identity | ورود، تایید موبایل، session، role | مستقل؛ Users را reference می‌کند |
| Users | profile، user signals، وضعیت حساب | Identity، Geography |
| Geography | City و 4D Region | مستقل |
| Categories | دسته‌ها و attributeهای پویا | مستقل |
| MarketContent | Listing، Wanted، Service Listing، Service Request | Users، Geography، Categories، Media |
| Search | indexing و query روی محتوای approved | MarketContent، Geography، Categories |
| Favorites | ذخیره محتوای کاربر | Users، MarketContent |
| Contact | Conversation/ContactEvent و Message | Users، MarketContent |
| Moderation | Review Queue، Case، Decision، Report | MarketContent، Users، Audit |
| Trust | signalهای اعتماد و risk جداگانه | Users، MarketContent، Moderation |
| Analytics | eventهای محصول | همه boundaryها فقط event ارسال می‌کنند |
| Administration | roleهای admin/moderator و ابزار عملیاتی | Users، Moderation، Audit |
| Audit | ثبت عملیات حساس | مستقل؛ entity references را نگه می‌دارد |

## 3. Entity List

### Identity و Users

| Entity | شرح | MVP |
|---|---|---|
| User | موجودیت اصلی کاربر | Yes |
| UserProfile | نام نمایشی، شهر اصلی، تنظیمات پایه | Yes |
| MobileVerification | وضعیت و زمان تایید موبایل | Yes |
| Session | نشست کاربر | Yes |
| RoleAssignment | نقش user/admin/moderator | Yes |
| UserTrustSignal | signalهای جدا مثل mobile verified، account age، response rate | Yes |

### Geography و Categories

| Entity | شرح | MVP |
|---|---|---|
| Region | 4D Region | Yes |
| City | گرمه، جاجرم، ایور، درق | Yes |
| Category | دسته اصلی | Yes |
| CategoryAttributeDefinition | attributeهای پویا برای آینده | Design Now |
| CategoryAttributeValue | مقدار attribute برای محتوا | Design Now |

### Market Content

| Entity | شرح | MVP |
|---|---|---|
| MarketContent | مفهوم مشترک lifecycle و moderation | Conceptual |
| Listing | آگهی فروش کالا | Yes |
| WantedListing | درخواست خرید | Yes |
| ServiceListing | معرفی خدمت | Yes |
| ServiceRequest | درخواست خدمت | Yes |
| MediaAsset | عکس‌های محتوا | Yes |
| ContentStatusHistory | تاریخچه وضعیت content | Yes |

### Interaction

| Entity | شرح | MVP |
|---|---|---|
| Favorite | ذخیره content توسط user | Yes |
| Conversation | ارتباط contextدار بین کاربران | Yes |
| Message | پیام در conversation | Optional MVP |
| ContactEvent | شروع ارتباط یا تماس سبک | Yes |
| Block | مسدودسازی ارتباط | Design Now |

### Moderation، Trust، Analytics

| Entity | شرح | MVP |
|---|---|---|
| Report | گزارش کاربر | Yes |
| ModerationCase | پرونده بررسی محتوا/کاربر | Yes |
| ModerationDecision | تصمیم moderator | Yes |
| AuditLog | ثبت عملیات حساس | Yes |
| ListingRiskSignal | signalهای risk برای content | Design Now |
| AnalyticsEvent | eventهای محصول | Yes |

### Future Entities

| Entity | دلیل عدم ورود به MVP |
|---|---|
| BusinessProfile | P1؛ نیازمند validation و verification |
| SubscriptionPlan | P2؛ monetization بعد از liquidity |
| Payment | P3؛ پیچیدگی مالی |
| Shipment | P3؛ logistics خارج از MVP |
| BoostCampaign | P2؛ بعد از supply رقابتی |
| SavedSearch | P1؛ بعد از مشاهده رفتار search |

## 4. Aggregates

### User Aggregate

Root: `User`

شامل:

- UserProfile
- MobileVerification reference/status
- RoleAssignment
- UserTrustSignal summary

قواعد:

- کاربر بدون mobile verification نمی‌تواند content ایجاد کند.
- تغییر role فقط توسط admin و با audit log انجام می‌شود.

### Category Aggregate

Root: `Category`

شامل:

- CategoryAttributeDefinition

قواعد:

- attribute definition با تغییر category schema فیزیکی یکی نیست.
- category غیرفعال برای content جدید قابل انتخاب نیست.

### Content Aggregates

Rootها:

- Listing
- WantedListing
- ServiceListing
- ServiceRequest

هر root شامل:

- owner user reference
- city reference
- category reference
- media references
- status
- status history
- attribute values

قواعد مشترک:

- content جدید با status `submitted` ایجاد می‌شود.
- فقط owner یا moderator/admin می‌تواند content را ویرایش کند.
- content عمومی فقط با status `approved` نمایش داده می‌شود.
- content `rejected` یا `suspended` عمومی نیست.
- reportها content را مستقیم حذف نمی‌کنند؛ moderation تصمیم می‌گیرد.

### Conversation Aggregate

Root: `Conversation`

شامل:

- participants
- context entity reference
- messages یا contact events
- block/report references

قواعد:

- conversation باید به یک content context وصل باشد.
- شروع conversation برای content غیر approved مجاز نیست، مگر owner/moderator context داخلی داشته باشند.
- هر شروع contact باید analytics event تولید کند.

### Moderation Aggregate

Root: `ModerationCase`

شامل:

- target reference
- reports
- automatic check results
- decisions
- assigned moderator
- status

قواعد:

- هر decision باید actor، reason، timestamp و audit log داشته باشد.
- decisionهای مجاز: approve، reject، edit_required، warning، suspend، ban، escalate.
- ban برای MVP فقط به‌عنوان قابلیت admin طراحی می‌شود و نیازمند policy در Phase 9 است.

## 5. Relationships

```text
User 1 ── 1 UserProfile
User 1 ── * Session
User 1 ── * RoleAssignment
User 1 ── * Listing
User 1 ── * WantedListing
User 1 ── * ServiceListing
User 1 ── * ServiceRequest
User 1 ── * Favorite
User * ── * Conversation

Region 1 ── * City
City 1 ── * UserProfile
City 1 ── * MarketContent

Category 1 ── * Listing
Category 1 ── * WantedListing
Category 1 ── * ServiceListing
Category 1 ── * ServiceRequest
Category 1 ── * CategoryAttributeDefinition

MarketContent 1 ── * MediaAsset
MarketContent 1 ── * Report
MarketContent 1 ── * ModerationCase
MarketContent 1 ── * AnalyticsEvent
MarketContent 1 ── * Conversation

ModerationCase 1 ── * ModerationDecision
ModerationDecision 1 ── 1 AuditLog
```

## 6. Status Models

### Content Status

| Status | معنی |
|---|---|
| draft | پیش‌نویس قبل از ارسال، optional |
| submitted | ارسال‌شده برای بررسی |
| approved | منتشرشده |
| edit_required | نیازمند اصلاح |
| rejected | ردشده |
| suspended | موقتاً خارج از نمایش |
| expired | منقضی‌شده |
| deleted_by_owner | حذف‌شده توسط owner |

### Moderation Case Status

| Status | معنی |
|---|---|
| open | نیازمند بررسی |
| assigned | به moderator اختصاص داده شده |
| resolved | تصمیم گرفته شده |
| escalated | ارجاع به سطح بالاتر |
| reopened | بازگشایی شده |

### Conversation Status

| Status | معنی |
|---|---|
| active | قابل استفاده |
| blocked | یکی از طرفین یا سیستم مسدود کرده |
| archived | پنهان/آرشیو برای کاربر |
| closed | بسته‌شده به دلیل حذف/تعلیق content یا policy |

## 7. Business Rules

### ثبت محتوا

- فقط user با mobile verified می‌تواند content ثبت کند.
- city برای هر content اجباری و یکی از چهار شهر MVP است.
- category برای هر content اجباری است.
- title و description حداقل طول معتبر دارند.
- قیمت برای Listing می‌تواند عدد یا توافقی باشد.
- budget برای Wanted optional است.
- Service Listing می‌تواند چند شهر قابل پوشش داشته باشد، اما یک شهر پایه لازم دارد.

### انتشار و moderation

- content جدید پیش از نمایش عمومی باید approved شود.
- automatic checks می‌توانند content را flag کنند، اما تصمیم نهایی در MVP توسط moderation است.
- reject و edit_required باید reason داشته باشند.
- هر تغییر status باید در ContentStatusHistory ثبت شود.
- هر decision حساس باید AuditLog داشته باشد.

### Search و نمایش عمومی

- search فقط contentهای approved و غیر expired/deleted را برای عموم برمی‌گرداند.
- فیلتر city می‌تواند یک شهر یا کل 4D باشد.
- sort پیش‌فرض جدیدترین است.
- content suspended یا rejected حتی اگر favorite شده باشد، عمومی باز نمی‌شود.

### Contact/Chat

- contact فقط برای content approved مجاز است.
- user نمی‌تواند با content خودش conversation buyer/seller عادی شروع کند.
- conversation باید context entity داشته باشد.
- شروع contact/chat باید `contact_started` یا `chat_started` event بسازد.
- شماره موبایل عمومی نمایش داده نمی‌شود مگر تصمیم API/UX بعدی تغییر کند.

### Favorites

- user فقط content approved را favorite می‌کند.
- favorite duplicate برای یک user و content مجاز نیست.
- حذف content باعث حذف سخت favorite نمی‌شود؛ اما در UX نباید محتوای غیرقابل نمایش باز شود.

### Report

- report reason اجباری است.
- هر user می‌تواند یک target را چندبار با فاصله/دلیل متفاوت گزارش کند، اما برای جلوگیری از abuse rate limit لازم است.
- report باید target type و target id داشته باشد.
- report به‌تنهایی content را حذف نمی‌کند.

### Expiry

- WantedListing expiry پیش‌فرض: 30 روز.
- ServiceRequest expiry پیش‌فرض: 14 روز.
- content expired در search عمومی نمایش داده نمی‌شود.
- owner می‌تواند قبل از expiry درخواست را تمدید کند، subject to moderation یا rule آینده.

## 8. Domain Events

| Event | Producer | Consumerهای محتمل |
|---|---|---|
| UserSignedUp | Identity | Analytics، Trust |
| MobileVerified | Identity | Users، Trust، Analytics |
| ContentSubmitted | MarketContent | Moderation، Analytics |
| ContentApproved | Moderation | Search، Analytics، Notification آینده |
| ContentRejected | Moderation | Analytics، Notification آینده |
| ContentEditRequired | Moderation | Notification آینده |
| ContentExpired | MarketContent | Search، Analytics |
| SearchPerformed | Search | Analytics |
| ContentViewed | MarketContent/Search | Analytics |
| FavoriteAdded | Favorites | Analytics |
| ContactStarted | Contact | Analytics، Trust |
| MessageSent | Contact | Analytics، Moderation آینده |
| ReportCreated | Moderation | Moderation، Trust، Analytics |
| ModerationDecisionMade | Moderation | Audit، Analytics، Trust |
| UserBlocked | Contact/Trust | Trust، Moderation |

## 9. Validation Notes برای Phase 7

Phase 7 نباید فوراً این مدل را به schema فیزیکی یک‌به‌یک تبدیل کند. تصمیم‌های مهم دیتابیس:

- آیا چهار content type table جدا داشته باشند یا table مشترک با subtype؟
- `MarketContent` در database physical entity باشد یا interface/application model؟
- Message کامل در MVP لازم است یا ContactEvent سبک کافی است؟
- CategoryAttributeValue با JSON، EAV کنترل‌شده یا table جدا مدل شود؟
- Search در شروع با database query کافی است یا index جدا لازم است؟

## 10. Exit Criteria Phase 6

| معیار | وضعیت |
|---|---|
| Entity List مشخص شده است | Done |
| Aggregates تعریف شده‌اند | Done |
| Relationships تعریف شده‌اند | Done |
| Domain Boundaries مشخص شده‌اند | Done |
| Business Rules نوشته شده‌اند | Done |
| Domain Events مشخص شده‌اند | Done |
