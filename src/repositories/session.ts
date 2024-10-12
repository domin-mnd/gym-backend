import type { Client, Employee, Session } from "kysely-codegen";
import { Repository } from ".";
import type { Database } from "@/database";
import type { Selectable } from "kysely";
import { createHmac } from "crypto";
import { ClientRepository } from "./client";
import { z } from "zod";

enum SessionSchema {
  Create,
}

export class SessionRepository extends Repository<Session> {
  public Schema = SessionSchema;
  public Schemas = {
    [this.Schema.Create]: z.object({
      session_id: z.never(),
      client_id: z.number(),
      jwt: z.string().min(1).max(255),
      created_at: z.date().min(new Date()),
      expires_at: z.date().min(new Date()),
    }),
  };

  private clientRepository: ClientRepository;
  constructor(private readonly db: Database) {
    super("session", "session_id", db);
    this.clientRepository = new ClientRepository(this.db);
  }

  public async get(
    session_id: number,
  ): Promise<Selectable<Session> | undefined>;
  public async get(
    jwt: string,
  ): Promise<Selectable<Session> | undefined>;
  public async get(
    data: string | number,
  ): Promise<Selectable<Session> | undefined> {
    if (typeof data === "number") {
      return this.db
        .selectFrom("session")
        .where("session_id", "=", data)
        .selectAll()
        .executeTakeFirst();
    } else {
      return this.db
        .selectFrom("session")
        .where("jwt", "=", data)
        .selectAll()
        .executeTakeFirst();
    }
  }

  public async getClient(
    jwt: string,
  ): Promise<Selectable<Client> | undefined> {
    const client = await this.db
      .selectFrom("session")
      .innerJoin("client", "client.client_id", "session.client_id")
      .where("jwt", "=", jwt)
      .where("revoked", "=", false)
      .select("session.expires_at")
      .selectAll("client")
      .executeTakeFirst();

    // Return undefined if session is expired
    if (client && client.expires_at.getTime() < Date.now()) {
      return undefined;
    }

    delete client?.expires_at;
    return client;
  }

  public async getEmployee(
    jwt: string,
  ): Promise<Selectable<Client & Employee> | undefined> {
    const client = await this.db
      .selectFrom("session")
      .innerJoin(
        "employee",
        "employee.client_id",
        "session.client_id",
      )
      .innerJoin("client", "client.client_id", "session.client_id")
      .where("jwt", "=", jwt)
      .where("revoked", "=", false)
      .select("session.expires_at")
      .selectAll("client")
      .selectAll("employee")
      .executeTakeFirst();

    // Return undefined if session is expired
    if (client && client.expires_at.getTime() < Date.now()) {
      return undefined;
    }

    delete client?.expires_at;
    return client;
  }

  public async delete(session_id: number): Promise<void> {
    await this.db
      .updateTable("session")
      .set({ revoked: true })
      .where("session_id", "=", session_id)
      .execute();
  }

  public async create(
    client_id: number,
  ): Promise<Selectable<Session> | Error> {
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const jwt = await this.yieldJWT(client_id, createdAt, expiresAt);
    return this.add({
      client_id,
      jwt,
      revoked: false,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  }

  public async hashPassword(password: string): Promise<string> {
    return createHmac("sha512", process.env.SALT)
      .update(password)
      .digest("hex");
  }

  /**
   * Yields JWT for a given client.
   * @see {@link https://jwt.io/introduction}
   * @param client_id - Client's id to form a payload.
   * @returns session JWT.
   */
  public async yieldJWT(
    client_id: number,
    createdAt: Date,
    expiresAt: Date,
  ): Promise<string> {
    const client = await this.clientRepository.get(client_id);

    const header = {
      alg: "HS512",
      typ: "JWT",
    };

    const payload = {
      client_id: client.client_id,
      created_at: createdAt,
      expires_at: expiresAt,
      first_name: client.first_name,
      profile_picture_url: client.profile_picture_url,
    };

    const base64UrlHeader = Buffer.from(
      JSON.stringify(header),
    ).toString("base64url");

    const base64UrlPayload = Buffer.from(
      JSON.stringify(payload),
    ).toString("base64url");

    const base64UrlSignature = createHmac("sha512", process.env.SALT)
      .update(`${base64UrlHeader}.${base64UrlPayload}`)
      .digest("base64url");

    return `${base64UrlHeader}.${base64UrlPayload}.${base64UrlSignature}`;
  }
}
