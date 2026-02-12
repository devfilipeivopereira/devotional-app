# HabitFlow + Supabase

O app usa **Supabase** para persistir hábitos e conclusões quando as variáveis de ambiente estão configuradas. Caso contrário, usa apenas **AsyncStorage** (dados locais no dispositivo).

---

## 1. Variáveis de ambiente

Crie ou edite o `.env` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

- **EXPO_PUBLIC_SUPABASE_URL** — URL do projeto (Supabase cloud ou auto-hospedado).
- **EXPO_PUBLIC_SUPABASE_ANON_KEY** — Chave **anon** (pública) em **Settings → API** no Dashboard.

No Expo, variáveis que precisam estar disponíveis no cliente devem ter o prefixo `EXPO_PUBLIC_`.

Também são aceites (para compatibilidade com outros setups):

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 2. Criar as tabelas no Supabase

### Opção A — SQL Editor (recomendado)

1. Abra o **Supabase Dashboard** do seu projeto.
2. Vá a **SQL Editor** e crie uma nova query.
3. Copie todo o conteúdo de:
   - `supabase/migrations/20250212000000_habitflow_tables.sql`
4. Cole na query e execute (Run).

### Opção B — Script com connection string

Se tiver a **connection string** do Postgres (Settings → Database):

```env
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

Depois:

```bash
npm run supabase:migrate
```

### Tabelas criadas

| Tabela | Descrição |
|--------|-----------|
| `habits` | id, name, color, icon, frequency, custom_days, reminder, created_at |
| `habit_completions` | id, habit_id, date (unique por habit_id + date) |

RLS está ativado com políticas que permitem leitura e escrita para o role anon. Para multi-utilizador no futuro, adicione `user_id` em `habits` e ajuste as políticas.

---

## 3. Testar a conexão

```bash
node scripts/test-supabase.js
```

O script:

- Lê o `.env`
- Conecta ao Supabase
- Faz SELECT em `habits`, INSERT de um hábito de teste, INSERT em `habit_completions`, SELECT e DELETE do hábito de teste

Se tudo estiver correto, verá: `Supabase: todos os testes passaram.`

---

## 4. Supabase auto-hospedado (Docker Swarm)

Se o Supabase estiver em Docker Swarm na VPS:

- Listar serviços: `docker service ls | grep supabase`
- Reiniciar o PostgREST (atualiza o schema cache):  
  `docker service update --force supabase_supabase_rest`

Depois de criar ou alterar tabelas, reiniciar o `rest` evita erros do tipo “table not found in schema cache”.

---

## 5. MCP (opcional)

Com o MCP do Supabase configurado no Cursor (ex.: `https://supabase.seudominio.com/mcp`), pode executar SQL e inspecionar tabelas a partir do IDE.
