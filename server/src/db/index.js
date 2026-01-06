import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const isProd = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PG pool error", err);
  process.exit(1);
});

export default pool;