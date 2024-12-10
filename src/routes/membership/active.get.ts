import { db } from "@/database";
import { MembershipRepository } from "@/repositories/membership";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const membershipRepository = new MembershipRepository(db);

export default define<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  const membership = await membershipRepository.getActive(
    res.locals.client.client_id,
  );

  res.json({
    success: true,
    membership,
  });
});
