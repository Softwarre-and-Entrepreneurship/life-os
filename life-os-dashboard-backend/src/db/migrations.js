import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { nowIso } from "../utils/time.js";

const migrationsUrl = new URL("./migrations/", import.meta.url);
const migrationPattern = /^(\d+)_(.+)\.sql$/;

function normalizeName(value) {
  return value.replace(/_/g, " ");
}

function listMigrationFiles() {
  if (!existsSync(migrationsUrl)) return [];

  return readdirSync(migrationsUrl)
    .map((fileName) => {
      const match = fileName.match(migrationPattern);
      if (!match) return null;
      return {
        version: Number.parseInt(match[1], 10),
        name: normalizeName(match[2]),
        fileName,
        sql: readFileSync(new URL(fileName, migrationsUrl), "utf8"),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.version - right.version);
}

export function getMigrationStatus(database) {
  const rows = database
    .prepare("SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC")
    .all();
  const latest = rows.at(-1);
  return {
    currentVersion: latest?.version || 0,
    applied: rows,
  };
}

export function runMigrations(database) {
  const migrations = listMigrationFiles();
  const seenVersions = new Set();
  migrations.forEach((migration) => {
    if (migration.version <= 1) {
      throw new Error(`migration version must be greater than baseline version 1: ${migration.fileName}`);
    }
    if (seenVersions.has(migration.version)) {
      throw new Error(`duplicate migration version ${migration.version}: ${migration.fileName}`);
    }
    seenVersions.add(migration.version);
  });

  const appliedVersions = new Set(
    database.prepare("SELECT version FROM schema_migrations").all().map((row) => row.version),
  );
  const pending = migrations.filter((migration) => !appliedVersions.has(migration.version));

  const applyMigration = database.transaction((migration) => {
    database.exec(migration.sql);
    database
      .prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)")
      .run(migration.version, migration.name || basename(migration.fileName, ".sql"), nowIso());
  });

  pending.forEach(applyMigration);

  return {
    appliedNow: pending.map(({ version, name, fileName }) => ({ version, name, fileName })),
    ...getMigrationStatus(database),
  };
}
