# AI Base URL

[English](README.md)

## 查看与使用

直接打开项目站点，即可快速查看现有平台的 base URL：

**[https://xiangxiangdong111-ops.github.io/ai-base-url/](https://xiangxiangdong111-ops.github.io/ai-base-url/)**

站点支持搜索、协议筛选、一键复制和语言切换（English / 中文）。

一个专注、结构化、可机器读取的 AI API Base URL 注册表。

AI 平台经常把兼容 API 放在不同的 base URL、文档页面、区域路径和命名方式里。这个项目解决一个非常实际的问题：接入某个平台、某种协议时，开发者到底应该配置哪个 base URL？

如果你发现某个平台缺失、信息过期，或能补充更准确的官方来源，欢迎直接提交 PR；更新 [data/providers.json](data/providers.json) 即可。每一次认真补充，都能帮后来的开发者更快接入、少踩一点坑。

## 数据模型

每个平台都有一个 canonical `id`，可选的 `aliases`，一个或多个 `domains`，以及一个或多个 endpoints。

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

## 支持的协议

当前 registry 只接受：

- `openai-compatible`
- `anthropic-compatible`

这个限制是有意的。协议面越克制，数据越容易校验，也越贴近真实配置场景。

## 维护流程

```bash
npm run validate
npm run generate
npm run check
```

- `npm run validate` 校验 registry 结构、支持的协议、日期、重复身份、重复域名和重复 base URL。
- `npm run generate` 只根据 [data/providers.json](data/providers.json) 更新 [docs/providers.json](docs/providers.json)。
- `npm run check` 运行校验，并确认生成后的页面数据是最新的。

新增或修改平台时，先改 [data/providers.json](data/providers.json)。其他展示层都应该从这份文件派生。

## 贡献方式

每个新增或修改的 endpoint 都必须包含官方来源 URL。新增 provider 前，请先搜索已有 provider 名称、别名、域名和 base URL。

不要提交 API key、私有网关 URL、账号专属 endpoint，或复制付费文档内容。请链接到公开的官方来源。

本 registry 是社区索引，最终请始终以链接到的官方文档为准。
