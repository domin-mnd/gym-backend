import swaggerJsdoc from "swagger-jsdoc";
import { type JsonObject, serve, setup } from "swagger-ui-express";
import { version } from "../../package.json";
import { globSync } from "glob";
import { existsSync, readFileSync } from "fs";
import { parse, stringify } from "yaml";
import defu from "defu";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";
import { mkdir } from "fs/promises";

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

const SPEC_DIR = "dist";
const SPEC_PATH_JSON = "dist/openapi.json";
const SPEC_PATH_YAML = "dist/openapi.yml";

export async function getSpec(
  ...specs: JsonObject[]
): Promise<JsonObject> {
  if (specs.length) return defu.apply(null, specs);

  if (!existsSync(SPEC_PATH_JSON))
    throw "Spec is not exported yet! Call exportSpec(spec) to export.";
  return JSON.parse(await readFile(SPEC_PATH_JSON, "utf-8"));
}

export async function exportSpec(spec: JsonObject): Promise<void> {
  await mkdir(SPEC_DIR, { recursive: true });
  await Promise.all([
    writeFile(SPEC_PATH_JSON, JSON.stringify(spec)),
    writeFile(SPEC_PATH_YAML, stringify(spec)),
  ]);
}

export function defineSwagger(spec: JsonObject) {
  return [serve, setup(spec)];
}
