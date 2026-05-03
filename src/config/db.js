import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const globalPostgres = globalThis;

const pool =
  globalPostgres.pgPool ||
  new Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSLMODE === "require" ? { rejectUnauthorized: false } : false,
    max: process.env.PG_MAX_CLIENTS ? parseInt(process.env.PG_MAX_CLIENTS) : 10,
    idleTimeoutMillis: process.env.PG_IDLE_TIMEOUT ? parseInt(process.env.PG_IDLE_TIMEOUT) : 10000,
    allowExitOnIdle: process.env.PG_ALLOW_EXIT_ON_IDLE === "true",
  });

if (!globalPostgres.pgPool) {
  globalPostgres.pgPool = pool;
}

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Database error:", err);
});

export default pool;