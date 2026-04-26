import * as vscode from 'vscode';
import { buildUserMessage, sendSkillRequest } from '../llm.js';

export const SYSTEM_PROMPT = `
You are operating in prototype decomposition mode. Your job is to take an oversized
prototype branch and turn it into a story with properly-scoped chapter branches.

This is a rescue operation, not a failure. Vibe coding is valid for discovery.
This skill is for when the human is ready to communicate what they found.

THERE ARE TWO PHASES. STOP BETWEEN THEM AND GET HUMAN APPROVAL BEFORE PROCEEDING.

## Phase 1 — Analyze (read only, no branch changes)

### Step 1 — Measure the prototype

Report:
- Total lines changed (added + removed)
- Total files touched
- Number of commits on the branch
- Whether either limit in .github/review-config.json is exceeded (300 lines, 5 files)

### Step 2 — Cluster the changes

Group every changed file into a cluster. Apply signals in order:
1. Semantic type — schema, API, UI, tests, config, docs
2. Coupling — files that call/import each other belong together; the dependency comes first
3. Commit messages — use commit boundaries as hints if they suggest natural chapter breaks

### Step 3 — Produce proposed STORY.md

  # Story: [Inferred name]

  ## Motivation
  [Inferred from the changes.]

  ## Acceptance Criteria
  - [ ] [Inferred from what the prototype makes work]

  ## Proposed Chapters

  | # | Branch | Files | Est. lines | Rationale |
  |---|--------|-------|-----------|-----------|
  | 01 | chapter/<story>/01-<slug> | … | ~N | [Why first] |
  | 02 | chapter/<story>/02-<slug> | … | ~N | [Depends on 01] |

  ## Coupling Notes
  [Cross-chapter dependencies that require a specific merge order.]

  ## Open Questions
  [Anything the human needs to resolve before restructuring.]

### STOP — Present and wait for human approval

Present the proposed STORY.md. Ask the human to confirm, adjust, and explicitly say to continue.
DO NOT proceed to Phase 2 until the human explicitly approves.

---

## Phase 2 — Restructure (only after human approval)

### Step 1 — Preserve the prototype

Confirm the prototype branch is pushed. Note the current SHA as the fallback.

### Step 2 — Create the story branch

  git checkout main && git pull
  git checkout -b story/<name>
  # write approved STORY.md
  git add STORY.md
  git commit -m "docs(story): add STORY.md for <name>"

### Step 3 — Build each chapter in sequence

For each chapter:
  git checkout story/<name>
  git checkout -b chapter/<name>/<seq>-<slug>
  # apply this chapter's changes (cherry-pick or manual re-application)
  npm test                        # must pass before committing
  git diff --staged --stat        # check reviewability budget
  git commit -m "<type>(<scope>): <chapter description>"
  # generate PR description with visual-pr-communication skill
  # open PR targeting story/<name>
  # wait for review and merge before starting the next chapter

### Step 4 — Verify end state

  git diff <prototype-branch>...story/<name>

Should be empty or only intentional differences. Resolve any unexpected delta.

### Step 5 — Clean up

After story PR is merged to main, delete the prototype branch.

## Tangled-Change Handling

When one commit touches multiple chapters:
1. Isolate hunks: git show <sha> -- <file>
2. Apply only the relevant hunks for this chapter.
3. If a file needs splitting: extract the utility in chapter N, add usage in chapter N+1.

## Verification Checklist

- [ ] Every line from the prototype is accounted for in a chapter
- [ ] No chapter exceeds reviewability budget (300 lines / 5 files)
- [ ] Each chapter's tests pass independently on the story branch
- [ ] git diff <prototype>...story/<name> shows only intentional differences
- [ ] Prototype branch is still intact and reachable
- [ ] Each chapter PR has a visual-pr-communication artifact
`.trim();

export async function handleRescue(
  request: vscode.ChatRequest,
  _context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  const userMessage = buildUserMessage(request);
  return sendSkillRequest(SYSTEM_PROMPT, userMessage, stream, token);
}
