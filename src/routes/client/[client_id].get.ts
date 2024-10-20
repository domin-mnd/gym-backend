import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import { throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const clientRepository = new ClientRepository(db);

type PayloadParams = {
  client_id: string;
};

/**
 * @openapi
 * /client/{client_id}:
 *   get:
 *     summary: Get Client
 *     description: Get any client's information using their client_id.
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: client_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the client in database
 *     responses:
 *       200:
 *         description: Successful retrieval of client's information.
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
 *                   $ref: '#/components/schemas/Client'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export default defineExpressRoute<{
  Locals: ClientLocals;
  Params: PayloadParams;
}>(async (req, res) => {
  const { success, error } = clientRepository.validate(
    clientRepository.Schema.Get,
    req.params,
  );
  if (!success) return throwError(res, error);

  const client = await clientRepository.get(req.params.client_id);
  if (!client) return throwError(res, "Not found");

  delete client.password_hash;
  res.json({
    success: true,
    client,
  });
});
