import type { Client } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";
import type { Selectable } from "kysely";

enum ClientSchema {
  SignUp,
  SignIn,
  Get,
}

export class ClientRepository extends Repository<Client> {
  public Schema = ClientSchema;
  public Schemas = {
    [this.Schema.SignUp]: z.object({
      client_id: z.undefined(),
      first_name: z.string().min(1).max(50),
      last_name: z.string().min(1).max(50),
      patronymic: z.string().min(1).max(64).optional(),
      profile_picture_url: z.string().url().min(1).max(255),
      email_address: z.string().min(1).max(255).email(),
      phone_number: z.string().min(1).max(15).regex(/^\d+$/),
      password: z.string().min(8),
    }),
    [this.Schema.SignIn]: z.object({
      email_address: z.string().min(1).max(255).email(),
      password: z.string().min(8),
    }),
    [this.Schema.Get]: z.object({
      client_id: z.string().regex(/^\d+$/).transform(Number),
    }),
  };

  constructor(private readonly db: Database) {
    super("client", "client_id", db);
  }

  public getByEmail(
    email: string,
  ): Promise<Selectable<Client> | undefined> {
    return this.db
      .selectFrom("client")
      .selectAll()
      .where("email_address", "=", email)
      .executeTakeFirst();
  }
}
