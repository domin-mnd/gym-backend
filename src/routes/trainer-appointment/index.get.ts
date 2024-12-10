import { db } from "@/database";
import { TrainerAppointmentRepository } from "@/repositories/trainerAppointment";
import { throwError } from "@/utils/api";
import type { ClientLocals } from "@/utils/types";
import { define } from "@storona/express";

const trainerAppointmentRepository = new TrainerAppointmentRepository(
  db,
);

type PayloadQs = {
  as_employee?: "true" | "false";
  // 2 Dates in ISO format
  range: [string, string];
};

/**
 * @openapi
 * /trainer-appointment:
 *   get:
 *     summary: Get Appointments
 *     description: Get client's trainer appointments using their client_id.
 *     tags:
 *       - TrainerAppointment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of appointments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the retrieval is successful
 *                   example: true
 *                 bank_card:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TrainerAppointment"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       429:
 *         $ref: "#/components/responses/TooManyRequests"
 */
export default define<{
  ReqQuery: PayloadQs;
  Locals: ClientLocals;
}>(async (req, res) => {
  const { success, error } = trainerAppointmentRepository.validate(
    trainerAppointmentRepository.Schema.Get,
    req.query,
  );
  if (!success) return throwError(res, error);

  const usedMethod =
    req.query.as_employee === "true"
      ? "getByEmployee"
      : "getByClient";

  const trainerAppointments = await trainerAppointmentRepository[
    usedMethod
  ](res.locals.client.client_id, req.query.range);

  res.json({
    success: true,
    trainer_appointment: trainerAppointments,
  });
});
