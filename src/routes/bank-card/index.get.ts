import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const bankCardRepository = new BankCardRepository(db);

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
