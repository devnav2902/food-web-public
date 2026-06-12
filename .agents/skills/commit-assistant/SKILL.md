---
name: commit-assistant
description: Analyze git changes, generate a Conventional Commit message, and commit when explicitly requested.
---

---

# Commit Assistant

Use this skill when:

- user asks to generate a commit message
- user asks to review current git changes before commit
- user asks to commit current changes

## Important Behavior

Default behavior is **suggest only**.

Only execute `git add` or `git commit` when the user explicitly says:

- commit it
- create commit
- commit changes
- stage and commit
- tự commit
- commit luôn

If the user only asks for a commit message, do not commit.

## Collect Context

Run:

```bash
git status --short
git diff
git diff --cached
```

## Safety Rules

Before committing, check for risky files:

```text
.env
.env.*
*.pem
*.key
id_rsa
secrets.*
credentials.*
```

If risky files are present, do not commit automatically. Warn the user.

## Commit Rules

- Use Conventional Commit format
- Subject max 72 characters
- Use lowercase scope
- Do not invent changes
- Do not include unrelated files if changes are mixed
- Prefer staged changes if available
- If nothing is staged and user explicitly asked to commit, stage all safe changed files
- If migration or schema changes exist, include risk warning before commit

## Allowed Types

- feat
- fix
- refactor
- docs
- chore
- perf
- test
- ci
- style

## Preferred Scopes

- api
- admin
- auth
- deploy
- dish
- rating
- notification
- bill
- statistics
- ui
- docs

## Suggest-only Output Format

```text
Commit:
<type>(<scope>): <subject>

Body:
- <change>
- <change>

Risk:
- <risk or none>

Command:
git commit -m "<subject>"
```

## Auto-commit Workflow

When user explicitly asks to commit:

1. Show changed files briefly.
2. Generate commit message.
3. Stage safe files:

```bash
git add .
```

4. Commit:

```bash
git commit -m "<generated-subject>"
```

5. Show final result:

```text
Committed:
<commit-hash> <commit-message>
```

## Good Example

```text
Commit:
refactor(notification): polish bill and result ui

Body:
- reuse shared bill validation helpers
- simplify invite row copy
- update approval CTA and winner image clipping
- trim statistics history subtitle

Risk:
- invite action ownership may be less explicit
```

## Bad Example

```text
update code
fix bug
changes
```
