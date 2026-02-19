# EAS Update — Atualizações OTA

Atualizações over-the-air para o app Android (APK) sem reinstalar.

## Regra obrigatória

O perfil `preview` em `eas.json` usa o **canal fixo `preview`**.  
Sempre publique atualizações nesse canal para que o APK instalado receba as mudanças.

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run update:preview` | Publica atualização OTA no canal `preview` |
| `npx eas-cli update --channel preview -m "sua mensagem"` | Mesmo efeito, com mensagem customizada |

## Fluxo

1. **Build do APK** (`npm run build:apk`) — gera o APK com canal `preview`
2. **Publicar update** (`npm run update:preview`) — envia o código atual para o canal `preview`

O app verifica atualizações ao abrir (com internet) e aplica na próxima abertura.

---

Documentação completa: [BUILD-APK.md#atualizações-ota](BUILD-APK.md#atualizações-ota-eas-update)
