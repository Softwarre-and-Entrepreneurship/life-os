function parseOrigins(value) {
  return value
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
}

export const env = {
  port: Number.parseInt(process.env.PORT || "4000", 10),
  host: process.env.HOST || "127.0.0.1",
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"),
  dbPath: process.env.DB_PATH || "data/life-os.sqlite",
};
