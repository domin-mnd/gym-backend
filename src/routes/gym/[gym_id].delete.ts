import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const gymRepository = new GymRepository(db);

type PayloadParams = {
  gym_id: string;
};

/**
 * @openapi
 * /gym/{gym_id}:
 *   delete:
 *     summary: Delete Gym
 *     description: Deletes whole gym along with all visits. Do not use this endpoint unless you are sure. You can only delete gym if you're admin.
 *     tags:
 *       - Gym
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: gym_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the gym in database (retrieved using GET /gym)
 *     responses:
 *       200:
 *         description: Successful gym deletion.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether gym is deleted
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute<{
  Params: PayloadParams;
}>(async (req, res) => {
  const { success, error } = gymRepository.validate(
    gymRepository.Schema.Delete,
    req.params,
  );
  if (!success) return throwError(res, error);

  await gymRepository.delete(req.params.gym_id);
  res.json({
    success: true,
  });
});
