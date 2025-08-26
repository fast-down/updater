import { Hono } from "hono";
import * as cheerio from "cheerio";

const urlCache = new Map<string, string>();
const latestJsonUrl =
  "https://github.com/fast-down/gui/releases/latest/download/latest.json";

export const guiApp = new Hono()
  .get("/latest", async (c) => {
    const res = <Latest>await fetch(latestJsonUrl).then((e) => e.json());
    for (const i in res.platforms) {
      res.platforms[i].url = res.platforms[i].url.replace(
        "https://github.com/fast-down/gui/releases/download/",
        "https://fast-down-update.s121.top/gui/raw/download/"
      );
    }
    const infoResp = await fetch(
      `https://github.com/fast-down/gui/releases/tag/fast-down-v${res.version}`
    );
    const html = await infoResp.text();
    const $ = cheerio.load(html, {
      baseURI: infoResp.url,
    });
    res.notes = $(".markdown-body").html() || "修复了一些已知问题";
    return c.json(res);
  })
  .get("/raw/download/:tag/:filename", async (c) => {
    const tag = c.req.param("tag");
    const filename = c.req.param("filename");
    const url = `https://github.com/fast-down/gui/releases/download/${tag}/${filename}`;
    if (!urlCache.has(url)) {
      const res = await fetch(url, { method: "HEAD" });
      urlCache.set(url, res.url);
    }
    return fetch(new Request(urlCache.get(url)!, c.req.raw));
  })
  .get("/download/:version/:platform/:arch", async (c) => {
    const version = c.req.param("version");
    const platform = c.req.param("platform");
    const arch = c.req.param("arch");
    const { tag, filename } = await genReleaseUrl(version, platform, arch);
    return c.redirect(`/gui/raw/download/${tag}/${filename}`);
  });

/**
 * 生成 gui release 下载地址
 * @param version 版本号，`latest` 表示最新版本，不需要带 `v`
 * @param platform 操作系统，`windows`、`linux`、`macos`
 * @param arch 架构，`64bit`、`32bit`、`arm64`
 */
async function genReleaseUrl(version: string, platform: string, arch: string) {
  if (version === "latest") {
    const latest = <Latest>await fetch(latestJsonUrl).then((e) => e.json());
    version = latest.version;
  }
  const filenameMap: Record<string, string | undefined> = {
    "linux-64bit": `fast-down-gui_${version}_amd64.AppImage`,
    "linux-arm64": `fast-down-gui_${version}_aarch64.AppImage`,
    "macos-64bit": "fast-down-gui_x64.app.tar.gz",
    "macos-arm64": "fast-down-gui_aarch64.app.tar.gz",
    "windows-64bit": `fast-down-gui_${version}_x64-setup.exe`,
    "windows-32bit": `fast-down-gui_${version}_x86-setup.exe`,
  };
  const filename = filenameMap[`${platform}-${arch}`];
  if (!filename) throw new Error("Unsupported platform or arch");
  return { tag: `fast-down-v${version}`, filename };
}
