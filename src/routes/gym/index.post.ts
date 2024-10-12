import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { assertError, throwError } from "@/utils/api";
import { defineExpressRoute } from "storona";

const gymRepository = new GymRepository(db);

interface Payload {
  city: string;
  street: string;
  building: string;
  description: string;
}

export default defineExpressRoute<{
  ReqBody: Payload;
}>(async (req, res) => {
  const { success, error } = gymRepository.validate(
    gymRepository.Schema.Add,
    req.body,
  );
  if (!success) return throwError(res, error);

  const gym = await gymRepository.add(req.body);
  if (assertError(gym, res)) return;

  res.json({
    success: true,
    gym,
  });
});
