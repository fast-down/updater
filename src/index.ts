import { Hono } from "hono";
import { createUpdaterApp } from "./factory";

const cliApp = createUpdaterApp({
  repo: "fast-down/cli",
  filenameGenerator: (platform, arch) => {
    const ext = platform === "windows" ? ".exe" : "";
    return `fd-${platform}-${arch}${ext}`;
  },
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
  .basePath("/update")
  .route("/cli", cliApp)
  .route("/gui", guiApp);

export default app;
