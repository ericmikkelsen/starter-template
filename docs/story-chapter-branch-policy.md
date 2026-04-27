# Story and Chapter Branch Policy

This repository includes a GitHub Action that enforces generic, reusable story/chapter branch flow.

## Branch Naming

- Story branches: `story/<story-slug>`
- Chapter branches: `chapter/<story-slug>/<chapter-number>-<chapter-slug>`

## Enforced Rules

- `story/<story-slug>` pull requests must target `main`
- `chapter/<story-slug>/<chapter-number>-<chapter-slug>` pull requests must target `story/<story-slug>` (this implicitly blocks chapters targeting `main` directly)
- Story slugs must match between chapter and story branches
- For same-repo pull requests, chapter branches must be based on their target story branch

## Chapter Scope Sentence Guidance

- A chapter scope still uses one sentence.
- A sentence may combine two related concerns only when it explicitly names both concerns and why they are combined in the same chapter.

## Chapter Pre-Commit Expectations

- Before committing chapter work, run `plan` for that chapter so tasks are explicit and reviewable.
- Before committing chapter work, run `review` so quality issues are handled inside the chapter branch.
- Make a good-faith reviewability budget check before commit with:

```bash
git diff --staged --stat -- . ':(exclude)package-lock.json'
```

- If clearly over budget, split the work into a smaller chapter slice before committing.

Workflow file: `.github/workflows/branch-flow-policy.yml`

## Required GitHub Settings

Add branch protections or rulesets so this check is required before merge:

- Require status check: `Validate story/chapter PR flow`
- Protect `main` from direct pushes
- Limit direct pushes to `story/*` and `chapter/*` to trusted automation/accounts only

Note: GitHub permissions are pattern-based, not branch-lineage based. Lineage is validated by the workflow using git ancestry checks.
