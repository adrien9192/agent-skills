---
name: architecture-review
description: Review a design or diff for architecture — boundaries, coupling, data flow, failure modes, security, and scalability tradeoffs.
---

# architecture-review

Also invoke `andrej-karpathy-skills:karpathy-guidelines` for the anti-overengineering lens. This is the DigitalAine review checklist.

## Checklist
- **Boundaries & responsibility** — does each module own one thing? Any leak of concerns across layers?
- **Coupling / cohesion** — hidden dependencies, circular imports, shared mutable state.
- **Data & state flow** — where does data enter, transform, persist? Single source of truth? Cache invalidation?
- **Failure modes** — what happens on timeout, partial write, retry, concurrent access, empty/huge input? Data-loss paths?
- **Security** — authz at trust boundaries, input validation, secret handling (never in code/git), injection surfaces.
- **Scalability** — obvious O(n²), N+1 queries, unbounded memory/growth, missing pagination/limits.
- **Simplicity (YAGNI)** — abstractions with one implementation, config for values that never change, speculative generality. Recommend deletion.
- **Reversibility** — is this a one-way door? migrations, public APIs, data schema.

## Structural invariants
For an important decision or invariant that binds multiple components or contracts, report:
- **Binds** — the units and contracts that must stay aligned.
- **Prevents** — the incompatible implementations or divergence the invariant rules out.
- **Verification** — the smallest automated structural check that proves alignment.

Ask: *Could two units meant to share this invariant diverge silently without tests, types, contracts, or tooling detecting it?* If yes, flag the gap and propose the smallest shared type/schema, contract test, or tooling check; a local patch alone is insufficient.

## Grill the design before scoring it
Challenging the premise needs a mechanism, not an intention. Before writing the tradeoff table, grill the design: 3-5 questions that could change the verdict, each answered from the code (`file:line`), a command, or the docs — never from plausibility. One must be adversarial: *does this need to exist at all?* Record `# | question | answer | evidence | verdict impact`. Escalate to the user only what is irreversible, a matter of preference, or a spend. Full protocol: the `grill-me` skill.

## Output
A tradeoff table: concern | risk (low/med/high) | evidence (file:line) | recommendation. Lead with the 2-3 highest-risk items, and with any premise the grill broke.
For a structural-invariant finding, put **Binds / Prevents / Verification** in the recommendation.
