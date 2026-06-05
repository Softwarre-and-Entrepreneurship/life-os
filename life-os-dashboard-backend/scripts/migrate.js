const { closeDatabase, db, migrationStatus } = await import("../src/db/connection.js");

try {
  console.log(`schema version: ${migrationStatus.currentVersion}`);
  if (migrationStatus.appliedNow.length === 0) {
    console.log("no pending migrations");
  } else {
    migrationStatus.appliedNow.forEach((migration) => {
      console.log(`applied migration ${migration.version}: ${migration.fileName}`);
    });
  }
  console.log("applied migrations:");
  db.prepare("SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC")
    .all()
    .forEach((row) => {
      console.log(`- ${row.version}: ${row.name} (${row.applied_at})`);
    });
} finally {
  closeDatabase();
}
