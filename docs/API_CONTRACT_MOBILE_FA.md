# قرارداد API برای اپ موبایل 4D

این سند baseline قرارداد مشترک Web و اپ موبایل است. اپ موبایل باید به responseها و error codeها وابسته باشد، نه متن یا ساختار UI وب.

## Auth

- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/password-login`
- `POST /api/v1/auth/logout`
- احراز session با `Authorization: Bearer <session_token>` انجام می‌شود.

## Catalog and listings

- `GET /api/v1/regions/4d/cities`
- `GET /api/v1/categories`
- `GET /api/v1/feed`
- `GET /api/v1/contents/:contentId`
- `POST /api/v1/listings`
- `POST/DELETE /api/v1/contents/:contentId/favorite`

تمام listing responseها می‌توانند `image_data_url` را به‌صورت URL عمومی media برگردانند؛ اپ نباید نام فیلد را به معنی base64 فرض کند.

## Media upload

`POST /api/v1/media/listing-images`

Body:

```json
{ "image_data_url": "data:image/jpeg;base64,..." }
```

Response موفق:

```json
{
  "data": {
    "asset_id": "uuid",
    "url": "/media/listing-images/user/file.jpg",
    "storage_key": "listing-images/user/file.jpg",
    "size_bytes": 120000,
    "mime_type": "image/jpeg",
    "checksum_sha256": "64-hex-characters"
  }
}
```

در development بدون PostgreSQL، upload محلی ممکن است `asset_id` نداشته باشد؛ در production ثبت metadata و storage پایدار باید اجباری باشد.

## Profile, trust and chat

- `GET/PUT /api/v1/me/profile`
- `GET/PUT /api/v1/me/business-profile`
- `GET /api/v1/business-profiles/:userId`
- `GET /api/v1/business-profiles/:userId/trust`
- `GET /api/v1/me/conversations`
- `GET/POST /api/v1/conversations/:conversationId/messages`

## Error contract

```json
{ "error": { "code": "validation_failed", "message": "...", "details": {} } }
```

اپ موبایل باید براساس `code` رفتار کند، نه متن `message`.

## Mobile implementation gate

قبل از شروع native app، API contract، migrationهای database، media upload با metadata، auth/session smoke و production storage decision باید green باشند.
