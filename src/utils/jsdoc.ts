import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { version } from "../../package.json";

export function defineJsdoc() {
  const openApiSpec = swaggerJsdoc({
    definition: {
      openapi: "3.1.0",
      info: {
        title: "Gym API",
        version,
      },
    },
    apis: ["./src/routes/**/*.ts"],
  });

  return [serve, setup(openApiSpec)];
}
