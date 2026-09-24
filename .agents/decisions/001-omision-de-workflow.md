---
name: 001-workflow-bypass-gate
status: accepted
date: 2026-09-23
domain: generic-harness
---

# ADR-001: Single user-issued workflow bypass gate

## Context

The harness gates ("enrich the plan", "execute the plan") require multiple user confirmations for each broad request, adding friction to small, clear changes. A mechanism is needed to speed up the cycle without allowing advances by inference.

## Decision

Add the exact phrase **"skip the workflow"** as the single exception authorizing the orchestrator to run the full cycle of a broad request (PENDING -> ENRICHED -> READY -> EXECUTED -> CLOSED) in a single pass, keeping the orchestrator's critical review, the DoD and per-phase reporting. The phrase must be spoken exactly by the user and is never inferred from ambiguous variants ("continue", "proceed", "do it"). The existing gates are not removed: the bypass subsumes them into a single authorization. The normative rule is recorded in RULES.md 0.13 (section 0.13 "Gates And Bypass"), WORKFLOW.md and orchestrator/instructions.md.

> Provenance note: this ADR was originally written in Spanish (name `001-omision-de-workflow`) when the harness normative language was Spanish. It was translated to English when the harness adopted the English language policy (see ADR-002, RULES.md 0.14). Its decision and acceptance date are unchanged.

## Consequences

- Positive: less friction for small, clear changes; control remains 100% explicit (literal phrase); DoD, persistent memory and per-phase reporting stay intact.
- Negative / trade-offs: a single phrase can cover several phases (fewer intermediate control points); the risk is mitigated by requiring the literal phrase and forbidding its inference.

## Alternatives Considered

- Using the simple flow for small changes: it already exists (1-2 changes), but it does not cover low-risk broad requests; discarded.
- Allowing "continue"/"proceed" as an advance authorization: contradicts the no-implicit-advance principle; discarded.
- Removing intermediate gates in general: takes away the user's phase-by-phase control; discarded.

## State

`proposed` -> `accepted` (2026-09-23: the user requested the rule and authorized its application in the same session).
