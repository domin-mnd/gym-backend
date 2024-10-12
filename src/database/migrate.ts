import { promises as fs } from "node:fs";
import path, { resolve } from "node:path";
import {
  FileMigrationProvider,
  Migrator,
  NO_MIGRATIONS,
} from "kysely";
import { db } from ".";

const migrationFolder = resolve("src/database/migrations");

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    migrationFolder,
    fs,
    path,
  }),
});

// Dangerous thing to do since it will delete all migrations along with the whole database.
migrator.migrateTo(NO_MIGRATIONS).then(info => {
  console.info(info);
  migrator.migrateToLatest().then(async info => {
    console.info(info);
    await db.destroy();
  }, console.error);
}, console.error);
