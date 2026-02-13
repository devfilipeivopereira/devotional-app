# Configuração Auth (recuperação de senha) – Supabase self-hosted

Usa estes valores no projeto onde tens o Supabase em Docker (ex.: `https://supabase.filipeivopereira.com/`).

## Variáveis de ambiente

- **App (login):** https://habitos.encorajar.com.br  
- **Supabase:** https://supabase.filipeivopereira.com  

## 1. Ficheiro `.env` (na pasta do docker-compose do Supabase)

```env
# App onde o utilizador faz login
SITE_URL=https://habitos.encorajar.com.br

# URL pública do Supabase
SUPABASE_PUBLIC_URL=https://supabase.filipeivopereira.com
API_EXTERNAL_URL=https://supabase.filipeivopereira.com

# Redirects permitidos: site web + deep link da app (recuperação de senha)
GOTRUE_URI_ALLOW_LIST=https://habitos.encorajar.com.br,https://habitos.encorajar.com.br/**,myapp://reset-password
```

## 2. Serviço `auth` no `docker-compose.yml`

Se as variáveis não forem lidas do `.env` pelo serviço `auth`, define-as no próprio serviço. Procura o bloco do **auth** (GoTrue) e adiciona/ajusta o `environment`:

```yaml
services:
  auth:
    image: supabase/gotrue:v2.x.x   # usa a tag que já tens
    environment:
      GOTRUE_SITE_URL: https://habitos.encorajar.com.br
      GOTRUE_URI_ALLOW_LIST: "https://habitos.encorajar.com.br,https://habitos.encorajar.com.br/**,myapp://reset-password"
      # ... resto das variáveis que já tens (GOTRUE_JWT_SECRET, DB, etc.)
```

Ou, para puxar do `.env`:

```yaml
  auth:
    image: supabase/gotrue:v2.x.x
    environment:
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_URI_ALLOW_LIST: ${GOTRUE_URI_ALLOW_LIST}
      # ... outras vars (GOTRUE_JWT_SECRET, GOTRUE_DB_*, etc.)
```

## 3. Aplicar e verificar

```bash
docker compose down
docker compose up -d
docker compose logs auth
```

Se o GoTrue já usar `GOTRUE_SITE_URL` e `GOTRUE_URI_ALLOW_LIST` por convenção a partir do `.env`, basta teres o `.env` correto e reiniciar. Caso contrário, usa o bloco `environment` do `auth` como acima.

## 4. No habit-tracker (já configurado)

O `.env` da app deve ter:

```env
EXPO_PUBLIC_SUPABASE_URL=https://supabase.filipeivopereira.com
EXPO_PUBLIC_SUPABASE_ANON_KEY=<teu_anon_key>
```

O redirect para recuperação de senha na app móvel é `myapp://reset-password` (definido no código e permitido em `GOTRUE_URI_ALLOW_LIST`). Após redefinir a senha, a app mostra um aviso de sucesso e o utilizador volta ao login para entrar com a nova senha.

---

## 5. Limite de e-mails (rate limit) – “não recebo mais o e-mail de recuperação”

O GoTrue aplica **limites de taxa** aos e-mails (recuperação, signup, etc.):

- **Por utilizador:** só é permitido um novo pedido de recuperação para o **mesmo e-mail** após ~**60 segundos**.
- **Global:** por defeito são enviados no máximo **2 e-mails por hora** (soma de todos os tipos: recuperação, confirmação, etc.).

Por isso, depois de pedires “Esqueci a senha” e usares o link ou o código de 6 dígitos, se pedires de novo recuperação para o **mesmo e-mail** em seguida, o servidor pode **não enviar** outro e-mail (ou devolver erro). Não é falha do SMTP: é o rate limit.

### O que fazer

1. **Esperar:** aguarda pelo menos **1 minuto** entre pedidos para o mesmo e-mail e, se já enviaste 2 e-mails na última hora, espera até passar a hora.
2. **Aumentar o limite no servidor (opcional):** no ambiente do serviço **auth** (GoTrue), podes definir:
   ```env
   # Número de e-mails permitidos por hora (padrão: 2). Ex.: 10 para desenvolvimento/testes.
   GOTRUE_RATE_LIMIT_EMAIL_SENT=10
   ```
   Adiciona esta variável ao bloco `environment` do serviço `auth` no teu `docker-compose` (ou ao `.env` que o auth usa), reinicia o auth e volta a testar.
3. **Ver logs:** `docker compose logs auth` (ou `docker service logs ...`) para ver se há mensagens de rate limit ou erro ao enviar o e-mail.
