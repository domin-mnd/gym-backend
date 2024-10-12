import { getAPIVersion } from "@/utils/api";
import { defineExpressMiddleware } from ".";
import { SessionRepository } from "@/repositories/session";
import { db } from "@/database";
import { getToken } from "@/utils/jwt";

const sessionRepository = new SessionRepository(db);

const swaggerEndpoints = [
  "/docs",
  "/docs/",
  "/docs/swagger-ui.css",
  "/docs/swagger-ui-bundle.js",
  "/docs/swagger-ui-standalone-preset.js",
  "/docs/swagger-ui-init.js",
];

const prefix = `/v${getAPIVersion()}`;

const allowedUrls: Record<string, string[]> = {
  [`${prefix}/client/register`]: ["POST"],
  [`${prefix}/client/login`]: ["POST"],
  [`${prefix}/gym`]: ["GET"],
  ...swaggerEndpoints.reduce<Record<string, string[]>>((acc, url) => {
    acc[url] = ["GET"];
    return acc;
  }, {}),
};

export default defineExpressMiddleware(async (req, res, next) => {
  if (
    allowedUrls[req.path] &&
    allowedUrls[req.path].includes(req.method)
  ) {
    return next();
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const client = await sessionRepository.getClient(getToken(req));

  if (!client) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  res.locals.client = client;
  return next();
});
