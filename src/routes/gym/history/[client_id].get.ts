import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import { assertError, throwError } from "@/utils/api";
import { getGraph } from "@/utils/graph";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const visitHistoryRepository = new VisitHistoryRepository(db);

type PayloadQs = {
  // 2 Dates in ISO format
  range: [string, string];
};

type PayloadParams = {
  client_id: string;
};

/**
 * @openapi
 * /v0/gym/history/{client_id}:
 *   get:
 *     summary: Get History
 *     description: Get any client's gym visit history using their client_id.
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: client_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the client in database
 */
export default defineExpressRoute<{
  ReqQuery: PayloadQs;
  Params: PayloadParams;
  Locals: ClientLocals;
}>(async (req, res) => {
  const params = visitHistoryRepository.validate(
    visitHistoryRepository.Schema.HistoryParams,
    req.params,
  );
  if (!params.success) return throwError(res, params.error);

  const qs = visitHistoryRepository.validate(
    visitHistoryRepository.Schema.HistoryQuery,
    req.query,
  );
  if (!qs.success) return throwError(res, qs.error);

  const history = await visitHistoryRepository.history(
    +req.params.client_id,
    req.query.range,
  );
  if (assertError(history, res)) return;

  res.json({
    success: true,
    visit_history: history,
    graph: getGraph(history, req.query.range),
  });
});
