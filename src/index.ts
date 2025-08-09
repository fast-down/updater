import { Hono } from "hono";
import { proxy } from "hono/proxy";
import * as cheerio from "cheerio";

const app = new Hono();

app.get("/cli/download/:platform/:arch", async (c) => {
  return proxy(
    `https://github.com/fast-down/cli/releases/latest/download/fast-down-${c.req.param(
      "platform"
    )}-${c.req.param("arch")}.zip`
  );
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

export default app;
