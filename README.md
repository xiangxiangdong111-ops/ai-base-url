# AI Base URL

[简体中文](README.zh-CN.md)

A focused, machine-readable registry for AI API base URLs.

AI providers expose compatible APIs through different base URLs, docs pages, regions, and naming conventions. This project gives developers one clean place to answer the practical question: what base URL should I configure for this provider and protocol?

This is not an awesome list. The core asset is [data/providers.json](data/providers.json): a canonical, validated dataset designed for tooling, static sites, and pull-request review. The web UI in [docs/](docs/) is a human-friendly view over the same data.

## What This Project Optimizes For

- **Trustworthy entries**: every endpoint must link to an official source.
- **Stable identities**: provider IDs, aliases, domains, and base URLs are checked for duplicates.
- **Small protocol surface**: support only for `openai-compatible` and `anthropic-compatible` until the registry has a reason to expand.
- **Static by default**: no backend, no API keys, no account-specific probing.
- **Data first**: README explains the project; `providers.json` carries the registry.

## Repository Layout

```text
data/providers.json        Canonical registry data
docs/index.html            Static GitHub Pages UI
docs/app.js                Browser search, language switch, filtering, and copy actions
docs/providers.json        Generated copy for GitHub Pages
scripts/validate.js        Registry shape and uniqueness checks
scripts/sync-docs-data.js  Syncs data/providers.json to docs/providers.json
```

## Data Model

Each provider has one canonical `id`, optional `aliases`, one or more `domains`, and one or more endpoints.

```json
{
  "id": "deepseek",
  "name": "DeepSeek",
  "aliases": ["deep-seek", "deep_seek"],
  "website": "https://www.deepseek.com",
  "domains": ["deepseek.com", "api.deepseek.com"],
  "endpoints": [
    {
      "id": "deepseek-openai",
      "protocol": "openai-compatible",
      "baseUrl": "https://api.deepseek.com",
      "source": "https://api-docs.deepseek.com/",
      "lastVerified": "2026-05-07",
      "notes": "OpenAI-compatible API endpoint."
    }
  ]
}
```

## Supported Protocols

The registry currently accepts only:

- `openai-compatible`
- `anthropic-compatible`

That constraint is intentional. A narrow protocol surface keeps the registry easy to validate and useful for real configuration workflows.

## Maintenance Flow

```bash
npm run validate
npm run generate
npm run check
```

- `npm run validate` checks registry shape, supported protocols, dates, duplicate identities, duplicate domains, and duplicate base URLs.
- `npm run generate` updates only [docs/providers.json](docs/providers.json) from [data/providers.json](data/providers.json).
- `npm run check` runs validation and confirms the generated docs data is current.

When adding or changing a provider, edit [data/providers.json](data/providers.json) first. Everything else should follow from that file.

## Usage

Browse and look up base URLs on the project site:

**https://xiangxiangdong111-ops.github.io/ai-base-url/**

The site supports search, protocol filtering, one-click copy, and language switching (English / 中文).

## Contributing

Every new or changed endpoint must include an official source URL. Before adding a provider, search existing provider names, aliases, domains, and base URLs.

Do not include API keys, private gateway URLs, account-specific endpoints, or copied paid documentation. Link to public official sources instead.

This registry is a community index. The linked official documentation remains the final source of truth.
