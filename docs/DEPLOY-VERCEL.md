# Deploy na Vercel (plano gratuito)

O HabitFlow pode ser publicado na web via Vercel a partir do repositório GitHub.

## 1. Conectar o repositório

1. Acede a [vercel.com](https://vercel.com) e faz login (pode ser com GitHub).
2. **Add New** → **Project** e importa o repositório `habit-tracker`.
3. Confirma o **Framework Preset**: escolhe **Other** (ou **Expo** se aparecer).

## 2. Configuração de build

Na configuração do projeto, define:

| Campo | Valor |
|-------|--------|
| **Build Command** | `npm run build:web` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (padrão) |

Guarda e faz **Deploy**.

## 3. Variáveis de ambiente (opcional)

Se usares Supabase, adiciona em **Settings → Environment Variables** as mesmas variáveis do teu `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

(ou `VITE_SUPABASE_*` se o projeto as usar no build web.)

## 4. Notas

- O ficheiro `vercel.json` já inclui **rewrites** para a app funcionar como SPA (todas as rotas servem `index.html`).
- A responsividade para desktop está feita no código: conteúdo limitado a 480px de largura e centrado no ecrã.
