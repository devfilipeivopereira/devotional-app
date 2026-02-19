# Devocional App

Aplicativo devocional inspirado no Glorify, com foco em simplicidade, beleza e profundidade espiritual. O projeto inclui o app mÃ³vel (React Native/Expo) e um CMS Web (Next.js) para gerenciamento de conteÃºdo.

![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)

---

## ðŸ“± App MÃ³vel

Desenvolvido para ajudar usuÃ¡rios a cultivarem um tempo diÃ¡rio com Deus.

### Funcionalidades
- **Hoje**: SessÃ£o devocional diÃ¡ria com cards interativos (CitaÃ§Ã£o, Passagem, ReflexÃ£o, OraÃ§Ã£o).
- **Semana**: CalendÃ¡rio visual de constÃ¢ncia.
- **BÃ­blia**: Leitor completo com versÃµes NVI, RA e ACF (via ABÃ­bliaDigital API), versÃ­culo do dia e busca.
- **SÃ©ries**: ConteÃºdo temÃ¡tico para aprofundamento.
- **Perfil**: HistÃ³rico de progresso e configuraÃ§Ãµes.

### Tecnologias
- **Core**: React Native, Expo Router, TypeScript.
- **UI**: Design system customizado (fontes serif premium + sans-serif), Lucide Icons.
- **Dados**: Supabase (PostgreSQL), Drizzle ORM (schema), Context API (sessÃ£o).
- **API**: IntegraÃ§Ã£o com ABÃ­bliaDigital.

---

## ðŸ–¥ï¸ CMS Web

Painel administrativo para criar e gerenciar o conteÃºdo devocional que aparece no app.

### Acesso
- URL Local: `http://localhost:3000`
- Login: AutenticaÃ§Ã£o via Supabase (mesmos usuÃ¡rios admins).

### Funcionalidades
- **Dashboard**: VisÃ£o geral de sÃ©ries, dias e blocos criados.
- **Editor de SÃ©ries**: Criar/editar sÃ©ries e gerenciar dias.
- **Editor de Blocos**: Interface arrastar-e-soltar para montar a sessÃ£o devocional.
  - Suporte a 8 tipos de blocos: CitaÃ§Ã£o, Escritura, ReflexÃ£o, OraÃ§Ã£o, RespiraÃ§Ã£o, AÃ§Ã£o, DiÃ¡rio, Imagem.
- **PublicaÃ§Ã£o**: Controle de rascunho/publicado.

---

## ðŸš€ InstalaÃ§Ã£o e ExecuÃ§Ã£o

### PrÃ©-requisitos
- Node.js 18+
- Conta no Supabase

### 1. ConfiguraÃ§Ã£o do Ambiente

Copie o `.env.example` para `.env` na raiz e em `cms/.env.local`:

```bash
# App MÃ³vel (.env)
EXPO_PUBLIC_SUPABASE_URL="sua_url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="sua_chave"
EXPO_PUBLIC_BIBLE_API_TOKEN="(opcional para uso ilimitado)"

# CMS (cms/.env.local)
NEXT_PUBLIC_SUPABASE_URL="sua_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave"
```

### 2. Banco de Dados

Rode as migraÃ§Ãµes SQL no Supabase (pasta `supabase/migrations`):
1. `20260219000000_devotional_tables.sql` (Estrutura)
2. `20260219100000_seed_devotional_data.sql` (Dados iniciais)

### 3. Rodar o Projeto

**Mobile:**
```bash
npm install
npx expo start
```

**CMS:**
```bash
cd cms
npm install
npm run dev
```

---

## ðŸ“¦ Deploy

### Expo (Mobile)
```bash
eas build --platform android --profile preview
# ou
eas update
```

### Vercel (CMS)
O diretÃ³rio `cms/` pode ser implantado diretamente na Vercel como um projeto Next.js padrÃ£o.

---

## ðŸ“‚ Estrutura

```
devotional-app/
â”œâ”€â”€ app/                 # Rotas do Mobile (Expo Router)
â”œâ”€â”€ components/          # Componentes UI Mobile (Blocks, Cards)
â”œâ”€â”€ lib/                 # LÃ³gica de negÃ³cios (Services, Contexts)
â”œâ”€â”€ cms/                 # Projeto Web Next.js (Admin)
â”‚   â”œâ”€â”€ app/             # Rotas do CMS
â”‚   â””â”€â”€ lib/             # LÃ³gica e Tipos do CMS
â”œâ”€â”€ constants/           # Design System (Tokens)
â”œâ”€â”€ supabase/            # MigraÃ§Ãµes e Seeds
â””â”€â”€ scripts/             # UtilitÃ¡rios de verificaÃ§Ã£o
```

## LicenÃ§a
Privado.

## Notes (2026-02-19)

- New migration added: `20260219110000_admin_policies.sql`.
- This migration creates `public.admin_users` and RLS write policies for content tables.
- After creating your first CMS user, grant admin access with:

```sql
insert into public.admin_users (user_id)
values ('<SUPABASE_AUTH_USER_ID>')
on conflict (user_id) do nothing;
```

- Env templates now exist at `.env.example` and `cms/env.example`.

