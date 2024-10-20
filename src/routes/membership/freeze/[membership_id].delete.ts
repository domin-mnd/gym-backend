import { db } from "@/database";
import { MembershipRepository } from "@/repositories/membership";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const membershipRepository = new MembershipRepository(db);

type PayloadParams = {
  membership_id: string;
};

export default defineExpressRoute<{
  Params: PayloadParams;
}>(async (req, res) => {
  const { success, error } = membershipRepository.validate(
    membershipRepository.Schema.Freeze,
    req.params,
  );
  if (!success) return throwError(res, error);

  const membership = await membershipRepository.get(
    req.params.membership_id,
  );
  if (!membership) return throwError(res, "Not found");

  if (membership.client_id !== res.locals.client.client_id)
    return throwError(res, "Unauthorized");

  if (membership.expires_at.getTime() <= new Date().getTime())
    return throwError(res, "Membership expired");

  const freeze = await membershipRepository.unfreeze(membership);

  res.json({
    success: true,
    freeze,
  });
});
