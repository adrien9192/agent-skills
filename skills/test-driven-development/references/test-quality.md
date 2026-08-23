# Test quality

## Durable tests

- Name the observable behavior, not the implementation step.
- Exercise the public seam used by real callers.
- Keep one logical behavior per test.
- Use an independent oracle.
- Include the smallest decisive error or boundary case.
- Let refactors change internals without changing the test.

## Failure signals

- Test passes before the behavior exists.
- Failure comes from setup, typo, fixture, or unavailable dependency.
- Assertion repeats the production algorithm.
- Test inspects private state or internal call order.
- Refactoring without behavior change breaks the test.
- Verification bypasses the public interface through a side channel.

Fix the test until RED proves the intended missing behavior, then begin GREEN.
