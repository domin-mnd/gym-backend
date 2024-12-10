import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { define } from "@storona/express";

const employeeRepository = new EmployeeRepository(db);

/**
 * @openapi
 * /employee:
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
 *                     $ref: "#/components/schemas/Employee"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define(async (_req, res) => {
  const employees = await employeeRepository.getExpanded();

  res.json({
    success: true,
    employee: employees,
  });
});
