import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { assertError, throwError } from "@/utils/api";
import type { EmployeeType } from "kysely-codegen";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

interface PayloadBody {
  client_id: number;
  employee_type: EmployeeType;
  left_at?: Date;
}

/**
 * @openapi
 * /employee:
 *   post:
 *     summary: Hire Employee
 *     description: Hire client as an employee in gym. You can only hire an employee if you're ADMIN.
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
 *               client_id:
 *                 type: number
 *                 description: Id of the client in database (you can get it via GET /client)
 *               employee_type:
 *                 type: string
 *                 description: Employee's job posting
 *               left_at:
 *                 type: string
 *                 format: date
 *                 description: Employee's firing date (can be undefined)
 *     responses:
 *       200:
 *         description: Successfully hired new employee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether an employee is hired
 *                   example: true
 *                 employee:
 *                   type: object
 *                   properties:
 *                     client_id:
 *                       type: number
 *                       description: Id of the client in database
 *                       example: 1
 *                     employee_id:
 *                       type: number
 *                       description: Id of the employee in database
 *                       example: 1
 *                     employee_type:
 *                       type: string
 *                       enum: [ADMIN, INSTRUCTOR, TRAINER]
 *                       description: Employee's current job posting
 *                       example: "ADMIN"
 *                     left_at:
 *                       type: string
 *                       format: date
 *                       description: Employee's firing date (can be undefined)
 *                       example: "2024-10-15T19:12:03.028Z"
 *                     hired_at:
 *                       type: string
 *                       format: date
 *                       description: Employee's hiring date
 *                       example: "2024-10-10T18:36:47.668Z"
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
