import { db } from "@/database";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const visitHistoryRepository = new VisitHistoryRepository(db);

/**
 * @openapi
 * /gym/visit:
 *   delete:
 *     summary: Leave Gym
 *     description: Leave gym using JWT.
 *     tags:
 *       - Gym
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully left gym.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether you left gym
 *                 visit_history:
 *                   $ref: "#/components/schemas/VisitHistory"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  const visit = await visitHistoryRepository.leave(
    res.locals.client.client_id,
  );

  delete visit.client_id;

  res.json({
    success: true,
    visit_history: visit,
  });
});
