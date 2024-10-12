import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { assertError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import { defineExpressRoute } from "storona";

const sessionRepository = new SessionRepository(db);

export default defineExpressRoute(async (req, res) => {
  const session = await sessionRepository.get(getToken(req));
  if (assertError(session, res)) return;

  await sessionRepository.delete(session.session_id);

  res.json({
    success: true,
  });
});
