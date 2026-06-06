# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- `develop` integration branch; `main` reserved for npm releases
- Cursor agent skills for documentation, commit-to-develop, and release-to-main workflows
- Initial `n8n-nodes-unabyss` package with Unabyss node (Memory, Deep Query, Integrations, Exports)
- MCP OAuth2 credential with Dynamic Client Registration against `https://mcp.unabyss.com`
- MCP token credential as static-token fallback (`unby_mcp_...`)
- Nine MCP tool operations: `query`, `store`, `whoami`, `agentic_query`, `agentic_query_read`, `list_integrations`, `export_list`, `export_read`, `export_create_from_text`
- Local development scripts for n8n 2.23 on Node 22 (`pnpm run setup:n8n`, `pnpm run dev`)
- GitHub Actions publish workflow with npm provenance (`.github/workflows/publish.yml`)

### Changed

- README documents `develop` / `main` branching for contributors
