import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: "5432",
  user: "postgres",
  password: "root",
  database: "instant",
  ssl: false, // true only for cloud DBs
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PG pool error", err);
  process.exit(1);
});

export default pool;