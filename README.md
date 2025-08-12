## AI Avatars – Full‑stack MVP

Create an AI avatar, synthesize a custom voice, and generate a short talking‑head video ready for social. This repo contains a TypeScript Express API and a Next.js frontend, plus docs explaining API choices and how to scale the system.

### Features

- Avatar previews via OpenAI DALL·E 3 and save to object storage (Cloudflare R2)
- Voice synthesis via ElevenLabs; assets saved and re‑usable
- Talking‑head videos via D‑ID; results listed and downloadable
- Cookie‑based auth with protected routes on the frontend
- Simple, demo‑friendly UI flow with clear feedback and loaders

### Tech stack

- Backend: Express (TypeScript), Prisma (Postgres), Zod, JWT cookies
- Providers: OpenAI (images + script), ElevenLabs (TTS), D‑ID (video)
- Storage/CDN: Cloudflare R2 (S3 API) + Worker/CDN URLs
- Frontend: Next.js App Router, React, Tailwind utilities, Axios

### Repository structure

```
AI Avatar/        # Express API (TypeScript)
frontend/         # Next.js app (UI)
docs/             # Diagrams and documentation
```

### Getting started

#### 1) Backend (AI Avatar)

1. Create `AI Avatar/.env` with at least:

```dotenv
NODE_ENV=development
PORT=8080

# JWT
JWT_SECRET=replace-with-strong-secret

# OpenAI
OPENAI_API_KEY=sk-...

# ElevenLabs
ELEVENLABS_API_KEY=...
ELEVENLABS_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# D‑ID
DID_API_KEY=...

# Cloudflare R2 (S3‑compatible)
R2_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
# Note: env name is intentionally CLOUDFARE_* in code
CLOUDFARE_WORKER_URL=https://cdn.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
```

2. Install and run:

```bash
cd "AI Avatar"
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

Health check: `GET http://localhost:8080/health` → `{ "status": "ok" }`.

#### 2) Frontend (Next.js)

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Sign up/sign in, then follow the nav: Avatars → Voices → Videos.

### Demo flow

Watch the workflow video:

https://github.com/user-attachments/assets/720d75fb-b01d-42ca-88f3-842f3715d83e

1. Create avatar: enter a description, generate previews, pick one, Save.
2. Generate voice: enter a short prompt or paste text; save and re‑use.
3. Create video: choose avatar, either use saved voice audio or script + provider voice; click Generate.
4. View/download from Videos.

### API quick reference

Base URL: `http://localhost:8080/api/v1`

- Auth: `POST /user/signup`, `POST /user/signin`, `POST /user/logout`, `GET /user/me`
- Avatars: `POST /avatars` (preview), `POST /avatars/save`, `GET /avatars`, `POST /avatars/delete`
- Voice: `POST /voice/synthesize`, `GET /voice`, `GET /voice/providers/elevenlabs/voices`
- Videos: `POST /videos`, `GET /videos`

Pagination on list endpoints: `?page=1&limit=50` returns `{ items, pagination: { page, limit, total } }` shape per route.

Dev‑only utility (no auth; blocked in production):

```bash
curl -X POST http://localhost:8080/api/v1/dev/wipe
```

### Docs

- API overview (routes and examples): `docs/API.md`
- Provider choices and trade‑offs: `docs/AiModelChoice.md`
- Scaling plan and production checklist: `docs/Scaling.md`
- Example output video: `docs/video.mp4`
