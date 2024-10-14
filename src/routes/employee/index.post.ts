import { db } from "@/database";
import { EmployeeRepository } from "@/repositories/employee";
import { assertError, throwError } from "@/utils/api";
import type { EmployeeType } from "kysely-codegen";
import { defineExpressRoute } from "storona";

const employeeRepository = new EmployeeRepository(db);

interface Payload {
  client_id: number;
  employee_type: EmployeeType;
  left_at?: Date;
}

/**
 * @openapi
 * /v0/employee:
 *   post:
 *     summary: Найм клиента в качестве сотрудника
 *     description: Найм нового сотрудника используя учётную запись клиента (клиент превращается в сотрудника). Нанять можно только при условии что сам вызов запроса происходит от сотрудника администратора.
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
 *                 description: ID клиента (получить можно с помощью GET /v0/client)
 *               employee_type:
 *                 type: string
 *                 description: Тип сотрудника
 *               left_at:
 *                 type: string
 *                 format: date
 *                 description: Дата увольнения сотрудника (не обязательное поле)
 *     responses:
 *       200:
 *         description: Добавление нового сотрудника
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешно ли добавление.
 *                   example: true
 *                 employee:
 *                   type: object
 *                   properties:
 *                     client_id:
 *                       type: number
 *                       description: Идентификатор клиента из БД
 *                       example: 1
 *                     employee_id:
 *                       type: number
 *                       description: Идентификатор сотрудника из БД
 *                       example: 1
 *                     employee_type:
 *                       type: string
 *                       enum: [ADMIN, INSTRUCTOR, TRAINER]
 *                       description: Тип сотрудника
 *                       example: "ADMIN"
 *                     left_at:
 *                       type: string
 *                       format: date
 *                       description: Дата увольнения сотрудника (не обязательное поле)
 *                       example: "2024-10-15T19:12:03.028Z"
 *                     hired_at:
 *                       type: string
 *                       format: date
 *                       description: Дата приема на работу сотрудника
 *                       example: "2024-10-10T18:36:47.668Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
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
