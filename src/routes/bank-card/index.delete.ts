import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

interface Payload {
  bank_card_id: number;
}

/**
 * @openapi
 * /v0/bank-card:
 *   delete:
 *     summary: Удаление банковской карты
 *     description: Удаление банковской карты по заранее известному ID карты. Удалить карту можно только свою относительно JWT.
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
 *               bank_card_id:
 *                 type: number
 *                 description: ID банковской карты (получить можно с помощью GET /v0/bank-card)
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
 *                   description: Успешно ли удаление.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = bankCardRepository.validate(
    bankCardRepository.Schema.Delete,
    req.body,
  );
  if (!success) return throwError(res, error);

  const bankCard = await bankCardRepository.get(
    req.body.bank_card_id,
  );
  if (!bankCard) return throwError(res, "Not found");

  if (bankCard.client_id !== res.locals.client.client_id)
    return throwError(res, "Unauthorized");

  await bankCardRepository.delete(req.body.bank_card_id);
  res.json({
    success: true,
  });
});
