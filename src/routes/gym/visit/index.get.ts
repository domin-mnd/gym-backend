import { db } from "@/database";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import { assertError, throwError } from "@/utils/api";
import { getGraph } from "@/utils/graph";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const visitHistoryRepository = new VisitHistoryRepository(db);

type PayloadQs = {
  // 2 Dates in ISO format
  range: [string, string];
};

/**
 * @openapi
 * /gym/visit:
 *   get:
 *     summary: Get History
 *     description: Get own gym visit history using JWT.
 *     tags:
 *       - Gym
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of own gym visit history.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 visit_history:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/VisitHistory"
 *                 graph:
 *                   $ref: "#/components/schemas/VisitGraph"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
  ReqQuery: PayloadQs;
  Locals: ClientLocals;
}>(async (req, res) => {
  const qs = visitHistoryRepository.validate(
    visitHistoryRepository.Schema.HistoryQuery,
    req.query,
  );
  if (!qs.success) return throwError(res, qs.error);

  const history = await visitHistoryRepository.history(
    res.locals.client.client_id,
    req.query.range,
  );
  if (assertError(history, res)) return;

  res.json({
    success: true,
    visit_history: history,
    graph: getGraph(history, req.query.range),
  });
});
