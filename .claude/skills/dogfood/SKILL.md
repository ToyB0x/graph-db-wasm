---
name: dogfood
description: Systematically explore and test a web application to find bugs, UX issues, and other problems using Playwright CLI. Use when asked to "dogfood", "QA", "exploratory test", "find issues", "bug hunt", "test this app/site/platform", or review the quality of a web application. Produces a structured report with full reproduction evidence -- step-by-step screenshots and detailed repro steps for every issue -- so findings can be handed directly to the responsible teams.
allowed-tools: Bash(npx playwright:*), Bash(pnpm exec playwright:*)
---

# Dogfood

Systematically explore a web application using Playwright CLI, find issues, and produce a report with full reproduction evidence for every finding.

## Setup

Only the **Target URL** is required. Everything else has sensible defaults -- use them unless the user explicitly provides an override.

| Parameter | Default | Example override |
|-----------|---------|-----------------|
| **Target URL** | _(required)_ | `vercel.com`, `http://localhost:5173` |
| **Output directory** | `./dogfood-output/` | `Output directory: /tmp/qa` |
| **Scope** | Full app | `Focus on the billing page` |
| **Browser** | chromium | `--browser firefox` |

If the user says something like "dogfood localhost:5173", start immediately with defaults. Do not ask clarifying questions unless authentication is mentioned but credentials are missing.

## Workflow

```
1. Initialize    Set up output dirs, report file, install browsers if needed
2. Orient        Navigate to starting point, take initial screenshot
3. Explore       Systematically visit pages and test features
4. Document      Screenshot each issue as found
5. Wrap up       Update summary counts, present findings
```

### 1. Initialize

Ensure Playwright browsers are installed, then set up the output directory:

```bash
npx playwright install chromium
mkdir -p {OUTPUT_DIR}/screenshots
```

Copy the report template into the output directory and fill in the header fields:

```bash
cp {SKILL_DIR}/templates/dogfood-report-template.md {OUTPUT_DIR}/report.md
```

### 2. Orient

Take an initial screenshot to understand the app structure:

```bash
npx playwright screenshot --wait-for-timeout 3000 {TARGET_URL} {OUTPUT_DIR}/screenshots/initial.png
```

Examine the screenshot to identify the main navigation elements and map out the sections to visit.

### 3. Explore

Read [references/issue-taxonomy.md](references/issue-taxonomy.md) for the full list of what to look for and the exploration checklist.

**Strategy -- work through the app systematically:**

- Start from the main navigation. Visit each top-level section.
- Within each section, examine interactive elements: buttons, forms, dropdowns/modals.
- Check edge cases: empty states, error handling, boundary inputs.
- Check for visual issues: layout, alignment, rendering, responsive design.
- Check the browser console for errors.

**At each page, take a screenshot:**

```bash
npx playwright screenshot --wait-for-timeout 2000 {PAGE_URL} {OUTPUT_DIR}/screenshots/{page-name}.png
```

**Useful Playwright CLI options:**

- `--full-page` — capture the entire scrollable page
- `--wait-for-timeout {ms}` — wait before capturing (for dynamic content)
- `--viewport-size {width},{height}` — test different viewport sizes
- `--device "iPhone 13"` — emulate a specific device
- `--color-scheme dark` — test dark mode

**For interactive testing, use `npx playwright codegen`** to explore the app interactively and observe behavior. Use this when you need to test forms, clicks, and navigation flows:

```bash
npx playwright codegen {TARGET_URL}
```

Use your judgment on how deep to go. Spend more time on core features and less on peripheral pages. If you find a cluster of issues in one area, investigate deeper.

### 4. Document Issues (Repro-First)

Steps 3 and 4 happen together -- explore and document in a single pass. When you find an issue, stop exploring and document it immediately before moving on. Do not explore the whole app first and document later.

Every issue must include evidence. When you find something wrong, capture a screenshot that clearly shows the problem.

**For each issue:**

1. **Capture the broken state** with a screenshot:

```bash
npx playwright screenshot --wait-for-timeout 2000 {PAGE_URL} {OUTPUT_DIR}/screenshots/issue-{NNN}.png
```

2. **For full-page issues** (layout problems, content below the fold):

```bash
npx playwright screenshot --full-page --wait-for-timeout 2000 {PAGE_URL} {OUTPUT_DIR}/screenshots/issue-{NNN}-full.png
```

3. **For responsive issues**, capture at multiple viewport sizes:

```bash
npx playwright screenshot --viewport-size 375,812 {PAGE_URL} {OUTPUT_DIR}/screenshots/issue-{NNN}-mobile.png
npx playwright screenshot --viewport-size 1920,1080 {PAGE_URL} {OUTPUT_DIR}/screenshots/issue-{NNN}-desktop.png
```

4. **Append to the report immediately.** Do not batch issues for later. Write each one as you find it so nothing is lost if the session is interrupted.

5. **Increment the issue counter** (ISSUE-001, ISSUE-002, ...).

### 5. Wrap Up

Aim to find **5-10 well-documented issues**, then wrap up. Quality of evidence matters more than total count -- 5 issues with clear screenshots and repro steps beat 20 with vague descriptions.

After exploring:

1. Re-read the report and update the summary severity counts so they match the actual issues. Every `### ISSUE-` block must be reflected in the totals.
2. Tell the user the report is ready and summarize findings: total issues, breakdown by severity, and the most critical items.

## Guidance

- **Evidence is everything.** Every issue needs a screenshot that clearly shows the problem.
- **Take screenshots at the right moment.** Use `--wait-for-timeout` to let dynamic content load before capturing.
- **Write repro steps that map to screenshots.** Each numbered step in the report should reference its corresponding screenshot. A reader should be able to follow the steps visually without touching a browser.
- **Be thorough but use judgment.** You are not following a test script -- you are exploring like a real user would. If something feels off, investigate.
- **Write findings incrementally.** Append each issue to the report as you discover it. If the session is interrupted, findings are preserved. Never batch all issues for the end.
- **Never delete output files.** Do not `rm` screenshots or the report mid-session. Work forward, not backward.
- **Never read the target app's source code.** You are testing as a user, not auditing code. All findings must come from what you observe in the browser.
- **Test like a user, not a robot.** Try common workflows end-to-end. Look at things a real user would see.
- **Use `--full-page` for layout review.** This captures the entire page, revealing issues below the fold.
- **Test responsive layouts.** Use `--viewport-size` or `--device` to test mobile and tablet views when relevant.

## References

| Reference | When to Read |
|-----------|--------------|
| [references/issue-taxonomy.md](references/issue-taxonomy.md) | Start of session -- calibrate what to look for, severity levels, exploration checklist |

## Templates

| Template | Purpose |
|----------|---------|
| [templates/dogfood-report-template.md](templates/dogfood-report-template.md) | Copy into output directory as the report file |
