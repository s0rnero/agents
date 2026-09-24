---
name: enrichment-process
description: Enrichment guide to turn general requests into executable technical plans.
project: [PROJECT NAME] - generic agent harness
---

# Enrichment Process

Enrichment is the role/subagent in charge of the analysis phase. Its goal is to turn a plan in `PENDING` state into a sufficiently clear technical plan, updating its state to `ENRICHED` when done.

## Input

An MD plan created by the orchestrator:

```markdown
---
name: plan-name
status: PENDING
type: feature
domain: <project-domain>
owner_rules: .agents
created: YYYY-MM-DD HH:mm
---

# Plan: [Name]

## Objective

- [What the user wants to achieve]

## Scope

- [Affected files]

## Restrictions

- [What not to do]

## Steps

1. [General step]

## Verification

- [How to verify]
```

## Output

An enriched technical plan:

```markdown
---
name: plan-name
status: ENRICHED
type: feature
domain: <project-domain>
owner_rules: .agents
created: YYYY-MM-DD HH:mm
---

# Technical Plan: [Name]

### Analysis

- Objective:
- Scope:
- Files:
- Risks:

### Changes

- [Concrete change per file]

### Restrictions

- [What to avoid]

### Steps

1. [Executable step with exact file, action and technical detail]

### Verification

- [Authorized command or manual review]

## Closure (persistent memory)

> Fill in when closing the plan. Without this entry the plan does not move to CLOSED (DoD).
```

## Process

### 1. Read the provided plan MD

Read the full plan including:

- Clear user objective.
- Defined scope (files, modules).
- Explicit restrictions.
- General steps.

### 2. Research Additional Context

Read at minimum:

| What to look for  | Where                                           |
| ----------------- | ----------------------------------------------- |
| Rules             | `.agents/RULES.md`                              |
| Standards         | `.agents/CODING_STANDARDS.md`                   |
| Architecture      | `.agents/DESIGN.md`                             |
| Repo profile      | `.agents/AGENTS.md` (stack, structure, scripts) |
| Existing plans    | `.agents/plans/`                                |
| Affected code     | Source files mentioned in the plan              |
| Relevant skills   | `.agents/skills/` (see README)                  |

### 3. Analyze And Detail

- Identify the user's exact objective.
- Determine affected files and dependencies.
- Review existing patterns before proposing changes.
- Flag risks or possible breaking changes.
- Strictly keep the original plan scope.

Every step must have:

- Exact file.
- Action: `read`, `edit`, `create`.
- Concrete technical detail.
- Applicable restrictions.

### 4. Validate the plan against guidelines

Before emitting the plan as output, verify:

| Guideline        | What to validate                                                                                                                                                          | Reference                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Architecture     | Changes respect the declared layers, modules and patterns                                                                                                                | `.agents/DESIGN.md`       |
| Coding standards | Structure, naming, contracts and code order per the stack                                                                                                                | `.agents/CODING_STANDARDS.md` |
| Rules            | No git, no blocked scripts, scope per requirement, secrets via environment, subordinate skills                                                                           | `.agents/RULES.md`        |
| Skills           | If the plan touches the repo stack, load the relevant skill from `.agents/skills/` and verify the plan does not contradict its recommendations, unless they contradict `.agents/CODING_STANDARDS.md` | `.agents/skills/` |
| Language         | Normative content in English; user plans in the language the user writes their prompts in (RULES.md 0.14)                                                                | `.agents/RULES.md` 0.14   |

If the plan violates any guideline, correct it before emitting it. Do not pass plans that fail this validation.

Priority: `.agents/CODING_STANDARDS.md` prevails over any skill. Skills extend context but do not replace the local standard.

### 5. Mark As ENRICHED

Update the plan frontmatter with `status: ENRICHED` and return the result to the orchestrator.

## Rules

### Always

- Read the full plan MD before enriching.
- Consult `.agents/RULES.md`.
- Consult `.agents/CODING_STANDARDS.md`.
- Consult `.agents/DESIGN.md`.
- Read existing files before proposing edits.
- Use skills only when they add context.
- Be detailed without inflating the scope.
- Include the expected verification.
- Strictly keep the original plan scope (no unsolicited changes).

### Never

- Run code during enrichment.
- Invent files or commands.
- Reference removed automations.
- Propose nonexistent conversational shortcuts.
- Leave the user's scope.
- Add features or changes not requested in the original plan.

## Checklist

- [ ] I read the full plan MD.
- [ ] I read rules, standards and design.
- [ ] I read the repo profile in `.agents/AGENTS.md`.
- [ ] I read affected files.
- [ ] I reviewed relevant skills.
- [ ] I kept the exact scope of the original plan.
- [ ] I listed executable steps with exact files.
- [ ] I included restrictions.
- [ ] I included verification.
- [ ] I validated against `.agents/DESIGN.md`.
- [ ] I validated against `.agents/CODING_STANDARDS.md`.
- [ ] I validated against applicable skills.
- [ ] I marked the state as `ENRICHED`.

**Last updated:** September 2026
**Version:** 1.1 (generic harness)
