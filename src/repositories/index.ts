import type {
  AnyColumn,
  Insertable,
  Kysely,
  Selectable,
} from "kysely";
import type { DB } from "kysely-codegen";
import { z, type EnumLike, type Schema } from "zod";

export abstract class Repository<Table extends DB[keyof DB]> {
  public abstract Schemas: Record<keyof typeof this.Schema, Schema>;

  public abstract readonly Schema: EnumLike;

  constructor(
    private readonly tableName: keyof DB,
    private readonly primaryKey: AnyColumn<DB, keyof DB>,
    private readonly database: Kysely<DB>,
  ) {}

  public async add(
    insertable: Insertable<Table>,
  ): Promise<Selectable<Table> | Error> {
    try {
      const table = (await this.database
        .insertInto(this.tableName)
        .values(insertable)
        .returningAll()
        .executeTakeFirst()) as Promise<Selectable<Table>>;
      return table;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      return new Error(message);
    }
  }

  public async delete(primaryKey: number | string): Promise<void> {
    await this.database
      .deleteFrom(this.tableName)
      .where(this.primaryKey, "=", primaryKey)
      .execute();
  }

  public async get(
    primaryKey: number | string,
  ): Promise<Selectable<Table> | undefined> {
    return this.database
      .selectFrom(this.tableName)
      .selectAll()
      .where(this.primaryKey, "=", primaryKey)
      .executeTakeFirst() as Promise<Selectable<Table> | undefined>;
  }

  public async getAll(): Promise<Selectable<Table>[]> {
    return this.database
      .selectFrom(this.tableName)
      .selectAll()
      .execute() as Promise<Selectable<Table>[]>;
  }

  public validate(schema: keyof typeof this.Schema, data: unknown) {
    return (this.Schemas[schema] as Schema).safeParse(data);
  }
}
