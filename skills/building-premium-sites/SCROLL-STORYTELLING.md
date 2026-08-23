# Scroll storytelling branch

Use this branch only when the approved brief explicitly makes scroll a timeline:
scrubbed media, pinned narrative states, a continuous journey, or another experience
whose meaning changes with scroll position. Ordinary reveals, parallax, marquees and
section entrances stay in `BLUEPRINT.md` section 4 bis.

This branch does not become a second site builder. `build-site` still owns framework,
source precedence, route ownership and deployment. `building-premium-sites` still owns
public content, design, SEO/GEO, CRO and accessibility. The existing GSAP/Lenis engine
remains the only generic motion engine; scene-specific timelines live beside the page
and never create another Lenis instance or ticker.

Method adapted from Nate Herk's `scroll-craft` (MIT), especially its feeling curve,
page grammars, fingerprint gate, dense-GOP encoding and scroll-state verification.
Provider-specific KIE code and its standalone engine are intentionally not imported.

## 1. Trigger and record the gate

In `docs/site-plan.md`, add a `scroll experience` capability row. Mark it `required`
only when an approved source or explicit brief needs scroll-driven meaning. A premium
site with tasteful entrance animation is `not applicable`.

Before components, record this contract:

```markdown
## Scroll experience
- Tell-someone sentence: "It is the site where ..."
- Dominant grammar:
- Grammar bans:
- Feeling curve:
  1. <feeling> — <visible cause>
- Peak: <one remembered moment>
- Quiet beat before the peak:
- Ending resolution:
- Signature interaction:
- Asset route: supplied | generated still | programmatic motion | generated video
- Reduced-motion equivalent:
- Scroll budget and media budget:
```

Ask only for product-direction choices that existing sources cannot settle. Do not add
a second generic intake or force a fixed questionnaire after `building-premium-sites`
has already collected the client brief.

Done when the feeling curve, one peak, ending, signature interaction, asset route and
reduced-motion equivalent are explicit enough to reject a conflicting implementation.

## 2. Pick one dominant grammar

A grammar is the organising rule of the page, not its palette. Pick one dominant row
and write its bans into the plan. Mixing grammars is allowed only for a named content
need; it cannot be a way to escape the chosen constraints.

| Grammar | Organising rule | Typical fit | Main bans |
|---|---|---|---|
| Filmic | One linear argument pushed like a film | launches, focused products | jump navigation, chapter chrome, repeated hard cuts |
| Editorial | Chapters and asymmetric reading spreads | methods, research, founder stories | full-bleed scrub hero, persistent marketing bar, media under body copy |
| Live surface | Real operable product state is the narrative | software and tools | fake dashboards, decorative photography, oversized marketing headings |
| Continuous world | One fixed stage with physical waypoints | geography, supply chain, place | document seams, independent pinned sections, source swapping mid-stage |
| Typographic | Type carries image, rhythm and scale | manifesto, verbal brand | stock media, card rails, decorative motion |
| Gallery | Objects plus factual labels form a collection | portfolio, range, catalogue | argument-shaped pinned copy, promotional labels, generic feature grid |
| Split stage | Two persistent sides resolve into one | before/after, cost/value | centred composition, decorative second column, symmetric ending |
| Rhythmic cutlist | Short hard cuts produce pulse | events, sport, youth brands | pins, long dwell, slow crossfades |

The page must also have one signature interaction that is not a parameter change to an
existing effect. It must serve the tell-someone sentence and remain optional to meaning
on touch devices and under reduced motion.

Done when the planned navigation, hero, sequence and ending all obey the selected
grammar, and the signature interaction is distinguishable from the generic motion kit.

## 3. Pass the fingerprint gate

Keep the cross-project registry outside any client repository:

1. `BUILD_SITE_HOME`, when set;
2. otherwise `~/.build-site/scroll-fingerprints.json`.

Create one plan JSON per build:

```json
{
  "id": "client-project",
  "grammar": "editorial",
  "nav": "chapter-folio",
  "hero": "type-title-page",
  "sequence": ["flow", "reveal", "pin", "flow", "pan"],
  "close": "colophon-link",
  "signature": "survey-line-draws-into-built-garden"
}
```

Use controlled slugs, not synonyms invented to bypass comparison:

```bash
node <building-premium-sites>/assets/scroll-registry.mjs init
node <building-premium-sites>/assets/scroll-registry.mjs check docs/scroll-plan.json
```

The planned build must differ from every previous build on at least four of six
dimensions: grammar, navigation, hero, sequence, close and signature. Append only after
the rendered build passes QA:

```bash
node <building-premium-sites>/assets/scroll-registry.mjs append docs/scroll-plan.json
```

Done when `check` exits zero before implementation and `append` exits zero after QA.

## 4. Score the sequence before building it

Write one row per act after the feeling curve, never before it:

| Act | Visitor feeling | Visible cause | Device family | Span reason | Asset | Reduced-motion state |
|---|---|---|---|---|---|---|

Apply these constraints:

- one visible reason for each act;
- at least three device families on a short experience, four on a full landing page;
- no device family twice in succession unless the approved grammar requires a
  continuous world;
- at most two scrubbed-video acts;
- the peak receives the strongest asset and visibly more time than neighbouring acts;
- the act before the peak is quieter;
- informational material such as FAQ, credentials and specifications stays normal flow;
- every span must produce an observable change or be declared as an intentional hold;
- total scroll length is a budget justified act by act, not a preset number.

Useful device families: normal flow, pinned state, scrubbed media, horizontal travel,
wipe/reveal, kinetic type, differential parallax, count using verified figures, and
pointer response. A device is support; it never substitutes for the act's meaning.

Done when removing any row would break the approved narrative, while lengthening any row
would need a stated visual reason.

## 5. Implementation and verification contract

Use semantic HTML first. Real headings, paragraphs, links and reading order exist without
motion. Add these attributes only to expose observable state to the audit harness:

| Attribute | Contract |
|---|---|
| `data-scroll-experience` | one root per independent scroll timeline |
| `data-scroll-act="<id>"` | one scored act; IDs remain stable across captures |
| `data-scroll-kind="pin|scrub|pan|flow|custom"` | sampling geometry, not styling |
| `data-scroll-cue` | copy whose rendered opacity changes with the act |
| `data-scroll-scrub` | video whose playhead is driven by scroll |
| `data-scroll-pan` | horizontally transformed track |
| `data-scroll-verify-state="<signature>"` | compact signature of rendered values for a custom fixed stage |
| `data-scroll-verify-hold="true"` | deliberate stable state, set only while that hold is visible |

`data-scroll-verify-state` must report rounded values that actually paint: divider
position, scene opacity, selected state, clip time or another rendered output. Raw scroll
progress cannot make a static composition pass.

Scene-specific GSAP code must:

- run inside `gsap.context()` and return cleanup;
- reuse the existing Lenis/ScrollTrigger loop;
- animate transforms and opacity by default;
- reserve geometry before animation to protect CLS and LCP;
- expose final semantic content without JavaScript;
- honour `prefers-reduced-motion` and the existing automation guard;
- allow the dedicated harness only through `window.__BUILD_SITE_MOTION_AUDIT__ === true`.

The generic automation guard remains active for ordinary Axe and screenshot runs. The
dedicated harness sets the audit flag before application code executes, so it can test the
timeline instead of photographing the static QA fallback.

Done when every custom timeline publishes rendered state, cleanup removes every trigger,
and normal QA remains deterministic without the audit flag.

## 6. Assets without a mandatory provider

Choose the cheapest defensible route in this order:

1. supplied brand photography or footage;
2. still generation/editing through the available image tool;
3. programmatic movement from approved stills with Remotion, CSS or ffmpeg;
4. true generated video only when an available `video` specialist and its cost are
   explicitly approved.

No provider is a hidden prerequisite. KIE is neither required nor assumed. Record each
asset's origin, rights, generation tool/provider, prompt or transformation, cost and final
path in `docs/asset-manifest.md`.

For a coherent generated set, write one art-direction preamble and reuse it verbatim.
Keep text as HTML rather than baking it into generated imagery. When product identity,
packaging or a logo matters, use the approved source asset as the reference and verify it
visually in every output.

For scrubbed clips:

- use one continuous camera direction with no cut or scene change;
- keep the subject visible throughout;
- trim people or objects entering/leaving the frame;
- grade supplied footage before the web encode rather than applying a full-frame CSS
  filter;
- normalise to 24-30 fps before dense-GOP encoding;
- derive the poster from the encoded clip's first frame;
- prepare a mobile crop or mobile-specific render when the subject cannot survive a
  centre crop.

Encode after editorial approval:

```bash
node <building-premium-sites>/assets/encode-scroll-video.mjs source.mp4 public/video/hero.mp4 --poster public/video/hero-poster.jpg
node <building-premium-sites>/assets/encode-scroll-video.mjs source.mp4 public/video/hero-mobile.mp4 --mobile --poster public/video/hero-mobile-poster.jpg
```

Dense keyframes trade file size for fast arbitrary seeking. Measure both output size and
seek behaviour; a normal playback encode can look correct while scrubbing poorly.

Done when every media URL resolves, posters match frame one, mobile composition remains
usable and the asset manifest names provenance and cost.

## 7. Verification loop

Run ordinary `audit-local.mjs` first with motion disabled. Then run the dedicated timeline
pass on desktop, mobile and reduced motion:

```bash
node <auditing-websites>/assets/audit-scroll.mjs --url http://localhost:3000 --out lab/scroll-desktop
node <auditing-websites>/assets/audit-scroll.mjs --url http://localhost:3000 --out lab/scroll-mobile --width 390 --height 844
node <auditing-websites>/assets/audit-scroll.mjs --url http://localhost:3000 --out lab/scroll-reduced --width 390 --height 844 --reduced-motion
```

Before trusting a run, confirm the served title and one known asset. A valid `200` from a
stale process on the same port proves the wrong site.

The harness must fail on:

- three consecutive samples with no rendered state change outside an authored hold;
- a cue that never reaches full opacity;
- a visible scrub video whose playhead does not advance;
- a pan rail without meaningful horizontal overflow or travel;
- console errors, failed requests or missing media;
- content removed rather than stilled under reduced motion.

Read `sheet.png`; the machine cannot judge composition, pacing, emotional effect or whether
the peak is memorable. Scroll once cold, write one felt word per act, then compare it with
the planned feeling curve. Fix the rendered page rather than rewriting the plan to match an
accident.

Done when all three harness runs pass, contact sheets are reviewed, intended and felt
curves agree after correction, the peak dominates, and the ending resolves without blank
or unreachable content.

## 8. Failure patterns to check deliberately

- A sticky stage can be visible before and after its pinned travel. Map scrubbed clip time
  across the stage's full visible life or the clip freezes while the stage slides.
- A cue window needs a plateau. Touching opacity `1` for one frame is not readable.
- Only a deliberate final state may hold indefinitely; a middle cue that stays visible can
  cross the next section.
- A pinned act needs real travel. If progress jumps from 0 to 1, use normal flow or increase
  its measured span.
- A horizontal rail must overflow at every target width. Aim for at least half a viewport
  of real travel and provide a reachable reduced-motion layout.
- Cue, parallax and pointer effects cannot all own `transform` on the same element. Use
  wrappers so each transform has one owner.
- A scrim used for dynamic contrast must be a sibling of hidden audit copy, not its pseudo-
  element; otherwise contrast capture removes the scrim with the text.
- A focusable control in a pinned, opacity-gated state needs an explicit keyboard path to a
  visible state. `scrollIntoView()` alone can leave it focused and transparent.
- Generated continuous worlds are expensive and fragile. Use them only when place and
  continuity are the approved idea, not as a default premium effect.

