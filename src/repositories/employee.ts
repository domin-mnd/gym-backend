import type { Employee } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";
import type { Selectable } from "kysely";

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
}
