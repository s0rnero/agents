---
name: design
description: Architecture and design criteria for the project.
project: [PROJECT NAME] - generic agent harness
---

# Design

This file defines the project's technical design. It is the generic harness template: adapt each section to the real stack and architecture of the repo before using it.

## 1. Architecture

> [STACK] Describe the real architecture: monorepo/modules, layers, organization patterns, folder conventions.

```text
[Fill in: project layer tree or flow]
```

- Each layer/module must have a clear responsibility.
- Layer boundaries are respected: the input surface does not access persistence or external services directly.
- Folder and module organization patterns are declared here and never invented per task.

## 2. Contracts

- Requests/responses/events are immutable, versionable contracts.
- Internal persistence entities are not exposed.
- Errors have a stable code, a safe message and a correlation ID.
- Public contract changes are planned and announced; public APIs are not changed without notice.

## 3. Performance

> [STACK] Define the stack's measurable criteria (latency, memory, cold start, throughput, pools).

- Measure before tuning; do not copy numbers without a reproducible benchmark.
- Limit buffers, retries and materializations of large streams.
- Clarity and security take priority over unmeasured micro-optimizations.

## 4. Security

- Secrets only via environment/secret manager; never in Git, builds, logs, responses or published code.
- Validate and authorize at the boundary; do not trust untrusted external data (ids, paths, return URLs) without resolving it against an authoritative source.

> [STACK] The following are typical examples for web/HTTP services; adapt or replace them according to the project type:

- Session cookies with secure flags (HttpOnly, Secure per environment, documented SameSite).
- CORS with exact origins; never `*` with credentials.
- Rate limits and body/attachment size limits on sensitive routes.
- Do not run shell, apply patches or write files without authorization, allowlist and validation.

## 5. Environments

- Dev, QA and Prod use the same topology and contracts, with isolated secrets, data, origins and providers.
- Health checks distinguish liveness/readiness (when the project type requires it) without revealing sensitive details.
- Graceful shutdown and correct signals are mandatory.
- Configuration changes and migrations are recorded in plans, not in code.

## 6. Decision Documentation

- Non-obvious decisions are documented (in this file or in plans), not every line of code.
- Plans in `.agents/plans/` record architecture, decisions and migrations.

**Last updated:** September 2026
**Version:** 1.1 (generic harness - adapt per repo)
