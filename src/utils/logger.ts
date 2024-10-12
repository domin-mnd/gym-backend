import consola from "consola";
import { type ColorName, colorize } from "consola/utils";
import type { createRouter } from "storona";

/**
 * Get max method length from the given array of routes.
 * @param routes - Array of routes with its results.
 * @returns Max string length of a method.
 */
function getMaxMethodLength(
  routes: Awaited<ReturnType<typeof createRouter>>,
) {
  return Math.max(
    ...routes.map(route => route.registered && route.method!.length),
  );
}

/**
 * Prepend a space to a string until it reaches the given length.
 * @param word - Given string.
 * @param length - Length to reach.
 * @returns String of the given length.
 */
function addSpace(word: string, length: number): string {
  return " ".repeat(length - word.length) + word;
}

/**
 * Constant color table for methods.
 */
const table: Record<string, ColorName> = {
  get: "greenBright",
  post: "yellowBright",
  put: "cyanBright",
  patch: "blueBright",
  delete: "redBright",
};

/**
 * Colorize given string to match method's table color.
 * @param method - Method name to color.
 * @returns Console colored string.
 */
export function colorizeMethod(method: string): string {
  return colorize(table[method.trim()], method.toUpperCase());
}

/**
 * Log all routes in console.
 * @param routes - Array of routes with its results.
 */
export function logRoutes(
  routes: Awaited<ReturnType<typeof createRouter>>,
) {
  const maxMethodLength = getMaxMethodLength(routes);

  for (const route of routes) {
    const method = colorizeMethod(
      addSpace(
        "method" in route ? route.method : "",
        maxMethodLength,
      ),
    );

    if (route.registered === true) {
      const colorizedEndpoint = colorize(
        "gray",
        route.endpoint.toString(),
      );
      consola.info(`  ${method}  ${colorizedEndpoint}`);
    } else if (route.registered === false) {
      const normalizedPath = route.path.replace(/\\/g, "/");
      const colorizedPath = colorize("gray", normalizedPath);

      consola.fail(
        `  ${method}  ${colorizedPath}: ${route.error.message}`,
      );
    }
  }
}
