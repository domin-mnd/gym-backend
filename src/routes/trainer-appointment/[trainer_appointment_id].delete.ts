import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { TrainerAppointmentRepository } from "@/repositories/trainerAppointment";
import { throwError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import type { ClientLocals } from "@/utils/types";
import { defineExpressRoute } from "storona";

const sessionRepository = new SessionRepository(db);
const trainerAppointmentRepository = new TrainerAppointmentRepository(
  db,
);

type PayloadParams = {
  trainer_appointment_id: string;
};

export default defineExpressRoute<{
  Params: PayloadParams;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = trainerAppointmentRepository.validate(
    trainerAppointmentRepository.Schema.Delete,
    req.params,
  );
  if (!success) return throwError(res, error);

  const jwt = getToken(req);
  const employee = await sessionRepository.getEmployee(jwt);

  const trainerAppointment = await trainerAppointmentRepository.get(
    req.params.trainer_appointment_id,
  );

  if (
    res.locals.client.client_id !== trainerAppointment.client_id &&
    (!employee || employee.employee_type !== "ADMIN")
  )
    return throwError(res, "Unauthorized");

  await trainerAppointmentRepository.delete(
    +req.params.trainer_appointment_id,
  );

  res.json({
    success: true,
  });
});
