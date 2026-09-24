# Architecture Decision Records (ADR)

Permanent registry of architecture and design decisions. It complements `.agents/plans/`:

- **Plans** record how a task was executed (context, steps, verification) and are the project's operational memory.
- **ADRs** record why the architecture is the way it is (decision, context, consequences) and are permanent design memory.

## Rules

- Every decision affecting the project's architecture or design is recorded as an ADR (template in `.agents/templates/adr.md`).
- ADRs are **permanent**: they are never deleted nor edited retroactively. A change of decision is recorded as a new ADR that marks the previous one as `superseded`.
- File naming: `<number>-<slug>.md` (e.g. `001-use-bun.md`).
- States: `proposed` -> `accepted` -> `superseded`.

## Flow

1. During a plan (or by direct user decision), an architecture decision is detected.
2. The ADR is created in `proposed` state with the decision and its consequences.
3. Once confirmed, it moves to `accepted`.
4. If time invalidates it, a new ADR marks it `superseded` with the cross-reference.

**Language note (RULES.md 0.14):** ADRs are written in English. ADR-001 is kept as a historical record of the decision it made; the English policy applies prospectively from ADR-002 onward.
