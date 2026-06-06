# n8n-nodes-unabyss

n8n community node for [Unabyss](https://unabyss.com) personal memory via the MCP JSON-RPC API at `https://mcp.unabyss.com`.

**Unabyss** is personal memory for AI workflows. Use this node to query what you already know, store new facts, run multi-step agentic research, list connected integrations, and manage markdown exports - all backed by your Unabyss account.

- Product: [unabyss.com](https://unabyss.com)
- MCP endpoint: [mcp.unabyss.com](https://mcp.unabyss.com)
- Source: [github.com/Unabyss/n8n-nodes-unabyss](https://github.com/Unabyss/n8n-nodes-unabyss)

## Authentication

**OAuth2 (default):** Uses n8n MCP Dynamic Client Registration against `https://mcp.unabyss.com`. Click Connect and approve consent in the browser.

**API Token (fallback):** Paste a static MCP token (`unby_mcp_...`) from the Unabyss client app.

## Operations

| Resource | Operation | MCP tool |
| --- | --- | --- |
| Memory | Query | `query` |
| Memory | Store | `store` |
| Memory | Who Am I | `whoami` |
| Deep Query | Agentic Query | `agentic_query` |
| Deep Query | Agentic Query Read | `agentic_query_read` |
| Integrations | List | `list_integrations` |
| Exports | List | `export_list` |
| Exports | Read | `export_read` |
| Exports | Create From Text | `export_create_from_text` |

### Agentic query polling

If Agentic Query returns `status: pending`, add a Wait node (`poll_after_seconds`), then Agentic Query Read with the returned `query_id`. Repeat until `status` is `completed` or `failed`.

## Repository branches

| Branch | Purpose |
| --- | --- |
| `develop` | Day-to-day development — open PRs and land commits here |
| `main` | npm releases only — updated when shipping a new package version |

Clone and work on `develop`:

```bash
git clone https://github.com/Unabyss/n8n-nodes-unabyss.git
cd n8n-nodes-unabyss
git checkout develop
```

## Local development

**Node version:** n8n 2.23 requires **Node 22 LTS** (`>=22.22 <23`). Node 25 breaks native module installs.

```bash
nvm install 22
nvm use 22
pnpm install
pnpm run setup:n8n   # one-time: downloads n8n into ~/.n8n-node-cli/runner
pnpm run dev
```

When you run `pnpm run dev`, wait until the terminal prints:

```
Editor is now accessible via: http://localhost:5678
```

Only then open [http://localhost:5678](http://localhost:5678). Opening the browser earlier shows a connection error because n8n is still starting. That is not a node bug.

In the workflow editor, open the node panel and search **Unabyss** (the node display name, not `n8n-nodes-unabyss`). If you do not see it after a code change, restart `pnpm run dev` or hard-refresh the browser.

After editing SVG icons only, run `pnpm run build` so `dist/` picks up the new files.

During the first `pnpm run setup:n8n`, npm may print long `ERESOLVE` / `zod` peer warnings. Those are harmless.

Alternative: `pnpm run dev:n8n-cli` uses the stock `n8n-node dev` command (downloads n8n via `npx` on each machine). Prefer `pnpm run dev` on this repo; it links the package into `~/.n8n-node-cli/.n8n/nodes/node_modules/` where n8n 2.x loads community nodes for the UI.

```bash
pnpm run lint
pnpm run build
```

## Install in n8n

Settings -> Community Nodes -> Install -> `n8n-nodes-unabyss`
