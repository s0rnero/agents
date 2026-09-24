---
name: agent-rules
description: Strict rules and operating protocols for project agents.
project: [PROJECT NAME] - generic agent harness
---

# Rules & Standards - Project Agents

These rules apply to any agent working in the codebase. They are the generic, shared part of the harness: they do not depend on the stack. Stack-specific rules (language, framework, styles, testing, architecture) live in `.agents/CODING_STANDARDS.md` and `.agents/DESIGN.md`, which each repo adapts.

## 0. Absolute Rules

### 0.1 Git

- Do not interact with Git unless the user explicitly requests it.
- If the user asks for a destructive Git operation, confirm before proceeding.

### 0.2 File Deletion

- Do not delete files or folders without explicit approval.
- If a file looks obsolete, report it and wait for instructions.

### 0.3 Scope Per Requirement

- Keep one main module (or unit) per requirement.
- Do not create extra submodules, classes or files unless explicitly requested or a clear technical need is explained to the user.
- Do not expand the scope with unsolicited changes.

### 0.4 Verification Scripts

- Do not automatically run project development, build, preview or test scripts.
- The real scripts are listed in `.agents/AGENTS.md` (section "Project Real Scripts"); do not invent commands that do not exist.
- If one needs to run, ask for permission or report that verification was left pending by project rule.

### 0.5 Subordinate Skills

- Skills are specialized references, not a higher authority than the local standard.
- If a skill contradicts `.agents/RULES.md`, `.agents/CODING_STANDARDS.md` or `.agents/DESIGN.md`, the local standard prevails.
- Always adapt generic skill examples (npm/npx/pnpm/yarn) to the real scripts and conventions of the repo.

### 0.6 Zero Duplication

- Do not duplicate code blocks.
- If a piece is needed in several places, extract a shared helper, utility or pattern when the scope allows it.

### 0.7 Current Code

- Use current official documentation when in doubt.
- Avoid deprecated APIs.

### 0.8 Secrets

- Secrets only via environment/secret manager; never in Git, builds, logs, responses or published code.

### 0.9 Stack Verification

- Before suggesting APIs or patterns, verify the repo baseline (language, framework, package manager versions) declared in `.agents/AGENTS.md`.
- Do not introduce unplanned major versions by inference; they require a migration plan and approval.
- Do not reintroduce standards from stacks that do not belong to the repo.

### 0.10 Plans As Persistent Memory

- The plans in `.agents/plans/` are the project's persistent memory: they record decisions, context, progress and the outcome of every change.
- Always complete the workflow: a plan is never abandoned or discarded; if it stops being viable, close it (`CLOSED`) documenting the reason.
- Never delete plans: do not remove the file, do not empty its content and do not archive it outside the repo. A closed plan remains as permanent history.
- Every change or modification of the project must be documented in the corresponding plan BEFORE being executed. Without a prior plan, nothing that requires a plan gets modified.

### 0.11 Definition Of Done

- No plan moves to `CLOSED` without meeting the DoD in `.agents/WORKFLOW.md` (section "Definition Of Done").
- The DoD is verified with the checklist in `.agents/subagents/reviewer.md` before closing.
- If the DoD is not met, the plan stays `EXECUTED` with the reason documented; it is not closed under pressure or by inference.

### 0.12 Architecture Decisions (ADR)

- Every decision that affects the project's architecture or design is recorded as an ADR in `.agents/decisions/` (template in `.agents/templates/adr.md`).
- Plans record the execution of a task; ADRs record the why of a decision and are permanent: they are never deleted nor edited retroactively; a change of decision is recorded as a new ADR that marks the previous one as `superseded`.
- An architecture decision made during a plan generates an ADR in addition to the plan closure.

### 0.13 Gates And Bypass

- Without the explicit gate phrases ("enrich the plan", "execute the plan"), nothing in the workflow advances or executes: no enrichment, no executor, no closing review.
- Single exception: if the user says exactly **"skip the workflow"**, the orchestrator may run the full cycle of that broad request (enrich -> review -> execute -> closing review + DoD -> CLOSED) in a single pass, without waiting for the intermediate phrases.
- "skip the workflow" is an exclusive, explicit user decision, word for word: it is never inferred from "continue", "go on", "do it" or similar.
- The bypass does not remove the gates: it subsumes them into a single authorization. Phase reporting and the DoD remain mandatory.

### 0.14 Language Policy

- All normative and documentation content of the harness (rules, workflow, roles, subagents, templates, decisions, scripts, README) is written in **English** for general compatibility.
- **User plans** in `.agents/plans/` are written in **the language the user writes their prompts in**.
- Canonical gate phrases are in English: **"enrich the plan"**, **"execute the plan"**, **"skip the workflow"**. When the user expresses the same gate phrase in their native language (e.g. "enriquece el plan", "ejecuta el plan", "omitir el workflow"), the orchestrator detects it and takes it as a valid instruction for the same transition. Ambiguous variants ("continue", "procede", "hazlo", "go on") never authorize anything; only the genuine gate phrase, in English or in the user's language, does.

## 1. Agent Workflow

The current flow is:

1. Analyze request and context.
2. Read rules, `.agents/CODING_STANDARDS.md`, relevant skills and affected files.
3. For broad work, create an MD plan in `PENDING` state and stop.
4. Move to Enrichment only when the user explicitly writes **"enrich the plan"** (or the genuine equivalent in their language).
5. Critically review the enriched plan; never mark `READY` automatically.
6. Move to Executor only when the user explicitly writes **"execute the plan"** (or the genuine equivalent in their language) and the plan is approved/`READY`.
7. Verify only with allowed or authorized commands.
8. Apply the closing review (`.agents/subagents/reviewer.md`) and meet the Definition of Done before marking `CLOSED`.
9. Report the final result.

**CRITICAL FLOW RULE:**

- NEVER run `Enrichment` or `Executor` automatically.
- The phrases **"enrich the plan"** and **"execute the plan"** are explicit gates and must not be inferred from "continue", "proceed", "investigate" or similar phrases.
- Investigating, contextualizing, answering questions or adjusting a plan does not change its state nor authorize the next phase.
- The user must review/approve the Enrichment result before the orchestrator marks it `READY`.
- Executor cannot receive a `PENDING` or `ENRICHED` plan.
- Build, dev, preview and test commands still require independent authorization per rule 0.4.
- A simple 1-2 change task that does not use a plan can be executed directly only when the user explicitly asked to implement that specific change; it must not silently become a plan flow.
- `CLOSED` requires the DoD met (rule 0.11); no plan is closed without the memory entry written.

There is no automatic history phase. Do not create history records unless explicitly requested by the user.

## 2. Stack & Structure

- The stack, repo structure and real scripts are declared in `.agents/AGENTS.md` (section "Project Profile").
- Code conventions are declared in `.agents/CODING_STANDARDS.md`.
- Architecture and design are declared in `.agents/DESIGN.md`.
- Do not invent stack rules by inference: if they are not written, ask or propose writing them.

## 3. Verification

- Use only safe read-only inspection commands without permission: file reading, search, listings and spot checks.
- Blocked scripts require explicit user authorization.
- If a verification is not run because of a rule, report it explicitly at closing.

## 4. Quick Reference

| Rule         | Do                                           | Avoid                                           |
| ------------ | -------------------------------------------- | ----------------------------------------------- |
| Git          | Wait for explicit request                    | Interacting without permission                  |
| Files        | Report before deleting                       | Deleting without approval                       |
| Scope        | Changes scoped to the requirement            | Extra submodules/files                          |
| Scripts      | Ask permission for verification              | Running blocked scripts automatically           |
| Skills       | Adapt to the stack and the local standard    | Letting them prevail over RULES/STANDARDS       |
| Stack        | Follow CODING_STANDARDS.md and DESIGN.md     | Inventing rules by inference                    |
| Secrets      | Environment/secret manager, redact in logs   | In Git, builds, logs, responses                 |
| Plans        | Document the change in the plan before executing; complete the workflow and close | Deleting, emptying or abandoning plans without a record |
| DoD          | Meet the checklist before CLOSED             | Closing a plan without DoD or memory entry      |
| Decisions    | ADR in `.agents/decisions/` (permanent)      | Leaving the decision only in the plan           |
| Gates        | Wait for "enrich the plan"/"execute the plan"; only "skip the workflow" allows the full cycle | Advancing by interpreting "continue"/"proceed" |
| Language     | Normative content in English; user plans in the user's language | Mixed languages in normative files |

**Last updated:** September 2026
**Version:** 1.2 (generic harness)
