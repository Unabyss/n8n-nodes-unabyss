# n8n-nodes-unabyss agent notes

Standalone npm community node for Unabyss MCP (`https://mcp.unabyss.com`).

## Skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| [n8n-node-docs](skills/n8n-node-docs/SKILL.md) | Update README, CHANGELOG, and in-node docs after changes |
| [n8n-node-commit](skills/n8n-node-commit/SKILL.md) | Commit and push changes on this repo |
| [n8n-node-release](skills/n8n-node-release/SKILL.md) | Bump version, tag, and publish to npm via CI |

Typical order: implement → **docs** → commit → release (when shipping).

## Toolchain

- **Node:** 22 LTS (`>=22.22 <23`) — required for `pnpm run dev` / native n8n deps
- **Package manager:** pnpm
- **Build:** `pnpm run lint` then `pnpm run build` (`dist/` is gitignored; CI builds on publish)
- **Local n8n:** `pnpm run setup:n8n` once, then `pnpm run dev`

## Repo

- Git remote: `https://github.com/Unabyss/n8n-nodes-unabyss.git`
- Default branch: `main`
- Monorepo stub (pointer only): `Unabyss/unabyss` → `integration-apps/n8n-nodes-unabyss/`

## Node authoring

See root [AGENTS.md](../AGENTS.md) and `.agents/` for n8n-node CLI conventions.
