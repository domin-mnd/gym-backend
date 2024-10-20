import type { Membership } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";
import type { Selectable } from "kysely";

enum MembershipSchema {
  Subscribe,
  Cancel,
  Freeze,
}

export class MembershipRepository extends Repository<Membership> {
  public Schema = MembershipSchema;

  public Schemas = {
    [this.Schema.Subscribe]: z.object({
      membership_id: z.undefined(),
      bank_card_id: z.number(),
      level_type: z.enum(["SIMPLE", "INFINITY", "PREMIUM"]),
    }),
    [this.Schema.Cancel]: z.object({
      membership_id: z.string().regex(/^\d+$/),
    }),
    [this.Schema.Freeze]: z.object({
      membership_id: z.string().regex(/^\d+$/),
    }),
  };

  public async getAny(client_id: number) {
    return this.db
      .selectFrom("membership")
      .selectAll()
      .where("client_id", "=", client_id)
      .where("expires_at", ">=", new Date())
      .executeTakeFirst();
  }

  public async getActive(client_id: number) {
    return this.db
      .selectFrom("membership")
      .selectAll()
      .where("client_id", "=", client_id)
      .where("expires_at", ">=", new Date())
      .where("freezed_at", "is", null)
      .executeTakeFirst();
  }

  public async freeze(membership: Selectable<Membership>) {
    return this.db
      .updateTable("membership")
      .set({ freezed_at: new Date() })
      .where("membership_id", "=", membership.membership_id)
      .returningAll()
      .execute();
  }

  public async unfreeze(membership: Selectable<Membership>) {
    // Formula to add to expire date
    const freezeDiff =
      new Date().getTime() - membership.freezed_at.getTime();

    const newExpiresAt = new Date(
      membership.expires_at.getTime() + freezeDiff,
    );

    return this.db
      .updateTable("membership")
      .set({ freezed_at: null, expires_at: newExpiresAt })
      .where("membership_id", "=", membership.membership_id)
      .execute();
  }

  public async revoke(membership_id: number) {
    await this.db
      .updateTable("membership")
      .set({ expires_at: new Date(), freezed_at: null })
      .where("membership_id", "=", membership_id)
      .execute();
  }

  constructor(private readonly db: Database) {
    super("membership", "membership_id", db);
  }
}
