import {
  defineJsdoc,
  defineYaml,
  exportSpec,
  getSpec,
} from "@/utils/swagger";

main();

/**
 * Parses tsdocs and yaml files of the project and parses them into a single OpenAPI spec json.
 * Then it export spec to dist/openapi.json.
 */
async function main() {
  const jsdoc = defineJsdoc("./src/routes/**/*.ts");
  const yaml = defineYaml("./src/docs/**/*.yaml");
  const openApiSpec = await getSpec(jsdoc, yaml);

  await exportSpec(openApiSpec);
}
