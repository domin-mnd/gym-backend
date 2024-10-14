import { db } from "@/database";
import { BankCardRepository } from "@/repositories/bankCard";
import { MembershipRepository } from "@/repositories/membership";
import { PaymentHistoryRepository } from "@/repositories/paymentHistory";
import { assertError, throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import type { LevelType } from "kysely-codegen";
import { defineExpressRoute } from "storona";

const membershipRepository = new MembershipRepository(db);
const bankCardRepository = new BankCardRepository(db);
const paymentHistoryRepository = new PaymentHistoryRepository(db);

interface Payload {
  bank_card_id: number;
  level_type: LevelType;
}

export default defineExpressRoute<{
  ReqBody: Payload;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = membershipRepository.validate(
    membershipRepository.Schema.Subscribe,
    req.body,
  );
  if (!success) return throwError(res, error);

  // Validate bank card
  const bankCard = await bankCardRepository.get(
    req.body.bank_card_id,
  );

  if (!bankCard) return throwError(res, "Not found");
  if (bankCard.client_id !== res.locals.client.client_id)
    return throwError(res, "Unauthorized");

  // Validate existing subscription
  const existingSubscription = await membershipRepository.getAny(
    res.locals.client.client_id,
  );

  if (existingSubscription) {
    if (existingSubscription.level_type === req.body.level_type) {
      return throwError(res, "Already subscribed");
    } else {
      await membershipRepository.revoke(
        existingSubscription.membership_id,
      );
    }
  }

  // Subscribe
  const subscription =
    await paymentHistoryRepository.membershipSubscribe({
      client_id: res.locals.client.client_id,
      bank_card_id: req.body.bank_card_id,
      level_type: req.body.level_type,
    });
  if (assertError(subscription, res)) return;

  res.json({
    success: true,
    subscription,
  });
});
