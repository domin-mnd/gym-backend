import { defineConfig } from "korob";

export default defineConfig({
  start: {
    format: "esm",
  },
  build: {
    format: ["esm"],
    onSuccess: "node dist/index.mjs",
  },
  diagnostics: {
    biome: {
      linter: {
        rules: {
          style: {
            useNodejsImportProtocol: "off",
          },
          correctness: {
            noUndeclaredVariables: "off",
          },
        },
      },
    },
  },
});
