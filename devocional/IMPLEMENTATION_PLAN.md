# Plano de Implementação: Devotional App

**Autor:** Manus AI

**Data:** 19 de Fevereiro de 2026

## 1. Introdução

Este documento detalha o plano de implementação para o desenvolvimento do **Devotional App**, um aplicativo devocional focado em experiência guiada de leitura, reflexão e journaling. O projeto utilizará o **Habitflow** como base técnica (`boilerplate`) e buscará inspiração na experiência e design do aplicativo **Glorify** [1]. O objetivo é criar um novo aplicativo independente, com uma arquitetura robusta e escalável, aproveitando os pontos fortes do Habitflow e incorporando as melhores práticas de design e experiência do usuário observadas no Glorify.

## 2. Análise do Habitflow

O Habitflow é um aplicativo de rastreamento de hábitos construído com **Expo React Native** para o frontend móvel, **Next.js** para o CMS (implícito, dado o `server` folder e `vercel.json`), e **Supabase** como backend. A análise do repositório `devfilipeivopereira/habit-tracker` [2] revelou uma estrutura de projeto bem organizada e a utilização de tecnologias modernas. Abaixo, detalhamos os principais aspectos:

### 2.1. Estrutura de Projeto

O projeto Habitflow segue uma estrutura de monorepo (embora não explicitamente configurado como tal, a ideia de `apps/` e `packages/` já está presente no planejamento do Devotional App), com pastas claras para `app` (aplicativo móvel), `server` (backend), `shared` (código compartilhado) e `supabase` (configurações e migrações do Supabase).

### 2.2. Tecnologias Utilizadas

| Categoria | Tecnologia | Observações |
| :-------- | :--------- | :---------- |
| Frontend Móvel | Expo React Native | Utiliza `expo-router` para navegação, `expo-notifications` para notificações, `expo-haptics` para feedback tátil, e `expo-image` para manipulação de imagens. |
| Backend | Node.js (Express) com `tsx` | O diretório `server` contém a lógica de backend, incluindo rotas e serviços. |
| Banco de Dados | Supabase (PostgreSQL) | Utiliza `drizzle-orm` para ORM e `drizzle-kit` para migrações. O schema atual inclui tabelas `habits` e `habit_completions`. |
| Autenticação | Supabase Auth | Implementado via `AuthContext.tsx` e referenciado nas migrações do Supabase. |
| Gerenciamento de Estado | React Context API, TanStack React Query | `HabitsContext.tsx` gerencia o estado dos hábitos e interações com o Supabase. `TanStack React Query` é usado para gerenciamento de dados assíncronos. |
| Design System | `constants/colors.ts`, `lib/useTheme.ts` | Um sistema de design básico está presente, com definições de cores e um hook para tema. |
| Testes/Linting | ESLint | Configuração de linting presente para manter a qualidade do código. |

### 2.3. Pontos Fortes para Reutilização

*   **Arquitetura:** A separação clara entre frontend e backend, o uso de Context API e React Query para gerenciamento de estado, e a estrutura de pastas são pontos fortes. A abordagem de `(auth)` e `(tabs)` com `expo-router` é eficiente para navegação. [2]
*   **Setup Expo:** A configuração do Expo para desenvolvimento móvel, incluindo notificações e outros módulos, é diretamente reutilizável. [2]
*   **Integração Supabase:** A forma como o Supabase é configurado (`lib/supabase.ts`) e utilizado para persistência de dados (`habits-context.tsx`) é um modelo sólido. [2]
*   **Autenticação:** O fluxo de autenticação via Supabase Auth é um componente crítico que pode ser adaptado. [2]
*   **Notificações:** A infraestrutura para notificações é um recurso valioso para engajamento do usuário no app devocional. [2]
*   **Padrões de Código:** A consistência nos padrões de código e organização de pastas facilita a compreensão e a manutenção. [2]

## 3. Funcionalidades Inspiradas no Glorify

O Glorify App oferece uma experiência devocional rica e guiada, com foco em sessões lineares, blocos de conteúdo curtos e um design minimalista [1]. As principais funcionalidades e princípios de design a serem inspirados são:

*   **Sessões Lineares Guiadas:** O Glorify estrutura o conteúdo em sessões diárias que guiam o usuário por uma sequência de atividades (citações, passagens bíblicas, reflexões, orações). [1]
*   **Blocos de Conteúdo Curtos:** O conteúdo é apresentado em blocos concisos, facilitando o consumo e a retenção. A regra editorial de "uma ideia por bloco" é fundamental. [1]
*   **Ritmo Calmo e Tipografia Protagonista:** A experiência é projetada para ser tranquila e reflexiva, com ênfase na tipografia para transmitir a mensagem. [1]
*   **Progresso Constante:** Indicadores visuais de progresso ajudam o usuário a manter o engajamento e a sensação de realização. [1]
*   **Journaling:** A capacidade de registrar pensamentos e reflexões diretamente no aplicativo é uma funcionalidade chave. [1]
*   **Design Minimalista e Cards Grandes:** A interface do usuário é limpa, com elementos visuais proeminentes e uso estratégico de espaço em branco. [1]

## 4. O que será Reutilizado do Habitflow

Conforme o planejamento, os seguintes componentes e conceitos do Habitflow serão reutilizados como base técnica para o Devotional App:

*   **Arquitetura Geral:** A estrutura de projeto, a separação de responsabilidades entre frontend e backend, e a organização de módulos. [2]
*   **Setup Expo:** Toda a configuração inicial do Expo, incluindo dependências, scripts de build e deploy, e a integração com `expo-router` para navegação. [2]
*   **Navegação:** O sistema de navegação baseado em `expo-router` e `(tabs)` será adaptado para as novas rotas do Devotional App (Home, Devotional Session, Library, Journal, Profile). [2]
*   **Design System Base:** As definições de cores (`constants/colors.ts`) e o hook de tema (`lib/useTheme.ts`) servirão como ponto de partida para o design do Devotional App, que será aprimorado com os princípios do Glorify. [2]
*   **Integração Supabase:** A configuração do cliente Supabase (`lib/supabase.ts`) e os padrões de interação com o banco de dados serão mantidos. [2]
*   **Autenticação (Auth):** O módulo de autenticação existente, incluindo o `AuthContext.tsx` e as rotas relacionadas (`app/(auth)`), será adaptado para o novo aplicativo. [2]
*   **Storage:** A abordagem de armazenamento local (AsyncStorage) e remoto (Supabase Storage) será reutilizada. [2]
*   **Notificações:** A infraestrutura para envio e gerenciamento de notificações será mantida e adaptada para o contexto devocional (e.g., lembretes de sessões diárias). [2]
*   **Analytics:** A base para coleta de dados de uso, se presente ou facilmente integrável, será mantida para futuras análises de engajamento. [2]
*   **Padrões de Código e Organização de Pastas:** A consistência e clareza na escrita do código e na organização dos arquivos serão replicadas. [2]
*   **Hooks e Services Base:** Hooks utilitários e serviços genéricos que não estão diretamente ligados ao domínio de hábitos serão mantidos. [2]

## 5. O que será Removido do Habitflow

Para transformar o Habitflow em um aplicativo devocional, o domínio de hábitos será completamente removido. Isso inclui:

*   **Tabelas de Banco de Dados:** As tabelas `public.habits` e `public.habit_completions` no Supabase serão removidas. [2]
*   **Contexto de Hábitos:** O `HabitsContext.tsx` e toda a lógica de gerenciamento de hábitos (adicionar, atualizar, deletar, completar, calcular streaks) serão removidos. [2]
*   **Componentes de UI:** Todos os componentes de interface do usuário específicos para hábitos (formulários de criação de hábito, listas de hábitos, calendários de conclusão de hábitos, telas de progresso de hábitos) serão removidos. [2]
*   **Rotas:** As rotas relacionadas a hábitos (`app/(tabs)/index.tsx`, `app/(tabs)/calendar.tsx`, `app/(tabs)/stats.tsx`, `app/habit-form.tsx`, `app/habit-detail.tsx`) serão removidas ou substituídas. [2]
*   **Lógica de Backend:** Qualquer lógica de servidor (`server/`) que manipule diretamente o domínio de hábitos será removida. [2]
*   **Schema Drizzle:** As definições de schema relacionadas a hábitos em `shared/schema.ts` serão removidas. [2]

## 6. O que será Adaptado do Habitflow

Alguns elementos do Habitflow precisarão ser adaptados para o novo domínio devocional:

*   **Navegação:** As rotas existentes serão substituídas pelas rotas do Devotional App (Home, Devotional Session, Library, Journal, Profile). Os ícones e títulos das abas serão atualizados. [2]
*   **Design System:** O design system base será estendido e modificado para refletir a estética minimalista e focada em tipografia do Glorify. Isso pode envolver a adição de novas fontes, paletas de cores e componentes estilizados. [1]
*   **Autenticação:** Embora a base seja reutilizada, pode ser necessário adaptar o fluxo de autenticação para incluir informações específicas do usuário devocional, se aplicável. [2]
*   **Notificações:** As notificações serão adaptadas para enviar lembretes de sessões devocionais diárias ou outros eventos relevantes. [2]
*   **Backend:** O backend existente será adaptado para servir o novo domínio de conteúdo devocional, incluindo APIs para gerenciar séries, dias e blocos devocionais. [2]

## 7. Nova Estrutura de Pastas

A nova estrutura de pastas seguirá o padrão de monorepo proposto, com a adição de novos `apps` e `packages` para o domínio devocional. A estrutura será a seguinte:

```
.
├── apps/
│   ├── devotional-mobile/ (Baseado no Habitflow, com domínio de hábitos removido e novo domínio devocional)
│   └── devotional-cms/ (Novo aplicativo Next.js para gerenciamento de conteúdo)
├── packages/
│   ├── ui/ (Componentes de UI compartilhados, incluindo o novo design system)
│   ├── types/ (Definições de tipos TypeScript compartilhadas)
│   ├── supabase/ (Configuração e tipos do cliente Supabase, schemas Drizzle)
│   └── content-engine/ (Lógica de negócio para o Session Engine, tipos de blocos, etc.)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**devotional-mobile:**

```
apps/devotional-mobile/
├── app/
│   ├── (auth)/ (Rotas de autenticação)
│   ├── (tabs)/ (Rotas principais: Home, Session, Library, Journal, Profile)
│   ├── _layout.tsx
│   └── index.tsx (Tela inicial, e.g., lista de sessões)
├── assets/
├── components/ (Componentes específicos do app móvel)
├── constants/
├── lib/ (Hooks, services, e.g., supabase client, theme context)
├── patches/
├── public/
├── scripts/
└── ... (outros arquivos de configuração do Expo)
```

**devotional-cms:**

```
apps/devotional-cms/
├── pages/
│   ├── api/
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── components/
├── lib/
├── public/
├── styles/
└── ... (outros arquivos de configuração do Next.js)
```

## 8. Estratégia de Migração

A migração do Habitflow para o Devotional App será realizada em etapas claras para garantir a estabilidade e a correta transição do domínio:

1.  **Duplicação e Renomeação:** Criar uma cópia do repositório Habitflow e renomeá-lo para `devotional-app`. Inicialmente, o `devotional-mobile` será o único `app` dentro do monorepo. [2]
2.  **Remoção do Domínio de Hábitos:**
    *   Excluir as tabelas `habits` e `habit_completions` do schema do Supabase e dos arquivos de migração. [2]
    *   Remover `HabitsContext.tsx` e todas as referências a ele. [2]
    *   Remover componentes de UI e rotas relacionadas a hábitos. [2]
    *   Limpar `shared/schema.ts` de quaisquer definições de hábitos. [2]
3.  **Configuração do Monorepo:** Estruturar o projeto como um monorepo, movendo o código do aplicativo móvel para `apps/devotional-mobile` e criando os diretórios para os `packages` compartilhados (`ui`, `types`, `supabase`, `content-engine`). [2]
4.  **Adaptação do Design System:** Iniciar a adaptação do design system base para os princípios visuais do Glorify, focando em tipografia, paleta de cores e componentes minimalistas. [1]
5.  **Criação do Novo Schema Supabase:** Implementar o novo schema para o domínio devocional (`devotional_series`, `devotional_days`, `devotional_blocks`, `devotional_media`, `devotional_progress`, `devotional_journal`). [User Document]
6.  **Desenvolvimento do Content Engine:** Iniciar o desenvolvimento do `content-engine` como um pacote separado, contendo a lógica para o `Devotional Session Engine` e a definição dos tipos de blocos. [User Document]
7.  **Implementação do CMS Web:** Desenvolver o `devotional-cms` (Next.js) para permitir a criação e gerenciamento de conteúdo devocional. [User Document]

## 9. Estratégia de Schema Supabase

O schema do Supabase será completamente redefinido para o domínio devocional, seguindo as diretrizes fornecidas. As tabelas serão:

*   **`devotional_series`:**
    *   `id` (UUID, PK)
    *   `title` (TEXT, NOT NULL)
    *   `description` (TEXT)
    *   `image_url` (TEXT, para capa da série)
    *   `created_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `is_published` (BOOLEAN, DEFAULT FALSE)

*   **`devotional_days`:**
    *   `id` (UUID, PK)
    *   `series_id` (UUID, FK para `devotional_series.id`, ON DELETE CASCADE)
    *   `day_number` (INTEGER, NOT NULL, e.g., Dia 1, Dia 2)
    *   `title` (TEXT, NOT NULL)
    *   `description` (TEXT)
    *   `created_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `is_published` (BOOLEAN, DEFAULT FALSE)
    *   `unique(series_id, day_number)`

*   **`devotional_blocks`:**
    *   `id` (UUID, PK)
    *   `day_id` (UUID, FK para `devotional_days.id`, ON DELETE CASCADE)
    *   `block_type` (TEXT, NOT NULL, e.g., 'quote', 'scripture', 'reflection', 'journal_prompt')
    *   `content` (JSONB, NOT NULL, estrutura varia conforme `block_type`)
    *   `order` (INTEGER, NOT NULL, para ordenação dos blocos dentro de um dia)
    *   `created_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

*   **`devotional_media`:**
    *   `id` (UUID, PK)
    *   `block_id` (UUID, FK para `devotional_blocks.id`, ON DELETE CASCADE, opcional)
    *   `media_type` (TEXT, NOT NULL, e.g., 'image', 'audio', 'video')
    *   `url` (TEXT, NOT NULL)
    *   `alt_text` (TEXT)
    *   `created_at` (TIMESTAMPTZ, DEFAULT NOW())

*   **`devotional_progress`:**
    *   `id` (UUID, PK)
    *   `user_id` (UUID, FK para `auth.users.id`, ON DELETE CASCADE)
    *   `day_id` (UUID, FK para `devotional_days.id`, ON DELETE CASCADE)
    *   `last_block_id` (UUID, FK para `devotional_blocks.id`, opcional, para retomar sessão)
    *   `completed_at` (TIMESTAMPTZ, para marcar o dia como concluído)
    *   `started_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `unique(user_id, day_id)`

*   **`devotional_journal`:**
    *   `id` (UUID, PK)
    *   `user_id` (UUID, FK para `auth.users.id`, ON DELETE CASCADE)
    *   `day_id` (UUID, FK para `devotional_days.id`, ON DELETE CASCADE)
    *   `block_id` (UUID, FK para `devotional_blocks.id`, opcional, se o journaling for específico a um bloco)
    *   `content` (TEXT, NOT NULL)
    *   `created_at` (TIMESTAMPTZ, DEFAULT NOW())
    *   `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Tipos de Blocos (v1):**

O campo `content` da tabela `devotional_blocks` será um JSONB que armazenará dados específicos para cada `block_type`. Exemplos de estrutura:

| `block_type` | Estrutura `content` (JSONB) |
| :----------- | :-------------------------- |
| `quote` | `{ "text": "string", "author": "string" }` |
| `scripture` | `{ "book": "string", "chapter": "string", "verse_start": "string", "verse_end": "string", "text": "string" }` |
| `reflection` | `{ "text": "string" }` |
| `prayer` | `{ "text": "string" }` |
| `breathing` | `{ "duration_seconds": "number", "instructions": "string" }` |
| `action` | `{ "text": "string", "call_to_action": "string", "link": "string" }` |
| `journal_prompt` | `{ "prompt": "string" }` |
| `image_meditation` | `{ "image_id": "uuid", "caption": "string" }` (referencia `devotional_media`) |

**Row Level Security (RLS):**

Será implementado RLS para todas as tabelas relacionadas ao usuário (`devotional_progress`, `devotional_journal`) para garantir que os usuários só possam acessar e modificar seus próprios dados. As tabelas de conteúdo (`devotional_series`, `devotional_days`, `devotional_blocks`, `devotional_media`) terão políticas de leitura pública, mas escrita restrita ao CMS ou administradores. [2]

## 10. Plano de Implementação por Fases

O roadmap técnico fornecido será seguido, com detalhes adicionais para cada fase:

### Fase 0: Análise Habitflow + Documentação de Implementação (Concluída)

*   Análise aprofundada do código-fonte do Habitflow. [2]
*   Pesquisa e análise das funcionalidades e design do Glorify App. [1]
*   Criação deste documento `IMPLEMENTATION_PLAN.md`.

### Fase 1: Fork Base + Remoção Domínio Hábitos

*   **Ação:** Criar um novo repositório (`devotional-app`) a partir do Habitflow. [2]
*   **Ação:** Mover o código do Habitflow para `apps/devotional-mobile`. [2]
*   **Ação:** Remover todas as referências ao domínio de hábitos (tabelas Supabase, contextos, componentes, rotas). [2]
*   **Verificação:** Garantir que o aplicativo móvel compile e execute sem erros relacionados a hábitos. [2]

### Fase 2: Schema Supabase Devocional

*   **Ação:** Definir o novo schema Drizzle para as tabelas `devotional_series`, `devotional_days`, `devotional_blocks`, `devotional_media`, `devotional_progress`, `devotional_journal` em `packages/supabase/schema.ts`. [User Document]
*   **Ação:** Criar novos arquivos de migração no Supabase para estas tabelas. [User Document]
*   **Ação:** Aplicar as migrações no ambiente de desenvolvimento do Supabase. [User Document]
*   **Ação:** Implementar as políticas de RLS conforme detalhado na seção 9. [2]

### Fase 3: Session Engine

*   **Ação:** Criar o pacote `packages/content-engine` para abrigar a lógica do `Devotional Session Engine`. [User Document]
*   **Ação:** Desenvolver o `useDevotionalSession` hook para gerenciar o estado da sessão (carregar dia, sequência de blocos, progresso incremental, retomar, pacing). [User Document]
*   **Ação:** Implementar o `DevotionalSessionProvider` para fornecer o contexto da sessão para o aplicativo móvel. [User Document]
*   **Ação:** Integrar o `content-engine` com o cliente Supabase para carregar dados das tabelas devocionais. [2]
*   **Verificação:** Testar o carregamento de sessões e o gerenciamento de progresso. [User Document]

### Fase 4: Renderer de Blocos

*   **Ação:** Desenvolver o `BlockRenderer` componente em `apps/devotional-mobile/components` (ou `packages/ui`) que será responsável por renderizar dinamicamente os diferentes tipos de blocos (`quote`, `scripture`, `reflection`, etc.). [User Document]
*   **Ação:** Criar componentes de UI específicos para cada tipo de bloco, aplicando os princípios de design do Glorify (tipografia protagonista, cards grandes, ritmo calmo). [1]
*   **Ação:** Implementar a interação para `journal_prompt` e `image_meditation`. [User Document]
*   **Verificação:** Testar a renderização correta e a interatividade de todos os tipos de blocos. [User Document]

### Fase 5: CMS Web

*   **Ação:** Inicializar o projeto `apps/devotional-cms` usando Next.js. [User Document]
*   **Ação:** Desenvolver a interface de usuário para criar e gerenciar séries e dias devocionais. [User Document]
*   **Ação:** Implementar um editor narrativo de blocos com funcionalidades de drag and drop e formulários dinâmicos para cada tipo de bloco. [User Document]
*   **Ação:** Integrar o CMS com o Supabase para persistir o conteúdo devocional. [2]
*   **Ação:** Implementar funcionalidades de upload de mídia, preview de sessão, agendamento e versionamento. [User Document]
*   **Verificação:** Testar a criação, edição e publicação de conteúdo devocional através do CMS. [User Document]

### Fase 6: Polimento UX

*   **Ação:** Revisar e refinar a interface do usuário do aplicativo móvel para garantir que os princípios de design do Glorify (UI minimalista, cards grandes, tipografia dominante, fundo suave, progress bar discreta, micro transições suaves) sejam totalmente aplicados. [1]
*   **Ação:** Otimizar o desempenho e a fluidez das transições e interações. [1]
*   **Ação:** Realizar testes de usabilidade para identificar e corrigir pontos de fricção na experiência do usuário. [1]

## 11. Riscos Técnicos

*   **Complexidade da Migração:** A remoção completa do domínio de hábitos e a introdução de um novo domínio podem ser complexas, exigindo atenção cuidadosa para evitar efeitos colaterais. [2]
*   **Adaptação do Design System:** Replicar a estética e a experiência do Glorify pode exigir um esforço significativo de design e desenvolvimento de UI/UX. [1]
*   **Gerenciamento de Conteúdo (CMS):** O desenvolvimento de um CMS robusto com editor narrativo, drag and drop e formulários dinâmicos é uma tarefa complexa e pode demandar tempo. [User Document]
*   **Performance do Session Engine:** Garantir que o `Devotional Session Engine` seja performático, especialmente no carregamento e transição entre blocos, é crucial para uma boa experiência. [User Document]
*   **RLS e Segurança:** A correta implementação das políticas de Row Level Security no Supabase é vital para a segurança dos dados do usuário. [2]

## 12. Decisões Arquiteturais

*   **Monorepo:** A adoção de uma estrutura de monorepo desde o início facilitará o compartilhamento de código entre o aplicativo móvel e o CMS, além de promover a consistência. [User Document]
*   **Separação de Domínios:** A decisão de não misturar os domínios de hábitos e devocional é central para manter a clareza e a manutenibilidade do código. [User Document]
*   **Content-Driven UI:** A interface do usuário do aplicativo móvel será impulsionada pelo conteúdo definido no CMS, com o `BlockRenderer` atuando como o interpretador visual. [User Document]
*   **Supabase como Backend Central:** O Supabase continuará sendo a espinha dorsal do backend, gerenciando autenticação, banco de dados e armazenamento. [2]
*   **Expo React Native para Mobile:** A escolha do Expo simplifica o desenvolvimento e deploy para plataformas móveis (iOS e Android). [2]
*   **Next.js para CMS:** O Next.js é uma escolha robusta para o CMS web, oferecendo renderização server-side e uma boa experiência de desenvolvimento. [User Document]

## 13. Conclusão

Este plano de implementação fornece um roteiro detalhado para a construção do Devotional App, aproveitando a base técnica do Habitflow e incorporando a inspiração do Glorify. A abordagem faseada e a clara definição de responsabilidades e tecnologias mitigarão riscos e garantirão um desenvolvimento eficiente e focado na qualidade do produto final.

## 14. Referências

[1] Glorify App. (n.d.). *Glorify - The #1 Christian Devotional App*. Retrieved February 19, 2026, from https://glorify-app.com/
[2] Pereira, F. (n.d.). *devfilipeivopereira/habit-tracker*. GitHub. Retrieved February 19, 2026, from https://github.com/devfilipeivopereira/habit-tracker
