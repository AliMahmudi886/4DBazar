# پشتیبان رایگان تصاویر آگهی

تا زمان تهیه Object Storage، تصاویر در `data/media` ذخیره می‌شوند. این روش رایگان است، اما باید از این پوشه backup گرفته شود.

## اجرای محلی

از ریشه پروژه:

```powershell
npm run media:backup
npm run media:verify
```

خروجی در `backups/media/<timestamp>` ساخته می‌شود و `MANIFEST.json` شامل تعداد فایل، حجم و SHA-256 است.

## اجرای روی cPanel

در `/home/a4dbazarir/4d-api`:

```bash
npm run media:backup
npm run media:verify
```

برای نگهداری backup خارج از پوشه برنامه:

```bash
MEDIA_BACKUP_ROOT=/home/a4dbazarir/media-backups npm run media:backup
MEDIA_BACKUP_ROOT=/home/a4dbazarir/media-backups npm run media:verify
```

این ابزار فایل‌های `data/media` را حذف یا جابه‌جا نمی‌کند. هنگام deploy این پوشه را پاک نکن.

برای restore کنترل‌شده با تطبیق checksum:

```bash
# اول آخرین پوشه واقعی backup را پیدا کن؛ از <timestamp> استفاده نکن.
BACKUP_DIR=$(find /home/a4dbazarir/media-backups -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d' ' -f2-)
MEDIA_BACKUP_PATH="$BACKUP_DIR" MEDIA_RESTORE_CONFIRM=YES npm run media:restore
```

اگر هنوز backup نگرفته‌ای، ابتدا اجرا کن:

```bash
MEDIA_BACKUP_ROOT=/home/a4dbazarir/media-backups npm run media:backup
MEDIA_BACKUP_ROOT=/home/a4dbazarir/media-backups npm run media:verify
```

برای restore یک پوشه مشخص نیز مسیر واقعی را بدون علامت‌های زاویه‌ای بنویس؛ مثلاً:

```bash
MEDIA_BACKUP_PATH=/home/a4dbazarir/media-backups/2026-08-18T12-30-00-000Z \\
MEDIA_RESTORE_CONFIRM=YES npm run media:restore
```

این دستور فقط بعد از `MEDIA_RESTORE_CONFIRM=YES` اجرا می‌شود و مسیرهای خارج از backup یا `data/media` را رد می‌کند.

این راه‌حل هزینه سرویس خارجی ندارد؛ اما backup روی همان هاست در برابر خرابی کامل هاست کافی نیست و بهتر است یک کپی خارج از هاست هم نگهداری شود.
