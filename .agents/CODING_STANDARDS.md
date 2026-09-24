---
name: coding-standards
description: Code writing conventions for the project.
project: [PROJECT NAME] - generic agent harness
---

# Coding Standards

> Code writing conventions. This file is the generic harness template: adapt each section to the real repo stack before using it. Whatever is not adapted here must not be invented by inference; ask or propose writing it.

## 1. File Structure

> [STACK] Define the structural order of the stack's files (e.g. block/function/class order in a file, folder layout per domain/layer).

1. [Initial block/file]
2. [Next block/file]
3. [Final block/file]

Rules:

- Keep a consistent definition order: imports, types/contracts, state, derived logic, effects, functions (helpers first, orchestrators last), public API.
- One responsibility per file when the language allows it; do not mix types and constants in the same file without a reason.

## 2. Naming Conventions

> [STACK] Adjust the examples to the real language/framework. Generic base table:

| Context                       | Convention                 | Example                              |
| ----------------------------- | -------------------------- | ------------------------------------ |
| Code files                    | [PascalCase/camelCase/kebab-case per stack] | [example]           |
| Variables and functions       | camelCase                  | `localModelValue`, `handleClick`     |
| Types, interfaces, classes    | PascalCase                 | `UserProps`, `CreateUserRequest`     |
| Booleans                      | `is`, `has`, `can` prefix  | `isLoading`, `hasError`, `canSubmit` |
| Handlers/events               | `handle` + action          | `handleSubmit`, `handleDismiss`      |
| Constants                     | UPPER_SNAKE_CASE or const  | `MAX_RETRIES`                        |
| Data structures               | `record`/`interface`/`type` per stack | immutable contracts       |

## 3. Contracts And Data

- Prefer immutable types/contracts (per the language) for data crossing boundaries (requests/responses, events).
- Do not expose internal persistence entities as public responses.
- Validate input at the boundary (the stack's validation framework) and return structured errors (`code`, `message`, `requestId`) without internal details.
- Do not duplicate identical contracts for convenience; share them only when meaning and lifecycle are the same.

## 4. Errors

- Uniform error responses across the whole API/public surface.
- Stable code as contract; safe user-facing message; never internal stack traces or infrastructure details.
- Log with context and redact sensitive data.

## 5. Testing

> [STACK] Define the repo's testing frameworks and patterns.

- Framework: [fill in]
- Unit: test success, empty case and error of every important piece.
- Integration: test against real infrastructure when the contract depends on it (databases, external services mocked only for external contracts).
- E2E: only if the repo has an E2E suite and the user authorizes running it.
- Always test negative paths: anonymous, unauthorized, invalid input, expiration, timeout, cancellation.

## 6. Verification And Scripts

- The repo's real scripts are in `.agents/AGENTS.md`; do not run any without authorization.
- Before closing a task, check that new code meets these conventions and introduces no stack anti-patterns declared in `.agents/DESIGN.md`.

## 7. Quick Reference

| Rule        | Do                                   | Avoid                               |
| ----------- | ------------------------------------ | ----------------------------------- |
| Contracts   | Immutable, validated at the boundary | Exposing internal entities          |
| Errors      | Stable code + safe message           | Internal details in responses       |
| Duplication | Extract shared helper/pattern        | Copying blocks                      |
| Scripts     | Ask permission for verification      | Running blocked scripts             |
| Stack       | Follow the adapted sections above    | Inventing conventions by inference  |

**Last updated:** September 2026
**Version:** 1.1 (generic harness - adapt per repo)
