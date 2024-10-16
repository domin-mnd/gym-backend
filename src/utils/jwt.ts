import type { Request } from "express";

/**
 * Get JSON Web Token from Authorization header.
 * @param req - Express request body.
 * @returns JSON Web Token or an empty string.
 */
// biome-ignore lint/suspicious/noExplicitAny: The only thing that matters is the authorization header
export function getToken(req: Request<any, any, any, any, any>) {
  return req.headers.authorization?.replace("Bearer ", "") ?? "";
}
