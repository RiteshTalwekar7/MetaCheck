# MetaCheck --- REST API

Base URL: `/api/v1`

All protected endpoints require: `Authorization: Bearer <access-token>`

## 1. Authentication

### POST `/auth/register`

Admin-only in production/demo seed environment.

Request:

``` json
{
  "name": "Officer",
  "email": "officer@example.com",
  "password": "..."
}
```

Response:

``` json
{
  "user": {
    "id": "...",
    "name": "Officer",
    "email": "...",
    "role": "OFFICER"
  }
}
```

### POST `/auth/login`

Response:

``` json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "name": "...",
    "role": "OFFICER"
  }
}
```

### GET `/auth/me`

Returns authenticated user.

## 2. Inspections

### POST `/inspections`

Creates a draft inspection.

Request:

``` json
{
  "reference": "INS-2026-001",
  "locationText": "...",
  "notes": "..."
}
```

### GET `/inspections`

Query: - `page` - `limit` - `search` - `status` - `result` -
`officerId` - `from` - `to` - `ruleSetVersion`

### GET `/inspections/:id`

Returns inspection metadata, latest analysis snapshot, evidence
metadata, and findings according to authorization.

### PATCH `/inspections/:id`

Updates permitted draft/review metadata.

## 3. Evidence

### POST `/inspections/:id/evidence`

Multipart upload using field `images`.

Backend: - validates file type, - validates size, - stores evidence
metadata, - assigns evidence IDs.

Response:

``` json
{
  "evidence": [
    {
      "id": "...",
      "filename": "...",
      "mimeType": "image/jpeg",
      "size": 12345
    }
  ]
}
```

### GET `/inspections/:id/evidence/:evidenceId`

Authenticated evidence retrieval.

## 4. Analysis

### POST `/inspections/:id/analyze`

Runs the configured AI extraction and deterministic validation pipeline.

Response:

``` json
{
  "analysisId": "...",
  "status": "COMPLETED",
  "extraction": {},
  "findings": [],
  "summary": {
    "overallStatus": "REVIEW",
    "resolvedChecks": 8,
    "totalChecks": 10,
    "score": 80
  }
}
```

`score` is a prototype prioritization metric, not a legal percentage.

### GET `/inspections/:id/analysis/:analysisId`

Returns an immutable analysis snapshot.

## 5. Review

### POST `/inspections/:id/review`

Request:

``` json
{
  "fieldPath": "product.netQuantity.value",
  "action": "CORRECT",
  "value": "500",
  "unit": "g",
  "reason": "Readable in evidence image"
}
```

Server: - validates the review action, - preserves original AI fact, -
creates reviewer revision, - re-runs deterministic validation.

### POST `/inspections/:id/finalize-review`

Marks the inspection as reviewed. This does not turn the result into a
legally binding determination.

## 6. Reports

### POST `/inspections/:id/report`

Generates a PDF from the stored analysis snapshot.

Response:

``` json
{
  "reportId": "...",
  "status": "READY"
}
```

### GET `/inspections/:id/report`

Returns/downloads the latest authorized PDF.

## 7. Rules

### GET `/rules`

Returns active rule metadata.

Query: - `ruleSetVersion` - `status` - `category`

### GET `/rules/:ruleId`

Returns rule metadata, source citation, applicability description, and
version.

Rule mutation is intentionally excluded from MVP public APIs.

## 8. Admin

### GET `/admin/users`

Admin-only.

### PATCH `/admin/users/:id/role`

Admin-only.

### GET `/admin/audit`

Admin-only, paginated.

## 9. Validation

Use Zod for: - params, - query, - body, - AI output, - normalized
facts, - rule definitions.

Reject unknown client fields where appropriate.

## 10. Authorization matrix

  Endpoint                              Officer       Admin
  ----------------------------- --------------- -----------
  Login                                     Yes         Yes
  Own inspections                           Yes         Yes
  Other officers' inspections     No by default         Yes
  Upload evidence                           Yes         Yes
  Analyze                                   Yes         Yes
  Review own inspection                     Yes         Yes
  User management                            No         Yes
  Rule view                                 Yes         Yes
  Rule mutation                              No   No in MVP
  Audit view                                 No         Yes
