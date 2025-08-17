import { Hono } from "hono";
import * as cheerio from "cheerio";

const app = new Hono();

app.get("/cli/download/:platform/:arch", (c) => {
  const platform = c.req.param("platform");
  const arch = c.req.param("arch");
  const url = `https://github.com/fast-down/cli/releases/latest/download/fast-down-${platform}-${arch}.zip`;
  return fetch(new Request(url, c.req.raw));
});
app.get("/cli/latest", async (c) => {
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
});

app.get("/gui/latest", async (c) => {
  const url =
    "https://github.com/fast-down/gui/releases/latest/download/latest.json";
  const res = <Latest>await fetch(url).then((e) => e.json());
  for (const i in res.platforms) {
    res.platforms[i].url = res.platforms[i].url.replace(
      "https://github.com/fast-down/gui/releases/download/",
      "https://fast-down-update.s121.top/gui/download/"
    );
  }
  return c.json(res);
});
const urlCache = new Map<string, string>();
app.get("/gui/download/:tag/:filename", async (c) => {
  const tag = c.req.param("tag");
  const filename = c.req.param("filename");
  const url = `https://github.com/fast-down/gui/releases/download/${tag}/${filename}`;
  if (!urlCache.has(url)) {
    const res = await fetch(url, { method: "HEAD" });
    urlCache.set(url, res.url);
  }
  return fetch(new Request(urlCache.get(url)!, c.req.raw));
});

export default app;
