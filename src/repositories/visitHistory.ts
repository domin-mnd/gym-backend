import type { Gym, VisitHistory } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";

enum VisitHistorySchema {
  Enter,
  Leave,
  HistoryQuery,
  HistoryParams,
}

export class VisitHistoryRepository extends Repository<VisitHistory> {
  public Schema = VisitHistorySchema;

  public Schemas = {
    [this.Schema.Enter]: z.object({
      client_id: z.number().optional(),
      gym_id: z.number(),
    }),
    [this.Schema.Leave]: z.object({
      client_id: z.number().optional(),
      gym_id: z.number(),
    }),
    [this.Schema.HistoryQuery]: z.object({
      range: z.string().datetime({ offset: true }).array().length(2),
    }),
    [this.Schema.HistoryParams]: z.object({
      client_id: z.string().regex(/^\d+$/).transform(Number),
    }),
  };

  constructor(private readonly db: Database) {
    super("visit_history", "visit_history_id", db);
  }

  public async history(client_id: number, range: [string, string]) {
    return this.db
      .selectFrom("visit_history")
      .select(["visit_history_id", "gym_id", "entered_at", "left_at"])
      .where("client_id", "=", client_id)
      .where("entered_at", ">=", new Date(range[0]))
      .where("entered_at", "<=", new Date(range[1]))
      .execute();
  }

  public async enter(gym_id: number, client_id: number) {
    const lastVisit = await this.db
      .selectFrom("visit_history")
      .select(["visit_history_id", "left_at"])
      .where("gym_id", "=", gym_id)
      .where("client_id", "=", client_id)
      .orderBy("visit_history_id", "desc")
      .executeTakeFirst();

    if (!lastVisit || lastVisit?.left_at) {
      try {
        return this.add({
          gym_id,
          client_id,
          entered_at: new Date(),
        });
      } catch (error) {
        return error as Error;
      }
    }

    return new Error("Already in the gym");
  }

  public async leave(gym_id: number, client_id: number) {
    return this.db
      .updateTable("visit_history")
      .where("gym_id", "=", gym_id)
      .where("client_id", "=", client_id)
      .where("left_at", "is", null)
      .set({
        left_at: new Date(),
      })
      .returningAll()
      .execute();
  }
}
