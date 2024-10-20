import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { assertError, throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const gymRepository = new GymRepository(db);

interface PayloadBody {
  city: string;
  street: string;
  building: string;
  description: string;
}

/**
 * @openapi
 * /gym:
 *   post:
 *     summary: Add Gym
 *     description: Add new gym. You can only add gym if you're admin.
 *     tags:
 *       - Gym
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 description: City where gym is located
 *                 example: "Казань"
 *               street:
 *                 type: string
 *                 description: Street where gym is located
 *                 example: "Хади Такташа"
 *               building:
 *                 type: string
 *                 format: date
 *                 description: Building number
 *                 example: "24"
 *               description:
 *                 type: string
 *                 description: Gym's description
 *                 example: "Фитнес-клуб премиум-класса, расположенный в самом сердце Казани."
 *     responses:
 *       200:
 *         description: Successful adding of a gym.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether gym was added
 *                   example: true
 *                 gym:
 *                   $ref: "#/components/schemas/Gym"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute<{
  ReqBody: PayloadBody;
}>(async (req, res) => {
  const { success, error } = gymRepository.validate(
    gymRepository.Schema.Add,
    req.body,
  );
  if (!success) return throwError(res, error);

  const gym = await gymRepository.add(req.body);
  if (assertError(gym, res)) return;

  res.json({
    success: true,
    gym,
  });
});
