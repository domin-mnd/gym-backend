import type { Client, Employee, EmployeeType } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";
import type { Insertable, Selectable } from "kysely";

enum EmployeeSchema {
  Promote,
  Fire,
}

export class EmployeeRepository extends Repository<Employee> {
  public Schema = EmployeeSchema;

  public Schemas = {
    [this.Schema.Promote]: z.object({
      employee_id: z.undefined(),
      client_id: z.number(),
      employee_type: z.enum([
        "ADMIN",
        "INSTRUCTOR",
        "TRAINER",
      ] as const),
      left_at: z.date().min(new Date()).optional(),
    }),
    [this.Schema.Fire]: z.object({
      employee_id: z.number(),
    }),
  };

  constructor(private readonly db: Database) {
    super("employee", "employee_id", db);
  }

  public async add(insertable: {
    client_id: number;
    employee_type: EmployeeType;
    left_at?: Date;
  }): Promise<Selectable<Employee> | Error> {
    try {
      const table = await this.db
        .insertInto("employee")
        .values({
          ...insertable,
          hired_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();
      return table;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      return new Error(message);
    }
  }

  public async delete(primaryKey: number): Promise<void> {
    await this.db
      .updateTable("employee")
      .set({ left_at: new Date() })
      .where("employee_id", "=", primaryKey)
      .execute();
  }

  public async getByClient(
    client_id: number,
  ): Promise<Selectable<Employee> | undefined> {
    return this.db
      .selectFrom("employee")
      .selectAll()
      .where("client_id", "=", client_id)
      .executeTakeFirst();
  }

  public async getExpanded(): Promise<
    Selectable<Omit<Client, "password_hash"> & Employee>[]
  > {
    return this.db
      .selectFrom("employee")
      .innerJoin("client", "client.client_id", "employee.client_id")
      .select([
        "employee.employee_id",
        "employee.client_id",
        "employee.employee_type",
        "employee.left_at",
        "employee.hired_at",
        "client.created_at",
        "client.email_address",
        "client.first_name",
        "client.last_name",
        "client.patronymic",
        "client.phone_number",
        "client.profile_picture_url",
      ])
      .execute();
  }
}
