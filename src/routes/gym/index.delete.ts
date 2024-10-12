import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const gymRepository = new GymRepository(db);

interface Payload {
  gym_id: number;
}

export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = gymRepository.validate(
    gymRepository.Schema.Delete,
    req.body,
  );
  if (!success) return throwError(res, error);

  await gymRepository.delete(req.body.gym_id);
  res.json({
    success: true,
  });
});
