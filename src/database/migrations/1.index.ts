import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable("client")
    .addColumn("client_id", "serial", col => col.primaryKey())
    .addColumn("first_name", "varchar(50)", col => col.notNull())
    .addColumn("last_name", "varchar(50)", col => col.notNull())
    .addColumn("patronymic", "varchar(64)")
    .addColumn("profile_picture_url", "varchar(255)", col =>
      col.notNull(),
    )
    .addColumn("email_address", "varchar(255)", col =>
      col.unique().notNull(),
    )
    .addColumn("phone_number", "varchar(15)", col => col.notNull())
    .addColumn("password_hash", "varchar(255)", col => col.notNull())
    .addColumn("created_at", "timestamp", col => col.notNull())
    .execute();

  await db.schema
    .createTable("session")
    .addColumn("session_id", "serial", col => col.primaryKey())
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("jwt", "text", col => col.unique().notNull())
    .addColumn("revoked", "boolean", col => col.notNull())
    .addColumn("created_at", "timestamp", col => col.notNull())
    .addColumn("expires_at", "timestamp", col => col.notNull())
    .execute();

  await db.schema
    .createType("level_type")
    .asEnum(["SIMPLE", "INFINITY", "PREMIUM"])
    .execute();

  await db.schema
    .createTable("membership")
    .addColumn("membership_id", "serial", col => col.primaryKey())
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("level_type", sql`level_type`, col => col.notNull())
    .addColumn("created_at", "timestamp", col => col.notNull())
    .addColumn("expires_at", "timestamp", col => col.notNull())
    .addColumn("freezed_at", "timestamp", col => col.notNull())
    .execute();

  await db.schema
    .createType("employee_type")
    .asEnum(["ADMIN", "INSTRUCTOR", "TRAINER"])
    .execute();

  await db.schema
    .createTable("employee")
    .addColumn("employee_id", "serial", col => col.primaryKey())
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("employee_type", sql`employee_type`, col =>
      col.notNull(),
    )
    .addColumn("left_at", "timestamp")
    .execute();

  await db.schema
    .createTable("bank_card")
    .addColumn("bank_card_id", "serial", col => col.primaryKey())
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("card_number", "varchar(20)", col => col.notNull())
    .addColumn("cardholder_name", "varchar(255)", col =>
      col.notNull(),
    )
    .addColumn("expires_at", "date", col => col.notNull())
    .addColumn("cvv", "varchar(4)", col => col.notNull())
    .execute();

  await db.schema
    .createTable("payment_history")
    .addColumn("payment_history_id", "serial", col =>
      col.primaryKey(),
    )
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("bank_card_id", "integer", col =>
      col
        .references("bank_card.bank_card_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("value", "integer", col => col.notNull())
    .addColumn("created_at", "timestamp", col => col.notNull())
    .addColumn("processed_at", "timestamp", col => col.notNull())
    .addColumn("revoked", "boolean", col => col.notNull())
    .execute();

  await db.schema
    .createTable("membership_payment_history")
    .addColumn("membership_payment_history_id", "serial", col =>
      col.primaryKey(),
    )
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("payment_history_id", "integer", col =>
      col
        .references("payment_history.payment_history_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("membership_id", "integer", col =>
      col
        .references("membership.membership_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("created_at", "timestamp", col => col.notNull())
    .execute();

  await db.schema
    .createTable("gym")
    .addColumn("gym_id", "serial", col => col.primaryKey())
    .addColumn("city", "varchar(64)", col => col.notNull())
    .addColumn("street", "varchar(64)", col => col.notNull())
    .addColumn("building", "varchar(64)", col => col.notNull())
    .addColumn("description", "text", col => col.notNull())
    .execute();

  await db.schema
    .createTable("visit_history")
    .addColumn("visit_history_id", "serial", col => col.primaryKey())
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("gym_id", "integer", col =>
      col.references("gym.gym_id").onDelete("cascade").notNull(),
    )
    .addColumn("entered_at", "timestamp", col => col.notNull())
    .addColumn("left_at", "timestamp")
    .execute();

  await db.schema
    .createTable("trainer_appointment")
    .addColumn("trainer_appointment_id", "serial", col =>
      col.primaryKey(),
    )
    .addColumn("client_id", "integer", col =>
      col
        .references("client.client_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("employee_id", "integer", col =>
      col
        .references("employee.employee_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("gym_id", "integer", col =>
      col.references("gym.gym_id").onDelete("cascade").notNull(),
    )
    .addColumn("payment_history_id", "integer", col =>
      col
        .references("payment_history.payment_history_id")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("created_at", "timestamp", col => col.notNull())
    .addColumn("appointed_at", "timestamp", col => col.notNull())
    .addColumn("ends_at", "timestamp", col => col.notNull())
    .addColumn("revoked", "boolean", col => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("client").cascade().execute();
  await db.schema.dropTable("session").cascade().execute();
  await db.schema.dropTable("membership").cascade().execute();
  await db.schema.dropTable("employee").cascade().execute();
  await db.schema.dropTable("bank_card").cascade().execute();
  await db.schema.dropTable("payment_history").cascade().execute();
  await db.schema
    .dropTable("membership_payment_history")
    .cascade()
    .execute();
  await db.schema.dropTable("gym").cascade().execute();
  await db.schema.dropTable("visit_history").cascade().execute();
  await db.schema
    .dropTable("trainer_appointment")
    .cascade()
    .execute();
  await db.schema.dropType("employee_type").execute();
  await db.schema.dropType("level_type").execute();
}
