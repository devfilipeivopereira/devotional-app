# Devocional App

Aplicativo devocional inspirado no Glorify, com foco em simplicidade, beleza e profundidade espiritual. O projeto inclui o app móvel (React Native/Expo) e um CMS Web (Next.js) para gerenciamento de conteúdo.

![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)

---

## 📱 App Móvel

Desenvolvido para ajudar usuários a cultivarem um tempo diário com Deus.

### Funcionalidades
- **Hoje**: Sessão devocional diária com cards interativos (Citação, Passagem, Reflexão, Oração).
- **Semana**: Calendário visual de constância.
- **Bíblia**: Leitor completo com versões NVI, RA e ACF (via ABíbliaDigital API), versículo do dia e busca.
- **Séries**: Conteúdo temático para aprofundamento.
- **Perfil**: Histórico de progresso e configurações.

### Tecnologias
- **Core**: React Native, Expo Router, TypeScript.
- **UI**: Design system customizado (fontes serif premium + sans-serif), Lucide Icons.
- **Dados**: Supabase (PostgreSQL), Drizzle ORM (schema), Context API (sessão).
- **API**: Integração com ABíbliaDigital.

---

## 🖥️ CMS Web

Painel administrativo para criar e gerenciar o conteúdo devocional que aparece no app.

### Acesso
- URL Local: `http://localhost:3000`
- Login: Autenticação via Supabase (mesmos usuários admins).

### Funcionalidades
- **Dashboard**: Visão geral de séries, dias e blocos criados.
- **Editor de Séries**: Criar/editar séries e gerenciar dias.
- **Editor de Blocos**: Interface arrastar-e-soltar para montar a sessão devocional.
  - Suporte a 8 tipos de blocos: Citação, Escritura, Reflexão, Oração, Respiração, Ação, Diário, Imagem.
- **Publicação**: Controle de rascunho/publicado.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Conta no Supabase

### 1. Configuração do Ambiente

Copie o `.env.example` para `.env` na raiz e em `cms/.env.local`:

```bash
# App Móvel (.env)
EXPO_PUBLIC_SUPABASE_URL="sua_url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="sua_chave"
EXPO_PUBLIC_BIBLE_API_TOKEN="(opcional para uso ilimitado)"

# CMS (cms/.env.local)
NEXT_PUBLIC_SUPABASE_URL="sua_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave"
```

### 2. Banco de Dados

Rode as migrações SQL no Supabase (pasta `supabase/migrations`):
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

## 📦 Deploy

### Expo (Mobile)
```bash
eas build --platform android --profile preview
# ou
eas update
```

### Vercel (CMS)
O diretório `cms/` pode ser implantado diretamente na Vercel como um projeto Next.js padrão.

---

## 📂 Estrutura

```
devotional-app/
├── app/                 # Rotas do Mobile (Expo Router)
├── components/          # Componentes UI Mobile (Blocks, Cards)
├── lib/                 # Lógica de negócios (Services, Contexts)
├── cms/                 # Projeto Web Next.js (Admin)
│   ├── app/             # Rotas do CMS
│   └── lib/             # Lógica e Tipos do CMS
├── constants/           # Design System (Tokens)
├── supabase/            # Migrações e Seeds
└── scripts/             # Utilitários de verificação
```

## Licença
Privado.
