import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { env } from "../config/env.js";
import { runMigrations } from "./migrations.js";

const dbFile = resolve(env.dbPath);
mkdirSync(dirname(dbFile), { recursive: true });

export const db = new Database(dbFile);
db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
export const migrationStatus = runMigrations(db);

export function transaction(work) {
  return db.transaction(work)();
}

export function closeDatabase() {
  db.close();
}
