# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is
SelectLens is a Chrome Manifest V3 extension. Select text on any page and it detects and decodes Base64 (standard and URL-safe), 10/13-digit Unix timestamps, and JWTs — all locally, with no network requests. Results render in an inline floating card.

This is a standalone git repo with its own GitHub remote, nested inside the parent docs project but versioned independently.

## No build system
There is no bundler, transpiler, linter, or test framework. Source files are loaded directly by Chrome. To run:

1. `chrome://extensions/` → enable Developer mode → "Load unpacked" → select this directory.
2. After editing `background.js` or `manifest.json`, click the reload icon on the extension card. Content-script (`content.js`) changes also need a reload plus a page refresh.

There is no automated test suite; verification is the manual smoke test documented in `README.md` (Base64 / URL-safe / JWT / 10- and 13-digit timestamps / context-menu trigger / both copy buttons / card show+dismiss).

## Architecture

Three runtime pieces communicate via `chrome.runtime` messaging:

- `content.js` — the core. Runs on `<all_urls>` at `document_idle`. Owns selection detection, all parsing logic, and the floating-card UI. This is where almost all behavior lives.
- `background.js` — service worker. Only job: register the "用 SelectLens 解析选中文本" selection context menu and forward clicks to `content.js` as a `SELECTLENS_CONTEXT_MENU_ANALYZE` message. The message-type string is duplicated in both files and must stay in sync.
- `manifest.json` — requests only the `contextMenus` permission. Deliberately has no `activeTab`/`tabs`; keep it minimal for store review.

### Detection pipeline (order is load-bearing)
`analyzeSelection()` tries parsers in a fixed order: **timestamp → JWT → Base64**. This order matters because the input space overlaps — e.g. some strings could be read as more than one type, and the first successful parser wins. Don't reorder without checking the overlap cases. Each parser returns `null` on no-match and a `{ type, label, output }` shape on success. Only types in `SUPPORTED_RESULT_TYPES` cause the card to render; `empty`/`unknown` results hide it.

### Floating card
- Rendered into a Shadow DOM (`mode: open`) on a `position: fixed` host with max z-index, so page styles can't leak in or out. All card CSS lives in `getFloatingCardStyles()`.
- `positionFloatingCard()` anchors to the selection rect with viewport clamping; falls back to a centered rect for context-menu triggers when no anchor is available.

### Interaction suppression (subtle — read before touching event handling)
Clicking inside the card must NOT be treated as a new page selection (which would re-trigger analysis or dismiss the card). This is handled by `isSuppressingFloatingCardInteraction` plus `suppressFloatingCardInteraction()`, a short timed flag set on every card interaction and on copy flows. `shouldIgnoreSelectionTrigger()` gates the selection listeners on it. The fallback copy path (`fallbackCopyText`, used when the async Clipboard API fails) saves and restores the user's prior selection and re-arms suppression — this is why the close button stays clickable right after copying. Changes to mouse/pointer/selection listeners can silently break card stability; re-run the manual smoke test.

### Dismissal
The card hides on: close button, Esc, outside pointerdown, scroll, resize, and cleared selection. `dismissedSelectionText` remembers the just-dismissed text so the same selection won't immediately re-pop the card.

## Orphaned code — `popup.*`
`popup.html` / `popup.css` / `popup.js` are leftovers from the original toolbar-popup design. The current `manifest.json` does NOT reference them, and `popup.js` sends a `GET_SELECTION_ANALYSIS` message that `content.js` no longer handles — so this code is dead. README keeps it as short-term reference only. Don't wire it back in or "fix" its message handler unless deliberately reviving the popup UI.

## Release process
Lightweight and manual. The single source of truth for the published version is `manifest.json`'s `version` field. Three things must always agree: the `manifest.json` version, the `CHANGELOG.md` version heading, and the git tag (e.g. `selectlens-v0.1.1`).

Rules:
- Never bump the version number without a matching changelog entry.
- A release isn't official without a matching annotated tag.
- User-visible changes go into the `## Unreleased` section of `CHANGELOG.md` as part of the same change, then get promoted into a dated version heading at release time.

Full step-by-step (version bump → changelog promotion → smoke test → release commit `release(selectlens): vX.Y.Z` → annotated tag → push) is in `README.md` under "Release".

## Constraints to respect
- Base64/JWT output must decode to valid UTF-8 (`TextDecoder` with `fatal: true`); binary payloads intentionally don't render.
- JWT is decode-only — header/payload are shown, signature is explicitly labeled unverified. Never add signature verification or any remote call; local-only is a core privacy promise.
- Restricted pages (`chrome://`, etc.) can't expose a selection; that's expected.
