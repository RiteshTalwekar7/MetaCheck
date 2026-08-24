# MetaCheck --- Deployment

## 1. Target deployment

Keep deployment simple:

``` text
Browser
  |
 HTTPS
  v
Static React/Vite hosting
  |
 HTTPS
  v
Node/Express hosting
  |
  +--> MongoDB managed database
  +--> AI provider API
```

No Docker, Kubernetes, Redis, Kafka, or microservices are required.

## 2. Frontend

Build:

``` bash
npm run build
```

Serve the generated Vite `dist` directory using the selected static
hosting platform.

Required environment:

``` text
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Configure SPA fallback so React Router paths resolve to `index.html`.

## 3. Backend

Required environment variables:

``` text
NODE_ENV=production
PORT=...
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=...
AI_PROVIDER=...
AI_API_KEY=...
CLIENT_ORIGIN=...
MAX_UPLOAD_MB=...
RULESET_VERSION=...
```

Never commit `.env`.

## 4. MongoDB

Create: - application database, - least-privilege application
credentials, - backups according to the chosen provider, - indexes
defined by Mongoose.

Recommended indexes: - users.email unique - inspections.reference -
inspections.createdAt - inspections.officerId + createdAt -
inspections.status + createdAt - inspections.result + createdAt

## 5. File/evidence storage

For a hackathon prototype, the storage adapter should be isolated.

The interface:

``` js
{
  put(file),
  get(id),
  delete(id)
}
```

The exact production storage provider is intentionally
deployment-specific. Do not expose local filesystem paths to clients.

If the prototype uses local disk, treat it as non-durable demo storage
and state that limitation clearly.

## 6. AI provider

Use an adapter so provider-specific SDK calls are isolated.

Configuration must select: - provider, - model, - timeout, - max image
size, - retry policy.

Never let a browser specify the model/provider for an analysis request.

## 7. Puppeteer

The backend generates PDF from a controlled HTML template.

Requirements: - pinned Chromium/Puppeteer-compatible versions, - no
remote untrusted HTML, - controlled CSS, - explicit page size/margins, -
timeouts, - cleanup of browser instances.

## 8. Deployment security checklist

-   HTTPS everywhere.
-   Strong JWT secret.
-   Secure CORS allowlist.
-   Rate-limit login.
-   Request body size limits.
-   Upload limits.
-   Authentication on evidence/report routes.
-   No public MongoDB access.
-   No secrets in client bundle.
-   Error responses do not expose stack traces.
-   Logs do not contain tokens or passwords.

## 9. Production readiness boundary

The hackathon prototype is deployable but not a certified enforcement
platform.

Before production use: - legal review, - rule registry verification, -
security review, - privacy/data-retention review, - model validation, -
adversarial image testing, - audit requirements, - availability/recovery
testing, - official integration requirements.

## 10. Deployment verification

After deployment:

``` text
GET /health
 -> API reachable
 -> database reachable
 -> active rule-set loaded
 -> AI provider configuration present
```

Then perform: 1. login, 2. create inspection, 3. upload evidence, 4. run
mock analysis, 5. run real AI analysis, 6. review uncertain field, 7.
generate PDF, 8. retrieve inspection from history.

## 11. Health endpoint

`GET /health`

Example:

``` json
{
  "status": "ok",
  "version": "1.0.0",
  "ruleSetVersion": "PCR-INDIA-2026-08-v1"
}
```

Do not expose secrets or provider API keys.
