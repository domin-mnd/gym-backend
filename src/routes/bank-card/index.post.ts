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
