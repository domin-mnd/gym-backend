import { db } from "@/database";
import { ClientRepository } from "@/repositories/client";
import { SessionRepository } from "@/repositories/session";
import { assertError, throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const clientRepository = new ClientRepository(db);
const sessionRepository = new SessionRepository(db);

interface PayloadBody {
  email_address: string;
  password: string;
}

/**
 * @openapi
 * /client/login:
 *   post:
 *     summary: Authentication
 *     description: Client authentication using email and password.
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
 *                 description: Client's correct password (non-hashed)
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Successful client authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether authentication is successful
 *                   example: true
 *                 session:
 *                   $ref: "#/components/schemas/Session"
 *                 client:
 *                   $ref: "#/components/schemas/Client"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default defineExpressRoute<{
  ReqBody: PayloadBody;
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
