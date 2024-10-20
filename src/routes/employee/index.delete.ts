import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

interface PayloadBody {
  employee_id: number;
}

/**
 * @openapi
 * /employee:
 *   delete:
 *     summary: Fire Employee
 *     description: Fire an employee using their id (employee_id, not client_id). You can only fire an employee if you're ADMIN.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: number
 *                 description: Id of the employee in database (you can get it via GET /employee)
 *     responses:
 *       200:
 *         description: Successfully fired an employee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the an employee is fired
 *                   example: true
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute<{
  ReqBody: PayloadBody;
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
