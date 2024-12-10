import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { define } from "@storona/express";

const gymRepository = new GymRepository(db);

/**
 * @openapi
 * /gym:
 *   get:
 *     summary: Get Gyms
 *     description: Get all existing gyms.
 *     tags:
 *       - Gym
 *     responses:
 *       200:
 *         description: Successful retrieval of gyms.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 gym:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Gym"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define(async (_req, res) => {
  const gyms = await gymRepository.getAll();

  res.json({
    success: true,
    gym: gyms,
  });
});
