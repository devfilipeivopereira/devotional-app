# Guia de Integração: API ABíbliaDigital (NVI PT-BR)

**Autor:** Manus AI  
**Data:** 19 de Fevereiro de 2026  
**Objetivo:** Fornecer ao agente na IDE os comandos, endpoints e a lógica necessária para integrar a versão NVI ao app devocional.

---

## 1. Informações Gerais da API

A **ABíbliaDigital** é uma API RESTful robusta que oferece a versão **NVI (Nova Versão Internacional)** em português brasileiro [1].

*   **URL Base:** `https://www.abibliadigital.com.br/api/`
*   **Documentação Oficial:** [abibliadigital.com.br/docs](https://www.abibliadigital.com.br/docs)
*   **Versão Alvo:** `nvi`
*   **Rate Limit:** 
    *   **Sem Token:** 20 requisições/hora/IP.
    *   **Com Token (Grátis):** Ilimitado (necessário cadastro no site) [1].

---

## 2. Endpoints Principais para o App Devocional

Para o motor de sessões do app, o agente deve utilizar os seguintes endpoints:

### 2.1. Buscar um Versículo Específico
Útil para o bloco tipo `scripture`.
*   **Endpoint:** `GET /verses/{version}/{abbrev}/{chapter}/{number}`
*   **Exemplo (Salmos 23:1):**
    ```bash
    curl -X GET "https://www.abibliadigital.com.br/api/verses/nvi/sl/23/1"
    ```

### 2.2. Buscar um Capítulo Inteiro
Ideal para leitura guiada ou contexto.
*   **Endpoint:** `GET /verses/{version}/{abbrev}/{chapter}`
*   **Exemplo (João 3):**
    ```bash
    curl -X GET "https://www.abibliadigital.com.br/api/verses/nvi/jo/3"
    ```

### 2.3. Buscar Versículo Aleatório
Perfeito para a tela Home (Versículo do Dia).
*   **Endpoint:** `GET /verses/{version}/random`
*   **Exemplo:**
    ```bash
    curl -X GET "https://www.abibliadigital.com.br/api/verses/nvi/random"
    ```

---

## 3. Comandos de Implementação (React Native/Expo)

O agente deve criar um serviço dedicado para a Bíblia. Abaixo, um exemplo de como estruturar o serviço usando `fetch` ou `axios` dentro da arquitetura do Habitflow adaptada.

### 3.1. Exemplo de Service (TypeScript)

```typescript
// apps/devotional-mobile/lib/bible-service.ts

const BIBLE_API_URL = "https://www.abibliadigital.com.br/api";
const BIBLE_TOKEN = "SEU_TOKEN_AQUI"; // Adicionar no .env

export const getVerse = async (abbrev: string, chapter: number, verse: number) => {
  try {
    const response = await fetch(`${BIBLE_API_URL}/verses/nvi/${abbrev}/${chapter}/${verse}`, {
      headers: {
        'Authorization': `Bearer ${BIBLE_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar versículo:", error);
    throw error;
  }
};
```

### 3.2. Mapeamento de Livros (Abreviações PT-BR)
A API utiliza abreviações padrão. O agente deve ter acesso a esta tabela para converter nomes completos em slugs da API:

| Livro | Abreviação (Slug) |
| :--- | :--- |
| Gênesis | `gn` |
| Salmos | `sl` |
| Provérbios | `pv` |
| Mateus | `mt` |
| João | `jo` |
| Romanos | `rm` |

---

## 4. Integração com o Session Engine

No `IMPLEMENTATION_PLAN.md`, o bloco `scripture` deve ser alimentado por esta API. O fluxo recomendado é:

1.  **CMS:** O editor insere apenas a referência (Ex: `sl, 23, 1`).
2.  **App Móvel:** O `BlockRenderer` identifica o tipo `scripture`.
3.  **Fetch:** O app faz a chamada à API ABíbliaDigital para buscar o texto em tempo real (ou via cache no Supabase).

---

## 5. Referências e Links Úteis

[1] [ABíbliaDigital - Site Oficial](https://www.abibliadigital.com.br/)  
[2] [Repositório GitHub do Projeto](https://github.com/omarciovsena/abibliadigital)  
[3] [Lista Completa de Abreviações de Livros](https://www.abibliadigital.com.br/api/books)  

---

**Nota de Direitos Autorais:** A versão NVI é de propriedade da Biblica Inc. O uso via API ABíbliaDigital é permitido para fins de estudo e pequenos projetos, mas para apps comerciais de grande escala, recomenda-se contato direto com a detentora dos direitos [4].
