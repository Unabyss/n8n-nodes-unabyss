---
name: n8n-node-commit
description: Stage n8n-nodes-unabyss changes, run lint and build as gates, create a single commit, and push. Use when the user asks to commit, commit and push, or persist changes in the standalone n8n-nodes-unabyss repository. Does not publish to npm (use n8n-node-release for that).
---

# n8n-node Commit

Stage changes, gate with `pnpm run lint` and `pnpm run build`, create one commit, and push to `origin`.

Repository: `https://github.com/Unabyss/n8n-nodes-unabyss.git` (standalone package at repo root).

## When to Use

- User says "commit", "commit and push", or equivalent in this repo.
- Initial import or ongoing node/credential/README/workflow edits.

## When NOT to Use

- Publishing a version to npm → use [n8n-node-release](../n8n-node-release/SKILL.md).
- User-visible changes without doc updates → run [n8n-node-docs](../n8n-node-docs/SKILL.md) first.
- Changes belong in the Unabyss monorepo (`Unabyss/unabyss`) → work there instead.

## Before You Start

1. Confirm cwd is the n8n repo root (contains `package.json` with `"name": "n8n-nodes-unabyss"`).
2. Run `git status`. If the working tree is clean, report and exit.
3. Confirm Node 22 is active: `node -v` should be `v22.x`. If not, run `nvm use 22` (or equivalent) before lint/build.

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
5. Use `git add` on the determined paths. For a full initial import, `git add -A` minus ignored paths is acceptable after verifying `git status` shows no secrets.

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

**Examples:**

```
feat(n8n): add Unabyss MCP node with OAuth2 and token auth

Initial community node extracted from the Unabyss monorepo. Covers all
nine MCP tools with OAuth2 DCR and static token fallback.

- Add Unabyss node, credentials, and local dev scripts.
- Wire publish workflow and package metadata for npm.
```

```
docs(n8n): expand node notices and README links
```

3. Commit with a HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<message here>

EOF
)"
```

## Phase 4: Push

1. If no upstream: `git push -u origin HEAD`
2. Else: `git push`
3. On failure: STOP. No `--force` unless the user explicitly requests it.

## Branching

- Default branch is `main`. Direct commits to `main` are allowed in this small package repo (unlike the Unabyss monorepo).
- Optional: `feat/<name>` or `fix/<name>` branches for larger changes; still push and open a PR to `main` if the user asks.

## Completion Summary

Report: short SHA, subject line, files staged (grouped), lint/build result, push result.

## Invariants

- Never stage `node_modules/`, `dist/`, or secret files.
- Never commit if lint or build fails.
- Never `git push --force` without explicit user instruction.
- Never update `git config`.
