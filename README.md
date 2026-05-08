# AI Base URL

[简体中文](README.zh-CN.md)

## Usage

Open the live directory to quickly browse current AI provider base URLs:

**[https://xiangxiangdong111-ops.github.io/ai-base-url/](https://xiangxiangdong111-ops.github.io/ai-base-url/)**

The site supports search, protocol filtering, one-click copy, and language switching (English / 中文).

AI providers expose compatible APIs through different base URLs, docs pages, regions, and naming conventions. This project gives developers one clean place to answer the practical question: what base URL should I configure for this provider and protocol?

If you spot a missing provider, outdated information, or a better official source, open a PR and update [data/providers.json](data/providers.json). Every careful contribution helps the next developer integrate faster and avoid one more unnecessary detour.

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

The current focus is:

- `openai-compatible`
- `anthropic-compatible`

Getting the common integration paths right is more useful than expanding scope too quickly. If a new protocol has a clear, stable real-world need, a PR is a good place to discuss it.

## PR Checklist

```bash
npm run validate
npm run generate
npm run check
```

- `npm run validate`: run a quick local sanity check.
- `npm run generate`: sync the data used by the site.
- `npm run check`: do one final pass before you open the PR.

If you are adding or updating a provider, edit [data/providers.json](data/providers.json). The rest of the generated files should follow from there.

## Contributing

- Every new or changed endpoint should include a public official source URL.
- Before adding a provider, search existing names, aliases, domains, and base URLs to avoid duplicates.
- Do not include API keys, private gateway URLs, account-specific endpoints, or copied restricted documentation.

The goal is not to collect the most entries. It is to keep the list trustworthy and directly useful. If something is still uncertain, opening a PR or issue for discussion is already a helpful contribution.
