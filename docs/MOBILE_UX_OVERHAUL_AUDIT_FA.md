# ممیزی UX بازطراحی موبایل 4D

## Audit محدود قبل از پیاده‌سازی

| بخش | Functional | Navigation | Scrolling | Layout / Visual | RTL / Accessibility | State / Responsive |
|---|---|---|---|---|---|---|
| Market | feed و refresh با `FlatList` وجود دارد؛ فیلترها پراکنده‌اند | Bottom navigation بیرون از محتوای بازار است | feed باید مالک اسکرول واحد باشد؛ فیلترهای قبل از `FlatList` درخت اسکرول را پیچیده می‌کنند | هیرو و فیلترها قبل از آگهی‌ها ارتفاع زیادی می‌گیرند | بعضی انتخاب‌ها افقی و clipping‌پذیرند | empty/loading/error باید در همان لیست کنترل شوند |
| Create Listing | فرم ثبت و publish کار می‌کند | در create، bottom navigation باید مخفی بماند و خروج محافظت شود | فرم بلند است و باید یک `ScrollView` مالک داشته باشد | انتخاب شهر/دسته به chipهای زیاد تبدیل شده | pickerها باید touch target و selected state واضح داشته باشند | draft/dirty state فعلاً وجود ندارد |
| Profile | تب‌های آگهی/غرفه/ذخیره وجود دارد | تب‌ها و bottom navigation با هم رقابت می‌کنند | صفحه فرم بلند است | dashboard و edit form در یک صفحه ادغام شده‌اند | وضعیت حساب به دو کارت بزرگ تقسیم شده | نقش admin در UI موبایل entry مشخصی ندارد |
| Admin | صفحه اختصاصی موبایل در مسیرهای فعلی شناسایی نشد | role-based entry لازم است | — | dashboard موبایل تعریف نشده | actionهای حساس نیازمند confirmation هستند | دسترسی باید بر اساس role کنترل شود |

## Root causeهای اصلی

1. `MarketScreen` چند بخش فیلتر را قبل از `FlatList` رندر می‌کند؛ بنابراین اسکرول feed و header یک مالک واحد ندارند.
2. انتخاب شهر، فیلتر و ویژگی‌ها با ردیف‌های chip افقی پیاده شده‌اند و برای گزینه‌های زیاد موبایل مناسب نیستند.
3. فرم ثبت آگهی یک صفحه بلند است؛ bottom navigation عمومی باید در تمام مدت flow مخفی باشد و CTA اختصاصی flow داشته باشد.
4. پروفایل هنوز هم‌زمان dashboard و فرم ویرایش است و entry مستقل Admin ندارد.

## اولویت اجرا

- P0: اسکرول واحد Market و جلوگیری از clipping/overlay.
- P1: selector قابل استفاده برای شهر، دسته و enumهای پرتعداد.
- P1: حذف bottom nav از Create و اضافه‌کردن header/CTA مخصوص flow.
- P2: تبدیل Profile به dashboard و اضافه‌کردن Admin mobile بر اساس role.
