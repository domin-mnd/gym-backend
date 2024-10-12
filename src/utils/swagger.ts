import swaggerJsdoc from "swagger-jsdoc";
import { type JsonObject, serve, setup } from "swagger-ui-express";
import { version } from "../../package.json";
import { globSync } from "glob";
import { readFileSync } from "fs";
import { parse } from "yaml";
import defu from "defu";

export function defineYaml(components: string): JsonObject {
  // Using sync to match definer pattern
  const yamlFiles = globSync(components);
  const files = yamlFiles.map(fileName =>
    readFileSync(fileName, "utf-8"),
  );
  const swaggerDocs = files.map(file => parse(file));

  return defu.apply(null, swaggerDocs);
}

export function defineJsdoc(routes: string): JsonObject {
  return swaggerJsdoc({
    definition: {
      openapi: "3.1.0",
      info: {
        title: "Gym API",
        version,
      },
    },
    apis: [routes],
  });
}

export function defineSwagger(...objects: JsonObject[]) {
  // console.dir(defu.apply(null, objects), { depth: null });
  return [serve, setup(defu.apply(null, objects))];
}
