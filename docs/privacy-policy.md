# Privacy Policy for SelectLens

_Last updated: 2026-06-05_

SelectLens is a lightweight browser extension designed to help users inspect selected text on webpages. This Privacy Policy explains what information SelectLens accesses, how it is used, and what SelectLens does **not** do with your data.

## 1. What SelectLens Accesses

SelectLens may access:

- The text that you intentionally select on the current webpage
- The webpage context needed by the content script to display the inline result card near your selection

SelectLens does **not** require an account, login, or personal profile to work.

## 2. How SelectLens Uses the Data

SelectLens uses the selected text only to provide its core functionality, including:

- Decoding Base64 text
- Converting 10-digit and 13-digit Unix timestamps into human-readable time
- Displaying the parsed result in an inline floating card on the page
- Allowing you to copy either the original selected text or the parsed result

## 3. Local Processing

At the current stage, SelectLens processes selected text locally in the browser extension.

SelectLens does **not** send the selected text to remote APIs or external servers as part of its current functionality.

## 4. Data Storage

SelectLens does not currently require persistent storage of user content in order to work.

At this stage, SelectLens does not maintain a user history, account profile, or cloud-synced dataset.

If future versions add settings, history, analytics, or remote services, this Privacy Policy will be updated before those features are released.

## 5. Data Sharing

SelectLens does not sell, rent, or share your selected text with third parties as part of the current version.

## 6. Permissions Used

SelectLens currently does not request additional Chrome extension permissions in `manifest.json`.

Its content script runs on supported webpages so it can detect text that you intentionally select and show the local inline result card. It does not use this access to upload selected text, store browsing history, or track you across websites.

## 7. User Control

You control when SelectLens is used:

- You choose what text to select
- The inline card only appears for supported selected text, such as Base64 or 10/13-digit Unix timestamps
- You can close the inline card, clear the selection, or remove the extension from your browser at any time

## 8. Changes to This Policy

This Privacy Policy may be updated if SelectLens changes how it handles data, introduces new features, or requires additional permissions.

When significant changes are made, the updated policy text will be published in the project documentation.

## 9. Contact

For support, bug reports, or privacy-related questions, please use the SelectLens GitHub repository associated with this project.
