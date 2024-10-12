import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { assertError, throwError } from "@/utils/api";
import type { EmployeeType } from "kysely-codegen";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

interface Payload {
  client_id: number;
  employee_type: EmployeeType;
}

export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = employeeRepository.validate(
    employeeRepository.Schema.Promote,
    req.body,
  );
  if (!success) return throwError(res, error);

  const employee = await employeeRepository.add(req.body);
  if (assertError(employee, res)) return;

  res.json({
    success: true,
    employee,
  });
});
