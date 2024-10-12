import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

export default defineExpressRoute(async (_req, res) => {
  const employees = await employeeRepository.getAll();

  res.json({
    success: true,
    employee: employees,
  });
});
