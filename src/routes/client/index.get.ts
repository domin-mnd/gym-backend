import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

/**
 * @openapi
 * /v0/client:
 *   get:
 *     summary: Получение информации о себе
 *     description: Получение информации о себе по JWT.
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешное получение
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешно ли получение.
 *                   example: true
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineExpressRoute<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  delete res.locals.client.password_hash;
  res.json({
    success: true,
    client: res.locals.client,
  });
});
