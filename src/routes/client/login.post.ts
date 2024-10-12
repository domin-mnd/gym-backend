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

  if (!client) return throwError(res, "Client not found");
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
