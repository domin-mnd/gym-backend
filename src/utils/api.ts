import type { Response } from "express";
import { ZodError } from "zod";
import { version } from "../../package.json";

/**
 * Assert that given data is an error.
 * @param data - Certain payload whether it's body or params.
 * @param res - Express response object.
 * @returns Whether given data is an error.
 */
export function assertError(
  data: unknown,
  res: Response,
): data is Error {
  if (data instanceof Error) {
    throwError(res, data);
  }
  return data instanceof Error;
}

/**
 * Throw a prettified error to the client.
 * @param res - Express response object.
 * @param error - Any error object.
 */
export function throwError(
  res: Response,
  error: Error | object | object[] | string,
) {
  let statusCode = 400;

  if (typeof error === "string" && error === "Unauthorized")
    statusCode = 401;

  if (typeof error === "string" && error === "Not found")
    statusCode = 404;

  if (!(error instanceof Error)) {
    res.status(statusCode).json({
      success: false,
      error,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(statusCode).json({
      success: false,
      error: error.issues,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: error.message,
  });
}

/**
 * Get the major API version from package.json.
 * @returns API version.
 */
export function getAPIVersion(): number {
  return +version.split(".")[0];
}
