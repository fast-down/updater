import { Hono } from "hono";
import { cliApp } from "./cli";
import { guiApp } from "./gui";

const app = new Hono().route("/cli", cliApp).route("/gui", guiApp);

export default app;
