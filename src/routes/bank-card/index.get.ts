import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

/**
 * @openapi
 * /v0/bank-card:
 *   get:
 *     summary: Получение банковских карт клиента
 *     description: Получение банковских карт по JWT клиента.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Удаление банковской карты
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешно ли получение.
 *                   example: true
 *                 bank_card:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BankCard'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineExpressRoute<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  const bankCards = await bankCardRepository.getByClient(
    res.locals.client.client_id,
  );

  res.json({
    success: true,
    bank_card: bankCards,
  });
});
