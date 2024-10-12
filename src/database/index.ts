import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

/**
 * Validate existence of environment variables.
 * @param env - Environment variables.
 * @returns Whether all environment variables exist.
 */
function validateEnv<T extends string | number | symbol>(
  env: Record<T, string | undefined>,
): env is Record<T, string> {
  return Object.keys(env).every(key => env[key] !== undefined);
}

const env: Record<string, string | undefined> = {
  connectionString: process.env.DATABASE_URL,
};

if (!validateEnv(env)) {
  throw new Error(
    `Please provide the following environment variables: ${Object.keys(
      env,
    ).join(", ")}`,
  );
}

const dialect = new PostgresDialect({
  pool: new Pool({
    ...env,
    max: 10,
  }),
});

export type Database = Kysely<DB>;

export const db = new Kysely<DB>({
  dialect,
});
