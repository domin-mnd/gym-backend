import type {
  LevelType,
  Membership,
  PaymentHistory,
  TrainerAppointment,
} from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import { z } from "zod";
import type { Selectable } from "kysely";
import {
  getAppointmentPrice,
  membershipPrices,
} from "@/utils/pricing";

enum PaymentHistorySchema {
  MembershipSubscription,
  TrainerAppointment,
  Delete,
}

interface MembershipPayload {
  client_id: number;
  bank_card_id: number;
  level_type: LevelType;
}

interface TrainerAppointmentPayload {
  client_id: number;
  employee_id: number;
  bank_card_id: number;
  gym_id: number;
  appointed_at: string;
  ends_at: string;
  created_at: string;
}

interface MembershipResponse {
  payment_history_id: number;
  type: "membership";
  client_id: number;
  level_type: LevelType;
  created_at: Date;
}

interface TrainerAppointmentResponse {
  payment_history_id: number;
  type: "trainer_appointment";
  client_id: number;
  employee_id: number;
  gym_id: number;
  appointed_at: Date;
  ends_at: Date;
}

type ParsedResponse = MembershipResponse | TrainerAppointmentResponse;

export class PaymentHistoryRepository extends Repository<PaymentHistory> {
  public Schema = PaymentHistorySchema;

  public Schemas = {
    [this.Schema.MembershipSubscription]: z.object({
      client_id: z.number(),
      bank_card_id: z.number(),
    }),
    [this.Schema.Delete]: z.object({}),
  };

  public async trainerAppoint({
    appointed_at,
    ends_at,
    bank_card_id,
    client_id,
    employee_id,
    gym_id,
  }: TrainerAppointmentPayload): Promise<
    Selectable<TrainerAppointment> | Error
  > {
    const [appointedAt, endsAt, createdAt] = [
      appointed_at,
      ends_at,
      undefined,
    ].map(date => new Date(date));

    try {
      return await this.db.transaction().execute(async trx => {
        const price = getAppointmentPrice(endsAt, appointedAt);
        const { payment_history_id } = await trx
          .insertInto("payment_history")
          .values({
            client_id,
            bank_card_id,
            value: price,
            created_at: createdAt,
            processed_at: createdAt,
            revoked: false,
          })
          .returning("payment_history_id")
          .executeTakeFirstOrThrow();

        const trainerAppointment = await trx
          .insertInto("trainer_appointment")
          .values({
            client_id,
            appointed_at: appointedAt,
            created_at: createdAt,
            employee_id,
            ends_at: endsAt,
            gym_id,
            payment_history_id,
            revoked: false,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        return trainerAppointment;
      });
    } catch (err) {
      return err;
    }
  }

  public async membershipSubscribe({
    client_id,
    bank_card_id,
    level_type,
  }: MembershipPayload): Promise<Selectable<Membership> | Error> {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      return await this.db.transaction().execute(async trx => {
        const { payment_history_id } = await trx
          .insertInto("payment_history")
          .values({
            client_id,
            bank_card_id,
            value: membershipPrices[level_type],
            created_at: createdAt,
            processed_at: createdAt,
            revoked: false,
          })
          .returning("payment_history_id")
          .executeTakeFirstOrThrow();

        const membership = await trx
          .insertInto("membership")
          .values({
            client_id,
            level_type,
            created_at: createdAt,
            expires_at: expiresAt,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        await trx
          .insertInto("membership_payment_history")
          .values({
            client_id,
            membership_id: membership.membership_id,
            payment_history_id,
            created_at: createdAt,
          })
          .executeTakeFirstOrThrow();

        return membership;
      });
    } catch (err) {
      return err;
    }
  }

  public async getAllParsed(): Promise<ParsedResponse[]> {
    /**
     * @todo Implement joining 2 types of payment histories and parsing it.
     */
    return [];
  }

  constructor(private readonly db: Database) {
    super("payment_history", "payment_history_id", db);
  }
}
