import { Hono } from "hono";
import { createUpdaterApp } from "./factory";
import { trimTrailingSlash } from "hono/trailing-slash";

const cliApp = createUpdaterApp({
  repo: "fast-down/cli",
  filenameGenerator: (platform, arch) => {
    const ext = platform === "windows" ? ".exe" : "";
    return `fd-${platform}-${arch}${ext}`;
  },
})
  .get("/install.sh", async (c) => {
    const res = await fetch(
      "https://raw.githubusercontent.com/fast-down/cli/refs/heads/main/scripts/install.sh",
    );
    if (!res.ok) return c.text("Script not found", 404);
    return new Response(res.body, res);
  })
  .get("/install.ps1", async (c) => {
    const res = await fetch(
      "https://raw.githubusercontent.com/fast-down/cli/refs/heads/main/scripts/install.ps1",
    );
    if (!res.ok) return c.text("Script not found", 404);
    return new Response(res.body, res);
  });

const guiApp = createUpdaterApp({
  repo: "fast-down/gui",
  filenameGenerator: (platform, arch) => {
    const ext: Record<string, string> = {
      windows: ".exe",
      macos: ".dmg",
      linux: "",
    };
    return `fast-down-${platform}-${arch}${ext[platform] || ""}`;
  },
});

const app = new Hono()
  .use(trimTrailingSlash())
  .basePath("/update")
  .route("/cli", cliApp)
  .route("/gui", guiApp);

export default app;
