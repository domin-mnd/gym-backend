import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import { define } from "@storona/express";

const clientRepository = new ClientRepository(db);

/**
 * @openapi
 * /clients:
 *   get:
 *     summary: Get Clients
 *     description: Get information about all clients (pagination to be added).
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of clients' information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 client:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Client"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define(async (_req, res) => {
  const clients = await clientRepository.getAll();

  res.json({
    success: true,
    client: clients,
  });
});
