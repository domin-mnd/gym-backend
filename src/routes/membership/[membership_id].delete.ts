import { db } from "@/database";
import { MembershipRepository } from "@/repositories/membership";
import { throwError } from "@/utils/api";
import { define } from "@storona/express";

const membershipRepository = new MembershipRepository(db);

type PayloadParams = {
  membership_id: string;
};

export default define<{
  Params: PayloadParams;
}>(async (req, res) => {
  const { success, error } = membershipRepository.validate(
    membershipRepository.Schema.Cancel,
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

  await membershipRepository.revoke(+req.params.membership_id);
  res.json({
    success: true,
  });
});
