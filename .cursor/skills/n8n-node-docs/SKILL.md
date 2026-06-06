---
name: n8n-node-docs
description: Update README, CHANGELOG, package metadata, and in-node documentation after n8n-nodes-unabyss changes. Use after implementation and before commit or release. Does not commit or publish.
---

# n8n-node Docs

Keep user-facing documentation in sync for the standalone `n8n-nodes-unabyss` package. Run after code changes on `develop` and **before** [n8n-node-commit](../n8n-node-commit/SKILL.md) or [n8n-node-release](../n8n-node-release/SKILL.md).

Commits go to `develop`; releases merge `develop` → `main` and publish to npm from `main` only.

This repo has no `docs/` tree — documentation lives in the package surfaces below.

## When to Use

- After adding/changing node operations, credentials, or auth flows.
- Before first npm publish or n8n verification submission.
- When the user asks to update docs, README, or changelog.
- Before release (CHANGELOG must reflect the version).

## When NOT to Use

- Typo-only code fix with no user-visible change — skip CHANGELOG unless releasing.
- Monorepo-only work (`Unabyss/unabyss` server/client) — use monorepo docs skills instead.

## Documentation Surfaces

| Surface | Path | Update when |
|---------|------|-------------|
| Install + dev guide | `README.md` | Auth, operations, dev setup, or install steps change |
| Release notes | `CHANGELOG.md` | Any user-visible change; **required** before `pnpm run release` |
| npm metadata | `package.json` `description`, `homepage` | Package positioning changes |
| Node panel + NDV copy | `nodes/Unabyss/Unabyss.node.ts` | `description`, `documentationUrl`, `notice` fields, parameter `description`/`hint` |
| n8n codex / docs links | `nodes/Unabyss/Unabyss.node.json` | Categories, aliases, `primaryDocumentation`, `credentialDocumentation` URLs |
| Credential docs link | `credentials/*.credentials.ts` `documentationUrl` | Auth setup docs move |

## Phase 1: Decide What Changed

1. Run `git diff` (or review the implementation) for `nodes/`, `credentials/`, `scripts/`.
2. Classify:
   - **User-visible** — new/changed operation, auth method, limits, polling behavior, breaking rename.
   - **Internal** — refactor, lint, dev script only.
3. User-visible changes need README + CHANGELOG updates. Internal-only can skip CHANGELOG.

## Phase 2: README.md

Keep sections aligned with the current package:

1. **Intro** — what Unabyss is, link to [unabyss.com](https://unabyss.com) and MCP endpoint.
2. **Authentication** — OAuth2 (DCR) vs API token (`unby_mcp_...`).
3. **Operations table** — Resource / Operation / MCP tool name (all nine tools).
4. **Agentic query polling** — Wait node + Agentic Query Read loop.
5. **Local development** — Node 22, `pnpm install`, `setup:n8n`, `dev`, search "Unabyss" in panel.
6. **Install in n8n** — Community Nodes → `n8n-nodes-unabyss`.
7. **Source** — link to `https://github.com/Unabyss/n8n-nodes-unabyss`.

Use plain English. No unicode escapes. Match existing README tone.

## Phase 3: CHANGELOG.md

Follow [Keep a Changelog](https://keepachangelog.com/) style. `release-it` expects entries here.

```markdown
# Changelog

## [Unreleased]

### Added
- ...

### Changed
- ...

### Fixed
- ...
```

Rules:

- Add bullets under `[Unreleased]` for each user-visible change.
- On release, `release-it` moves `[Unreleased]` to a version heading — do not hand-edit released sections unless fixing a mistake.
- Verification on npm expects a non-empty changelog history over time.

## Phase 4: In-Node and Package Metadata

### `Unabyss.node.ts`

- `description` — short line for node search panel.
- `documentationUrl` — product or repo docs (usually `https://unabyss.com` or GitHub repo).
- Top `notice` — HTML links allowed (`<a href="..." target="_blank">`).
- Resource-specific notices (e.g. agentic polling).
- Parameter `description` / option `description` when behavior is non-obvious.

### `Unabyss.node.json`

- `categories`, `alias` — search discoverability.
- `resources.primaryDocumentation[0].url` — prefer this repo README on GitHub.
- `resources.credentialDocumentation[0].url` — auth help (product site or README anchor).

### `package.json`

- `description` — one line for npm search.
- `homepage` — `https://unabyss.com`.

### Credentials

- `documentationUrl` on both credential types when auth docs change.

## Phase 5: Optional Monorepo Pointer (cross-repo)

Only when the user asks or the package location/auth story changes:

| Monorepo file | Action |
|---------------|--------|
| `integration-apps/n8n-nodes-unabyss/README.md` | Stub must link to `https://github.com/Unabyss/n8n-nodes-unabyss` |
| `integration-apps/README.md` | Table row points to external repo |
| `docs/architecture/integration-apps/index.md` | Add row for n8n community node (external repo) |

Do not duplicate full README content in the monorepo — pointer only.

## Phase 6: n8n Verification Checklist

Before Creator Portal submission, confirm:

- README has install, auth, operations, example workflow hint (agentic polling).
- CHANGELOG has at least one released or unreleased entry describing the package.
- MIT license in `package.json`.
- No runtime `dependencies` (only `devDependencies` + `peerDependencies`).
- `repository.url` matches `https://github.com/Unabyss/n8n-nodes-unabyss.git`.

## Completion Summary

Report which files were updated and what was skipped (with reason). Do not commit — hand off to `n8n-node-commit`.

## Invariants

- Never add secrets or tokens to docs.
- Never use unicode escape sequences in markdown or TS strings.
- Keep English only (n8n verification requirement).
- Do not commit or publish from this skill.
