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
