# Plan Ownership

`.agents/plans/` is the only plan location of the project. All plans belong to this repository and are governed by `.agents/WORKFLOW.md`.

## Plans Are The Project's Persistent Memory

- `.agents/plans/` is the project's only persistent memory: it records decisions, context, progress and the outcome of every change.
- The workflow must always be completed: a plan is never abandoned or discarded. If it stops being viable, it is closed (`CLOSED`) documenting the reason.
- NEVER delete plans: do not remove the file, do not empty its content and do not archive it outside the repo. A closed plan remains as permanent history.
- Every change or modification of the project (code, configuration, structure, rules) must be documented in a plan BEFORE being executed: the plan is created/updated first and only then executed through the "execute the plan" gate.
- If a change already has a plan, no modification is executed outside that plan and its gates.

## Format

- New plans must declare in their frontmatter the domain and the rules that govern them:

```yaml
domain: <project-domain>
owner_rules: .agents
```

- When creating a plan, review `.agents/plans/` first to avoid duplicating existing plans.
- Historical copies are not deleted without inventorying references and explicit approval.
- Gates and states follow `.agents/WORKFLOW.md`:

`PENDING` -> `ENRICHED` -> (Orchestrator reviews) -> `READY` -> `EXECUTED` -> `CLOSED`

- Transitions are authorized only by the explicit phrases **"enrich the plan"** and **"execute the plan"** (canonical, in English per RULES.md 0.14; a genuine equivalent in the user's language is detected and accepted; ambiguous variants never count).
