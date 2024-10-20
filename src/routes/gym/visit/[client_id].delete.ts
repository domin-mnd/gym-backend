import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { VisitHistoryRepository } from "@/repositories/visitHistory";
import { throwError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const visitHistoryRepository = new VisitHistoryRepository(db);
const sessionRepository = new SessionRepository(db);

type PayloadParams = {
  client_id: string;
};

export default defineExpressRoute<{
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
