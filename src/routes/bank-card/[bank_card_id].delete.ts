import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

type PayloadParams = {
  bank_card_id: string;
};

/**
 * @openapi
 * /bank-card/{bank_card_id}:
 *   delete:
 *     summary: Delete Card
 *     description: Bank card deletion using an already known id. You can only delete your card using JWT.
 *     tags:
 *       - BankCard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bank_card_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the bank card in database (retrieved using GET /bank-card)
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
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute<{
  Params: PayloadParams;
}>(async (req, res) => {
  const { success, error } = bankCardRepository.validate(
    bankCardRepository.Schema.Delete,
    req.params,
  );
  if (!success) return throwError(res, error);

  const bankCard = await bankCardRepository.get(
    req.params.bank_card_id,
  );
  if (!bankCard) return throwError(res, "Not found");

  if (bankCard.client_id !== res.locals.client.client_id)
    return throwError(res, "Unauthorized");

  await bankCardRepository.delete(req.params.bank_card_id);
  res.json({
    success: true,
  });
});
