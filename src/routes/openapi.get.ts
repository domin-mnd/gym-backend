import { getSpec } from "@/utils/swagger";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const spec = await getSpec();

/**
 * @openapi
 * /v0/openapi:
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
 */
export default defineExpressRoute<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  res.json(spec);
});
