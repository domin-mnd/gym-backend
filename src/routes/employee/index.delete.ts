import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

interface Payload {
  employee_id: number;
}

/**
 * @openapi
 * /v0/employee:
 *   delete:
 *     summary: Увольнение сотрудника
 *     description: Фактическое увольнение сотрудника по его ID (не client_id, а employee_id). Уволить можно только при условии что сам вызов запроса происходит от сотрудника администратора.
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
 *                 description: ID сотрудника (получить можно с помощью GET /v0/employee)
 *     responses:
 *       200:
 *         description: Увольнение сотрудника
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешно ли увольнение.
 *                   example: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
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
