import { db } from "@/database";
import { GymRepository } from "@/repositories/gym";
import { defineExpressRoute } from "storona";

const gymRepository = new GymRepository(db);

export default defineExpressRoute(async (_req, res) => {
  const gyms = await gymRepository.getAll();

  res.json({
    success: true,
    gym: gyms,
  });
});
