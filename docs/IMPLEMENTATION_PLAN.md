# MetaCheck --- Concise Implementation Plan

## Architecture consistency review

The documents are aligned around these invariants:

1.  React/Vite is the only frontend framework.
2.  Express/Node.js is the only backend application runtime.
3.  MongoDB/Mongoose is the only database.
4.  AI is an extraction adapter only.
5.  The compliance engine is deterministic and independent.
6.  Rules are versioned and source-cited.
7.  PASS/FAIL/REVIEW/UNKNOWN/NOT_APPLICABLE are used consistently.
8.  Evidence and provenance are first-class data.
9.  Human corrections preserve the original AI extraction.
10. PDF generation uses Puppeteer.
11. No microservices or extra infrastructure is required.

## Legal-source contradiction check

The official Department of Consumer Affairs repository currently lists
Packaged Commodities amendments through 2026. Therefore, a rule registry
based only on the older consolidated rules would be incomplete for a
claim of current-law support. The implementation must create a
source/version inventory first and activate only rules that have been
verified against the current official material.
citeturn1search0turn2search0

The official 2021 amendment also demonstrates why applicability and
effective dates must be represented explicitly rather than encoded as
generic "mandatory fields." citeturn0search2

## Implementation order

### Phase 0 --- Source and project foundation

-   Freeze the legal source inventory from the official DCA repository.
-   Identify the exact rules in MVP scope.
-   Create source metadata and rule-set version.
-   Initialize monorepo-style client/server directories.
-   Configure linting, formatting, environment validation, and test
    runners.

### Phase 1 --- Backend skeleton

-   Express app.
-   MongoDB connection.
-   Mongoose models.
-   Error middleware.
-   Zod validation.
-   JWT auth.
-   Role middleware.
-   Health endpoint.

### Phase 2 --- Inspection/evidence

-   Inspection CRUD.
-   Multer upload.
-   File validation.
-   Evidence metadata.
-   Authenticated evidence retrieval.
-   Basic inspection UI.

### Phase 3 --- Mock AI pipeline

-   AIProvider interface.
-   Mock fixtures.
-   Zod extraction schema.
-   Normalizer.
-   Provenance model.
-   Analysis persistence.

Do not connect a real AI provider until this phase passes tests.

### Phase 4 --- Rule engine

-   Rule registry.
-   Applicability evaluator.
-   deterministic evaluator contract.
-   status precedence.
-   rule-set versioning.
-   unit tests for every seeded rule.

### Phase 5 --- End-to-end analysis

-   Replace/mock provider through adapter.
-   Real multimodal extraction.
-   image-quality handling.
-   extraction -\> normalization -\> rule evaluation.
-   immutable analysis snapshot.

### Phase 6 --- Review workflow

-   field correction UI.
-   audit trail.
-   re-evaluation.
-   final human-reviewed state.

### Phase 7 --- Dashboard/history

-   dashboard metrics.
-   search.
-   filters.
-   inspection detail.
-   status and score visualization.

### Phase 8 --- PDF reports

-   controlled HTML template.
-   Puppeteer PDF generation.
-   report metadata.
-   evidence.
-   findings.
-   disclaimer.
-   rule-set/model versions.

### Phase 9 --- Hardening

-   authorization tests.
-   upload-security tests.
-   rule regression tests.
-   AI malformed-output tests.
-   conflicting-evidence tests.
-   end-to-end tests.
-   deployment smoke test.

## Definition of Done

A feature is not complete until: - API validation exists. -
authorization exists. - happy-path test exists. - failure-path test
exists. - UI loading/error/empty states exist. - audit/provenance
requirements are satisfied. - no AI output bypasses the deterministic
rule engine. - documentation matches the implementation.

## Suggested build sequence for the hackathon

Build vertically rather than finishing every backend layer first:

`Auth -> Create inspection -> Upload image -> Mock extraction -> Rule result -> Review UI -> Real AI -> History -> PDF -> Deployment`

This gives the team a working demo early and keeps provider/legal
uncertainty from blocking the whole application.
