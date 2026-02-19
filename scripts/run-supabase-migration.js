/**
 * Executa migracoes SQL do Supabase em ordem alfabetica.
 *
 * Requer SUPABASE_DB_URL no .env (connection string PostgreSQL do Supabase):
 * postgresql://postgres:[PASSWORD]@db.<project-ref>.supabase.co:5432/postgres
 *
 * Sem SUPABASE_DB_URL, imprime a lista de arquivos para executar manualmente no SQL Editor.
 */

const fs = require("fs");
const path = require("path");

const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
const dbUrl = process.env.SUPABASE_DB_URL;

function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

const migrationFiles = getMigrationFiles();

if (migrationFiles.length === 0) {
  console.log("Nenhuma migracao .sql encontrada em supabase/migrations.");
  process.exit(0);
}

if (!dbUrl) {
  console.log("SUPABASE_DB_URL nao definida.");
  console.log("Execute estes arquivos no SQL Editor do Supabase, nesta ordem:\n");
  migrationFiles.forEach((file, idx) => {
    console.log(`${idx + 1}. ${file}`);
  });
  process.exit(0);
}

async function run() {
  const { Client } = require("pg");
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log(`Aplicando ${migrationFiles.length} migracao(oes)...`);

    for (const file of migrationFiles) {
      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, "utf-8");

      console.log(`- ${file}`);
      await client.query("begin");
      await client.query(sql);
      await client.query("commit");
    }

    console.log("Migracoes aplicadas com sucesso.");
  } catch (err) {
    try {
      await client.query("rollback");
    } catch (_) {
      // noop
    }
    console.error("Erro ao aplicar migracoes:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
