# AESDR — Code Connect Runbook

**Goal:** wire the AESDR Figma library to the React components in `components/` so designers in Figma's Dev Mode see real production code instead of placeholder guesses.

**Time:** ~5 minutes once the Figma library exists. (Without the prep in this kit, this would take ~30 minutes.)

**Prerequisite:**
- The Figma library file exists (built per `figma-assembly-guide.md`).
- `@figma/code-connect` CLI installed globally:
  ```
  npm install --global @figma/code-connect@latest
  ```
- A Figma personal access token with the `code_connect:write` scope.

---

## Step 1 — Authenticate the CLI (one time)

In a terminal:

```
figma auth
```

Or set `FIGMA_ACCESS_TOKEN` in your environment. Generate a token at Figma → Settings → Account → Personal access tokens → Generate new token. Required scope: `code_connect:write`.

## Step 2 — Fill in the Figma node URLs

Five Code Connect mapping files were authored ahead of time. Each has a `FIGMA_NODE_URL_TBD` placeholder that needs the real URL of the corresponding Figma component:

| Mapping file | Figma component to link |
|---|---|
| `components/AesdrBrand.figma.ts` | `brand/wordmark` |
| `components/LandingSequence.figma.ts` | `pattern/editorial-split-hero` |
| `components/DeckStack.figma.ts` | `pattern/deck-peel-card` |
| `components/Testimonials.figma.ts` | `pattern/testimonial-gallery` |
| `components/GhostButton.figma.ts` | `component/ghost-button` |

For each one:

1. Open the Figma library file.
2. Find the listed component (on the `⚙ Components` page, by the listed name).
3. Right-click → `Copy/paste as` → `Copy link`.
4. Paste the URL into the corresponding mapping file, replacing `FIGMA_NODE_URL_TBD`.

The URL format is `https://www.figma.com/design/<file_key>/<title>?node-id=<node_id>`. Code Connect parses the file_key and node_id from this URL.

## Step 3 — Validate

```
figma connect validate
```

Should report each of the 5 mappings as valid. If a mapping points at the wrong component or a URL with bad formatting, this surfaces it before publish.

## Step 4 — Publish

```
figma connect publish
```

This uploads the mapping data to Figma. Designers using the AESDR library now see the real React component code in Dev Mode for every wired component.

## Step 5 — Verify in Figma

Open any frame using the AESDR library in Figma. Switch to Dev Mode (top-right toggle). Click the wordmark, the deck stack, etc. The right panel should show the React component name and code preview from your repo, not `<Frame>` placeholder code.

---

## Adding a new component

When a new component lands in `components/` that should be wired to Figma:

1. Author a new `*.figma.ts` file alongside it. Use any of the existing 5 as a template — the simplest is `Testimonials.figma.ts` (zero-prop pattern), the most prop-rich is `AesdrBrand.figma.ts`.
2. Build/find the corresponding Figma component in the library.
3. Fill in the `FIGMA_NODE_URL_TBD` with the component's URL.
4. Re-run `figma connect validate` then `figma connect publish`.

Keep the mapping file co-located with its component (`components/Foo.tsx` → `components/Foo.figma.ts`). The `figma.config.json` `include` glob picks it up automatically.

## Re-publishing after a code change

Code Connect is non-blocking — your CI doesn't need to publish on every commit. Re-publish manually when:

- A component's prop signature changes (Figma needs the updated `props` mapping).
- A new component is added.
- A component is renamed.
- A Figma component is renamed (the URL changes — recapture and re-paste).

A reasonable cadence: publish after major component refactors, not after every minor change.

## Privacy notes (per Figma's Code Connect docs)

Figma collects only the minimum data needed to enable Code Connect:
- The paths for components that are added.
- The repository URL where the Code Connect components are implemented.
- The properties and code in the `.figma` files.

Figma logs only basic events for understanding Code Connect usage (when components are published or unpublished, calls to get Figma data when using the CLI). For the full privacy statement, see Figma's Privacy Policy.

---

## What this gives the AESDR design system

- **No drift between Figma and code.** A designer can't accidentally use a Figma component whose props don't match the real code.
- **Dev Mode handoffs are instant.** The React code is right there, no copy-paste-from-other-tabs.
- **Onboarding new designers is faster** — they see component usage examples generated from production code.
- **Claude Design + your Figma + your codebase** share a single source of truth. When Claude Design generates a layout using AESDR Figma components, the resulting code can use the real React components, not approximations.

---

*— Code Connect runbook v1, 2026-04-29.*
