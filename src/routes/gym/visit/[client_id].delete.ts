import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import { throwError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const visitHistoryRepository = new VisitHistoryRepository(db);
const sessionRepository = new SessionRepository(db);

type PayloadParams = {
  client_id: string;
};

/**
 * @openapi
 * /gym/visit/{client_id}:
 *   delete:
 *     summary: Leave Gym
 *     description: Leave gym for a client. You have to be an admin to leave gym for another client.
 *     tags:
 *       - Gym
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: client_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the client in database
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
 *                   description: Whether client left gym
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
  Params: PayloadParams;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = visitHistoryRepository.validate(
    visitHistoryRepository.Schema.Leave,
    req.params,
  );
  if (!success) return throwError(res, error);

  const jwt = getToken(req);
  const employee = await sessionRepository.getEmployee(jwt);

  if (
    req.params.client_id &&
    (!employee || employee.employee_type !== "ADMIN")
  ) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const visit = await visitHistoryRepository.leave(
    +req.params.client_id ?? res.locals.client.client_id,
  );

  res.json({
    success: true,
    visit_history: visit,
  });
});
