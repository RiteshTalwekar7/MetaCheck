# MetaCheck --- Compliance Rule Engine

## 1. Legal-source policy

This document defines the software architecture for representing legal
rules. It must not be treated as an independent legal source.

The authoritative source registry for the project is the Department of
Consumer Affairs' official Legal Metrology repository and the
corresponding official Gazette notifications. The DCA repository
currently lists the original Packaged Commodities Rules plus amendments
through 2026, including 2025 and 2026 entries.
citeturn1search0turn2search0

The official consolidated DCA publication confirms the principal Rules
were notified as GSR 202(E) on 7 March 2011 and contains amendment
annotations through its covered period. citeturn0search1

**Important:** Do not seed a production/legal rule with a memory-based
interpretation. Each implemented rule must have an exact source
reference, effective date, and applicability statement derived from
official material.

The DCA repository also lists 2026 amendments, so a prototype that
claims "current law" must account for those amendments rather than
stopping at the 2023 consolidated text. citeturn2search0

## 2. Rule model

A rule is represented separately from AI extraction:

``` js
{
  id: "PCR-R6-001",
  title: "Rule title",
  source: {
    instrument: "Legal Metrology (Packaged Commodities) Rules, 2011",
    rule: "6",
    subRule: "1",
    clause: "...",
    notification: "GSR ...",
    sourceUrl: "...",
    effectiveFrom: "YYYY-MM-DD"
  },
  version: 1,
  applicability: {
    type: "EXPRESSION_OR_CONFIGURED_PREDICATE"
  },
  inputs: ["product.netQuantity", "product.mrp"],
  evaluator: "function identifier",
  statusPolicy: {
    missingInput: "UNKNOWN",
    conflictingInput: "REVIEW"
  },
  enabled: true
}
```

The actual evaluator code should be deterministic and unit-tested.

## 3. Rule registry architecture

Separate: 1. legal metadata, 2. applicability, 3. input facts, 4.
evaluator, 5. result explanation, 6. evidence requirements.

Do not put legal rules inside AI prompts.

## 4. Evaluation contract

``` js
{
  ruleId,
  ruleSetVersion,
  status,
  reason,
  inputsUsed,
  evidence,
  evaluatorVersion
}
```

Allowed status: - `PASS` - `FAIL` - `REVIEW` - `UNKNOWN` -
`NOT_APPLICABLE`

## 5. Decision precedence

For a single rule:

1.  If applicability is deterministically false -\> `NOT_APPLICABLE`.
2.  If applicability cannot be established -\> `REVIEW` or `UNKNOWN`,
    according to the rule's configured missing-input policy.
3.  If required evidence is conflicting -\> `REVIEW`.
4.  If required input is missing/not visible -\> `UNKNOWN` unless the
    rule itself explicitly defines a different sourced treatment.
5.  If deterministic condition is satisfied -\> `PASS`.
6.  If deterministic condition is violated -\> `FAIL`.

This is an engineering policy. It does not override the legal text. If
the source rule specifies a different legal treatment, encode that exact
treatment and cite it.

## 6. Rule categories for the prototype

The registry may include only rules that have been verified from
official source material. Candidate categories for implementation are:

-   manufacturer/packer/importer declarations,
-   commodity identification,
-   net quantity,
-   retail sale price/MRP-related declaration,
-   consumer care/contact declaration where applicable,
-   country-of-origin/import declarations where applicable,
-   unit sale price where applicable,
-   date-related declarations where applicable.

**Do not assume every category applies to every package.** The rule's
applicability predicate must be explicit and sourced.

## 7. Example of a verified rule pattern

The official 2021 amendment changed Rule 6(1)(e) wording and inserted
Rule 6(11), specifying unit-sale-price forms by quantity type. For
example, the amendment describes forms for grams/kilograms,
centimetres/metres, number, millilitres/litres. citeturn0search2

Engineering representation:

``` text
Rule: PCR-R6-11-UNIT-PRICE
Applicability:
  only when the current legal source establishes that unit sale price is applicable
Inputs:
  net quantity type
  net quantity value
  unit sale price declaration
Evaluator:
  compare declaration format against the sourced unit category
Missing input:
  UNKNOWN
Unreadable evidence:
  REVIEW
```

Do not hard-code this as a universal requirement without checking the
complete current rule and applicability context.

## 8. Evidence binding

A FAIL must be traceable to: - normalized fact(s), - evidence
image(s), - rule source.

A missing declaration should never be "proved" by the AI saying it is
absent. The UI should say: `Not visible in supplied evidence` when that
is what the evidence establishes.

## 9. Rule-set versioning

Example:

``` text
PCR-INDIA-2026-08-v1
```

Each inspection stores the exact version used.

When a legal amendment becomes effective: 1. add new rule/version; 2.
add migration/activation date; 3. add tests; 4. run regression suite; 5.
activate deliberately.

Never mutate a previously used rule version in place.

## 10. Rule tests

Every rule needs: - clear PASS fixture, - clear FAIL fixture, -
missing-input fixture, - conflicting-input fixture when applicable, -
NOT_APPLICABLE fixture when applicable, - boundary values.

Tests must operate on normalized facts, not images.

## 11. Legal-source ingestion workflow

For every legal update:

``` text
Official DCA/Gazette source
 -> human legal review
 -> source excerpt + metadata
 -> rule definition
 -> evaluator
 -> unit tests
 -> review
 -> activate version
```

The system should not scrape and auto-publish legal rules.

## 12. Current-source warning

The official DCA page lists: - 2025 Packaged Commodities amendments, -
2026 amendment dated 13 February 2026, - 2026 Second Amendment, - 2026
Third Amendment dated 29 May 2026. citeturn2search0

Therefore, before a demo is described as "current-law compliant," the
team must verify which 2026 amendments are effective on the demo date
and encode the applicable changes. Do not treat the old consolidated
2011/2023 material as the final current rule-set.

## 13. No legal inference

The engine can answer:
`Given these facts and this configured rule, the deterministic condition evaluated to FAIL.`

It must not answer: `The business has committed an offence.`

The latter is outside the prototype's authority.
