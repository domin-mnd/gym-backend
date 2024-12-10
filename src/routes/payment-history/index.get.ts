import { db } from "@/database";
import { PaymentHistoryRepository } from "@/repositories/paymentHistory";
import { define } from "@storona/express";

const paymentHistoryRepository = new PaymentHistoryRepository(db);

/**
 * @openapi
 * /payment-history:
 *   get:
 *     summary: Get Payments
 *     description: Get all client's payments using JWT.
 *     tags:
 *       - PaymentHistory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of payments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 payment_history:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/PaymentHistory"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define(async (_req, res) => {
  const history = await paymentHistoryRepository.getAllParsed();

  res.json({
    success: true,
    payment_history: history,
  });
});
