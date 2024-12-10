import express, { type Express } from "express";
import helmet from "helmet";
import { createRouter } from "storona";
import { adapter } from "@storona/express";
import { logRoutes } from "@/utils/logger";
import { middleware } from "@/middleware";
import {
  defineDefaults,
  defineJsdoc,
  defineSwagger,
  defineYaml,
  exportSpec,
  getSpec,
} from "@/utils/swagger";
import {
  defineEnvironment,
  definePort,
  printReady,
} from "@/utils/server";
import "dotenv/config";
import { defineRatelimit } from "./utils/ratelimit";

async function createServer(): Promise<Express> {
  const jsdoc = defineJsdoc("./src/routes/**/*.ts");
  const yaml = defineYaml("./src/docs/**/*.yaml");
  const defaults = defineDefaults();
  // Get single openApi spec
  const openApiSpec = await getSpec(jsdoc, yaml, defaults);

  const swagger = defineSwagger(openApiSpec);
  await exportSpec(openApiSpec);

  const limiter = defineRatelimit();

  const app = express()
    .use(express.json()) // Body parser
    .use(helmet()) // Helmet
    .use(limiter) // Add ratelimits - 100 reqs per 5 minutes
    .use(...middleware) // src/middleware/...
    .use("/docs", ...swagger);

  // Router
  const routes = await createRouter(app, {
    directory: "src/routes",
    adapter: adapter({
      prefix: true,
    }),
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
