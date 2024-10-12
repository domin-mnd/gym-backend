import type { NextFunction, Request, Response } from "express";
import authenticate from "@/middleware/authenticate";
import admin from "@/middleware/admin";

export function defineExpressMiddleware(
  cb: (req: Request, res: Response, next: NextFunction) => void,
) {
  return cb;
}

export const middleware = [authenticate, admin];
