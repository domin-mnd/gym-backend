import { db } from "@/database";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const visitHistoryRepository = new VisitHistoryRepository(db);

export default defineExpressRoute<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  const visit = await visitHistoryRepository.leave(
    res.locals.client.client_id,
  );

  res.json({
    success: true,
    visit_history: visit,
  });
});
