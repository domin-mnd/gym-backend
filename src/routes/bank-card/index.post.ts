import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import { assertError, throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

interface PayloadBody {
  card_number: string;
  cardholder_name: string;
  expires_at: string;
  cvv: string;
}

/**
 * @openapi
 * /bank-card:
 *   post:
 *     summary: Add Card
 *     description: Add new client's bank card using its JWT.
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
 *                 description: Bank card number
 *                 example: "4242424242424242"
 *               cardholder_name:
 *                 type: string
 *                 description: Owner of the card
 *                 example: "SAKHABUTDINOV KAMIL"
 *               expires_at:
 *                 type: string
 *                 format: date
 *                 description: Card's expiration date
 *                 example: "2025-01-01"
 *               cvv:
 *                 type: string
 *                 description: CVC/CVV
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Successful adding of a new card.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether card was added
 *                   example: true
 *                 bank_card:
 *                   $ref: '#/components/schemas/BankCard'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineExpressRoute<{
  ReqBody: PayloadBody;
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
