import { getAPIVersion } from "@/utils/api";
import { defineExpressMiddleware } from ".";
import { SessionRepository } from "@/repositories/session";
import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { getToken } from "@/utils/jwt";

const sessionRepository = new SessionRepository(db);

const prefix = `/v${getAPIVersion()}`;
export default defineExpressMiddleware(async (req, res, next) => {
  const matchingUrls: Record<string, string[]> = {
    [`${prefix}/employee`]: ["POST", "DELETE"],
    [`${prefix}/gym`]: ["POST", "DELETE"],
  };

  if (
    !matchingUrls[req.path] ||
    !matchingUrls[req.path].includes(req.method)
  ) {
    return next();
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const employee = await sessionRepository.getEmployee(getToken(req));

  if (!employee || employee.employee_type !== "ADMIN") {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  res.locals.employee = employee;
  return next();
});
