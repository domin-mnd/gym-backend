import { db } from "@/database";
import { PaymentHistoryRepository } from "@/repositories/paymentHistory";
import { defineExpressRoute } from "storona";

const paymentHistoryRepository = new PaymentHistoryRepository(db);

export default defineExpressRoute(async (_req, res) => {
  const history = await paymentHistoryRepository.getAllParsed();

  res.json({
    success: true,
    payment_history: history,
  });
});
