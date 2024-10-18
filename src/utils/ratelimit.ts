import rateLimit from "express-rate-limit";

/**
 * Define a middleware for ratelimiting using a library.
 * @returns Rate limit middleware for express.
 */
export function defineRatelimit() {
  return rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: true, // Enable the `X-RateLimit-*` headers.
    message: {
      success: false,
      error: "Too many requests, please try again later",
    },
  });
}
