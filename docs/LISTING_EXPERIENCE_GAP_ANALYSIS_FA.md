# Gap Analysis تجربه آگهی و تعاملات 4D

## دامنه

این سند، متن پیوست کاربر را به وضعیت فعلی repository نگاشت می‌کند. این سند جایگزین implementation نیست و هر مورد باید در tracker به slice قابل‌آزمون تبدیل شود.

## وضعیت Requirements

| حوزه | وضعیت فعلی | شکاف/تصمیم اجرایی |
|---|---|---|
| بازشدن جزئیات از کل کارت | Partially implemented | در Web کارت، تصویر/عنوان/بدنه با Enter/Space و click به detail drawer می‌رود؛ کنترل‌های مستقل از propagation محافظت شدند. Mobile باید جداگانه QA و تکمیل شود. |
| Listing Detail | Partially implemented | عنوان، قیمت، شهر، دسته، وضعیت، توضیح و seller context موجود است؛ view count، کد آگهی و اکشن sticky هنوز نیاز به slice مستقل دارد. |
| تماس و چت | Partially implemented | چت داخل برنامه و contact intent موجود است؛ CTA کاربر به «تماس» تغییر کرد، event/notification end-to-end هنوز نیازمند smoke واقعی است. |
| Favorite | Implemented with tests | API idempotent و state refresh شده است؛ E2E چندکلاینت باقی است. |
| View Count | Partially implemented | analytics event موجود است؛ نمایش شمارنده و unique-ish window باید طراحی و تست شود. |
| Push موبایل | Partially implemented | token endpoint و زیرساخت fallback موجود است؛ FCM credential و تست foreground/background/device هنوز باز است. |
| فرم و شهر | Partially implemented | شهر و دسته search + select دارند؛ Searchable Select واحد و schema دسته‌ای هنوز backlog است. |
| فرم dynamic category | Missing | ابتدا metadata/schema و validation مشترک API طراحی شود؛ سپس املاک/خودرو/موبایل. |
| مدیریت آگهی | Partially implemented | Owner edit/delete و moderation موجود است؛ archive و وضعیت‌های کامل UI باید تکمیل شود. |
| گزارش | Partially implemented | API و UI موجود است؛ copy کاربر باید از اصطلاحات داخلی moderation پاک‌سازی شود. |
| پروفایل و حریم خصوصی | Partially implemented | بخش کنترل analytics ضروری است؛ حذف کامل privacy navigation بدون حذف کنترل امنیتی باید با audit جدا انجام شود. |
| Search/filter | Partially implemented | فیلترهای پایه موجودند؛ فیلتر category-specific باید از metadata مشترک تغذیه شود. |

## اولویت sliceها

1. Detail/card/contact و regression Web/Mobile.
2. Listing management، view count و reporting copy.
3. Category schema و فرم/فیلتر dynamic.
4. Chat notification با credential واقعی و device E2E.
5. benchmark و polish نهایی، بدون clone کردن UI رقبا.

## موارد خارج از این slice

Dynamic attributes، migrationهای جدید، FCM واقعی و E2E دستگاهی عمداً در این تغییر پیاده‌سازی نشده‌اند؛ چون بدون قرارداد داده و credential/محیط تست معتبر، نتیجه قابل اتکا نخواهد بود.
