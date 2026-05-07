# Contributing

Thanks for helping keep this registry useful and trustworthy.

## Scope

This project currently accepts only these endpoint protocols:

- `openai-compatible`
- `anthropic-compatible`

Please open an issue before adding a new protocol.

## Requirements

Every endpoint must include:

- A canonical provider `id`
- Provider aliases, even if the array is empty
- Provider domains
- A base URL
- One supported protocol
- An official source URL
- A `lastVerified` date in `YYYY-MM-DD` format

Official sources include provider docs, official SDK repositories, official examples, or provider-owned API reference pages.

## Duplicate Checks

Before opening a PR, search existing entries by:

- Provider name
- Provider aliases
- Website domain
- API domain
- Base URL

The validator rejects duplicate canonical IDs, duplicate normalized identities, duplicate domains, and duplicate normalized base URLs.

## Local Workflow

```bash
npm run validate
npm run generate
npm run check
```

`npm run generate` updates only `docs/providers.json` from `data/providers.json`. README files are maintained manually as repository documentation.

## Notes

Do not include API keys, account-specific URLs, private gateway URLs, or copied paid documentation. Link to official public sources instead.
