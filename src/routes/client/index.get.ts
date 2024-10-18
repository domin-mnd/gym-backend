import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

/**
 * @openapi
 * /client:
 *   get:
 *     summary: Get Client
 *     description: Get own information using JWT.
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of client's information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
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
