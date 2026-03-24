import { Hono } from "hono";

export const guiApp = new Hono()
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

async function fetchRelease(v: string = "latest") {
  const url =
    v === "latest"
      ? "https://api.github.com/repos/fast-down/gui/releases/latest"
      : `https://api.github.com/repos/fast-down/gui/releases/tags/${v}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "fast-down-update",
    },
  });
  const data = await resp.json();
  const tag = data["tag_name"];
  const assets = data["assets"].map((asset) => {
    const [_name, platform, arch] = asset.name.split(".", 1)[0].split("-");
    const downloadUrl = asset["browser_download_url"];
    return {
      platform,
      arch,
      downloadUrl,
    };
  });
  return { tag, assets };
}
