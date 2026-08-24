# MetaCheck --- UX/UI Design Specification

## 1. Design direction

The interface should feel like a professional inspection workstation
rather than a consumer AI chat app.

Principles: - Evidence-first. - Dense but readable information. - Clear
status semantics. - Minimal animation. - Strong hierarchy. - Every
AI-derived field is visibly labelled as AI-extracted. - Compliance
results distinguish "failed rule" from "needs human review."

Use React + Tailwind + shadcn/ui. Prefer reusable shadcn primitives over
custom one-off components.

## 2. Global layout

Desktop: - left sidebar navigation, - top bar with user, role,
inspection context, - main content with responsive max-width, -
persistent status indicators.

Mobile: - collapsible navigation, - stacked evidence/result panels.

Primary navigation: - Dashboard - New Inspection - Inspections -
Reports - Rules - Users (admin) - Settings

## 3. Dashboard

Widgets: - Inspections today - Awaiting review - Potential violations -
Average inspection score - Recent inspections

Primary action: `Start New Inspection`

Recent table: - inspection ID - date/time - commodity - officer -
status - score - review state

## 4. New Inspection

Step 1: Metadata - inspection reference - location/establishment text -
commodity category (optional unless required by the configured rules) -
notes

Step 2: Evidence upload - drag/drop zone - camera/file upload - image
thumbnails - image count - remove/reorder - upload validation messages

Step 3: Analyze - explicit consent-like action:
`Run AI-Assisted Analysis` - progress states: - uploading - checking
image quality - extracting declarations - validating rules - preparing
results

## 5. Analysis workspace

Recommended two-column desktop layout.

### Left: Evidence

-   image viewer
-   zoom
-   thumbnail strip
-   highlighted evidence region
-   "source image" labels

### Right: Findings

Top: - overall review state - compliance score - "AI-assisted / human
verification required" notice

Then declaration cards: - declaration name - extracted value -
confidence - visibility state - source image - bounding box indicator -
rule status

Violation cards: - status - concise reason - rule ID - legal source
citation - evidence link - reviewer action

## 6. Status semantics

Use text + icon + shape, not color alone.

-   PASS --- requirement appears satisfied by available evidence.
-   FAIL --- deterministic rule condition is triggered by
    verified/accepted inputs.
-   REVIEW --- evidence or applicability requires human review.
-   UNKNOWN --- insufficient evidence to establish the condition.
-   NOT_APPLICABLE --- rule is not applicable based on established
    facts.

Never map UNKNOWN to FAIL.

## 7. Confidence display

Confidence belongs to extraction, not legal validity.

Example: `Net quantity: 500 g · extraction confidence 0.94`

Avoid: `94% legally compliant`

Confidence bands: - High: \>= 0.90 - Medium: 0.70--0.89 - Low: \< 0.70

These are UX thresholds, not legal thresholds.

## 8. Review interactions

For an uncertain field: - show original AI value, - show evidence, -
allow officer to correct, - require a reason/category for correction, -
preserve original value.

Reviewer correction status: `AI_EXTRACTED -> HUMAN_CONFIRMED` or
`AI_EXTRACTED -> HUMAN_CORRECTED`

## 9. Compliance score

The score is a prototype prioritization metric, not a legal measure.

Recommended calculation: - Only evaluate rules whose applicability and
inputs are sufficiently established. - PASS contributes positive
weight. - FAIL contributes zero for that criterion. - REVIEW/UNKNOWN are
excluded from the denominator or surfaced as unresolved, rather than
silently treated as PASS. - Display `X/Y checks resolved` beside the
score.

Do not call the score "legal compliance percentage."

## 10. Inspection history

Filters: - date range - status - result - officer - commodity/category -
rule-set version

Search: - inspection ID - commodity name - reference text

Table actions: - open - review - export PDF

## 11. Report screen

Show report preview metadata: - inspection ID - officer - date -
rule-set version - AI model/version - evidence count - result summary -
unresolved items

Report must include: 1. Disclaimer. 2. Inspection metadata. 3. Evidence
images. 4. Extracted declarations. 5. Rule findings. 6. Evidence
references. 7. Review/correction history. 8. Rule-set version. 9.
Generation timestamp.

## 12. Component system

Shared: - `StatusBadge` - `ConfidenceBadge` - `EvidenceViewer` -
`EvidenceThumbnail` - `DeclarationCard` - `FindingCard` -
`RuleCitation` - `ScoreSummary` - `ReviewBanner` - `DataTable` -
`EmptyState` - `ErrorState` - `LoadingState` - `ConfirmDialog`

## 13. Accessibility

-   Keyboard navigation.
-   Visible focus states.
-   Semantic headings.
-   Form labels.
-   Text alternatives for status.
-   Do not rely on red/green alone.
-   Minimum readable contrast.
-   Error messages adjacent to affected fields.

## 14. Design anti-patterns

Do not: - build a chatbot as the primary UI; - hide evidence behind
multiple dialogs; - show a giant AI confidence percentage as the main
result; - show PASS/FAIL without rule evidence; - let AI-generated
narrative replace structured findings; - make the dashboard look like a
generic SaaS template.
