import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const dbPath = resolve(process.env.DB_PATH || "data/life-os.sqlite");
const backupDir = resolve(process.argv[2] || "backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = resolve(backupDir, `${basename(dbPath, ".sqlite")}-${stamp}.sqlite`);

if (!existsSync(dbPath)) {
  console.error(`database file not found: ${dbPath}`);
  process.exit(1);
}

const { db, closeDatabase } = await import("../src/db/connection.js");

try {
  mkdirSync(dirname(backupPath), { recursive: true });
  await db.backup(backupPath);
} finally {
  closeDatabase();
}

console.log(`backup created: ${backupPath}`);
