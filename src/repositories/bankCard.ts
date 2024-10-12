import type { BankCard } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";

enum BankCardSchema {
  Add,
  Delete,
  Get,
}

export class BankCardRepository extends Repository<BankCard> {
  public Schema = BankCardSchema;

  public Schemas = {
    [this.Schema.Add]: z.object({
      bank_card_id: z.undefined(),
      client_id: z.undefined(),
      card_number: z.string().min(1).max(20),
      cardholder_name: z.string().min(1).max(255),
      expires_at: z.string().date(),
      cvv: z.string().min(1).max(4),
    }),
    [this.Schema.Delete]: z.object({
      bank_card_id: z.number(),
    }),
    [this.Schema.Get]: z.object({
      client_id: z.number().optional(),
    }),
  };

  constructor(private readonly db: Database) {
    super("bank_card", "bank_card_id", db);
  }

  public async getByClient(client_id: number) {
    return this.db
      .selectFrom("bank_card")
      .selectAll()
      .where("client_id", "=", client_id)
      .execute();
  }
}
