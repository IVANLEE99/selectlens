# Chrome Web Store Launch Checklist

This checklist is the minimum launch gate before submitting SelectLens to the Chrome Web Store. Treat it as both an asset-prep checklist and a final compliance review.

## Launch gate

Submission is only ready when all items below are checked:

- [x] Icons ready
- [ ] Screenshots ready — needs inline-card recapture
- [ ] Store copy approved
- [ ] Privacy notes verified
- [ ] Final submission review complete

---

## 1. Icon checklist

### Required checks
- [x] Manifest-referenced icons exist in all required sizes
- [ ] Icon artwork is sharp and not a placeholder
- [ ] Icon remains clear on light and dark browser UI
- [ ] Icon style matches the SelectLens product identity
- [ ] No low-resolution exports remain in the release folder

### Asset notes
- Source of truth: `generated-images/selectlens-final-icon-smallsize.png`
- Export sizes: align with Chrome extension manifest and Chrome Web Store needs
- Final files should be square, crisp, and visually centered
- Keep icon background, contrast, and padding consistent across all sizes

### Suggested deliverables
- [x] Toolbar icon set exported
- [ ] Chrome Web Store listing icon exported
- [x] Final filenames recorded
- `assets/icons/icon-16.png`
- `assets/icons/icon-32.png`
- `assets/icons/icon-48.png`
- `assets/icons/icon-128.png`

---

## 2. Screenshot shot list

Do not just capture random product screens. Each screenshot should communicate one clear benefit.

### Before capture
- [ ] Use a consistent browser window size for all screenshots
- [ ] Close unrelated tabs, notifications, and distracting UI
- [ ] Keep the selected text short enough to remain readable in the store listing
- [ ] Use realistic, non-sensitive technical content
- [ ] Ensure the SelectLens UI state shown in the screenshot matches the shipped build

### Screenshot 1 — Core trigger
- **Filename:** `01-select-text-trigger.png`
- **Goal:** Show the main interaction clearly
- **Scene:** User selects text on a real webpage and SelectLens reaction is visible
- **Must show:** Real webpage context + selected text + extension UI trigger state
- **Notes:** This should explain the product in one glance
- **Capture instructions:**
  - Use a clean technical article, documentation page, or simple demo page
  - Select a short Base64 string or timestamp that is visually easy to spot
  - SelectLens should automatically show the inline floating card next to the selected text
  - Frame the shot so users can immediately understand “select text → get insight”

### Screenshot 2 — Base64 parsing result
- **Filename:** `02-base64-result.png`
- **Goal:** Show Base64 decoding value
- **Scene:** A Base64 string is selected and the result UI is visible
- **Must show:** Selected Base64 input + readable decoded output
- **Notes:** Avoid fake-looking demo text if possible
- **Capture instructions:**
  - Use a documentation-style or test page with a readable Base64 example
  - Example source text can be a short Base64 string that decodes into plain English
  - Make sure the SelectLens UI clearly shows the original selected value and the decoded result
  - Keep the decoded output visually prominent so the value of the extension is obvious

### Screenshot 3 — Timestamp parsing result
- **Filename:** `03-timestamp-result.png`
- **Goal:** Show timestamp conversion value
- **Scene:** A 10-digit or 13-digit timestamp is selected and parsed
- **Must show:** Raw timestamp + human-readable time result
- **Notes:** Use a realistic timestamp example
- **Capture instructions:**
  - Use a page that looks like logs, API docs, or a realistic debugging example
  - Select a 10-digit or 13-digit Unix timestamp from the page content
  - SelectLens should automatically show the readable converted time in the inline floating card
  - Keep both the raw timestamp and the parsed time visible in the same composition

### Screenshot 4 — Copy result flow
- **Filename:** `04-copy-result.png`
- **Goal:** Show the one-click copy workflow
- **Scene:** Parsed result is visible with copy affordance or copy success state
- **Must show:** Copy button and confirmation UI if available
- **Notes:** Make the action obvious at listing size
- **Capture instructions:**
  - Reuse the Base64 or timestamp scenario that produces the cleanest result UI
  - Show the copy button clearly in the SelectLens panel
  - If the extension displays copy feedback, capture the success state as part of the same shot
  - Make the copy interaction readable even when scaled down in the store listing

### Screenshot 5 — Real-world debugging use case
- **Filename:** `05-real-world-use-case.png`
- **Goal:** Show SelectLens in an authentic workflow
- **Scene:** Example page such as API docs, logs, developer tool demo page, or technical article
- **Must show:** Practical context, not just a blank playground page
- **Notes:** Pick the strongest user story for the listing
- **Capture instructions:**
  - Choose the most believable real-world page, such as API documentation, a logs page mockup, or a technical tutorial
  - Select content that naturally appears in that workflow, such as a timestamp in logs or Base64 in an example response
  - SelectLens should automatically appear as part of a real debugging task after text selection
  - Compose the screenshot to emphasize practical usage rather than a synthetic test environment

### Screenshot acceptance rules
- [ ] Use realistic, non-sensitive content
- [ ] Keep browser window clean and uncluttered
- [ ] Make extension UI the focal point
- [ ] Use consistent window size and visual style
- [ ] Ensure text remains readable at store listing scale
- [ ] Do not show features that are not in the submitted build

---

## 3. Store copy worksheet

### Product name
**SelectLens**

### One-line value proposition
Select text on any page and instantly decode Base64, format timestamps, and copy the result.

### Short description
Select any text to instantly decode Base64, format timestamps, and copy results.

### Full description
SelectLens helps you inspect selected text directly on webpages. It can decode Base64, convert 10-digit and 13-digit Unix timestamps into readable time, and let you copy the parsed result with one click.

Built for developers, testers, operators, and anyone who frequently works with encoded strings or raw timestamps online, SelectLens reduces context switching and makes common debugging tasks faster.

### Key feature bullets
- Decode selected Base64 text instantly
- Convert 10-digit and 13-digit Unix timestamps
- Copy parsed results with one click
- Lightweight workflow directly inside the browser
- Simple and focused for daily debugging tasks

### Typical use cases
- Reading timestamps in logs or API examples
- Decoding Base64 values from docs, responses, or tutorials
- Quickly copying parsed output into notes, chat, or tickets
- Lightweight inspection during day-to-day web debugging

### Permissions explanation
SelectLens currently does not request extra Chrome extension permissions. It uses a content script on supported webpages to detect text that the user intentionally selects, process it locally, and display an inline floating card near the selection.

### Support / feedback line
For support, bug reports, or feature ideas, direct users to the SelectLens GitHub repository.

### Copy guardrails
- [ ] No unsupported features described
- [ ] No exaggerated claims such as “best” or “most powerful”
- [ ] No references to cloud or AI features that do not exist
- [ ] Listing copy matches the actual shipped UI and behavior

---

## 4. Privacy and compliance notes

### Data accessed
- Selected text on the current page
- Webpage context needed to render the inline floating card near the selection

### Data purpose
- Selected text is needed to detect and parse Base64 or Unix timestamps
- Page context is used locally to position and display the inline result card

### Data processing
- Current planned behavior: processing happens locally in the extension
- No remote API calls should be claimed unless they are actually added later

### Data storage
- Current MVP does not require persistent user data storage
- If settings or history are added later, update both listing copy and privacy notes

### Data sharing
- No third-party data sharing should be claimed unless it truly exists

### Permissions review
- [ ] Manifest permissions match the listing explanation
- [ ] No unnecessary permissions are present
- [ ] Permission wording is understandable to non-technical reviewers

### Privacy policy notes
- [x] Privacy policy text has been prepared in `docs/privacy-policy.md`
- [ ] Confirm whether Chrome Web Store requires a separate privacy policy URL for the current submission setup
- [ ] If required, prepare the URL before submission
- [ ] If no privacy policy page exists yet, treat that as a submission blocker

### User-facing privacy summary draft
SelectLens processes selected text locally to decode Base64 values and convert Unix timestamps. It does not need an account to work. If future versions add remote services, storage, or analytics, the privacy description must be updated before release.

---

## 5. Submission verification

### Asset verification
- [x] Icon files are present and final
- [ ] Screenshot files are captured and approved for the inline-card UI
- [ ] Screenshot filenames match the shot list for the inline-card UI
- [ ] No placeholders remain

### Copy verification
- [ ] Short description is ready
- [ ] Full description is ready
- [ ] Feature bullets are ready
- [ ] Permissions explanation is ready
- [ ] Support line is ready

### Compliance verification
- [ ] Store copy matches actual functionality
- [ ] Screenshots reflect the current version UI
- [ ] Privacy notes match real behavior
- [ ] Manifest permissions and listing explanations are consistent
- [ ] No unimplemented roadmap items appear in the listing

### Final submission review
- [ ] Unpacked extension smoke test passed
- [ ] Final build/version to be submitted is confirmed
- [ ] Reviewer-facing notes are prepared if needed
- [ ] Submission blockers have been cleared

---

## 6. Submission blockers

Mark any blocker clearly before submission:

- Missing icon export
- Missing screenshot scenario
- Listing copy not approved
- Privacy policy URL missing when required
- Manifest permissions not fully explained
- Screenshot/UI mismatch with current build
- Final smoke test not completed

---

## 7. Recommended next outputs

Once this checklist exists, the next useful deliverables are:
- Final icon export list
- Actual screenshot capture script / shot instructions
- Final Chrome Web Store short description and full description
- Privacy policy page content
- Submission day checklist tied to the exact release version
