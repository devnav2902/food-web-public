---
name: work-summary
description: Summarize current working tree changes before commit or PR creation.
---

---

# Work Summary

Use this skill when:

- user is working on master/main
- no PR exists yet
- user wants summary of current changes
- user wants commit preparation

## Collect Context

Run:

```bash id="xnl1d8"
git status
git diff
git diff --cached
```

## Tasks

- summarize current work
- group related changes
- detect possible scope
- detect risky changes
- suggest commit message
- suggest branch name
- suggest PR title

## Output Format

```text id="j7dylf"
Scope:
<scope>

Summary:
- item
- item

Suggested Branch:
<branch-name>

Suggested Commit:
<commit>

Risks:
- risk or none
```

## Example

```text id="z8l5r1"
Scope:
rating

Summary:
- add dish rating endpoint
- update average score logic
- validate duplicate rating

Suggested Branch:
feat/dish-rating

Suggested Commit:
feat(rating): add dish rating api

Risks:
- aggregation query load increase
```
