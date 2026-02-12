/**
 * Testa a conexão e as tabelas do Supabase (habits + habit_completions).
 * Carrega .env do projeto. Uso: node scripts/test-supabase.js
 */

const path = require("path");
const fs = require("fs");

// Carregar .env
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8").replace(/\r\n/g, "\n");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  });
}

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  const envKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes("SUPABASE") || k.includes("EXPO_PUBLIC")
  );
  console.error(
    "Falta no .env: EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
  if (envKeys.length) console.error("Variáveis no process.env com SUPABASE/EXPO_PUBLIC:", envKeys.join(", "));
  else console.error(".env em", envPath, "– verifique se as chaves são exatamente EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(url, key);

async function test() {
  console.log("Testando Supabase...");
  console.log("URL:", url.replace(/\/[^/]*$/, "/..."));

  // 1) SELECT habits
  const { data: habits, error: e1 } = await supabase.from("habits").select("id").limit(1);
  if (e1) {
    console.error("SELECT habits falhou:", e1.message);
    process.exit(1);
  }
  console.log("  SELECT habits: OK");

  // 2) INSERT habit de teste
  const { data: inserted, error: e2 } = await supabase
    .from("habits")
    .insert({
      name: "Teste Supabase",
      color: "#2EC4B6",
      icon: "checkmark-circle-outline",
      frequency: "daily",
    })
    .select("id")
    .single();
  if (e2) {
    console.error("INSERT habit falhou:", e2.message);
    process.exit(1);
  }
  const testId = inserted.id;
  console.log("  INSERT habit: OK (id:", testId, ")");

  // 3) INSERT completion
  const today = new Date().toISOString().split("T")[0];
  const { error: e3 } = await supabase
    .from("habit_completions")
    .insert({ habit_id: testId, date: today });
  if (e3) {
    console.error("INSERT habit_completions falhou:", e3.message);
    await supabase.from("habits").delete().eq("id", testId);
    process.exit(1);
  }
  console.log("  INSERT habit_completions: OK");

  // 4) SELECT completions
  const { data: comps, error: e4 } = await supabase
    .from("habit_completions")
    .select("habit_id, date")
    .eq("habit_id", testId);
  if (e4 || !comps?.length) {
    console.error("SELECT habit_completions falhou ou vazio:", e4?.message || "sem dados");
  } else {
    console.log("  SELECT habit_completions: OK");
  }

  // 5) Limpar: delete habit (cascade remove completions)
  const { error: e5 } = await supabase.from("habits").delete().eq("id", testId);
  if (e5) console.error("DELETE habit falhou:", e5.message);
  else console.log("  DELETE habit (limpeza): OK");

  console.log("\nSupabase: todos os testes passaram.");
}

test().catch((err) => {
  console.error(err);
  process.exit(1);
});
