import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import { assertError, throwError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const visitHistoryRepository = new VisitHistoryRepository(db);
const sessionRepository = new SessionRepository(db);

interface Payload {
  client_id?: number;
  // 2 Dates in ISO format
  range: [string, string];
}

export default defineExpressRoute<{
  ReqBody: Payload;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = visitHistoryRepository.validate(
    visitHistoryRepository.Schema.History,
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

  const history = await visitHistoryRepository.history(
    req.body.client_id ?? res.locals.client.client_id,
    req.body.range,
  );
  if (assertError(history, res)) return;

  res.json({
    success: true,
    visit_history: history,
  });
});
