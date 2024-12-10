import { getSpec } from "@/utils/swagger";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const spec = getSpec();

/**
 * @openapi
 * /openapi:
 *   get:
 *     summary: Get OpenAPI Docs
 *     description: Get JSON object, representing OpenAPI specification docs.
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Successful documentation retrieval.
 *         content:
 *           application/json:
 *             schema:
 *               type: any
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  res.json(await spec);
});
