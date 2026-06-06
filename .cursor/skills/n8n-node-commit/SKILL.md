---
name: n8n-node-commit
description: Stage n8n-nodes-unabyss changes on develop (or a feature branch), run lint and build as gates, create a single commit, and push. Use when the user asks to commit, commit and push, or persist changes. Never commits to main (use n8n-node-release for releases to main/npm).
---

# n8n-node Commit

Stage changes, gate with `pnpm run lint` and `pnpm run build`, create one commit, and push to `origin`.

Repository: `https://github.com/Unabyss/n8n-nodes-unabyss.git` (standalone package at repo root).

## Branching Model

| Branch | Role |
|--------|------|
| `develop` | Integration branch — **all day-to-day commits land here** |
| `main` | Release branch — matches npm; **no direct feature commits** |
| `feat/<name>`, `fix/<name>` | Optional short-lived branches; merge to `develop` via PR |

`main` is updated only through [n8n-node-release](../n8n-node-release/SKILL.md) (merge `develop` → `main`, then version tag + npm publish).

## When to Use

- User says "commit", "commit and push", or equivalent in this repo.
- Ongoing node/credential/README/workflow edits on `develop` or a feature branch.

## When NOT to Use

- Publishing a version to npm → use [n8n-node-release](../n8n-node-release/SKILL.md).
- User-visible changes without doc updates → run [n8n-node-docs](../n8n-node-docs/SKILL.md) first.
- Changes belong in the Unabyss monorepo (`Unabyss/unabyss`) → work there instead.
- Current branch is `main` → STOP. Switch to `develop` or use the release skill.

## Before You Start

1. Confirm cwd is the n8n repo root (contains `package.json` with `"name": "n8n-nodes-unabyss"`).
2. Run `git status`. If the working tree is clean, report and exit.
3. Confirm current branch:
   - **Allowed:** `develop`, or `feat/*` / `fix/*`.
   - **Forbidden:** `main` — STOP unless the user explicitly requests a release/hotfix flow (then use release skill).
4. If `develop` does not exist locally but exists on remote: `git checkout develop`.
5. If `develop` does not exist at all: create from `main` and push:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```
6. Confirm Node 22 is active: `node -v` should be `v22.x`. If not, run `nvm use 22` before lint/build.

## Phase 1: Staging

1. Run `git status` and `git diff --name-only` (and `git diff --cached --name-only` if needed).
2. **Always stage when modified:**
   - `CHANGELOG.md` (if version or user-visible behavior changed)
   - `README.md`
   - `package.json` / `pnpm-lock.yaml` (if dependencies changed)
   - `.github/workflows/*`
   - `nodes/**`, `credentials/**`, `scripts/**`
   - `.cursor/**` (skills, agent notes)
3. **Stage on first import or new files:** all new source files under the repo root that belong to this package (`.agents/`, config files, SVGs, etc.).
4. **Never stage:**
   - `node_modules/`
   - `dist/` (gitignored build output)
   - `.env`, `.npmrc` with tokens, secrets, API keys
   - Editor-only junk (`.DS_Store`)
5. Use `git add` on the determined paths.

**STOP** if any file might contain credentials or npm tokens. Never guess.

## Phase 2: Lint and Build Gate

Run from repo root:

```bash
pnpm run lint
pnpm run build
```

1. If **lint** fails: STOP. Report errors verbatim. Do not commit.
2. If **build** fails: STOP. Report errors verbatim. Do not commit.
3. Do not commit `dist/` even if build succeeded — it stays gitignored.

## Phase 3: Commit

1. Draft a commit message from the staged diff (template below). Use the user's message verbatim if they provided one.
2. Single commit per invocation. No amend unless user rules allow and HEAD was yours unpushed.

### Commit Message Template

```
<type>(n8n): <subject>

<body: why this change>

- <substantive bullet>
```

**Types:** `feat`, `fix`, `docs`, `chore`, `build`, `refactor`

3. Commit with a HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<message here>

EOF
)"
```

## Phase 4: Push

1. On `develop`: push to `origin develop` (`git push` or `git push -u origin develop` if no upstream).
2. On `feat/*` or `fix/*`: `git push -u origin HEAD` (user opens PR to `develop` separately if needed).
3. On failure: STOP. No `--force` unless the user explicitly requests it.

## Completion Summary

Report: branch name, short SHA, subject line, files staged (grouped), lint/build result, push result.

## Invariants

- Never commit directly to `main` from this skill.
- Never stage `node_modules/`, `dist/`, or secret files.
- Never commit if lint or build fails.
- Never `git push --force` without explicit user instruction.
- Never update `git config`.
