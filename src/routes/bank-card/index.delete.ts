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
 *     summary: Delete Card
 *     description: Bank card deletion using an already known id. You can only delete your card using JWT.
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
 *                 description: Bank card ID (retrieved using GET /v0/bank-card)
 *     responses:
 *       200:
 *         description: Successful bank card deletion.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether bank card is deleted
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
