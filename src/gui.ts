import { Hono } from "hono";
import * as cheerio from "cheerio";

export const guiApp = new Hono()
  .get("/latest", async (c) => {
    const version = await getLatestVersion();
    const infoResp = await fetch(
      `https://github.com/fast-down/gui/releases/expanded_assets/v${version}`,
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
  .get("/download/:version/:platform/:arch", async (c) => {
    const version = c.req.param("version");
    const platform = c.req.param("platform");
    const arch = c.req.param("arch");
    const { tag, filename } = await genReleaseUrl(version, platform, arch);
    const url = `https://github.com/fast-down/gui/releases/download/v${tag}/${filename}`;
    return c.redirect(url);
  });

/**
 * 生成 gui release 下载地址
 * @param version 版本号，`latest` 表示最新版本，不需要带 `v`
 * @param platform 操作系统，`windows`、`linux`、`macos`
 * @param arch 架构，`64bit`、`32bit`、`arm64`
 */
async function genReleaseUrl(version: string, platform: string, arch: string) {
  if (version === "latest") version = await getLatestVersion();
  return {
    tag: version,
    filename: `fast-down-${platform}-${arch}${platform === "windows" ? ".exe" : ""}`,
  };
}

async function getLatestVersion() {
  const releasesResp = await fetch(
    "https://github.com/fast-down/gui/releases/latest/",
  );
  return releasesResp.url.split("/").at(-1)!.split("v")[1];
}
