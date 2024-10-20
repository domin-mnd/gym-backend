import type { Gym } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";

enum GymSchema {
  Add,
  Delete,
}

export class GymRepository extends Repository<Gym> {
  public Schema = GymSchema;

  public Schemas = {
    [this.Schema.Add]: z.object({
      gym_id: z.undefined(),
      city: z.string().min(1).max(64),
      street: z.string().min(1).max(64),
      building: z.string().min(1).max(64),
      description: z.string(),
    }),
    [this.Schema.Delete]: z.object({
      gym_id: z.string().regex(/^\d+$/),
    }),
  };

  constructor(private readonly db: Database) {
    super("gym", "gym_id", db);
  }
}
