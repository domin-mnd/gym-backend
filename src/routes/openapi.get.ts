import { getSpec } from "@/utils/swagger";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const spec = await getSpec();

/**
 * @openapi
 * /v0/openapi:
 *   get:
 *     summary: Получение документации в виде OpenAPI спецификации
 *     description: Получение JSON объекта, представляющего OpenAPI спецификацию документации.
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Успешное получение объекта документации
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
