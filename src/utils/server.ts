import consola from "consola";
import { colorize } from "consola/utils";

/**
 * Get preferred server port from environment.
 * @param fallbackPort - Fallback port to use if the environment variable is not set.
 * @returns Server port as number.
 */
export function definePort(fallbackPort: number = 3000): number {
  return +process.env.PORT ?? fallbackPort;
}

export enum Environment {
  Development = "DEV",
  Production = "PROD",
}

/**
 * Get environment from environment variable.
 * @returns Environment as enum.
 */
export function defineEnvironment(): Environment {
  // Includes instead of === because of script names in package.json e.g. "dev:bun" and "dev:node"
  return process.env.npm_lifecycle_event?.includes("dev")
    ? Environment.Development
    : Environment.Production;
}

/**
 * Print ready message to console.
 * @param environment - Given server environment enum.
 * @param port - Given server port.
 */
export function printReady(environment: Environment, port: number) {
  console.info("");
  consola.success(
    `  ${colorize("greenBright", "Local")}: http://localhost:${port}`,
    `\n    ${colorize("yellowBright", "Environment")}: ${environment}`,
  );
  console.info("");
}
