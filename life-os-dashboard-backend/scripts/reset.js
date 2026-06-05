import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const force = process.argv.includes("--force");
const dbPath = resolve(process.env.DB_PATH || "data/life-os.sqlite");

if (!force) {
  console.error("refusing to reset database without --force");
  console.error("usage: npm run reset -- --force");
  process.exit(1);
}

let removed = 0;
for (const suffix of ["", "-wal", "-shm"]) {
  const target = `${dbPath}${suffix}`;
  if (existsSync(target)) {
    rmSync(target, { force: true });
    removed += 1;
    console.log(`removed: ${target}`);
  }
}

if (removed === 0) {
  console.log(`no database files found for: ${dbPath}`);
}
