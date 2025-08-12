## Stack

- Node.js + Express 5
- Prisma ORM + PostgreSQL
- Zod for request validation
- JWT cookies for auth
- Cloudflare R2 (S3 compatible) storage
- OpenAI, ElevenLabs, D‑ID external APIs

## Environment variables

Create a `.env` file in `AI Avatar/` with at least:

```
NODE_ENV=development
PORT=8080

# JWT
JWT_SECRET=replace-with-strong-secret

# OpenAI & Models
OPENAI_API_KEY=sk-...

# ElevenLabs
ELEVENLABS_API_KEY=...
# Optional default voice when not provided in requests
ELEVENLABS_DEFAULT_VOICE_ID=

# D-ID
DID_API_KEY=...

# Cloudflare R2 (S3-compatible)
R2_ENDPOINT_URL=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Public CDN/Worker base used to construct public asset URLs
# NOTE: variable name is intentionally spelled CLOUDFARE_* in code
CLOUDFARE_WORKER_URL=https://cdn.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public

# Web (production only enforcement)
FRONTEND_URL=https://app.yourdomain.com
COOKIE_DOMAIN=yourdomain.com
```

## Install, migrate, run

```bash
pnpm install

# Prisma
pnpm prisma generate
pnpm prisma migrate deploy  # or `pnpm prisma migrate dev` locally

# Dev (compiles TS and runs dist/index.js)
pnpm dev

# Build & start
pnpm build
pnpm start
```

Server listens on `PORT` (default 8080). Health check: `GET /health` → `{ "status": "ok" }`.

## Authentication

- On successful signup/signin, a JWT is set as an httpOnly cookie named `token` (7 days).
- Protected routes require this cookie. If missing/invalid/expired → `401`.
- In production, rate limiting is applied (50 req / 5 min per IP) and CORS origin must match `FRONTEND_URL`.

Cookie attributes:

- `httpOnly: true`, `sameSite: strict`
- `secure: true` in production
- `domain: COOKIE_DOMAIN` in production (unset in development)

## Base URL

All API routes are under `/api/v1`.

---

## User routes

### POST /api/v1/user/signup

- Auth: Public
- Body:

```json
{
  "email": "alice@example.com",
  "username": "alice",
  "password": "secret123"
}
```

- Responses:
  - 200
    ```json
    {
      "message": "User Created Successfully",
      "username": "alice",
      "email": "alice@example.com"
    }
    ```
    Sets `token` cookie.
  - 403: email or username already exists
  - 411: validation error
  - 500: server error

### POST /api/v1/user/signin

- Auth: Public
- Body:

```json
{ "email": "alice@example.com", "password": "secret123" }
```

- Responses:
  - 200
    ```json
    {
      "message": "Logged in successfully",
      "userId": "usr_...",
      "email": "alice@example.com"
    }
    ```
    Sets `token` cookie.
  - 401: invalid email or password
  - 411: validation error
  - 500: server error

### POST /api/v1/user/logout

- Auth: Public (clears cookie if present)
- Response:

```json
{ "message": "Logged out Successfully" }
```

### GET /api/v1/user/me

- Auth: Required
- Response:

```json
{ "id": "usr_...", "email": "alice@example.com", "fullName": "" }
```

---

## Avatar routes

### POST /api/v1/avatars

- Auth: Required
- Description: Generate ONE DALL·E 3 image from a prompt. This does NOT persist; it returns a remote image URL so you can preview.
- Body:

```json
{ "prompt": "photoreal headshot, soft studio light, smiling" }
```

- Response (200):

```json
{
  "created": 1734041234567,
  "data": [
    {
      "url": "https://...openai.../image.png",
      "revised_prompt": "photoreal headshot, ..."
    }
  ]
}
```

- Errors: 411 validation, 500 upstream/server

### GET /api/v1/avatars

- Auth: Required
- Response (200):

```json
{
  "avatars": [
    {
      "id": "avt_...",
      "userId": "usr_...",
      "prompt": "...",
      "imageUrl": "https://cdn.../video/avatars/usr_.../172...png",
      "imageKey": "avatars/usr_.../172...png",
      "preferred": false,
      "createdAt": "2025-08-12T07:44:00.000Z"
    }
  ]
}
```

### POST /api/v1/avatars/save

- Auth: Required
- Description: Persist a selected preview. The service downloads the `imageUrl`, uploads it to R2, and creates a DB record.
- Body:

```json
{
  "imageUrl": "https://...openai.../image.png",
  "prompt": "photoreal headshot ...",
  "preferred": false
}
```

- Response (200):

```json
{
  "message": "Avatar saved",
  "avatar": {
    "id": "avt_...",
    "userId": "usr_...",
    "prompt": "...",
    "imageUrl": "https://cdn.../video/avatars/usr_.../172...png",
    "imageKey": "avatars/usr_.../172...png",
    "preferred": false,
    "createdAt": "2025-08-12T07:44:00.000Z"
  }
}
```

- Errors: 411 validation, 400 fetch failure, 500

### POST /api/v1/avatars/delete

- Auth: Required
- Body: `{ "avatarId": "avt_..." }`
- Response: `{ "message": "Avatar deleted" }`
- Errors: 411 missing `avatarId`, 404 not found, 500

---

## Voice routes

### POST /api/v1/voice/synthesize

- Auth: Required
- Description: Generates short script from `prompt` if `text` not provided, then calls ElevenLabs to synthesize MP3. Uploads to R2 and persists.
- Body (one of):

```json
{ "prompt": "friendly welcome for a landing page" }
```

or

```json
{
  "text": "Hey there, welcome to our demo!",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

- Optional fields: `model_id`, `voice_settings.stability`, `voice_settings.similarity_boost`.
- Response (200):

```json
{
  "audioBase64": "<base64 mp3>",
  "audioKey": "audio/usr_.../172..._21m00Tcm4TlvDq8ikWAM.mp3",
  "audioUrl": "https://cdn.../video/audio/usr_.../172..._voice.mp3",
  "asset": {
    "id": "vce_...",
    "userId": "usr_...",
    "text": "Hey there, welcome to our demo!",
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "modelId": "eleven_monolingual_v1",
    "stability": 0.75,
    "similarity": 0.85,
    "audioKey": "audio/usr_.../....mp3",
    "audioUrl": "https://cdn.../video/audio/usr_.../....mp3",
    "createdAt": "2025-08-12T07:44:00.000Z"
  }
}
```

- Errors: 411 (missing prompt/text or voiceId when required), 500

### GET /api/v1/voice

- Auth: Required
- Response (200): `{ "voices": [ VoiceAsset, ... ] }`

### GET /api/v1/voice/providers/elevenlabs/voices

- Auth: Required
- Description: Proxies ElevenLabs voice list.
- Response (200):

```json
{
  "voices": [
    { "voice_id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel", "...": "..." }
  ]
}
```

---

## Video routes

### POST /api/v1/videos

- Auth: Required
- Description: Creates a D‑ID "talk" using either your provided audio or a generated/refined script + voice.
- Body options:

1. Using existing audio saved in R2

```json
{
  "avatarId": "avt_...",
  "audioKey": "audio/usr_.../....mp3",
  "prompt": "optional idea used only if we need to generate a script"
}
```

2. Using direct audio URL

```json
{ "avatarId": "avt_...", "audioUrl": "https://cdn.../....mp3" }
```

3. Using text + voice

```json
{
  "avatarId": "avt_...",
  "script": "Short single-sentence script",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "refinePrompt": true
}
```

- Validation rules:
  - `avatarId` required
  - Either `audioUrl`/`audioKey` OR `script` is required
  - If `script` is provided, `voiceId` is required
- Response (200):

```json
{
  "message": "Video created",
  "job": {
    "id": "vid_...",
    "userId": "usr_...",
    "avatarId": "avt_...",
    "script": "[audio provided]",
    /* or the generated/refined script string */ "voiceId": null,
    "status": "completed",
    "outputUrl": "https://.../result.mp4",
    "createdAt": "2025-08-12T07:44:00.000Z",
    "updatedAt": "2025-08-12T07:44:00.000Z"
  }
}
```

- If D‑ID result isn’t immediately ready after ~60s polling, status may be `"queued"` and `outputUrl` empty. The job will still be persisted.
- Errors: 411 validation, 404 avatar not found, 500

### GET /api/v1/videos

- Auth: Required
- Response (200): `{ "jobs": [ VideoJob, ... ] }`

---

## Storage

- Assets are stored in Cloudflare R2 under keys like:
  - Avatars: `avatars/{userId}/{timestamp}.png`
  - Voices: `audio/{userId}/{timestamp}_{voiceId}.mp3`
- Public URLs are constructed as `${CLOUDFARE_WORKER_URL}/video/{key}`. Ensure your Worker/edge routes `/video/*` to the R2 bucket appropriately.

## CORS

- Development: `origin` defaults to `http://localhost:3000`
- Production: `origin` must equal `FRONTEND_URL`
- `withCredentials: true` must be set by the client

## Status codes

- 200 OK on success
- 400 Bad Request (some fetch failures)
- 401 Unauthorized (missing/invalid/expired token)
- 403 Conflict/Already exists (signup duplicates)
- 404 Not Found (resources not owned/found)
- 411 Validation errors (non‑standard; used by this API)
- 500 Internal Server Error

## Health check

`GET /health` → `{ "status": "ok" }`

## Notes

- Variable name `CLOUDFARE_WORKER_URL` is intentionally spelled that way in code; match your env var.
- There is a duplicate `uploadBuffer` implementation in `src/services/uploadBuffer.ts` that is not used; the active one lives in `src/services/putObject.ts`.
