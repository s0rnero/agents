# Agents Harness

A generic `.agents` harness that boots the same AI agent workflow in every repository: one conversational flow, explicit authorization gates, plans as persistent memory and stack-adaptive conventions. Install it once and every coding agent (Codex, Copilot, Cursor, Claude Code, or this same harness orchestrator) works with the same rules, the same plan lifecycle and the same Definition of Done — in any language, on any project.

Inspired by the `.agents` systems of **Khatarsis** (Vue 3, v3.3) and **Alytos** (Java/Spring, v1.0).

## What it is

A set of plain-Markdown normative files (`.agents/`) plus a small installer (`setup.mjs`). The core — rules, workflow, roles, templates — is **stack-neutral** and identical in every repository. Each repo adapts only three files (`AGENTS.md` profile, `CODING_STANDARDS.md`, `DESIGN.md`) through `[STACK]` markers, so the harness supports any language or project.

## How the workflow works

Every request is classified by the **Orchestrator** (the coordinating agent role):

| Request type | Behavior |
| --- | --- |
| Question | Answered directly, nothing changes |
| Simple (1-2 changes) | Implemented directly with inline verification |
| Broad (3+ steps, multiple files) | Requires a **plan** in `.agents/plans/` and follows the gated cycle below |

### Plan lifecycle and gates

```text
PENDING -> ENRICHED -> (Orchestrator reviews) -> READY -> EXECUTED -> (DoD review) -> CLOSED
```

Transitions are **never** inferred from "continue" or "proceed". Only these exact phrases authorize them:

| Phrase | Effect |
| --- | --- |
| **"enrich the plan"** | `PENDING -> ENRICHED`: Enrichment turns the plan into detailed technical steps |
| **"execute the plan"** | `READY -> EXECUTED`: Executor implements within the approved scope |
| **"skip the workflow"** | Single pass through the whole cycle (enrich -> review -> execute -> close), keeping DoD and per-phase reporting |

Canonical phrases are in English, but a genuine equivalent in the user's native language is detected and accepted (e.g. "enriquece el plan"). Ambiguous variants never count. Normative content is written in English; **user plans are written in the language the user writes their prompts in** (RULES 0.14).

### Key rules the orchestrator follows

- **No Git without an explicit request**; no file deletions without approval.
- **No build/dev/test/preview scripts** run without permission; real scripts are declared in `.agents/AGENTS.md`.
- **Plans are persistent memory**: never deleted, every change documented in a plan before execution; `CLOSED` requires the **Definition of Done** (scope match, authorized verification, no secrets/dead code, memory entry).
- **Architecture decisions become ADRs** in `.agents/decisions/` — permanent, never edited retroactively.
- **Skills are subordinate**: a skill never prevails over `RULES.md`, `CODING_STANDARDS.md` or `DESIGN.md`.
- **Zero duplication**, current (non-deprecated) APIs, secrets only via environment/secret manager.

Full detail: `.agents/RULES.md` (rules), `.agents/WORKFLOW.md` (flow, gates, DoD), `.agents/orchestrator/instructions.md` (orchestrator role) and `.agents/subagents/` (Enrichment, Executor, Reviewer guides).

## Install

### From npm (short command)

```bash
npx agents-setup-sorno ../repo-name
# or: bunx agents-setup-sorno ../repo-name
```

This copies the core into `../repo-name/.agents/`, creates the per-repo files only if missing, detects the stack (package.json, Gradle/Maven, Go, Rust, Python), fills the `AGENTS.md` profile, generates the root compatibility layer (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`) and runs an autoskills preview (add `--skills` to install skills). It registers the harness origin in `.agents/manifest.json`.

Useful flags: `--dry-run` (show, don't write) · `--skip-skills` · `--no-fill` · `--no-compat`.

### From source (without npm)

```bash
node scripts/setup.mjs ../repo-name
node scripts/setup.mjs ../repo-name --from https://github.com/<user>/<repo>.git
```

## Update from npm

The install registers the origin, so updating is one command:

```bash
npx agents-setup-sorno ../repo-name update
```

`update` overwrites only the **core**, compares versions and **never touches** your adapted `AGENTS.md`/`CODING_STANDARDS.md`/`DESIGN.md`, your plans (`.agents/plans/`), decisions (`.agents/decisions/`) or skills (`.agents/skills/`, including `skills-lock.json`).

| Type | Files | On update |
| --- | --- | --- |
| Core | rules, workflow, roles, subagents, templates, scripts, manifest | Overwritten |
| Per repo | `AGENTS.md`, `CODING_STANDARDS.md`, `DESIGN.md` | Created only if missing |
| Generated | root `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, copilot-instructions | Regenerated |
| Preserved | plans, decisions, skills, anything unlisted | Never touched |

To update from another source: `npx agents-setup-sorno ../repo-name update --from <url-or-path>`.

## Verify

```bash
node scripts/verify.mjs ../repo-name   # health check: core, plans, ADRs, compat, skills
```

## Structure

```text
.agents/
|-- AGENTS.md                      # Central index (project profile + system)
|-- RULES.md                       # Generic operating rules
|-- CODING_STANDARDS.md            # Code conventions (adapt per repo)
|-- DESIGN.md                      # Architecture and design (adapt per repo)
|-- WORKFLOW.md                    # Flow + gates + DoD + plan cycle
|-- PLANS.md                       # Plan ownership (persistent memory)
|-- manifest.json                  # Harness version and lists (install/update)
|-- plans/                         # Project plans (persistent memory)
|-- decisions/                     # Architecture decisions (ADR, permanent)
|-- templates/                     # Templates: plan.md and adr.md
|-- orchestrator/instructions.md   # Orchestrator role
|-- subagents/                     # Enrichment, Executor and Reviewer (DoD)
|-- skills/README.md               # Skills registry + autoskills
`-- bootstrap/INSTALL.md           # Full install/update guide
scripts/
|-- setup.mjs                      # Install/update by command (install/update, --from)
|-- verify.mjs                     # Health check of the installed harness
`-- install.sh                     # setup.mjs wrapper with bash fallback
```

## Sources

- Khatarsis: agent system v3.3 (Vue 3 + TypeScript + Tailwind + Bun).
- Alytos: agent system v1.0 (Java 21 + Spring Boot 4 + WebFlux).
- autoskills: `midudev/autoskills` (`npx autoskills`), audited registry with SHA-256 manifest.

**Version:** 1.2 (generic harness) · **License:** MIT
