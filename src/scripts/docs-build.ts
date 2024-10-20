import {
  defineDefaults,
  defineJsdoc,
  defineYaml,
  exportSpec,
  getSpec,
} from "@/utils/swagger";
import "dotenv/config";

main();

/**
 * Parses tsdocs and yaml files of the project into a single OpenAPI spec json.
 * Then it exports spec to dist/openapi.json & dist/openapi.yaml.
 * @see {@link .github/actions/docs-build/action.yml} for the workflow that triggers this script.
 */
async function main() {
  const jsdoc = defineJsdoc("./src/routes/**/*.ts");
  const yaml = defineYaml("./src/docs/**/*.yaml");
  const defaults = defineDefaults();
  const openApiSpec = await getSpec(jsdoc, yaml, defaults);

  await exportSpec(openApiSpec);
}
