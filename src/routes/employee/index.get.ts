import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

/**
 * @openapi
 * /v0/employee:
 *   get:
 *     summary: Get Employees
 *     description: Get all employees, even fired ones.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful employee retrieval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 employee:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineExpressRoute(async (_req, res) => {
  const employees = await employeeRepository.getExpanded();

  res.json({
    success: true,
    employee: employees,
  });
});
