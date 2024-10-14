import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import { SessionRepository } from "@/repositories/session";
import { assertError, throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const clientRepository = new ClientRepository(db);
const sessionRepository = new SessionRepository(db);

interface Payload {
  email_address: string;
  password: string;
}

/**
 * @openapi
 * /v0/client/login:
 *   post:
 *     summary: Аутентификация клиента
 *     description: Аутентификация клиента по почте и паролю.
 *     tags:
 *       - Client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_address:
 *                 type: string
 *                 description: Почта клиента
 *                 example: "Og0rB@example.com"
 *               password:
 *                 type: string
 *                 description: Пароль клиента
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Успешная аутентификация клиента
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Успешность запроса
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = clientRepository.validate(
    clientRepository.Schema.SignIn,
    req.body,
  );
  if (!success) return throwError(res, error);

  const passwordHash = await sessionRepository.hashPassword(
    req.body.password,
  );

  const client = await clientRepository.getByEmail(
    req.body.email_address,
  );

  if (!client) return throwError(res, "Not found");
  if (client.password_hash !== passwordHash)
    return throwError(res, "Incorrect password");

  const session = await sessionRepository.create(client.client_id);
  if (assertError(session, res)) return;

  delete client.password_hash;
  delete session.client_id;

  res.json({
    success: true,
    session,
    client,
  });
});
