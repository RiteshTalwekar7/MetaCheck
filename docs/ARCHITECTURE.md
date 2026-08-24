# MetaCheck --- Architecture

## 1. Architectural style

A modular monolith is the correct MVP architecture:

-   React/Vite SPA
-   Express/Node.js REST API
-   MongoDB/Mongoose persistence
-   AI provider behind an internal adapter
-   Deterministic compliance engine as a pure application module
-   Puppeteer PDF generation inside the backend

Do not introduce microservices, queues, Redis, Kafka, Python services,
or a separate AI server.

## 2. High-level flow

``` text
Browser
  |
  | HTTPS + JWT
  v
React/Vite SPA
  |
  | Axios
  v
Express API
  |
  +--> Auth module
  +--> Inspection module
  |      |
  |      +--> Upload/evidence service
  |      +--> AI adapter
  |      +--> Normalizer
  |      +--> Compliance engine
  |      +--> Report service
  |
  +--> Rule registry
  +--> Audit service
  |
  v
MongoDB
```

## 3. Repository structure

``` text
metacheck/
├─ client/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ features/
│  │  │  ├─ auth/
│  │  │  ├─ dashboard/
│  │  │  ├─ inspections/
│  │  │  ├─ analysis/
│  │  │  ├─ reports/
│  │  │  └─ users/
│  │  ├─ lib/
│  │  ├─ hooks/
│  │  ├─ routes/
│  │  └─ styles/
│  └─ ...
├─ server/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ middleware/
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  ├─ users/
│  │  │  ├─ inspections/
│  │  │  ├─ evidence/
│  │  │  ├─ analysis/
│  │  │  ├─ compliance/
│  │  │  ├─ rules/
│  │  │  ├─ reports/
│  │  │  └─ audit/
│  │  ├─ ai/
│  │  │  ├─ aiProvider.js
│  │  │  ├─ schemas.js
│  │  │  ├─ prompt.js
│  │  │  └─ mockProvider.js
│  │  ├─ rules/
│  │  │  ├─ registry/
│  │  │  ├─ engine/
│  │  │  └─ tests/
│  │  ├─ models/
│  │  ├─ utils/
│  │  └─ app.js
│  └─ ...
├─ docs/
├─ scripts/
└─ README.md
```

## 4. Module boundaries

### Auth

Responsible for password hashing, login, JWT issuance, authentication
middleware, and role checks.

### Inspections

Owns inspection lifecycle and immutable-ish analysis snapshots.

### Evidence

Owns file validation, storage metadata, secure retrieval, and image
provenance.

### AI

Only converts images into structured extraction candidates. It must not
call the compliance engine or produce authoritative legal outcomes.

### Compliance

Consumes normalized facts and a selected rule-set version. It returns
deterministic findings.

### Rules

Stores/loads versioned rules and their legal citations. Rule definitions
are data/configuration plus deterministic evaluator functions.

### Reports

Builds a read-only report view from an inspection snapshot and renders
HTML to PDF through Puppeteer.

### Audit

Records security-sensitive and analysis-changing actions.

## 5. Request lifecycle

For analysis:

``` text
POST /inspections/:id/analyze
 -> authenticate
 -> authorize
 -> load inspection
 -> verify evidence ownership/access
 -> assess image quality
 -> AI adapter
 -> Zod validate AI JSON
 -> normalize facts
 -> compliance engine
 -> persist AnalysisSnapshot
 -> return result
```

The backend must never accept a client-supplied `PASS`/`FAIL` result as
authoritative.

## 6. Error handling

Use a single Express error middleware and stable error codes:

-   `AUTH_REQUIRED`
-   `FORBIDDEN`
-   `VALIDATION_ERROR`
-   `NOT_FOUND`
-   `UNSUPPORTED_FILE`
-   `FILE_TOO_LARGE`
-   `AI_PROVIDER_ERROR`
-   `AI_SCHEMA_ERROR`
-   `IMAGE_UNREADABLE`
-   `RULESET_NOT_FOUND`
-   `REPORT_GENERATION_ERROR`
-   `INTERNAL_ERROR`

Return a consistent structure:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Do not leak stack traces or provider credentials.

## 7. Security architecture

-   Password hashes only; never store plaintext passwords.
-   JWT with short-lived access token.
-   Role middleware for officer/admin operations.
-   Validate all request bodies with Zod.
-   Validate upload MIME type and file size.
-   Generate server-side evidence IDs.
-   Never expose filesystem paths to clients.
-   Serve evidence through an authenticated route or signed mechanism
    implemented by the backend.
-   Sanitize report data before HTML rendering.
-   Do not place arbitrary user HTML into the PDF template.
-   Rate-limit authentication endpoints if the deployment environment
    supports it without introducing a new required infrastructure
    service.
-   Keep secrets in environment variables.
-   Log security events without sensitive token contents.

## 8. Data flow invariants

### Invariant A

`AI output != compliance result`.

### Invariant B

A compliance finding must contain: - rule ID, - rule-set version, -
status, - reason, - input facts, - evidence references when
applicable, - evaluator version.

### Invariant C

Every extracted field contains provenance: - source image ID(s), -
confidence, - visibility state, - extraction method, - optional bounding
box.

### Invariant D

Human corrections never overwrite the original AI extraction. They
create a review decision/fact revision.

## 9. Scalability boundary

For the hackathon, synchronous analysis is acceptable. Design the
analysis service so it can later be moved behind a queue without
changing its domain contract. Do not implement the queue now.

## 10. Observability

At minimum log: - request ID, - user ID, - inspection ID, - analysis
ID, - rule-set version, - AI provider/model, - duration, -
success/failure.

Never log full images, passwords, JWTs, or sensitive provider payloads.

## 11. Architectural decision records

Record decisions for: 1. Modular monolith. 2. AI adapter boundary. 3.
Rule registry separate from AI. 4. Versioned inspection snapshots. 5.
Evidence-first UX. 6. Synchronous MVP analysis.
