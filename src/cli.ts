import { Hono } from "hono";
import * as cheerio from "cheerio";
import { cache } from "hono/cache";

export const cliApp = new Hono()
  .get(
    "/installer/:platform",
    cache({
      cacheName: "installer",
      cacheControl: "max-age=3600",
    }),
    async (c) => {
      const platform = c.req.param("platform");
      const isWindows = platform == "windows";
      const script = await fetch(
        `https://raw.githubusercontent.com/fast-down/cli/refs/heads/main/scripts/install.${isWindows ? "ps1" : "sh"}`,
      );
      return await c.text(await script.text());
    },
  )
  .get("/latest", async (c) => {
    const { tag, assets } = await fetchRelease("latest");
    return c.json({
      version: tag,
      assets: assets.map((asset) => ({
        platform: asset.platform,
        arch: asset.arch,
        download_url: asset.downloadUrl,
      })),
    });
  })
  .get("/download/:version/:platform/:arch", async (c) => {
    const version = c.req.param("version");
    const platform = c.req.param("platform");
    const arch = c.req.param("arch");
    const { assets } = await fetchRelease(version);
    const asset = assets.find(
      (asset) => asset.platform == platform && asset.arch == arch,
    );
    if (!asset) c.notFound();
    return c.redirect(asset.downloadUrl);
  });

/**
 * 生成 cli release 下载地址
 * @param version 版本号，`latest` 表示最新版本，不需要带 `v`
 * @param platform 操作系统，`windows`、`linux`、`macos`
 * @param arch 架构，`64bit`、`32bit`、`arm64`
 */
async function genReleaseUrl(version: string, platform: string, arch: string) {
  if (version === "latest") version = await getLatestVersion();
  const isWindows = platform === "windows";
  return {
    tag: version,
    filename: `fd-${platform}-${arch}${isWindows ? ".exe" : ""}`,
  };
}

async function fetchRelease(v: string = "latest") {
  const url =
    v === "latest"
      ? "https://api.github.com/repos/fast-down/cli/releases/latest"
      : `https://api.github.com/repos/fast-down/cli/releases/tags/${v}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "fast-down-update",
    },
  });
  const data = await resp.json();
  const tag = data["tag_name"];
  const assets = data["assets"].map((asset) => {
    const [_name, platform, arch] = asset.name.split("-");
    const downloadUrl = asset["browser_download_url"];
    return {
      platform,
      arch,
      downloadUrl,
    };
  });
  return { tag, assets };
}
