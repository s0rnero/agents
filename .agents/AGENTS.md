---
name: agents-system-index
description: Central index of the agent system and the project's operating context.
project: [PROJECT NAME] - generic agent harness
---

# Agent System - Central Index

This file is the entry point for any AI working in this project. It defines the codebase context, the current flow and the rules that must be respected before touching code.

> **Bootstrap note:** this is the generic harness shared by all repositories. The core (workflow, roles, gates, plan cycle, skills) is identical in every repo. The only per-repo adaptations are this profile, `.agents/CODING_STANDARDS.md` and `.agents/DESIGN.md`. See `.agents/bootstrap/INSTALL.md`.

## 1. Project Profile

> [STACK] Fill per repo. Describe the project, its real stack and structure. Example stack table:

| Technology | Use |
| --- | --- |
| [Language/Framework] | [What it is used for] |
| [Build/packages] | [Manager and scripts] |
| [Testing] | [Framework and when it runs] |

### Stack

- [Fill in: languages, frameworks, package manager, build/test tools]

### Project Structure

```text
[Fill in: main repo directory tree]
```

### Project Real Scripts

> [STACK] List the real build/dev/test/preview scripts. Do not invent commands that do not exist.

| Purpose | Command |
| --- | --- |
| [Build] | [real command] |
| [Test] | [real command] |
| [Dev/Preview] | [real command] |

## 2. Agent System Goal

Keep a consistent way of working across all repos: understand first, plan just enough, implement with a clear scope and report changes without inventing external processes.

## 3. `.agents` Structure

```text
.agents/
|-- AGENTS.md                      # Central index (this file)
|-- RULES.md                       # Generic operating rules of the project
|-- CODING_STANDARDS.md            # Code conventions for the stack
|-- DESIGN.md                      # Architecture and design for the stack
|-- WORKFLOW.md                    # Current flow + gates + Definition of Done
|-- PLANS.md                       # Plan ownership (persistent memory)
|-- manifest.json                  # Harness version and lists (install/update)
|-- plans/                         # Project plans (states per WORKFLOW.md)
|-- decisions/                     # Architecture decisions (ADR, permanent)
|-- templates/                     # Templates: plan.md and adr.md
|-- orchestrator/
|   `-- instructions.md            # Orchestrator role
|-- subagents/
|   |-- enrichment-process.md      # Guide to turn a request into a technical plan
|   |-- executor.md                # Guide to implement a technical plan
|   `-- reviewer.md                # Closing checklist (DoD) before CLOSED
|-- skills/                        # Registered skills (autoskills + manual)
|   `-- README.md                  # Registry and onboarding process
`-- bootstrap/
    `-- INSTALL.md                 # How to install/update this harness in a repo
```

Important notes:

- There is no commands file; conversational shortcuts must not be invented.
- There is no automatic history phase; do not create history records unless the user asks for that system again.
- `.agents/plans/` keeps the plans; broad requests require a persisted plan per `.agents/WORKFLOW.md`.

## 4. Active Roles

| Role           | File                                      | Function                                                                           |
| -------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Orchestrator   | `.agents/orchestrator/instructions.md`    | Receives the request, decides the flow, coordinates context, implementation and reporting |
| Enrichment     | `.agents/subagents/enrichment-process.md` | Turns a broad request into an executable technical plan                             |
| Executor       | `.agents/subagents/executor.md`           | Executes concrete changes following a plan or defined scope                         |
| Review         | `.agents/subagents/reviewer.md`           | Closing checklist (DoD) before `CLOSED`                                             |
| Global rules   | `.agents/RULES.md`                        | Shared operating restrictions                                                       |
| Skills         | `.agents/skills/README.md`                | Local and community registered skills                                               |

## 5. Current Flow

```text
User
  -> Orchestrator contextualizes the request
  -> Reads rules, skills and relevant files
  -> Classifies scope:
     - Question -> Answer without changing states
     - Simple without plan -> Implement only if the user explicitly asks
     - Broad -> Create MD plan in PENDING and stop
  -> "enrich the plan" -> Enrichment -> ENRICHED
  -> Orchestrator review/approval -> READY
  -> "execute the plan" -> Executor -> EXECUTED
  -> Closing review (reviewer.md) + DoD -> CLOSED
  -> Report changes, touched files and verifications
```

Canonical gate phrases are in English (RULES.md 0.14): "enrich the plan", "execute the plan" and "skip the workflow". A genuine equivalent in the user's language is detected and accepted; ambiguous variants never authorize transitions.

### Authorization Gates

For any broad request with a plan:

- **"enrich the plan"** authorizes exclusively the transition `PENDING -> ENRICHED`.
- **"execute the plan"** authorizes exclusively the transition `READY -> EXECUTED` through Executor.
- "Investigate", "contextualize", "continue", "proceed" or "make a plan" do not by themselves authorize any of those transitions.
- Research may update the plan analysis without changing its state.
- The orchestrator must show in every reply whether the plan is in `PENDING`, `ENRICHED`, `READY`, `EXECUTED` or `CLOSED`.
- `CLOSED` is reached by meeting the Definition of Done (`.agents/WORKFLOW.md`); it is not authorized by a phrase.

The flow is conversational and executable in the current session. It does not depend on watchers, conversational shortcuts, hidden scripts or nonexistent subagents.

## 6. Absolute Rules

These rules summarize `.agents/RULES.md`; when in doubt, `.agents/RULES.md` wins.

- Do not use Git unless the user explicitly requests it.
- Do not delete files or folders without explicit approval.
- Keep the scope of a task in one main module per requirement, unless instructed otherwise.
- Do not run development, build, preview or test scripts without user permission (the real script list lives in section 1).
- Do not invent commands, files, conversational shortcuts or nonexistent subagents.
- Never put secrets in Git, logs, responses or images.
- Zero duplication: if a piece is needed in several places, extract a shared helper, utility or pattern.
- Use current official documentation; avoid deprecated APIs.
- Skills are subordinate references: a skill never prevails over `.agents/RULES.md`, `.agents/CODING_STANDARDS.md` or `.agents/DESIGN.md`.
- No plan moves to `CLOSED` without meeting the Definition of Done (`.agents/WORKFLOW.md`) and without its memory entry.
- Any stack-specific rule (language, framework, styles, testing) is defined in `.agents/CODING_STANDARDS.md` and `.agents/DESIGN.md`; never invent it by inference.

## 7. Available Skills

Skills are resolved per stack via **autoskills** (`npx autoskills`): it scans the repo, detects the technologies and installs the curated skills from the audited registry into `.agents/skills/`. See `.agents/skills/README.md`.

| How | Command |
| --- | --- |
| Preview without installing | `npx autoskills --dry-run` |
| Install the detected ones | `npx autoskills -y` |
| Add a manual skill | `npx skills find <query>` / `npx skills add <owner/repo> --list` |

Skills may contain generic examples from their original sources (with `npm`, `npx`, `pnpm`, `yarn` or other scripts that do not exist in this repo). In this project, always adapt those examples to the real scripts declared in section 1 and the conventions of `.agents/CODING_STANDARDS.md`.

Guideline priority: a skill never prevails over `.agents/RULES.md`, `.agents/CODING_STANDARDS.md` or `.agents/DESIGN.md`. Skills are specialized references, not a higher authority than the local standard.

## 8. Orchestrator Checklist

Before acting:

- Understand the exact user request.
- Read `.agents/RULES.md` and the relevant files.
- Apply `.agents/CODING_STANDARDS.md` above any skill recommendation.
- Check whether the task is a question, bug, feature, refactor or maintenance.
- Review existing plans in `.agents/plans/` before creating a new one.
- Load applicable skills only when they help the work (see `.agents/skills/README.md`).
- Make scoped, consistent changes to the codebase.
- Report modified files and executed or not-executed tests/commands.

## 9. Quick Reference

| For...                    | See                                        |
| ------------------------- | ------------------------------------------ |
| Understanding the system  | `.agents/AGENTS.md`                        |
| Following the current flow | `.agents/WORKFLOW.md`                     |
| Acting as orchestrator    | `.agents/orchestrator/instructions.md`     |
| Applying technical rules  | `.agents/RULES.md`                         |
| Writing code              | `.agents/CODING_STANDARDS.md`              |
| Architecture and design   | `.agents/DESIGN.md`                        |
| Preparing a technical plan | `.agents/subagents/enrichment-process.md` |
| Executing a plan          | `.agents/subagents/executor.md`            |
| Reviewing before CLOSED   | `.agents/subagents/reviewer.md`            |
| Definition of Done        | `.agents/WORKFLOW.md`                      |
| Architecture decisions    | `.agents/decisions/`                       |
| Plan/ADR templates        | `.agents/templates/`                       |
| Stack skills              | `.agents/skills/README.md`                 |
| Installing/updating       | `.agents/bootstrap/INSTALL.md`             |

**Last updated:** September 2026
**Version:** 1.2 (generic harness)
