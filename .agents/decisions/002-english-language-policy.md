---
name: 002-english-language-policy
status: accepted
date: 2026-09-23
domain: generic-harness
---

# ADR-002: English as the harness normative language

## Context

The harness was originally written in Spanish, which limits reuse by non-Spanish-speaking users and agents. For general compatibility the harness must be readable by any coding agent and any team, while the user still needs to interact in their own language when creating plans and issuing gate phrases.

## Decision

All normative and documentation content of the harness (rules, workflow, roles, subagents, templates, decisions, scripts, README) is written in **English**. User plans in `.agents/plans/` are written in **the language the user writes their prompts in**. Canonical gate phrases are English ("enrich the plan", "execute the plan", "skip the workflow"); when the user expresses the same gate phrase in their native language, the orchestrator detects it and takes it as valid for the same transition. Ambiguous variants never authorize anything. The policy is codified as RULES.md 0.14 and applied across the whole harness.

## Consequences

- Positive: maximum compatibility for any language or project; agents of any origin can consume the rules; the user keeps working in their native language where it matters (plans, gates).
- Negative / trade-offs: Spanish-speaking users read normative docs in English; ADR-001 was translated from its original Spanish, keeping a provenance note.

## Alternatives Considered

- Bilingual files (English + Spanish side by side): doubles maintenance and drifts over time; discarded.
- Keeping Spanish as canonical with English translations: inverts the compatibility goal; discarded.
- Translating only the core and leaving per-repo files in Spanish: inconsistent surface for external agents; discarded.

## State

`proposed` -> `accepted` (2026-09-23: requested by the user and applied in the same session).
