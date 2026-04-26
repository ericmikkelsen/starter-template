# Agent Skills Architecture

This starter-template now separates concerns:

## This Repo: `starter-template`
- **Purpose:** Foundational project setup with coding standards, CI/CD, versioning, conventions
- **Contains:** 
  - `.github/skills/` — Reference documentation for development workflows (TDD, git discipline, code review, etc.)
  - `.copilot-instructions.md` — Project-specific Copilot behavioral directives
  - Build config, linting, release automation
  - **~72 files, <1MB** (lean by design)

## Separate Repo: `agent-skills-extension`
- **Location:** `/Users/eric/projects/agent-skills-extension/` (ready to push to GitHub)
- **Purpose:** VS Code extension providing `/story`, `/visualize`, `/rescue`, `/spec`, `/plan`, `/build` + 4 more slash commands
- **Contains:**
  - VS Code extension source (TypeScript)
  - Copilot SDK harness for testing skills offline
  - Test fixtures demonstrating skill behavior
  - **~29 core files, ~500MB with node_modules**

## How They Connect

1. **For new projects:** Clone `starter-template`, get lean defaults + coding standards
2. **Optional upgrade:** Install the `agent-skills-extension` VS Code extension if you want interactive skill workflow
3. **For skill developers:** Work in the extension repo; run skills offline against fixtures via the SDK harness

## Skills Docs

The `.github/skills/` SKILL.md files (git-workflow, TDD, code-review, etc.) are the reference. They document **what the skills do** and **when to use them**. The extension is just the tooling that invokes them.

## Separation Benefits

- Starter-template stays **lightweight** — onboard new projects fast
- Skills extension is **optional** — projects don't inherit a 500MB dependency they don't need
- Clear **upgrade path** — teams can start lean and add VS Code extension only when useful
- Easier **independent maintenance** — skill updates don't trigger starter-template version bumps
