/**
 * Executa a migração do HabitFlow no Supabase.
 * Requer SUPABASE_DB_URL no .env (Connection string do Supabase: Settings → Database).
 * Ex.: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
 *
 * Se SUPABASE_DB_URL não estiver definida, imprime o SQL para colar no SQL Editor.
 */

const fs = require("fs");
const path = require("path");

const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20250212000000_habitflow_tables.sql"
);
const sql = fs.readFileSync(migrationPath, "utf-8");

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.log("SUPABASE_DB_URL não definida. Cole o SQL abaixo no SQL Editor do Supabase:\n");
  console.log("---");
  console.log(sql);
  console.log("---");
  process.exit(0);
}

async function run() {
  const { Client } = require("pg");
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Migração aplicada com sucesso.");
  } catch (err) {
    console.error("Erro ao aplicar migração:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
