---
name: n8n-node-release
description: Merge develop to main, bump version, tag, and publish n8n-nodes-unabyss to npm via GitHub Actions. Use when the user asks to release, publish to npm, or ship a new package version. Requires develop to be committed and documented first.
---

# n8n-node Release

Ship a new npm version from `main`. Day-to-day work stays on `develop`; this skill is the only path that updates `main` and triggers npm publish.

## Branching Model

| Branch | Role |
|--------|------|
| `develop` | Integration — features land here via [n8n-node-commit](../n8n-node-commit/SKILL.md) |
| `main` | Release — merged from `develop`, then version-tagged for npm |

## When to Use

- User says "release", "publish to npm", "ship version X", or "tag and publish".
- `develop` has the changes to ship and is pushed to `origin`.

## When NOT to Use

- Uncommitted changes on any branch → run [n8n-node-commit](../n8n-node-commit/SKILL.md) on `develop` first.
- `CHANGELOG.md` not updated for this version → run [n8n-node-docs](../n8n-node-docs/SKILL.md) first.
- User only wants a git commit without npm publish.

## Prerequisites (one-time, human)

1. npm package `n8n-nodes-unabyss` claimed on [npmjs.com](https://www.npmjs.com).
2. **Trusted Publisher** on npm → GitHub Actions:
   - Repository owner: `Unabyss`
   - Repository name: `n8n-nodes-unabyss`
   - Workflow filename: `publish.yml`
3. `@n8n/node-cli` >= 0.23.0 in `devDependencies` (provenance support).
4. `develop` branch exists on GitHub (set as default branch in repo settings if desired).

## Before You Start

1. `develop` is clean, pushed, and contains everything to release.
2. Node 22 active (`nvm use 22`).
3. `pnpm run lint` and `pnpm run build` pass on `develop`.
4. `CHANGELOG.md` has `[Unreleased]` entries for this release.

## Phase 1: Merge develop into main

```bash
git checkout develop
git pull origin develop
pnpm run lint
pnpm run build

git checkout main
git pull origin main
git merge develop
```

If merge conflicts: STOP and resolve with the user before continuing.

Do not commit feature work on `main` — only the merge commit (and release-it's version commit) belong here.

## Phase 2: Release and publish

### Option A — Interactive (preferred)

On `main` after the merge:

```bash
nvm use 22
pnpm run release
```

`pnpm run release` (release-it) typically:

- bumps `package.json` version
- moves `CHANGELOG.md` `[Unreleased]` to the new version section
- commits the version bump on `main`
- creates a git tag (e.g. `0.1.0`)
- pushes `main` and the tag to `origin`
- GitHub Actions `publish.yml` runs on tag push and publishes to npm with provenance

Follow release-it prompts. Do not skip hooks unless the user explicitly requests it.

### Option B — Manual tag

If the user prefers not to run release-it locally:

1. On `main` after merge: bump `package.json` version and finalize `CHANGELOG.md` in one commit.
2. Push `main`, then tag and push:

```bash
git tag 0.1.0
git push origin main
git push origin 0.1.0
```

3. Monitor GitHub Actions for the Publish workflow.

## Phase 3: Sync develop with main

After a successful release, bring the version bump back to `develop`:

```bash
git checkout develop
git merge main
git push origin develop
```

This keeps `develop` aligned with the released `package.json` version and changelog.

## Tag Convention

Workflow triggers on tags like `0.1.0`, `0.2.0` (no `v` prefix). If you need `v0.1.0`, change `publish.yml` `on.push.tags` first.

## After Publish

1. Confirm GitHub Actions Publish workflow succeeded.
2. Verify on npm: `https://www.npmjs.com/package/n8n-nodes-unabyss`
3. Test install in n8n: Settings → Community Nodes → `n8n-nodes-unabyss`

## Verification path (later)

Submit the published package via the [n8n Creator Portal](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/) after npm publish with provenance.

## Invariants

- Never release from `develop` directly — merge to `main` first, then tag from `main`.
- Never publish from a dirty working tree.
- Never publish with failing lint/build.
- Never store `NPM_TOKEN` in the repo; use Trusted Publishing or GitHub Secrets.
- Never `git push --force` tags without explicit user instruction.
