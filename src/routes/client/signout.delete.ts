import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { assertError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import { defineExpressRoute } from "storona";

const sessionRepository = new SessionRepository(db);

/**
 * @openapi
 * /v0/client/signout:
 *   delete:
 *     summary: Выход из аккаунта
 *     description: Отзыв сессии клиента по JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный отзыв сессии
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешен ли отзыв.
 *                   example: true
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 */
export default defineExpressRoute(async (req, res) => {
  const session = await sessionRepository.get(getToken(req));
  if (assertError(session, res)) return;

  await sessionRepository.delete(session.session_id);

  res.json({
    success: true,
  });
});
