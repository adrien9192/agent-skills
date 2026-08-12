# First run — Claude Code

Goal: make `/build-site` work predictably on a fresh machine/session.

## Prerequisites

- Git access to the repository that distributes this skill;
- Node.js supported by current Claude Code/Astro;
- pnpm preferred;
- latest Claude Code;
- Figma remote MCP/plugin when building from Figma;
- browser automation available for visual QA.

## Install the distributed skills

Install this skill and every required dependency through the containing repository's documented
installer. Do not copy `build-site` alone: the selected source lane and bundled marketing path
must resolve before first run.

Restart Claude Code after changing globally installed skills.

## Claude Code health

```bash
claude update
claude doctor
```

Start the current latest Opus alias with:

```bash
claude --model opus
```

The alias is preferred over hard-coding a model id in this repository: it follows the latest Opus available to the account.

## Figma — preferred remote MCP

Install the official Figma Claude Code plugin:

```bash
claude plugin install figma@claude-plugins-official
```

Restart Claude Code, open `/plugin`, authorize the installed Figma plugin, then verify it shows connected.

The remote Figma MCP is preferred. Code Connect is optional; `implement-figma` has a fallback when the current Figma plan/seat does not expose it.

## Browser QA

`build-site`, `implement-figma` and `implement-website` require a real rendered-page QA loop.

Use an available browser tool (Claude Chrome/browser integration, Playwright MCP, agent-browser, etc.). If more than one exists, use the most reliable tool that can set viewport sizes and capture screenshots.

Do not claim visual fidelity without browser screenshots.

## Dependencies and gated catalogue
The containing distribution must provide every **required** dependency on the selected path,
including the source owner and the bundled public-marketing owners named by `ROUTING.md`.

Run that distribution's dependency verifier after installation. A missing required dependency is
a broken installation; reinstall from the complete bundle rather than compensating silently.

`build-site/ROUTING.md` also names optional specialists from the runtime catalogue for
authenticated product UI, auth, backend/data, billing, AI, workflows, performance, deployment and
production verification. Every optional owner is marked `if available`. Absence has only two valid
outcomes:

When `security-review` is absent, `architecture-review` is the explicit fallback, with trust-boundary, authorization and negative-path probes; the report must not claim that the dedicated security skill ran.

The browser integration is a tool rather than a skill. Without a rendered-page browser probe there is no visual-fidelity claim.

Rule that never moves: a missing helper never authorizes invented content, skipped factual gates or a stronger environment claim.

## Greenfield Astro initialization

For a new marketing/content site, first verify current Astro docs/CLI, then initialize Astro with pnpm.

Canonical current shape:

```bash
pnpm create astro@latest
```

Tailwind CSS 4 uses its current Vite plugin integration. Do not resurrect the deprecated Astro Tailwind integration from old tutorials.

Install React only after the design inventory identifies components that genuinely need React hydration:

```bash
pnpm astro add react
```

Do not run that command by default for a static marketing site.

## Example greenfield editorial launch

Create or open the empty project directory, then start Claude Code with the current recommended
model for the repository:

```bash
mkdir marketing-site
cd marketing-site
claude
```

Then issue one command/prompt:


```text
/build-site <figma-url> fidelity

This is a greenfield public marketing website. Build the complete approved Figma as an Astro site. Inventory all desktop/mobile/inner-page/menu frames before coding. Use the official Figma MCP, exact durable assets and Figma variables. Do not publish Lorem ipsum, fake testimonials or unverified metrics/security/certification claims; gate them and keep the affected blocks out or clearly unresolved. Implement responsive behavior, then execute visual QA route by route and run the full Astro verification. Do not stop at a homepage scaffold.
```

## Expected execution order

```text
/build-site
  -> repository audit
  -> framework/provider decision
  -> source inventory and precedence
  -> route-to-surface map
  -> capability/risk gate table with one owner and one probe
  -> design tokens + durable assets + component map
  -> bounded public and/or product implementation
  -> responsive/accessibility/security/performance gates triggered
  -> browser visual + functional QA
  -> project checks and behavioral tests
  -> required pre-launch/production audit
  -> deploy only to the recorded local/preview/production target
  -> proof and blockers report
```

## Never do this on first run

- invoke all three skills manually in parallel;
- scaffold TanStack for a pure greenfield marketing site;
- add Convex/Clerk because they exist in the SaaS starter;
- install React before identifying an island need;
- publish Figma placeholders as facts;
- use temporary Figma asset URLs in final code;
- accept a green build as visual proof.
