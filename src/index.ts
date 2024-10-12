import express, { type Express } from "express";
import { createRouter } from "storona";
import { logRoutes } from "@/utils/logger";
import { middleware } from "@/middleware";
import {
  defineEnvironment,
  definePort,
  printReady,
} from "@/utils/server";
import "dotenv/config";
import { defineJsdoc } from "./utils/jsdoc";

async function createServer(): Promise<Express> {
  const jsdoc = defineJsdoc();

  const app = express()
    .use(express.json()) // Body parser
    .use(...middleware) // src/middleware/...
    .use("/docs", ...jsdoc);

  // Router
  const routes = await createRouter(app, {
    directory: "src/routes",
    prefix: true,
    quiet: true,
  });

  logRoutes(routes);
  return app;
}

const server = await createServer();
const port = definePort(3000);
const environment = defineEnvironment();

server.listen(port, () => {
  printReady(environment, port);
});
