# معرفی فنی اپلیکیشن 4D

## خلاصه

4D یک اپلیکیشن marketplace محلی برای منطقه گرمه، جاجرم، ایور و درق است. نسخه فعلی به شکل MVP/Beta ساخته شده و شامل بازار آگهی، ثبت آگهی، احراز هویت با پیامک و رمز، پروفایل کاربر، moderation ادمین، تماس امن و چت داخل برنامه است.

## زبان و پلتفرم

زبان اصلی پروژه TypeScript است. پروژه روی Node.js اجرا می‌شود و ساختار آن monorepo است؛ یعنی API، Web و packageهای مشترک داخل یک workspace نگهداری می‌شوند.

ساختار اصلی:

- `apps/api`: بک‌اند و API
- `apps/web`: رابط کاربری وب و پنل ادمین
- `packages/shared`: تایپ‌ها و قراردادهای مشترک
- `db/migrations`: migrationهای دیتابیس
- `db/seeds`: داده اولیه منطقه، شهرها، دسته‌ها و داده demo

## Frontend

رابط کاربری با React 19 و Vite ساخته شده است. UI فعلی یک web app است که هم بازار عمومی، هم حساب کاربر و هم بخش ادمین را در یک تجربه وب ارائه می‌کند.

قابلیت‌های اصلی frontend:

- نمایش بازار و آگهی‌ها
- جستجو و فیلتر شهر/دسته
- ثبت آگهی با عکس
- فشرده‌سازی تصویر در مرورگر قبل از ارسال
- ورود با رمز یا ثبت‌نام/فراموشی رمز با SMS
- کپچای تصویری/پازلی draggable
- پروفایل کاربر و تکمیل اطلاعات ضروری
- پنل ادمین برای moderation
- چت داخل برنامه برای گفتگو روی آگهی

کتابخانه‌های مهم frontend:

- `react`
- `react-dom`
- `vite`
- `lucide-react`
- `playwright` برای Visual QA

## Backend

بک‌اند با Fastify روی Node.js ساخته شده است. API با TypeScript نوشته شده و از ساختار modular monolith پیروی می‌کند؛ یعنی سیستم هنوز microservice نشده و ماژول‌های محصول داخل یک backend واحد نگهداری می‌شوند.

قابلیت‌های اصلی backend:

- API سلامت سرویس
- مدیریت region/city/category
- ثبت و نمایش آگهی
- فید عمومی فقط برای آگهی‌های تاییدشده
- ثبت آگهی‌های pending برای review ادمین
- احراز هویت با OTP پیامکی
- ورود با رمز عبور
- session token با Bearer Authorization
- پروفایل کاربر و احراز هویت سبک
- moderation queue و تصمیم approve/reject
- گزارش آگهی
- شروع تماس امن
- مکالمه و پیام داخل برنامه
- audit log پایه

کتابخانه‌های مهم backend:

- `fastify`
- `@fastify/cors`
- `kysely`
- `pg`
- `zod`
- `dotenv`
- `tsx`

## دیتابیس

دیتابیس پروژه PostgreSQL است. اتصال دیتابیس از طریق `pg` و query builder با Kysely انجام می‌شود. migrationها داخل `db/migrations` هستند و seed اولیه داخل `db/seeds`.

جدول‌های مهم:

- `users`
- `user_profiles`
- `sessions`
- `user_roles`
- `otp_challenges`
- `market_contents`
- `listings`
- `contact_events`
- `conversations`
- `conversation_messages`
- `conversation_reads`
- `conversation_preferences`
- `conversation_blocks`
- `push_subscriptions`
- `reports`
- `moderation_cases`
- `moderation_decisions`
- `audit_logs`

## Auth و SMS

ورود اولیه یا فراموشی رمز با OTP پیامکی انجام می‌شود. provider پیامک فعلی Kavenegar است و تنظیمات آن از `.env` خوانده می‌شود. بعد از اینکه کاربر وارد شد و پروفایلش را کامل کرد، می‌تواند رمز عبور تنظیم کند و دفعات بعد با رمز وارد شود.

برای امنیت MVP:

- OTP در دیتابیس hash و ذخیره می‌شود.
- OTP مصرف‌شده دوباره قابل استفاده نیست.
- برای درخواست OTP محدودیت تعداد وجود دارد.
- رمز عبور با scrypt hash ذخیره می‌شود.
- تلاش‌های ناموفق ورود با رمز با bucket کوتاه‌عمر محدود می‌شوند.
- مسیرهای protected با Bearer token محافظت می‌شوند.
- ادمین فقط با role واقعی `moderator` دیده و استفاده می‌شود.

## چت داخل برنامه

برای جلوگیری از نمایش عمومی شماره، شروع تماس روی آگهی persisted یک conversation می‌سازد. پیام‌ها در جدول `conversation_messages` ذخیره می‌شوند و کاربر از داخل برنامه گفتگو می‌کند.

نسخه فعلی چت MVP است، اما inbox گفتگوها unread count، preview آخرین پیام، زمان آخرین پیام و read state per-user دارد. در وب، گفتگوها هنگام باز شدن read می‌شوند و نشست فعال با polling سبک هر ۳۰ ثانیه تازه‌سازی می‌شود. هر پیام داخل چت قابل گزارش است و API فقط وقتی report پیام را می‌پذیرد که گزارش‌دهنده participant همان گفتگو باشد. کاربر می‌تواند هر گفتگو را mute/unmute یا block/unblock کند؛ گفتگوهای mute شده badge پیام جدید نمی‌سازند و گفتگوهای blocked امکان ارسال پیام جدید ندارند. وب اکنون notification tray داخل برنامه، اعلان اختیاری مرورگر برای پیام‌های جدید unmuted/unblocked، ثبت Push subscription، ارسال best-effort Web Push برای پیام جدید و تست Push از پروفایل دارد. برای Push واقعی باید `VITE_VAPID_PUBLIC_KEY` در وب و `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` در API تنظیم شوند. read receipt نمایشی، block سراسری کاربر، job queue مستقل برای push و realtime کامل هنوز برای فازهای بعدی باقی مانده‌اند.

## اجرای محلی

دستورات اصلی:

```powershell
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

اعتبارسنجی:

```powershell
npm run check
npm run build
npm test
npm run qa:visual
```

تست کامل محلی:

```powershell
npm run ci:local
```

## وضعیت معماری

معماری فعلی برای MVP مناسب است:

- Monorepo
- Modular Monolith
- PostgreSQL
- React Web App
- Fastify API
- Role-based admin boundary
- SMS OTP با Kavenegar
- Server-side captcha proof baseline برای request OTP
- Local media storage baseline برای عکس آگهی با URL عمومی `/media/...`
- Push subscription storage baseline با service worker
- Best-effort Web Push delivery برای پیام‌های چت

برای نسخه production، موارد زیر هنوز باید کامل‌تر شوند:

- مهاجرت local media storage عکس‌ها به object storage managed
- provider ضد bot production-grade و observability مسیر OTP
- انتقال Push delivery به job queue جدا و realtime/polling منظم‌تر برای چت
- secret manager و deploy target
- baseline visual snapshot در CI
- policy کامل‌تر برای user safety، retention و account recovery
