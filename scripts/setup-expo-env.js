/**
 * Adiciona variáveis EXPO_PUBLIC_* ao .env baseado nas VITE_* existentes.
 * Uso: node scripts/setup-expo-env.js
 */

const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.error(".env não encontrado");
  process.exit(1);
}

let content = fs.readFileSync(envPath, "utf-8");
const lines = content.split("\n");
const hasExpoPublic = content.includes("EXPO_PUBLIC_SUPABASE_URL");

if (hasExpoPublic) {
  console.log("Variáveis EXPO_PUBLIC_* já existem no .env");
  process.exit(0);
}

// Extrair VITE_* values
let viteUrl = "";
let viteKey = "";
lines.forEach((line) => {
  if (line.startsWith("VITE_SUPABASE_URL=")) {
    viteUrl = line.split("=").slice(1).join("=").trim();
  }
  if (line.startsWith("VITE_SUPABASE_PUBLISHABLE_KEY=")) {
    viteKey = line.split("=").slice(1).join("=").trim();
  }
});

if (!viteUrl || !viteKey) {
  console.error("VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não encontradas");
  process.exit(1);
}

// Adicionar EXPO_PUBLIC_* ao final do arquivo
const expoLines = [
  "",
  "# Expo (necessário para o app React Native)",
  `EXPO_PUBLIC_SUPABASE_URL=${viteUrl}`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY=${viteKey}`,
];

content = content.trim() + "\n" + expoLines.join("\n") + "\n";
fs.writeFileSync(envPath, content, "utf-8");
console.log("Variáveis EXPO_PUBLIC_* adicionadas ao .env");
console.log("EXPO_PUBLIC_SUPABASE_URL:", viteUrl.replace(/\/[^/]*$/, "/..."));
console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY:", viteKey.substring(0, 20) + "...");
