# fast-down-updater

[![cloudflare workers](https://badgen.net/badge/a/Cloudflare%20Workers/orange?icon=https%3A%2F%2Fworkers.cloudflare.com%2Fresources%2Flogo%2Flogo.svg&label=)](https://workers.cloudflare.com/)
![Latest commit (branch)](https://img.shields.io/github/last-commit/fast-down/updater/main)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fast-down/updater/blob/main/LICENSE)

这是一个用来更新 fast-down 的 Cloudflare Worker

## 使用

### 获取最新版本

[https://fast-down-update.s121.top/cli/latest](https://fast-down-update.s121.top/cli/latest)

```json
{
  "version": "v2.2.1",
  "assets": [
    { "platform": "linux", "arch": "64bit" },
    { "platform": "linux", "arch": "arm64" },
    { "platform": "macos", "arch": "64bit" },
    { "platform": "macos", "arch": "arm64" },
    { "platform": "windows", "arch": "32bit" },
    { "platform": "windows", "arch": "64bit" },
    { "platform": "windows", "arch": "arm64" }
  ]
}
```

`https://fast-down-update.s121.top/{项目名称}/latest`

- {项目名称}
  - `cli`
  - `gui`

### 下载最新版本

[https://fast-down-update.s121.top/cli/download/latest/linux/64bit](https://fast-down-update.s121.top/cli/download/latest/linux/64bit)

`https://fast-down-update.s121.top/{项目名称}/download/{版本}/{系统}/{架构}`

- {项目名称}
  - `cli`
  - `gui`
- {版本}
  - `latest`
  - `2.2.1` (注意不带 `v`)
  - ...
- {系统}
  - `linux`
  - `macos`
  - `windows`
- {架构}
  - `32bit`
  - `64bit`
  - `arm64`

## 开发

```txt
bun install
bun run dev
```

```txt
bun run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
bun run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
