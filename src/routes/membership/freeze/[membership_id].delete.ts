import { db } from "@/database";
import { MembershipRepository } from "@/repositories/membership";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const membershipRepository = new MembershipRepository(db);

type PayloadParams = {
  membership_id: string;
};

/**
 * @openapi
 * /membership/freeze/{membership_id}:
 *   delete:
 *     summary: Unfreeze Membership
 *     description: Unfreeze membership by given id. You can only freeze/unfreeze your own memberships.
 *     tags:
 *       - Membership
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: membership_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the membership in database (retrieved using GET /membership/any)
 *     responses:
 *       200:
 *         description: Successful unfreezing of membership.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether membership is unfreezed
 *                   example: true
 *                 freeze:
 *                   $ref: "#/components/schemas/Membership"
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
