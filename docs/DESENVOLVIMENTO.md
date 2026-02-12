# Guia de desenvolvimento — HabitFlow

## Ambiente local

1. **Node.js** 18 ou superior.
2. **Clone e dependências:**
   ```bash
   git clone <repo>
   cd habit-tracker
   npm install
   ```
3. **Variáveis:** copie `.env.example` para `.env` e preencha (ver [Supabase](SUPABASE.md)).
4. **Migração:** execute o SQL em `supabase/migrations/` no Supabase ou use `npm run supabase:migrate`.
5. **Executar:** `npx expo start`.

---

## Estrutura de dados (app)

### Habit

- `id`, `name`, `color`, `icon`
- `frequency`: `'daily' | 'weekdays' | 'weekends' | 'custom'`
- `customDays`: array de dias da semana (0–6) quando `frequency === 'custom'`
- `createdAt`, `reminder` (opcional)

### HabitCompletion

- `habitId`, `date` (string `YYYY-MM-DD`)

A lógica de streak e taxa de conclusão está em `lib/habits-context.tsx` e respeita a frequência de cada hábito.

---

## Fluxo de dados

- **Com Supabase configurado:** `lib/habits-context.tsx` usa `lib/supabase.ts` para todas as operações em `habits` e `habit_completions`.
- **Sem Supabase:** o mesmo context usa `AsyncStorage` com as chaves `@habitflow_habits` e `@habitflow_completions`.

O context expõe `error` e `refetch()` para tratamento de erros e nova tentativa de carregamento.

---

## Scripts úteis

| Script | Uso |
|--------|-----|
| `node scripts/test-supabase.js` | Testa conexão e CRUD no Supabase. |
| `node scripts/run-supabase-migration.js` | Aplica a migração (requer `SUPABASE_DB_URL`). |
| `node scripts/setup-expo-env.js` | Adiciona `EXPO_PUBLIC_*` ao `.env` a partir das `VITE_*`. |

---

## Lint e formato

```bash
npm run lint
npm run lint:fix
```

---

## Build para produção (Expo)

- **Web:** ver scripts no `package.json` (ex.: `expo:static:build`).
- **iOS/Android:** `eas build` (requer EAS configurado) ou build local com as ferramentas do Expo.

Consulte a [documentação do Expo](https://docs.expo.dev) para detalhes de publicação nas lojas e web.
