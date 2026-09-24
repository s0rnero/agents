---
name: workflow-automation
description: Current agent system workflow. It does not rely on removed automations.
project: [PROJECT NAME] - generic agent harness
---

# Agent System Workflow

This document describes the real flow the orchestrator must follow within the current session. The system uses no conversational shortcuts, automatic watchers or automatic history phases. This flow is identical in every repository using this harness.

## Base Principle

The orchestrator must not simulate automations that do not exist. If a task requires code, the agent reads context, prepares the scope, implements and reports. If a task requires a verification the rules block, ask for permission or leave it explicitly reported.

Without explicit gates nothing in the workflow advances; the single exception is the exact phrase "skip the workflow" (see Explicit Transition Gates and RULES.md 0.13).

## Main Flow

```text
1. Receive user request
2. Classify: question, bug, feature, refactor, maintenance or research
3. Read minimal context:
   - .agents/AGENTS.md
   - .agents/RULES.md
   - .agents/CODING_STANDARDS.md
   - affected source files
   - relevant skill, if any
4. Classify scope:
   - Question -> answer without changing states or files
   - Simple (1-2 changes) -> execute only if the user explicitly asks to implement
   - Broad (multiple changes/files) -> create a PENDING plan and stop
5. Enrich only with the explicit phrase: "enrich the plan"
6. Execute only with the explicit phrase: "execute the plan", after reviewing/approving the plan
7. Verify with allowed or authorized commands
8. Apply the closing review (`.agents/subagents/reviewer.md`) and meet the DoD before `CLOSED`
9. Report the final result
```

## Explicit Transition Gates

These gates are mandatory for work that uses `.agents/plans/`:

- Creating or updating an initial plan leaves it `PENDING`; it does not start enrichment or execution. For broad requests the persisted plan is mandatory.
- Researching, reading files, consulting documentation or reproducing a problem does not change the plan state.
- The phrase **"enrich the plan"** is the authorization to move from `PENDING` to `ENRICHED` and invoke Enrichment. Ambiguous variants such as "investigate", "continue" or "proceed" do not substitute this authorization.
- After `ENRICHED`, the orchestrator must review the content and explain any important decision. It is never marked `READY` automatically.
- The phrase **"execute the plan"** is the authorization to move from `READY` to execution and invoke Executor. Ambiguous variants do not substitute this authorization.
- Single exception: the phrase **"skip the workflow"**, spoken exactly by the user, authorizes running the full cycle of a broad request (PENDING -> ENRICHED -> READY -> EXECUTED -> CLOSED) without waiting for the intermediate phrases, keeping the orchestrator review, DoD and per-phase reporting. It is never inferred from ambiguous variants.
- Executor cannot be invoked from a `PENDING` or `ENRICHED` plan.
- If the user first asks to research, answer or adjust the plan, the flow stays in its current state and project files are not edited.
- Scripts blocked by `RULES.md` still require independent authorization even when plan execution is authorized.
- `CLOSED` is not authorized by a phrase: it is reached only when the DoD is met and the memory entry is written.

Canonical gate phrases are in English (RULES.md 0.14). If the user expresses the same gate phrase in their native language, the orchestrator detects it and takes it as valid for the same transition; ambiguous variants never count.

The orchestrator must confirm in its reply which gate it is attending and stop when the required phrase is absent.

If a skill contradicts `.agents/CODING_STANDARDS.md`, the flow must follow `.agents/CODING_STANDARDS.md`. Skills only complement local judgment.

## Simple Flow (1-2 changes)

For small, clear requests:

```text
1. Read minimal context (rules, standards, files)
2. Implement the change directly
3. Verify inline: RULES.md, CODING_STANDARDS.md, DESIGN.md
4. Report the result
```

No MD plan is created. No subagents are invoked. The orchestrator assumes all verifications.

## Full Plan Flow (Broad Request)

For requests with multiple steps or touching multiple files:

```text
1. Create MD plan in .agents/plans/
   - Frontmatter: name, status (PENDING), type, domain, owner_rules, created
   - Content: objective, scope, files, restrictions, steps, verification
2. Wait for the explicit phrase "enrich the plan" and invoke Enrichment
   - Pass plan MD + context (rules, standards, source files)
   - Enrichment turns the plan into detailed technical steps
3. Orchestrator critical review (MANDATORY)
   - Verify it fulfills exactly what the user asked
   - Verify it invents no unsolicited changes
   - Verify it respects RULES.md, CODING_STANDARDS.md, DESIGN.md
   - Verify it introduces no stack anti-patterns (see CODING_STANDARDS.md)
   - If it fails: reject, correct or re-enrich
4. If approved: mark READY and wait for the explicit phrase "execute the plan"
5. After that phrase, invoke Executor to implement the changes
6. Record `EXECUTED` when the implementation finished (verification may be pending)
7. Apply the closing review (checklist in `.agents/subagents/reviewer.md`) and meet the **Definition of Done** before `CLOSED`
```

## Using Plans

`.agents/plans/` is mandatory for broad requests.

### When to create an MD plan

- The request has 3+ steps or touches multiple files/areas.
- The user explicitly asks for a plan.
- The change is complex enough to need technical enrichment.
- The task may be resumed later.

### When NOT to create an MD plan

- A simple 1-2 step change (1-2 files, point fix).
- An informational question.
- When creating the plan would add noise without value.

### Plan Format

Use `.agents/templates/plan.md` as the base (it includes the closure entry as persistent memory).

```markdown
---
name: plan-name
status: PENDING
type: feature|bugfix|refactor|maintenance|research
domain: <project-domain>
owner_rules: .agents
created: YYYY-MM-DD HH:mm
---

# Plan: [Name]

## Objective
- [Expected outcome]

## Scope
- [Affected files or modules]

## Restrictions
- [What not to do]

## Steps
1. [Executable step]

## Verification
- [Allowed/authorized command or manual review]
```

User plans are written in the language the user writes their prompts in (RULES.md 0.14). Structural fields (`name`, `status`, `type`, `domain`, `owner_rules`, `created`) and lifecycle states remain in English.

### Plan States (Lifecycle)

- **PENDING:** Awaiting enrichment.
- **ENRICHED:** Enriched by the subagent, awaiting orchestrator review.
- **READY:** Reviewed and approved by the orchestrator, ready to execute.
- **EXECUTED:** Implemented; verification may be pending.
- **CLOSED:** Finished meeting the **Definition of Done** (next section) and with the verification outcome documented: approved, not needed or pending explicitly accepted by the user. The closure entry remains as persistent memory.

**Cycle:** `PENDING` -> `ENRICHED` -> (Orchestrator reviews) -> `READY` -> `EXECUTED` -> (Closing review + DoD) -> `CLOSED`

## Definition Of Done (DoD)

No plan moves to `CLOSED` without meeting the DoD. Mandatory checklist:

- [ ] The implemented code matches the approved plan: no unsolicited changes or extra scope.
- [ ] Real repo verification ran with an authorized command, or was reported as pending per rule 0.4 with the exact reason.
- [ ] No secrets, debug logs, dead code or duplication were introduced.
- [ ] Touched files respect `.agents/CODING_STANDARDS.md` and `.agents/DESIGN.md`.
- [ ] The plan was updated with the real changes and the verification outcome.
- [ ] The plan closure entry was written as persistent memory (see `.agents/PLANS.md`): what changed, how it was verified, outcome and pending items.

`CLOSED` without DoD is a rule violation. The orchestrator applies the checklist in `.agents/subagents/reviewer.md` before closing.

## Enrichment

Use `.agents/subagents/enrichment-process.md` as the guide when the request is broad. This phase can only start after the user explicitly writes **"enrich the plan"** (or the genuine equivalent in their language). Enrichment analyzes, researches and details; it does not implement code nor run scripts.

Input:

- Plan MD + additional context.

Output:

- Enriched technical plan with files, actions, restrictions and verification.

The orchestrator MUST critically review the output before approving.

## Executor

Use `.agents/subagents/executor.md` as the guide for implementation. This phase can only start after the plan is `READY` and the user explicitly writes **"execute the plan"** (or the genuine equivalent in their language). Executor implements and verifies within the approved scope; it does not redefine the plan.

Responsibilities:

- Read files before editing them.
- Touch only the necessary scope.
- Follow `.agents/RULES.md` and `.agents/CODING_STANDARDS.md`.
- Pass the stack rules quality gate before reporting.
- Run the real repo verification (listed in `.agents/AGENTS.md`) only if the user authorized the corresponding command.
- Report changes.

## Verification

The real project scripts are listed in `.agents/AGENTS.md` (section "Project Real Scripts"). Current rule: do not run build/dev/test/preview scripts automatically. If verification is needed, ask the user for permission or report it as pending by restriction.

Safe read-only inspection commands such as file reading, search, listings and spot checks may be used to contextualize the work.

## Final Report

The final report must include:

- What changed.
- Modified files.
- Verification executed or the reason it was not.
- Risks or pending items, if any.

Do not reference automations, files or shortcuts that do not exist in the current `.agents` tree.

## Summarized Flow

```text
User -> Orchestrator -> Context
  -> [Simple?] -> Execute directly -> Inline verification -> Report
  -> [Broad?] -> MD Plan -> Enrichment -> Orchestrator review
                                  -> Executor -> Closing review + DoD -> CLOSED -> Report
```

**Last updated:** September 2026
**Version:** 1.2 (generic harness)
