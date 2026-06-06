# Changelog

This file records notable changes to SelectLens.

## Unreleased

### Added
- Added a selection right-click menu for manually triggering SelectLens parsing on selected text.
- Added the `contextMenus` permission for the selection context menu entry.
- Added a “复制原文” action for copying the original selected text from the inline floating card.
- Initial SelectLens MVP for detecting selected Base64 and 10/13-digit Unix timestamps, with parsing and copy support.
- Public project documentation covering features, local loading, permissions, and Chrome Web Store copy.
- A standalone Git repository and GitHub remote for publishing SelectLens independently.
- Added finalized SelectLens extension icon assets in 16/32/48/128 sizes and connected them in `manifest.json`.
- Added Chrome Web Store screenshot assets covering trigger flow, Base64 decoding, timestamp parsing, copy flow, and a real-world debugging use case.

### Changed
- Upgraded SelectLens from toolbar popup results to an inline floating card that appears after selecting supported text.
- Removed the popup-triggered `activeTab` / `tabs` permission flow from `manifest.json` for the inline-card MVP.
- Renamed the project and extension branding from the generic working name to **SelectLens**.
- Renamed the local project directory from `chrome-selection-tools/` to `selectlens/`.

### Fixed
- Clicking inside the inline floating card no longer dismisses it or retriggers selection analysis.
- The close button remains stable after using copy actions, including fallback copy flows.
