import { db } from "@/database";
import { SessionRepository } from "@/repositories/session";
import { TrainerAppointmentRepository } from "@/repositories/trainerAppointment";
import { throwError } from "@/utils/api";
import { getToken } from "@/utils/jwt";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const sessionRepository = new SessionRepository(db);
const trainerAppointmentRepository = new TrainerAppointmentRepository(
  db,
);

type PayloadParams = {
  trainer_appointment_id: string;
};

/**
 * @openapi
 * /trainer-appointment/{trainer_appointment_id}:
 *   delete:
 *     summary: Cancel Appointment
 *     description: Cancel a trainer appointment that hasn't started or ended yet. You can only cancel your own appointment using JWT.
 *     tags:
 *       - TrainerAppointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trainer_appointment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the appointment in database (retrieved using GET /bank-card)
 *     responses:
 *       200:
 *         description: Successful appointment cancellation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether an appointment is cancelled
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
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
