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

/**
 * Parses yaml files into a single json object.
 * @param components - Glob pattern to match yaml files.
 * @returns A single json object.
 */
export function defineYaml(components: string): JsonObject {
  // Using sync to match definer pattern
  const yamlFiles = globSync(components);
  const files = yamlFiles.map(fileName =>
    readFileSync(fileName, "utf-8"),
  );
  const swaggerDocs = files.map(file => parse(file));

  return defu.apply(null, swaggerDocs);
}

/**
 * Parses jsdocs/tsdocs files into a single json object.
 * @param routes - Glob pattern to match js/ts files.
 * @returns A single json object.
 */
export function defineJsdoc(routes: string): JsonObject {
  return swaggerJsdoc({
    definition: {
      openapi: "3.1.0",
      basePath: process.env.OPENAPI_BASE_PATH,
      host: process.env.OPENAPI_HOST,
      schemes: ["http"],
      info: {
        title: "Gym API",
        version,
      },
    },
    apis: [routes],
  });
}

/**
 * Defines default values for the OpenAPI spec.
 * @returns A single json object.
 */
export function defineDefaults(): JsonObject {
  return {
    servers: [
      {
        url: `http://${process.env.OPENAPI_HOST}${process.env.OPENAPI_BASE_PATH}`,
      },
    ],
  };
}

const SPEC_DIR = "dist";
const SPEC_PATH_JSON = "dist/openapi.json";
const SPEC_PATH_YAML = "dist/openapi.yml";

/**
 * Combines the provided specs into a single object.
 * If no specs are provided, it reads the exported spec from the dist folder.
 * @param specs - The specs to combine.
 * @returns A single json object.
 * @throws If the spec is not exported yet and no argument was provided.
 */
export async function getSpec(
  ...specs: JsonObject[]
): Promise<JsonObject> {
  if (specs.length) return defu.apply(null, specs);

  if (!existsSync(SPEC_PATH_JSON))
    throw "Spec is not exported yet! Call exportSpec(spec) to export.";
  return JSON.parse(await readFile(SPEC_PATH_JSON, "utf-8"));
}

/**
 * Exports the provided spec to the dist folder as json and yaml.
 * @param spec - The spec to export.
 */
export async function exportSpec(spec: JsonObject): Promise<void> {
  await mkdir(SPEC_DIR, { recursive: true });
  await Promise.all([
    writeFile(SPEC_PATH_JSON, JSON.stringify(spec)),
    writeFile(SPEC_PATH_YAML, stringify(spec)),
  ]);
}

/**
 * Serves the OpenAPI spec using Swagger UI.
 * @param spec - The OpenAPI spec to serve.
 * @returns An array of middleware arguments.
 */
export function defineSwagger(spec: JsonObject) {
  return [serve, setup(spec)];
}
