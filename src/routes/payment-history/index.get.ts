import { db } from "@/database";
import { PaymentHistoryRepository } from "@/repositories/paymentHistory";
import { defineExpressRoute } from "storona";

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
 *                   example:
 *                     - payment_history_id: 1
 *                       type: "membership"
 *                       client_id: 1
 *                       level_type: "SIMPLE"
 *                       created_at: "2024-10-10T18:36:47.668Z"
 *                     - payment_history_id: 1
 *                       type: "trainer_appointment"
 *                       client_id: 1
 *                       employee_id: 1
 *                       gym_id: 1
 *                       appointed_at: "2024-10-10T18:36:47.668Z"
 *                       ends_at: "2024-10-10T20:36:47.668Z"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute(async (_req, res) => {
  const history = await paymentHistoryRepository.getAllParsed();

  res.json({
    success: true,
    payment_history: history,
  });
});
