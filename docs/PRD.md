# MetaCheck --- Product Requirements Document

## 1. Purpose

MetaCheck is a deployable MERN-stack hackathon prototype for
enforcement-support inspection of packaged commodities. An enforcement
officer uploads photographs of a package. Multimodal AI/OCR extracts
visible label declarations into a strict structured representation. A
deterministic backend rule engine evaluates those extracted facts
against a versioned registry of Legal Metrology (Packaged Commodities)
Rules, 2011 requirements and explicitly sourced amendments.

**Legal/product boundary:** MetaCheck is an inspection-assistance tool.
It does not make legally binding determinations, issue penalties, or
replace an officer's judgment. Every result must expose its evidence,
rule source, confidence/review state, and limitations.

## 2. Goals

### MVP goals

1.  Authenticate officers and administrators.
2.  Create an inspection and upload one or more package images.
3.  Run AI-assisted extraction into a strict schema.
4.  Preserve original evidence images and extraction provenance.
5.  Evaluate deterministic rules without allowing the AI to decide
    compliance.
6.  Produce PASS, FAIL, REVIEW, UNKNOWN, or NOT_APPLICABLE at
    declaration/rule level and an overall inspection outcome.
7.  Show evidence and rule explanations to the officer.
8.  Store inspection history with search/filter.
9.  Generate a PDF inspection report.
10. Provide a small admin capability for rule/version visibility and
    user management.
11. Deploy as a conventional React SPA + Express API + MongoDB
    application.

### Non-goals

-   Binding legal adjudication.
-   Automatic penalty calculation or legal notice issuance.
-   Generic legal advice.
-   Training/fine-tuning a foundation model.
-   Fully automatic verification of facts that cannot be established
    from package images.
-   Replacing physical measurement, sampling, laboratory testing,
    registration checks, or other procedures outside image-visible
    declarations.
-   Microservices or distributed infrastructure.

## 3. Users

### Enforcement Officer

-   Sign in.
-   Start an inspection.
-   Upload package images.
-   Review extracted declarations and evidence.
-   Run/re-run analysis.
-   Review rule outcomes.
-   Correct extraction fields where permitted, with audit trail.
-   Mark an inspection as reviewed.
-   Export a report.
-   Search prior inspections.

### Administrator

-   Manage users/roles.
-   Inspect active rule-set versions.
-   View system/audit activity.
-   Configure AI provider settings through environment/configuration,
    not arbitrary client input.

## 4. Core user journey

1.  Officer signs in.
2.  Officer opens `New Inspection`.
3.  Officer enters optional inspection metadata.
4.  Officer uploads package images.
5.  Backend validates files and creates an inspection.
6.  AI pipeline performs image quality assessment and structured
    extraction.
7.  Backend normalizes extracted values.
8.  Rule engine selects applicable rules from the active rule-set
    version.
9.  Rule engine evaluates only normalized facts and returns atomic
    findings.
10. UI displays:

-   overall review state,
-   compliance score,
-   declaration checklist,
-   violations,
-   evidence image/region,
-   confidence,
-   exact rule source,
-   reviewer actions.

11. Officer reviews/corrects uncertain extraction.
12. System records a final human-reviewed inspection state.
13. Officer exports PDF.

## 5. MVP feature scope

  Feature                                   MVP
  ----------------------------------------- -------------------------------------
  JWT authentication                        Yes
  Roles: officer/admin                      Yes
  Image upload                              Yes
  Image validation                          Yes
  AI extraction                             Yes
  Structured extraction JSON                Yes
  AI confidence/provenance                  Yes
  Deterministic rule engine                 Yes
  Versioned rule registry                   Yes
  PASS/FAIL/REVIEW/UNKNOWN/NOT_APPLICABLE   Yes
  Evidence images                           Yes
  Compliance score                          Yes, clearly labelled as heuristic
  Inspection history                        Yes
  Search/filter                             Yes
  PDF report                                Yes
  Audit trail                               Yes
  Rule editing UI                           No for MVP; read-only registry view
  Offline mode                              No
  Mobile native app                         No
  External enforcement-system integration   No

## 6. Product principles

1.  **AI extracts; rules decide.**
2.  **Absence is not inference.** If a declaration is not visible,
    return `null`/`UNKNOWN`; do not fabricate it.
3.  **Image uncertainty propagates.** Poor image quality can make a rule
    `REVIEW` or `UNKNOWN`.
4.  **Evidence first.** Every extracted field should point to an image
    and, where available, a bounding box/crop.
5.  **Deterministic evaluation.** Same normalized facts + same rule-set
    version must produce the same result.
6.  **Version everything.** AI model, extraction schema version,
    rule-set version, application version, and timestamps belong in an
    inspection snapshot.
7.  **Human review is explicit.** A reviewer correction is stored as a
    new fact with provenance; original AI output is retained.
8.  **No silent legal updates.** Rule changes require a new version and
    tests.

## 7. Assumptions

-   Images are photographs/scans of the package and may contain
    front/back/side panels.
-   A commodity may require multiple images to expose relevant
    declarations.
-   AI provider availability is external and may fail.
-   The prototype can use seeded test data and a mock AI adapter during
    development.
-   Rule applicability can depend on commodity/package facts that may
    not be visible; such rules must not be treated as proven from images
    alone.
-   The authoritative legal source is the official Department of
    Consumer Affairs repository and official Gazette notifications. The
    DCA page currently lists amendments through 2026, including 2025 and
    2026 packaged-commodity amendments. Therefore the rule registry must
    be built from the current official source set, not from an old
    consolidated copy alone. citeturn1search0turn2search0

## 8. Success criteria

A demo inspection should complete the path:

`upload -> extraction -> normalized facts -> deterministic validation -> evidence review -> score -> history -> PDF`

with no AI-generated compliance conclusion being accepted directly by
the backend.

## 9. Key risks

-   OCR/model hallucination.
-   Wrong applicability assumptions.
-   Legal amendments changing requirements.
-   Poor image quality.
-   Prompt injection embedded in package artwork.
-   Large images increasing request time/cost.
-   PDF containing stale analysis.
-   Unauthorized access to evidence images.
-   Rule-engine bugs.
-   Misleading score presentation.

## 10. Safety and legal wording

Use UI language such as: \> "AI-assisted inspection support. Findings
are indicative and require officer verification. This system does not
make legally binding determinations."

Avoid: - "Legally compliant" as an absolute claim. - "Penalty
automatically applicable." - "AI determined violation." - "Guaranteed
violation."

## 11. Acceptance criteria

-   An unauthenticated user cannot access inspections.
-   An officer can upload only supported image MIME types within
    configured limits.
-   Every uploaded image receives a persistent evidence ID.
-   AI output is schema-validated before entering the rule engine.
-   AI output cannot directly set a rule outcome.
-   Missing/illegible declarations do not become invented values.
-   Rule evaluation references a rule ID and version.
-   Every FAIL has a deterministic reason and source citation.
-   REVIEW/UNKNOWN states remain visible rather than being coerced to
    PASS/FAIL.
-   Inspection results are reproducible from stored normalized facts and
    rule-set version.
-   A report can be generated from the stored inspection snapshot.
-   Original AI output and human corrections remain auditable.
