import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

interface Payload {
  employee_id: number;
}

export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = employeeRepository.validate(
    employeeRepository.Schema.Fire,
    req.body,
  );
  if (!success) return throwError(res, error);

  await employeeRepository.delete(req.body.employee_id);
  res.json({
    success: true,
  });
});
