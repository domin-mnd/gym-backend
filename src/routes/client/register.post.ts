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
 * /v0/client/register:
 *   post:
 *     summary: Регистрация нового клиента
 *     description: Регистрация клиента по введённым данным.
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
 *                 description: Адрес электронной почты
 *                 example: "Og0rB@example.com"
 *               password:
 *                 type: string
 *                 description: Пароль клиента
 *                 example: "1234567890"
 *               first_name:
 *                 type: string
 *                 description: Имя
 *                 example: "Иван"
 *               last_name:
 *                 type: string
 *                 description: Фамилия
 *                 example: "Иванов"
 *               patronymic:
 *                 type: string
 *                 description: Отчество
 *                 example: "Иванович"
 *               phone_number:
 *                 type: string
 *                 description: Номер телефона
 *                 example: "79174236278"
 *               profile_picture_url:
 *                 type: string
 *                 description: URL изображения профиля
 *                 example: "https://example.com/profile_picture.jpg"
 *     responses:
 *       200:
 *         description: Успешная регистрация нового клиента
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
