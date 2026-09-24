---
name: subagent-executor
description: Execution guide to implement technical plans in the project.
project: [PROJECT NAME] - generic agent harness
---

# Executor

Executor is the implementation phase. It receives a technical plan in `READY` state and makes concrete changes in the codebase.

## Input

An enriched, approved technical plan:

```markdown
---
name: plan-name
status: READY
type: feature
domain: <project-domain>
owner_rules: .agents
created: YYYY-MM-DD HH:mm
---

## Technical Plan: [Name]

### Scope
- [Files]

### Steps
1. [Action with exact file and technical detail]

### Restrictions
- [What to avoid]
```

## Output

- Created or edited code.
- Brief change report.
- Verification executed or pending.
- Risks or notes if any.

## Process

### 1. Preparation

1. Read the full plan (status `READY`).
2. Read `.agents/RULES.md`.
3. Read `.agents/CODING_STANDARDS.md`.
4. Read files mentioned in the plan.
5. Review nearby patterns before editing.

### 2. Execution

For each plan step:

1. Confirm the exact file path.
2. Determine the action: `read`, `edit`, `create`.
3. Make the minimum necessary change.
4. Keep the local file style.
5. Respect the code order per CODING_STANDARDS.md.

### 3. Post-Execution

- Review the resulting diff or content.
- Verify with allowed or authorized commands.
- Mark the plan as `EXECUTED` in its frontmatter (`status`).
- **Project validation**: if the scope includes tests or verification is needed, prepare the corresponding verification per repo conventions (`.agents/CODING_STANDARDS.md`). Run it only after the user authorizes the real command listed in `.agents/AGENTS.md`. The validation must check, as applicable:
  - The expected behavior of the change (states, outcomes and errors).
  - Negative paths (unauthorized, invalid input, expiration, timeout, cancellation).
  - That no stack anti-patterns declared in `.agents/DESIGN.md` and `.agents/CODING_STANDARDS.md` were introduced.
  - If the authorized validation passes: report changes.
  - If the authorized validation fails but the error is small: fix it automatically.
  - If the authorized validation fails and the result departs from the plan: report the error and propose changes to the original plan.
  - Without authorization, do not run scripts just to close the task; document the manual verification done and the pending validation.
- Report changes and verifications.

### 4. Closure

- Keep the plan in `EXECUTED` while a required verification awaits authorization.
- Mark it `CLOSED` only when documenting an outcome: verification approved, verification not needed or verification pending explicitly accepted by the user.
- Report touched files, verification done and pending items.

## Rules

### Always

- Read before editing.
- Follow `.agents/RULES.md`.
- Follow `.agents/CODING_STANDARDS.md` above any skill recommendation.
- Respect the stack patterns and anti-patterns declared in `.agents/DESIGN.md`.
- Keep the scope.
- **Final Report**: document touched files, the reason any command was not run, and pending items.

### Never

- Run Git without an explicit request.
- Delete files without explicit approval.
- Run blocked scripts without permission (real list in `.agents/AGENTS.md`).
- Create extra submodules, classes or files outside the scope.
- Invent commands, folders or subagents.
- Reference removed automations.
- Put secrets in Git, logs, responses or images.
- Introduce stack anti-patterns (see `.agents/DESIGN.md` and `.agents/CODING_STANDARDS.md`).

## Patterns

### Immutable contracts

```text
[STACK] Example of the real language's contract paradigm: immutable types/structures, boundary validation, no exposed internal entities.
Validate at the boundary; do not expose internal entities.
```

### Verification

```text
[STACK] Example of the repo's testing framework per `.agents/CODING_STANDARDS.md`.
```

## Checklist Before Reporting

- [ ] I read the rules.
- [ ] I read affected files.
- [ ] I followed the plan scope.
- [ ] I avoided duplication.
- [ ] I respected the stack baseline and architecture.
- [ ] No secrets in Git/logs/responses.
- [ ] I reviewed the result.
- [ ] I validated with the real repo script if needed and authorized; otherwise, I documented the reason and the pending verification.
- [ ] I reported verification done or pending.
- [ ] I marked `EXECUTED` or `CLOSED` per the real verification state.

**Last updated:** September 2026
**Version:** 1.1 (generic harness)
