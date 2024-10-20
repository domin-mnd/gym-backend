import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const gymRepository = new GymRepository(db);

type PayloadParams = {
  gym_id: string;
};

export default defineExpressRoute<{
  Params: PayloadParams;
}>(async (req, res) => {
  const { success, error } = gymRepository.validate(
    gymRepository.Schema.Delete,
    req.params,
  );
  if (!success) return throwError(res, error);

  await gymRepository.delete(req.params.gym_id);
  res.json({
    success: true,
  });
});
