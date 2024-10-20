import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

/**
 * @openapi
 * /bank-card:
 *   get:
 *     summary: Get Cards
 *     description: Get client's bank cards using JWT.
 *     tags:
 *       - BankCard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of bank cards.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 bank_card:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/BankCard"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
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
