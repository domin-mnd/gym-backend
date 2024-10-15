import { db } from "@/database";
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

export default defineExpressRoute<{
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
