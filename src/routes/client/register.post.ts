import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import { SessionRepository } from "@/repositories/session";
import { assertError, throwError } from "@/utils/api";
import type { Insertable } from "kysely";
import type { Client } from "kysely-codegen";
import { defineExpressRoute } from "storona";

const clientRepository = new ClientRepository(db);
const sessionRepository = new SessionRepository(db);

interface Payload
  extends Omit<
    Insertable<Client>,
    "client_id" | "password_hash" | "created_at"
  > {
  password: string;
}

/**
 * @openapi
 * /client/register:
 *   post:
 *     summary: Registration
 *     description: Register new client with given input.
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
 *                 description: Client's email address
 *                 example: "Og0rB@example.com"
 *               password:
 *                 type: string
 *                 description: Client's password (at least 8 characters long)
 *                 example: "1234567890"
 *               first_name:
 *                 type: string
 *                 description: Client's first name
 *                 example: "Иван"
 *               last_name:
 *                 type: string
 *                 description: Client's last name
 *                 example: "Иванов"
 *               patronymic:
 *                 type: string
 *                 description: Client's patronymic/middle name
 *                 example: "Иванович"
 *               phone_number:
 *                 type: string
 *                 description: Client's phone number
 *                 example: "79174236278"
 *               profile_picture_url:
 *                 type: string
 *                 description: Link to client's profile picture, typically uploaded using POST /v0/profile-picture
 *                 example: "https://example.com/profile_picture.jpg"
 *     responses:
 *       200:
 *         description: Successful client registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether client is registered
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = clientRepository.validate(
    clientRepository.Schema.SignUp,
    req.body,
  );
  if (!success) return throwError(res, error);

  const passwordHash = await sessionRepository.hashPassword(
    req.body.password,
  );

  delete req.body.password;
  const clientPayload: Insertable<Client> = {
    ...req.body,
    created_at: new Date(),
    password_hash: passwordHash,
  };

  const client = await clientRepository.add(clientPayload);
  if (assertError(client, res)) return;

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
