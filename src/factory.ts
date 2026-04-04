import { Hono } from "hono";
import * as cheerio from "cheerio";
import { normalizeArch } from "./arch";
import { normalizePlatform } from "./platform";

export interface UpdaterConfig {
  repo: string;
  filenameGenerator: (platform: string, arch: string) => string;
}

export function createUpdaterApp(config: UpdaterConfig) {
  const app = new Hono();

  async function getLatestVersion() {
    const resp = await fetch(
      `https://github.com/${config.repo}/releases/latest/`,
    );
    const tag = resp.url.split("/").pop() || "";
    return tag.replace(/^v/, "");
  }

  app.get("/latest", async (c) => {
    const version = await getLatestVersion();
    const infoResp = await fetch(
      `https://github.com/${config.repo}/releases/expanded_assets/v${version}`,
    );
    const html = await infoResp.text();
    const $ = cheerio.load(html, { baseURI: infoResp.url });
    const assets = $("ul>li")
      .map((_, el) => {
        const a = $(el).find("a");
        return {
          name: a.text().trim(),
          url: a.prop("href") || "",
        };
      })
      .toArray()
      .filter((item) => item.name && !item.name.includes("Source code"))
      .map((item) => {
        const match = item.name.match(
          /-(windows|linux|macos)-([a-zA-Z0-9_]+)/i,
        );
        if (!match) return null;
        return {
          platform: match[1].toLowerCase(),
          arch: match[2].toLowerCase(),
        };
      })
      .filter((item) => item !== null);
    return c.json({
      version,
      assets,
    });
  });

  app.get("/download/:version/:platform/:arch", async (c) => {
    let version = c.req.param("version").trim().toLowerCase().replace(/^v/, "");
    const platform = normalizePlatform(c.req.param("platform"));
    if (platform === "unknown") return c.text("Unsupported platform", 404);
    const arch = normalizeArch(c.req.param("arch"));
    if (arch === "unknown" || (platform === "macos" && arch === "x86"))
      return c.text("Unsupported architecture", 404);
    if (version === "latest") version = await getLatestVersion();
    const filename = config.filenameGenerator(platform, arch);
    const url = `https://github.com/${config.repo}/releases/download/v${version}/${filename}`;
    const resp = await fetch(url, { redirect: "manual", method: "HEAD" });
    if (resp.status !== 302) return c.notFound();
    return c.redirect(url);
  });

  app
    .get("/install.sh", async (c) => {
      const res = await fetch(
        `https://raw.githubusercontent.com/${config.repo}/refs/heads/main/scripts/install.sh`,
      );
      if (!res.ok) return c.text("Script not found", 404);
      return new Response(res.body, res);
    })
    .get("/install.ps1", async (c) => {
      const res = await fetch(
        `https://raw.githubusercontent.com/${config.repo}/refs/heads/main/scripts/install.ps1`,
      );
      if (!res.ok) return c.text("Script not found", 404);
      return new Response(res.body, res);
    });

  return app;
}
