import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import { assertError, throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

interface Payload {
  card_number: string;
  cardholder_name: string;
  expires_at: string;
  cvv: string;
}

/**
 * @openapi
 * /v0/bank-card:
 *   post:
 *     summary: Добавление банковской карты
 *     description: Добавление банковской карты по JWT клиента.
 *     tags:
 *       - BankCard
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_number:
 *                 type: string
 *                 description: Номер банковской карты
 *                 example: "4242424242424242"
 *               cardholder_name:
 *                 type: string
 *                 description: Держатель банковской карты
 *                 example: "SAKHABUTDINOV KAMIL"
 *               expires_at:
 *                 type: string
 *                 format: date
 *                 description: Срок действия банковской карты
 *                 example: "2025-01-01"
 *               cvv:
 *                 type: string
 *                 description: CVC/CVV код
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Добавление банковской карты
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешно ли добавление.
 *                   example: true
 *                 bank_card:
 *                   $ref: '#/components/schemas/BankCard'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineExpressRoute<{
  ReqBody: Payload;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = bankCardRepository.validate(
    bankCardRepository.Schema.Add,
    req.body,
  );
  if (!success) return throwError(res, error);

  const payload = {
    ...req.body,
    client_id: res.locals.client.client_id,
  };

  const bankCard = await bankCardRepository.add(payload);
  if (assertError(bankCard, res)) return;

  res.json({
    success: true,
    bank_card: bankCard,
  });
});
