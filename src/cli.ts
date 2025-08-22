import { Hono } from "hono";
import * as cheerio from "cheerio";

const urlCache = new Map<string, string>();

export const cliApp = new Hono()
  .get("/latest", async (c) => {
    const releasesResp = await fetch(
      "https://github.com/fast-down/cli/releases/latest/"
    );
    const version = releasesResp.url.split("/").at(-1);
    const infoResp = await fetch(
      `https://github.com/fast-down/cli/releases/expanded_assets/${version}`
    );
    const html = await infoResp.text();
    const $ = cheerio.load(html, {
      baseURI: infoResp.url,
    });
    const assets = $("ul>li")
      .map((_, el) => {
        const a = $(el).find("a");
        return {
          name: a.text().trim(),
          url: a.prop("href")!,
        };
      })
      .toArray()
      .filter((item) => !item.name.includes("Source code"))
      .map((item) => {
        const parts = item.url.split("/").at(-1)!.split(".")[0].split("-");
        return {
          platform: parts[2],
          arch: parts[3],
        };
      });
    return c.json({
      version,
      assets,
    });
  })
  .get("/raw/download/:tag/:filename", async (c) => {
    const tag = c.req.param("tag");
    const filename = c.req.param("filename");
    const url = `https://github.com/fast-down/cli/releases/download/${tag}/${filename}`;
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
    const url = genReleaseUrl(version, platform, arch);
    if (!urlCache.has(url)) {
      const res = await fetch(url, { method: "HEAD" });
      urlCache.set(url, res.url);
    }
    return fetch(new Request(urlCache.get(url)!, c.req.raw));
  });

/**
 * 生成 cli release 下载地址
 * @param version 版本号，`latest` 表示最新版本，不需要带 `v`
 * @param platform 操作系统，`windows`、`linux`、`macos`
 * @param arch 架构，`64bit`、`32bit`、`arm64`
 */
function genReleaseUrl(version: string, platform: string, arch: string) {
  if (version === "latest")
    return `https://github.com/fast-down/cli/releases/latest/download/fast-down-${platform}-${arch}.zip`;
  return `https://github.com/fast-down/cli/releases/download/v${version}/fast-down-${platform}-${arch}.zip`;
}
