---
name: verify
description: Prove a change works — inspect the diff, run lint/typecheck/tests/build, and smoke-test the real behavior before claiming done.
---

# verify

Also invoke `superpowers:verification-before-completion`. This is the concrete DigitalAine gate.

## Steps
1. **Inspect the diff** (`git diff`, `git status`). Know exactly what changed and why.
2. **Run the checks that exist**, in order, capturing failures verbatim:
   - lint
   - typecheck
   - tests (targeted for the change, then the suite)
   - build
3. **Smoke-test observable behavior.** Config/tests passing is not proof. Exercise the real flow: start the app and hit the route, run the CLI, call the endpoint, render the page. Watch the actual output.
4. **Classify results:** success / pre-existing failure / failure caused by this change / environment blocker.
5. Only then say "Terminé / Vérification / Risques restants". Never announce done on green tests alone if there's runtime surface to drive.

## Never
- Say "done" without evidence.
- Hide a failure or an environment blocker — surface it with the output and exit code.
