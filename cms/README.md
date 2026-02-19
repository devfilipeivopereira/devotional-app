# Devocional CMS (Next.js)

## Rodar local

```bash
cd cms
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

Defina no ambiente (local e Vercel):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use `cms/env.example` como base.

## Deploy na Vercel (monorepo)

No projeto da Vercel:

1. Importe este repositorio.
2. Em `Root Directory`, selecione `cms`.
3. Framework: `Next.js`.
4. Build command: `npm run build` (ja configurado em `cms/vercel.json`).
5. Configure as variaveis de ambiente acima.
6. Deploy.

## Observacoes

- O repositorio tem um `vercel.json` na raiz para o app Expo Web. Para o CMS, sempre use `Root Directory = cms`.
- Se alterar envs, faca novo deploy para a Vercel aplicar.