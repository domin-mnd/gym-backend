import { db } from "@/database";
import { MembershipRepository } from "@/repositories/membership";
import { throwError } from "@/utils/api";
import { define } from "@storona/express";

const membershipRepository = new MembershipRepository(db);

interface PayloadBody {
  membership_id: number;
}

/**
 * @openapi
 * /membership/freeze:
 *   post:
 *     summary: Freeze Membership
 *     description: Freeze membership by given id. You can only freeze/unfreeze your own memberships.
 *     tags:
 *       - Membership
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membership_id:
 *                 type: number
 *                 description: Id of the appointment in database (retrieved using GET /membership/active)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successful freezing of a membership.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether membership was freezed
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
export default define<{
  ReqBody: PayloadBody;
}>(async (req, res) => {
  const { success, error } = membershipRepository.validate(
    membershipRepository.Schema.Freeze,
    req.body,
  );
  if (!success) return throwError(res, error);

  const membership = await membershipRepository.get(
    req.body.membership_id,
  );
  if (!membership) return throwError(res, "Not found");

  if (membership.client_id !== res.locals.client.client_id)
    return throwError(res, "Unauthorized");

  if (membership.expires_at.getTime() <= new Date().getTime())
    return throwError(res, "Membership expired");

  const freeze = await membershipRepository.freeze(membership);

  res.json({
    success: true,
    freeze,
  });
});
