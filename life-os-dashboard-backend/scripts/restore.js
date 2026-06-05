import { existsSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import Database from "better-sqlite3";

const force = process.argv.includes("--force");
const backupArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const dbPath = resolve(process.env.DB_PATH || "data/life-os.sqlite");

if (!backupArg) {
  console.error("missing backup file");
  console.error("usage: npm run restore -- <backup-file> --force");
  process.exit(1);
}

if (!force) {
  console.error("refusing to restore database without --force");
  console.error("usage: npm run restore -- <backup-file> --force");
  process.exit(1);
}

const backupPath = resolve(backupArg);
if (!existsSync(backupPath)) {
  console.error(`backup file not found: ${backupPath}`);
  process.exit(1);
}

if (existsSync(dbPath)) {
  const rollbackDir = resolve("backups", "pre-restore");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rollbackPath = resolve(rollbackDir, `${basename(dbPath, ".sqlite")}-${stamp}.sqlite`);
  mkdirSync(dirname(rollbackPath), { recursive: true });
  const currentDb = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    await currentDb.backup(rollbackPath);
  } finally {
    currentDb.close();
  }
  console.log(`current database copied before restore: ${rollbackPath}`);
}

mkdirSync(dirname(dbPath), { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${dbPath}${suffix}`, { force: true });
}
copyFileSync(backupPath, dbPath);

console.log(`database restored from: ${backupPath}`);
console.log(`database restored to: ${dbPath}`);
