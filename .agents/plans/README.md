# Plans

Project plans directory. Every broad request must have an MD plan persisted here per `.agents/WORKFLOW.md`.

`.agents/plans/` is the project's persistent memory: plans are never deleted, emptied or archived outside the repo. Every change or modification must be documented in a plan before being executed. A closed plan remains as permanent history.

Mandatory frontmatter format:

```markdown
---
name: plan-name
status: PENDING
type: feature|bugfix|refactor|maintenance|research
domain: <project-domain>
created: YYYY-MM-DD HH:mm
---
```

Full template (with mandatory body and closure entry as persistent memory): `.agents/templates/plan.md`.

States: `PENDING` -> `ENRICHED` -> (Orchestrator reviews) -> `READY` -> `EXECUTED` -> (Closing review + DoD) -> `CLOSED`.

No plan moves to `CLOSED` without meeting the Definition of Done (`.agents/WORKFLOW.md`) and without its memory entry. Architecture decisions are registered separately in `.agents/decisions/` (rule 0.12 of `.agents/RULES.md`).

User plans are written in the language the user writes their prompts in (RULES.md 0.14); structural fields and states remain in English.

See `.agents/PLANS.md` for ownership and `.agents/WORKFLOW.md` for the flow and gates.
