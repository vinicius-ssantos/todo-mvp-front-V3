# Tickr Web – Front-end do Todo List SaaS

Interface web construída com Next.js 15 (App Router) para consumir a API do Tickr. Fornece autenticação, dashboard com listas/tarefas, criação/edição avançada de cards e um BFF (`/api/*`) para intermediar chamadas ao back-end.

---

## Visão Geral

- **Framework:** Next.js 15 com React 19, Server Components habilitados e rotas App Router.
- **Design System:** Shadcn/UI + Tailwind + Radix, com componentes compartilhados em `components/ui`.
- **Gerenciamento de dados:** React Query para cache/fetch de listas/tarefas, Zod para validação.
- **Autenticação:** BFF de sessão (`/api/session/*`) que armazena JWT em cookies httpOnly e aplica middleware de proteção de rotas.
- **UX atual:** Sidebar com listas e contador de concluídas, formulário avançado para criar tarefas (descrição, prioridade, status, due date) e modal de edição completa.

---

## Estrutura de Pastas

```
app/                       # App Router (pages, layout, API routes)
 ├── page.tsx              # Dashboard autenticado
 ├── login/                # Tela de login
 ├── register/             # Tela de cadastro
 └── api/                  # Rotas BFF (proxy, sessão)
src/
 ├── entities/             # Camada de dados (models, schemas, queries/mutations)
 ├── features/             # Casos de uso (criar lista, editar tarefa, etc.)
 ├── shared/               # UI primitivas, libs e utilitários
 └── widgets/              # Composição de UI (sidebar, tabela de tarefas)
components/                # Shadcn components
public/                    # Assets estáticos
styles/                    # Tailwind/global styles
```

---

## Pré-requisitos

- Node.js 20+
- pnpm ou npm (lockfiles para ambos)
- Back-end (`Tickr API`) executando em `http://localhost:8082` (ajustável via env)

---

## Variáveis de Ambiente

Configure um `.env.local` (ou utilize as defaults):

```bash
API_BASE_URL=http://localhost:8082
API_PATH_PREFIX=/api/v1        # prefixo real da API externa
LOGIN_PATH=/api/auth/login     # endpoint de login no back-end
```

Variáveis expostas no cliente (`NEXT_PUBLIC_*`) são validadas em `src/shared/env`:

| Variável                   | Default                 | Uso                                                       |
| -------------------------- | ----------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`     | `TodoList App`          | Título e meta tags                                        |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8082` | Base usada pelo fetcher caso bypass do BFF                |
| `NEXT_PUBLIC_USE_PATCH`    | `false`                 | Força uso de PATCH ao renomear lista, se PUT indisponível |

---

## Scripts Principais

```bash
npm install           # ou pnpm install
npm run dev           # inicia servidor Next em modo dev
npm run build         # build de produção
npm run start         # serve build de produção
npm run lint          # ESLint + regras Next
npm run typecheck     # verificação TypeScript
npm run format        # Prettier
```

> ℹ️ Em dev, todo request passa pelo proxy (`app/api/[...path]`) que injeta cookies e preserva headers. Ajuste `API_BASE_URL` se o back-end estiver em outra origem.

---

## Autenticação & Middleware

- `app/api/session/login` – recebe email/senha, chama o back-end, grava cookie `token` httpOnly.
- `app/api/session/logout` – limpa cookies de acesso.
- `middleware.ts` – protege todas as rotas exceto `/login`, `/register`, `/api/auth/**`, assets e API pública. Usuários sem cookie são redirecionados para `/login?next=<rota>`.

---

## Fluxo de Dados

1. Sidebar (`SidebarLists`) usa `useLists` → `GET /api/lists` para trazer listas e contadores.
2. Selecionar lista aciona `TaskTable`, que consome `useListTasks` (fetch detalhado da lista).
3. Criação de tarefas (`CreateTaskForm`):
   - Envia título + descrição + prioridade + status + dueDate para `POST /api/lists/{id}/tasks`.
   - Invalida caches de tarefas/listas via React Query.
4. Edição (`EditTaskDialog`) utiliza `useUpdateTask` e PATCH no mesmo endpoint.
5. Toggle de concluído (`useToggleTask`) altera status OPEN/DONE.
6. Exclusões acionam `DELETE` e invalidam cache.

> Todos os schemas de entrada/saída estão em `src/entities/*/model/schemas.ts`. Zod garante que respostas em desacordo sejam tratadas como erro.

---

## Rodando com Docker

Build/execução local:

```bash
docker build -t tickr-web .
docker run -p 3000:3000 \
  -e API_BASE_URL=http://host.docker.internal:8082 \
  tickr-web
```

Monte um arquivo `.env.production` para sobrepor configurações durante `docker build` se necessário.

---

## Roadmap Próximo

- [ ] Implementar barra de filtros (Hoje/Semana/Atrasadas/Status) reutilizando `FiltersBar` e cache por query params.
- [ ] Adicionar visão de dashboard semanal (gráficos com Recharts).
- [ ] Tema dark/light e atalhos de teclado (`N`, `Enter`) integrados ao formulário.
- [ ] Exportação CSV/JSON integrada ao back-end.
- [ ] Página pública (landing + política de privacidade) e PWA básico.

---

## Dicas e Troubleshooting

- **`Failed to fetch`**: verifique se o back-end está acessível no host configurado ou se o BFF está apontando para a URL correta (`API_BASE_URL`).
- **`jwt malformed` no BFF**: indica login com token ausente/expirado. Faça logout para limpar cookies.
- **Problemas de CORS**: preferencialmente use o proxy (`/api/[...path]`). Caso acesse o back-end direto do browser, habilite CORS na API Spring.
- **`tsc` não encontrado**: garanta que `node_modules/.bin` esteja no PATH ou rode `npm install` antes de `npm run typecheck`.

---

## Links Úteis

- Back-end README: `../todolistSimplesMVP/README.md`
- Documento de requisitos: `../todolistSimplesMVP/IDEIA_CENTRAL_TODO_SAAS_V01.md`
- Qodana/qualidade: `qodana.yaml`

Sinta-se à vontade para abrir PRs ou issues com melhorias! ✨
