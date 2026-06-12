---
name: pr-writer
description: Generate pull request title and description from git changes, and create PR when explicitly requested.
---

---

# PR Writer

Use this skill when:

- user asks to create PR description
- user asks to summarize a feature branch
- user asks to prepare merge request
- user asks to create pull request

## Important Behavior

Default behavior is **suggest only**.

Only create a PR when the user explicitly says:

- create PR
- open PR
- tạo pull request
- tạo PR luôn
- push and create PR

If the user only asks for a PR summary, do not create PR automatically.

## Collect Context

Run:

```bash
git status --short
git branch --show-current
git log --oneline -10
git diff
git diff --cached
```

If current branch is:

```text
main
master
develop
```

warn the user that PRs are usually created from feature branches.

## Preferred Workflow

Recommended flow:

```text
feature branch
→ commit
→ push
→ create PR
→ review
→ merge
```

## PR Rules

- Keep title concise
- Focus on business impact
- Mention risky changes clearly
- Mention migration/schema changes
- Mention breaking changes explicitly
- Avoid generic summaries
- Group related changes together

## PR Title Rules

Use Conventional Commit style when possible:

```text
feat(scope): short title
fix(scope): short title
refactor(scope): short title
```

Max 72 characters.

## Suggested Output Format

```md
PR Title:

<title>

## Summary

<summary>

## Changes

- item
- item

## Risks

- risk or none

## Testing

- [ ] api tested
- [ ] ui tested
- [ ] migration tested
- [ ] rollback checked
```

## Auto PR Workflow

Only when explicitly requested.

### 1. Validate branch

If current branch is:

```text
main
master
```

suggest:

```bash
git checkout -b feat/<scope>
```

before creating PR.

### 2. Check remote status

Run:

```bash
git status
git remote -v
```

### 3. Push branch

```bash
git push origin <current-branch>
```

### 4. Generate PR content

Generate:

- PR title
- summary
- changes
- risks
- testing checklist

### 5. Create PR

Using GitHub CLI:

```bash
gh pr create
```

or:

```bash
gh pr create \
  --base main \
  --head <current-branch> \
  --title "<generated-title>" \
  --body "<generated-body>"
```

### 6. Show result

```text
PR Created:
<pr-url>
```

## Good Example

```md
PR Title:
feat(rating): add dish rating aggregation

## Summary

Support dish rating submission and average score aggregation.

## Changes

- add rating endpoint
- validate duplicate rating
- update aggregation query
- invalidate rating cache

## Risks

- aggregation query may increase DB load

## Testing

- [x] duplicate rating validation
- [x] aggregation accuracy
- [x] cache invalidation
```

## Bad Example

```md
update stuff
fix ui
some changes
```
