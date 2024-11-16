import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const clientRepository = new ClientRepository(db);

/**
 * @openapi
 * /client/all:
 *   get:
 *     summary: Get Clients
 *     description: Get information about all clients.
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
export default defineExpressRoute<{
  Locals: ClientLocals;
}>(async (_req, res) => {
  const clients = await clientRepository.getAll();

  res.json({
    success: true,
    client: clients,
  });
});
