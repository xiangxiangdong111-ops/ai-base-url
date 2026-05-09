# AI Base URL

[English](README.md)

## 查看与使用

直接打开项目站点，即可快速查看现有平台的 base URL：

**[https://ai-base-url.vercel.app/](https://ai-base-url.vercel.app/)**

**[https://xiangxiangdong111-ops.github.io/ai-base-url/](https://xiangxiangdong111-ops.github.io/ai-base-url/)**

站点支持搜索、协议筛选、平台类型筛选、一键复制和语言切换（English / 中文）。

AI 平台经常把兼容 API 放在不同的 base URL、文档页面、区域路径和命名方式里。这个项目解决一个非常实际的问题：接入某个平台、某种协议时，开发者到底应该配置哪个 base URL？

如果你发现某个平台缺失、信息过期，或能补充更准确的官方来源，欢迎直接提交 PR；更新 [data/providers.json](data/providers.json) 即可。每一次认真补充，都能帮后来的开发者更快接入、少踩一点坑。

## 数据模型

每个平台都有一个 canonical `id`、一个 `providerType`、一个 `popularityRank`、可选的 `aliases`、一个或多个 `domains`，以及一个或多个 endpoints。

- `providerType`：取值为 `model-provider` 或 `cloud-platform`，它是前端平台类型筛选与分组显示的唯一来源。
- `popularityRank`：同一 `providerType` 内的排序值，必须是正整数，数字越小越靠前。

```json
{
  "id": "deepseek",
  "name": "DeepSeek",
  "providerType": "model-provider",
  "popularityRank": 4,
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
      "notes": "OpenAI-compatible API endpoint.",
      "notesZh": "DeepSeek 通用 OpenAI 兼容端点。"
    }
  ]
}
```

## 支持的协议

当前优先收录：

- `openai-compatible`
- `anthropic-compatible`

先把最常见、最直接影响接入体验的协议整理准确，比盲目扩展范围更有价值。若后续出现明确、稳定的真实需求，也欢迎通过 PR 讨论扩展。

## PR 自检

```bash
npm run validate
npm run generate
npm run check
```

- `npm run validate`：先做基础检查。
- `npm run generate`：同步页面使用的数据文件。
- `npm run check`：提交前再做一次完整确认。

如果你准备提交 PR，直接更新 [data/providers.json](data/providers.json) 即可；其他展示文件会基于它同步生成。

## 贡献方式

- 每个新增或修改的 endpoint，都请附上公开可访问的官方来源。
- 新增 provider 前，先搜索已有 provider 名称、别名、域名和 base URL，避免重复提交。
- 不要提交 API key、私有网关 URL、账号专属 endpoint，或复制受限文档内容。

目标不是收得越多越好，而是尽可能让人拿来就能用、用得放心。若信息仍有不确定之处，也欢迎先提 PR 或 issue 一起讨论。
