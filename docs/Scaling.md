# Scaling and Production Readiness (Simple Guide)

This guide explains how to grow the MVP into a stable, production system for 1,000+ users/day, with a clear path to 10,000+/day. It keeps the language simple and the steps practical.

- High‑level diagram:

![High‑level architecture](docs/diagram.png)

- Example generated video:

[Download/view example (video.mp4)](docs/video.mp4)

- Validate and authorize requests quickly. Do heavy work in background jobs.
- Let the client poll job status or use webhooks/SSE.
- Serve media from CDN/Object Storage. Do not stream big files through the API.

## Current gaps (what to fix next)

- Heavy work happens inside requests (voice/video). Move it to background jobs.
- No queue or backpressure. Add a queue and a dead‑letter queue (DLQ).
- Minimal visibility. Add logs, metrics, tracing, and a request/trace ID.
- No guard for providers. Add rate limits and circuit breakers per provider.

## Production improvements

### Move long work to background jobs

- Use a queue (Redis+BullMQ or AWS SQS). Put jobs on the queue for:
  - Avatar image generation (many previews)
  - ElevenLabs TTS
  - D‑ID video creation and polling
- API behavior:
  - Validate → enqueue
  - Client polls `GET /jobs/:id` or listens via SSE/WebSocket.
- Job record should have: `status`, `progress`, `attempts`, `error`, `resultUrl`.
- Add a DLQ after max retries with exponential backoff.

## Data flows

### Avatar preview → save

1. Client requests previews → API enqueues preview jobs (or runs a few synchronously with a cap).
2. Worker calls OpenAI Images and returns URLs; API sends them to the client.
3. On save, API fetches the image (whitelisted host), uploads to storage, writes an `Avatar` row.
4. If `preferred`, make sure only one avatar is preferred (transaction).

### Voice synthesis

1. Client POSTs prompt or text → API enqueues voice job.
2. Worker generates or uses text → calls ElevenLabs → stores MP3 → writes `VoiceAsset`.
3. Client polls job or fetches with `GET /voice`.

### Video render

1. Client POSTs `avatarId` and either `audioKey`/`audioUrl` or `script + voiceId`.
2. API enqueues video job.
3. Worker resolves script/audio → calls D‑ID → polls or uses webhook → saves `outputUrl`.
4. Client polls `GET /videos` or `GET /jobs/:id`.

- Use BullMQ (Redis) or RabbitMQ. BullMQ is simple for Node/TS; RabbitMQ/Kafka for very high throughput
- Model long‑running provider work in stages: start → poll/update → finalize

## Stack choices

- Queue: BullMQ (Redis)
- Workers: Kubernetes with node pools
- Storage/CDN: S3 + CloudFront
- DB: Postgres + Prisma + PgBouncer

## scaling summary

For 1k daily active users we estimate ~18 GB of object storage/day (avatars + videos) and a low concurrency requirement for workers under reasonable assumptions. Workers are orchestrated in Kubernetes and scaled using KEDA on queue depth. Workers are grouped by job type (image‑gen, video‑gen, postprocess) and placed on dedicated node pools. Postgres is fronted by PgBouncer with read replicas for read‑heavy endpoints. All generated media are stored in S3 and served through CloudFront, with lifecycle rules to archive older assets to reduce cost. Per‑user quotas and concurrency limits are enforced to protect from runaway costs and external API rate‑limits.
