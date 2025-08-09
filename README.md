# fast-down-updater

![Latest commit (branch)](https://img.shields.io/github/last-commit/fast-down/updater/main)
![License](https://camo.githubusercontent.com/2c688e7decdaf0ee046dbefbf1bfeff0500b962e151b1a606d791f8f2e9f54c6/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d627269676874677265656e2e737667)

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

- `{项目名称}`
  - `cli`

### 下载最新版本

[https://fast-down-update.s121.top/cli/download/linux/64bit](https://fast-down-update.s121.top/cli/download/linux/64bit)

`https://fast-down-update.s121.top/{项目名称}/download/{系统}/{架构}`

- `{项目名称}`
  - `cli`
- `{系统}`
  - `linux`
  - `macos`
  - `windows`
- `{架构}`
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
