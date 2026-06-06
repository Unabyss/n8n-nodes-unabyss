---
name: n8n-node-release
description: Bump version, update CHANGELOG, tag, and publish n8n-nodes-unabyss to npm via GitHub Actions. Use when the user asks to release, publish to npm, or ship a new package version. Requires a clean commit on the branch first (use n8n-node-commit if needed).
---

# n8n-node Release

Publish `n8n-nodes-unabyss` to the npm registry using `pnpm run release` and the `publish.yml` GitHub Actions workflow.

## When to Use

- User says "release", "publish to npm", "ship version X", or "tag and publish".
- After a feature is merged and ready for npm consumers.

## When NOT to Use

- Uncommitted changes → run [n8n-node-commit](../n8n-node-commit/SKILL.md) first.
- `CHANGELOG.md` not updated for this version → run [n8n-node-docs](../n8n-node-docs/SKILL.md) first.
- User only wants a git commit without npm publish.

## Prerequisites (one-time, human)

1. npm package `n8n-nodes-unabyss` claimed on [npmjs.com](https://www.npmjs.com).
2. **Trusted Publisher** on npm → GitHub Actions:
   - Repository owner: `Unabyss`
   - Repository name: `n8n-nodes-unabyss`
   - Workflow filename: `publish.yml`
3. `@n8n/node-cli` >= 0.23.0 in `devDependencies` (provenance support).

## Before You Start

1. Working tree clean (`git status`).
2. Node 22 active (`nvm use 22`).
3. `pnpm run lint` and `pnpm run build` pass locally.
4. `CHANGELOG.md` updated for this version (release-it may prompt; ensure entries exist).

## Release Process

### Option A — Interactive (local)

From repo root:

```bash
nvm use 22
pnpm run lint
pnpm run build
pnpm run release
```

`pnpm run release` runs release-it, which typically:

- bumps `package.json` version
- updates `CHANGELOG.md`
- commits and creates a git tag (e.g. `0.1.0`)
- pushes commit + tag to `origin`
- GitHub Actions `publish.yml` runs on tag push and publishes to npm with provenance

Follow release-it prompts. Do not skip hooks unless the user explicitly requests it.

### Option B — CI-only tag (manual)

If the user prefers not to run release-it locally:

1. Bump `package.json` version and `CHANGELOG.md` in a normal commit (via n8n-node-commit).
2. Create and push tag matching `publish.yml` filter (`*.*.*`):

```bash
git tag 0.1.0
git push origin 0.1.0
```

3. Monitor GitHub Actions for the Publish workflow.

Prefer Option A unless the user specifies otherwise.

## Tag Convention

Workflow triggers on tags like `0.1.0`, `0.2.0` (no `v` prefix). If you need `v0.1.0`, change `publish.yml` `on.push.tags` first.

## After Publish

1. Confirm workflow succeeded on GitHub.
2. Verify package on npm: `https://www.npmjs.com/package/n8n-nodes-unabyss`
3. Test install in n8n: Settings → Community Nodes → `n8n-nodes-unabyss`

## Verification path (later)

For n8n Cloud discoverability, submit the published package via the [n8n Creator Portal](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/) after npm publish with provenance.

## Invariants

- Never publish from a dirty working tree.
- Never publish with failing lint/build.
- Never store `NPM_TOKEN` in the repo; use Trusted Publishing or GitHub Secrets.
- Never `git push --force` tags without explicit user instruction.
