import express, { type Express } from "express";
import { createRouter } from "storona";
import { logRoutes } from "@/utils/logger";
import { middleware } from "@/middleware";
import {
  defineJsdoc,
  defineSwagger,
  defineYaml,
} from "@/utils/swagger";
import {
  defineEnvironment,
  definePort,
  printReady,
} from "@/utils/server";
import "dotenv/config";

async function createServer(): Promise<Express> {
  const jsdoc = defineJsdoc("./src/routes/**/*.ts");
  const yaml = defineYaml("./src/docs/**/*.yaml");
  const swagger = defineSwagger(jsdoc, yaml);

  const app = express()
    .use(express.json()) // Body parser
    .use(...middleware) // src/middleware/...
    .use("/docs", ...swagger);

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
