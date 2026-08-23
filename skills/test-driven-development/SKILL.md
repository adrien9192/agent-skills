---
name: test-driven-development
description: "Use when implementing a behavior change test-first, reproducing a bug with a regression test, or when a delivery workflow reaches a risky implementation slice. Owns the RED-GREEN-refactor loop and test quality. Not for research, documentation-only work, disposable exploration, or configuration with no observable behavior."
license: MIT
---

# Test-driven development

Build confidence one observable behavior at a time. This is the primary TDD
contract when another installed TDD skill overlaps with it.

## 1. Choose the public seam

A **public seam** is the interface through which a caller or user observes the
behavior: exported API, command, HTTP endpoint, UI flow, file format, or other
stable boundary. Test there, not through private methods or internal call order.

State the seam before writing the test. Infer it when the repository, contract,
or existing tests make it clear. Ask only when different seams would materially
change product behavior, cost, or architecture.

For legacy behavior with no reliable tests, write a **characterization test**
that records current observable behavior before changing it.

## 2. Work as vertical slices

Take one **vertical slice** from public input to observable output:

1. Write one test for one behavior.
2. Run it and observe RED for the expected missing behavior or reproduced bug.
3. Write the smallest production change that can make this slice GREEN.
4. Run the focused test, then affected tests.
5. Refactor only while everything stays GREEN.
6. Repeat with the next behavior learned from the previous slice.

Do not write a horizontal batch of speculative tests followed by a batch of
implementation. Each slice is a tracer bullet that can correct the next one.

## 3. Use an independent oracle

An **independent oracle** supplies the expected result without reproducing the
implementation's algorithm. Prefer a worked example, specification, invariant,
fixture, known literal, or independently produced reference result.

A test that calculates its expected value with the same operations as the code
can agree with the same bug and proves little.

## 4. Mock only at a system boundary

A **system boundary** is something outside the owned unit: network provider,
clock, randomness, operating system, external process, or occasionally a real
database replaced for isolation. Prefer a real test database when practical.

Use dependency injection at that boundary. Exercise owned modules together.
Internal collaborator mocks, private-method assertions, and call-count tests
couple tests to structure instead of behavior.

Read [references/test-quality.md](references/test-quality.md) when choosing a
seam or reviewing a weak test. Read [references/mocking.md](references/mocking.md)
when an external dependency must be isolated.

## Completion evidence

Before reporting completion, retain:

- focused RED output with expected failure reason;
- focused GREEN output;
- affected-suite result;
- public seam and independent oracle used;
- any system boundary mocked and why.

If production code already existed before this run, preserve it. Add a failing
regression or characterization test rather than deleting user work to perform a
ceremonial rewrite.
