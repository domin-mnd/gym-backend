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

interface Payload {
  client_id?: number;
  trainer_appointment_id: number;
}

export default defineExpressRoute<{
  ReqBody: Payload;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = trainerAppointmentRepository.validate(
    trainerAppointmentRepository.Schema.Delete,
    req.body,
  );
  if (!success) return throwError(res, error);

  const jwt = getToken(req);
  const employee = await sessionRepository.getEmployee(jwt);

  const trainerAppointment = await trainerAppointmentRepository.get(
    req.body.trainer_appointment_id,
  );

  if (
    res.locals.client.client_id !== trainerAppointment.client_id &&
    (!employee || employee.employee_type !== "ADMIN")
  )
    return throwError(res, "Unauthorized");

  await trainerAppointmentRepository.delete(
    req.body.trainer_appointment_id,
  );

  res.json({
    success: true,
  });
});
