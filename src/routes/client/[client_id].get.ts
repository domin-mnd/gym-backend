import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import { throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const clientRepository = new ClientRepository(db);

type Payload = {
  client_id: string;
};

/**
 * @openapi
 * /v0/client/{client_id}:
 *   get:
 *     summary: Получение информации о другом клиенте
 *     description: Получение информации о другом клиенте.
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
 *         description: ID клиента
 *     responses:
 *       200:
 *         description: Успешное получение
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешно ли получение.
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
  Params: Payload;
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
