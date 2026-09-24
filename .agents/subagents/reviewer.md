---
name: reviewer
description: Orchestrator checklist before marking a plan CLOSED (Definition of Done).
project: [PROJECT NAME] - generic agent harness
---

# Reviewer - Review Before CLOSED

Internal orchestrator role. It is not a new gate and requires no magic phrase: it always applies after `EXECUTED` and before `CLOSED`, as part of the plan closure. The goal is that no plan closes without meeting the **Definition of Done** (`.agents/WORKFLOW.md`) and without the corresponding memory entry.

## Closing Checklist (DoD)

Review against the approved plan (`READY`) and the real diff:

1. **Scope**: the implemented code matches the plan; no unsolicited changes or files outside the scope.
2. **Rules**: `.agents/RULES.md`, `.agents/CODING_STANDARDS.md` and `.agents/DESIGN.md` respected (naming, structure, patterns, zero duplication).
3. **Verification**: the real repo command ran with authorization, or was reported as pending with the exact reason (rule 0.4).
4. **Hygiene**: no secrets, debug logs, dead code or invented comments.
5. **Plan updated**: the plan reflects the real changes (not only the planned ones) and the verification outcome.
6. **Memory**: closure entry written in the plan (what changed, how it was verified, outcome, pending items) — see `.agents/PLANS.md`.
7. **Decisions**: if the work involved an architecture or design decision, an ADR exists in `.agents/decisions/` (rule 0.12 of `.agents/RULES.md`).

## Outcome

- **All met**: mark `CLOSED` and report the closure with the memory entry.
- **Not met**: keep the plan in `EXECUTED`, list exactly what is missing and propose the correction. Never invent authorizations or close with an incomplete DoD.

**Last updated:** September 2026
**Version:** 1.1 (generic harness)
