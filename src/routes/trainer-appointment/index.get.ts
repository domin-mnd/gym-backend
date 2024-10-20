import { db } from "@/database";
import { TrainerAppointmentRepository } from "@/repositories/trainerAppointment";
import { throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const trainerAppointmentRepository = new TrainerAppointmentRepository(
  db,
);

interface PayloadBody {
  client_id?: number;
  as_employee?: boolean;
  // 2 Dates in ISO format
  range: [string, string];
}

export default defineExpressRoute<{
  ReqBody: PayloadBody;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = trainerAppointmentRepository.validate(
    trainerAppointmentRepository.Schema.Get,
    req.body,
  );
  if (!success) return throwError(res, error);

  const usedClientId =
    req.body.client_id ?? res.locals.client.client_id;
  const usedMethod = req.body.as_employee
    ? "getByEmployee"
    : "getByClient";

  const trainerAppointments = await trainerAppointmentRepository[
    usedMethod
  ](usedClientId, req.body.range);

  res.json({
    success: true,
    trainer_appointment: trainerAppointments,
  });
});
