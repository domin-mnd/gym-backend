import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { assertError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import { defineExpressRoute } from "storona";

const sessionRepository = new SessionRepository(db);

/**
 * @openapi
 * /client/sign-out:
 *   delete:
 *     summary: Sign Out
 *     description: Client's session revoke.
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful given session revoke.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether session is revoked
 *                   example: true
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute(async (req, res) => {
  const session = await sessionRepository.get(getToken(req));
  if (assertError(session, res)) return;

  await sessionRepository.delete(session.session_id);

  res.json({
    success: true,
  });
});
