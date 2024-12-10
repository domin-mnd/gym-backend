import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import { assertError, throwError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const visitHistoryRepository = new VisitHistoryRepository(db);
const sessionRepository = new SessionRepository(db);

interface PayloadBody {
  client_id?: number;
  gym_id: number;
}

/**
 * @openapi
 * /gym/visit:
 *   post:
 *     summary: Enter Gym
 *     description: Enter certain gym by yourself or given client. You have to be an admin to enter gym for another client.
 *     tags:
 *       - Gym
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required:
 *         - gym_id
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 description: Id of the client in database
 *               gym_id:
 *                 type: string
 *                 description: Id of the gym in database
 *           example:
 *             gym_id: 1
 *     responses:
 *       200:
 *         description: Successfully entering gym.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether you/client entered gym
 *                   example: true
 *                 visit_history:
 *                   $ref: "#/components/schemas/VisitHistory"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
  ReqBody: PayloadBody;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = visitHistoryRepository.validate(
    visitHistoryRepository.Schema.Enter,
    req.body,
  );
  if (!success) return throwError(res, error);

  const jwt = getToken(req);
  const employee = await sessionRepository.getEmployee(jwt);

  if (
    req.body.client_id &&
    (!employee || employee.employee_type !== "ADMIN")
  ) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const visit = await visitHistoryRepository.enter(
    req.body.gym_id,
    req.body.client_id ?? res.locals.client.client_id,
  );
  if (assertError(visit, res)) return;

  delete visit.client_id;

  res.json({
    success: true,
    visit_history: visit,
  });
});
