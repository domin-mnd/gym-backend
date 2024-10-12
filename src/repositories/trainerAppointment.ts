import type { TrainerAppointment } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";

enum TrainerAppointmentSchema {
  Add,
  Delete,
  Get,
}

export class TrainerAppointmentRepository extends Repository<TrainerAppointment> {
  public Schema = TrainerAppointmentSchema;

  public Schemas = {
    [this.Schema.Add]: z.object({
      gym_id: z.undefined(),
      city: z.string().min(1).max(64),
      street: z.string().min(1).max(64),
      building: z.string().min(1).max(64),
      description: z.string(),
    }),
    [this.Schema.Get]: z.object({
      client_id: z.number().optional(),
      as_employee: z.boolean().optional(),
      range: z.string().datetime({ offset: true }).array().length(2),
    }),
    [this.Schema.Delete]: z.object({
      trainer_appointment_id: z.number(),
      client_id: z.number().optional(),
    }),
  };

  constructor(private readonly db: Database) {
    super("trainer_appointment", "trainer_appointment_id", db);
  }

  public async delete(trainer_appointment_id: number) {
    await this.db
      .updateTable("trainer_appointment")
      .set({ revoked: true })
      .where("trainer_appointment_id", "=", trainer_appointment_id)
      .execute();
  }

  public getByClient(client_id: number, range: [string, string]) {
    return this.db
      .selectFrom("trainer_appointment")
      .innerJoin(
        "employee",
        "employee.employee_id",
        "trainer_appointment.employee_id",
      )
      .innerJoin("client", "employee.client_id", "client.client_id")
      .where("trainer_appointment.client_id", "=", client_id)
      .where(
        "trainer_appointment.appointed_at",
        ">=",
        new Date(range[0]),
      )
      .where(
        "trainer_appointment.appointed_at",
        "<=",
        new Date(range[1]),
      )
      .selectAll()
      .execute();
  }

  public getByEmployee(employee_id: number, range: [string, string]) {
    return this.db
      .selectFrom("trainer_appointment")
      .innerJoin(
        "client",
        "client.client_id",
        "trainer_appointment.client_id",
      )
      .where("trainer_appointment.employee_id", "=", employee_id)
      .where(
        "trainer_appointment.appointed_at",
        ">=",
        new Date(range[0]),
      )
      .where(
        "trainer_appointment.appointed_at",
        "<=",
        new Date(range[1]),
      )
      .selectAll()
      .execute();
  }
}
