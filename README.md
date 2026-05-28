<div align="center">
  <img src="public/images/cheffy-presentation.svg"
       alt="Cheffy Web" width="220" />

  <h1>Cheffy Web</h1>
  <p>Frontend web da plataforma Cheffy — receitas, favoritos, busca culinária e assistente gastronômico com IA</p>

  ![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=000000)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=ffffff)
  ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=flat-square)
  ![Better Auth](https://img.shields.io/badge/Better_Auth-Sessions-FF6B6B?style=flat-square)
  ![Orval](https://img.shields.io/badge/Orval-API_Client-2F855A?style=flat-square)
  ![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel)
</div>

---

### 2. Visão Geral

O **Cheffy Web** é um projeto desenvolvido para faculdade, com foco em tecnologia aplicada à alimentação consciente, saúde e organização culinária.

A aplicação é a interface frontend da plataforma Cheffy, consumindo a `Cheffy API` para exibir Home, receitas, categorias, detalhes nutricionais, favoritos do usuário, autenticação via Better Auth e assistente gastronômico com inteligência artificial.

O projeto possui maior aderência ao **ODS 3 — Saúde e Bem-Estar**, contribuindo para hábitos alimentares mais conscientes ao apresentar receitas, ingredientes, etapas de preparo e informações nutricionais de forma clara. Também se relaciona ao **ODS 12 — Consumo e Produção Responsáveis**, ao apoiar melhor aproveitamento de ingredientes e adaptação de receitas com IA. Como apoio tecnológico, dialoga com o **ODS 9 — Indústria, Inovação e Infraestrutura**, por usar uma arquitetura moderna, documentada e pronta para deploy.

<br/>
[🔗 API local esperada (http://localhost:8000/docs)](http://localhost:8000/docs)

---

### 3. Decisões Técnicas

- **Por que Next.js App Router?**
  **Escolha:** Next.js 16 com App Router.
  **Motivo:** O projeto combina páginas públicas, metadados por rota, renderização otimizada, imagens locais/remotas e integração direta com deploy Vercel. O App Router mantém o roteamento por filesystem e permite separar páginas, layouts e componentes de domínio com baixo atrito.

- **Por que React 19?**
  **Escolha:** React 19 com componentes funcionais.
  **Motivo:** A aplicação é altamente interativa: favoritos, autenticação, filtros, paginação, busca, modo de preparo e chat com IA. React mantém essas experiências previsíveis e compatíveis com o ecossistema do Next.

- **Por que Tailwind CSS e shadcn/ui?**
  **Escolha:** Tailwind CSS 4, Radix UI e componentes shadcn.
  **Motivo:** A interface precisa de consistência visual, responsividade e componentes acessíveis como dialog, sheet, select, tabs, alert e carousel. Tailwind concentra a estilização próxima do componente sem criar uma camada pesada de CSS global.

- **Por que TanStack Query?**
  **Escolha:** `@tanstack/react-query`.
  **Motivo:** A Home, busca, favoritos e detalhes dependem de cache, revalidação, estados de loading e mutations. TanStack Query reduz estado manual e mantém o consumo da API mais previsível.

- **Por que Orval?**
  **Escolha:** Cliente gerado a partir do OpenAPI da Cheffy API.
  **Motivo:** O frontend não precisa duplicar contratos manualmente. Os tipos e hooks são gerados a partir do backend, reduzindo divergência entre API e interface.

- **Por que Better Auth no client?**
  **Escolha:** `better-auth/react` apontando para `NEXT_PUBLIC_API_URL`.
  **Motivo:** A sessão fica centralizada no backend, enquanto o frontend consome o estado autenticado para abrir login, liberar favoritos e enviar cookies nas requisições.

- **Por que Vercel?**
  **Escolha:** Deploy com framework `nextjs`, build `pnpm build` e variáveis públicas configuradas no painel.
  **Motivo:** É o caminho mais direto para Next.js, mantendo build reproduzível com `pnpm-lock.yaml` e sem precisar de servidor customizado.

---

### 4. Arquitetura

```text
app/
├── layout.tsx             # Layout raiz, fontes, QueryProvider e Toaster
├── page.tsx               # Home
├── receitas/              # Busca/listagem e detalhe de receita
├── categorias/[slug]/     # Página de categoria
└── favoritos/             # Favoritos do usuário autenticado

components/
├── auth/                  # Login social, sessão e ações de autenticação
├── category/              # Experiência de categoria
├── favorites/             # Página e estado vazio de favoritos
├── home/                  # Hero, sabores, benefícios e seções dinâmicas
├── layout/                # Header, footer, logo, busca e navegação mobile
├── recipe-detail/         # Detalhe, preparo, nutrição, impressão e IA
├── search/                # Busca, filtros e resultado de receitas
├── shared/                # Cards, favoritos e componentes reutilizáveis
└── ui/                    # Base shadcn/Radix

api/
├── generated/             # Cliente e tipos gerados pelo Orval
└── interceptor.ts         # Axios com baseURL, cookies e erro padronizado

lib/
├── auth-client.ts         # Cliente Better Auth
├── hooks/                 # Hooks locais, incluindo stream de IA
├── schemas/               # Schemas utilitários de busca
└── utils.ts               # Helpers de composição
```

**Fluxo end-to-end de dados:**
1. **Página** → Renderiza a rota do App Router.
2. **Componente client** → Usa hooks gerados pelo Orval ou hooks locais.
3. **API client** → `api/interceptor.ts` envia requests com `baseURL` e `withCredentials`.
4. **Backend** → Cheffy API responde com contratos OpenAPI/Zod.
5. **Interface** → TanStack Query atualiza cache, loading, erros, favoritos e paginação.

**Fluxo de autenticação:**
1. Usuário aciona o login pela interface.
2. `better-auth/react` redireciona para o provider configurado no backend.
3. A sessão é mantida por cookies do domínio da API.
4. Componentes como favoritos e assistente consultam `authClient.useSession()`.

**Fluxo de favoritos:**
1. Cards recebem `isFavorited` vindo do backend.
2. Botão de favorito exige sessão ativa.
3. Mutation chama `POST` ou `DELETE /api/v1/recipes/{id}/favorite`.
4. A UI atualiza a experiência sem hardcode de estado favorito.

**Fluxo do assistente gastronômico:**
1. Página de detalhe abre o chat da receita.
2. `use-ai-stream.ts` chama o endpoint SSE da API.
3. Tokens chegam em tempo real e são renderizados no chat.
4. O backend mantém contexto da receita e do usuário autenticado.

---

### 5. Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Home com hero, sabores favoritos, benefícios, seções dinâmicas e fechamento visual |
| `/receitas` | Busca de receitas com filtros, paginação e ordenação |
| `/receitas/[slug]` | Detalhe completo da receita, preparo, nutrição, favoritos, impressão e IA |
| `/categorias/[slug]` | Listagem de receitas por categoria |
| `/favoritos` | Receitas favoritadas pelo usuário autenticado |

---

### 6. Integração com Backend

O frontend espera a **Cheffy API** disponível em `NEXT_PUBLIC_API_URL`.

Principais integrações:

| Recurso | Origem |
|---------|--------|
| Home | `GET /api/v1/home` |
| Receitas | `GET /api/v1/recipes` |
| Detalhe por slug | `GET /api/v1/recipes/slug/{slug}` |
| Categorias | `GET /api/v1/categories` |
| Favoritos | `GET /api/v1/me/favorites` |
| Toggle favorito | `POST/DELETE /api/v1/recipes/{id}/favorite` |
| Sessão | `/api/auth/*` via Better Auth |
| IA | `POST /api/v1/ai/recipes/{recipeId}/assistant/stream` |

O cliente gerado pelo Orval fica em `api/generated`, usando `api/interceptor.ts` como mutator para Axios.

---

### 7. Variáveis de Ambiente

Crie um `.env` local a partir de `.env.example`.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | ✅ | URL pública da Cheffy API. Local: `http://localhost:8000` |
| `NEXT_PUBLIC_FRONTEND_URL` | ✅ | URL pública do frontend. Local: `http://localhost:3333` |

> No Vercel, configure essas variáveis em **Project Settings → Environment Variables**. Como são `NEXT_PUBLIC_*`, elas entram no bundle do navegador durante o build.

---

### 8. Como Rodar Localmente

#### Pré-requisitos

- Node.js 24+
- pnpm 10+
- Cheffy API rodando localmente ou publicada

#### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/willianOliveira-dev/cheffy-web.git
cd cheffy-web

# 2. Instale dependências
pnpm install

# 3. Crie o arquivo de ambiente
cp .env.example .env

# 4. Garanta que a API esteja disponível
# Localmente, a API deve responder em http://localhost:8000

# 5. Inicie o frontend
pnpm dev
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

A aplicação local roda em:

```bash
http://localhost:3333
```

---

### 9. Como Gerar Cliente da API

O projeto usa Orval para gerar tipos e hooks a partir do OpenAPI da Cheffy API.

```bash
pnpm generate:api
```

Esse comando usa:

```text
NEXT_PUBLIC_API_URL/doc
```

Antes de rodar, a API precisa estar ativa e o `.env` precisa conter `NEXT_PUBLIC_API_URL`.

---

### 10. Como Rodar em Produção (Vercel)

O projeto está pronto para deploy na Vercel com `vercel.json`.

Configuração esperada:

| Campo | Valor |
|-------|-------|
| Framework Preset | Next.js |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | Automático pelo Next.js |
| Node.js | 24+ |

Variáveis para produção:

```env
NEXT_PUBLIC_API_URL=https://sua-api.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://seu-frontend.vercel.app
```

Checklist antes do deploy:

- API publicada e acessível via HTTPS.
- `FRONTEND_URL` e `ALLOWED_ORIGINS` configurados na Cheffy API.
- `BETTER_AUTH_URL` configurado no backend com a URL pública da API.
- Callback OAuth do Google liberado para o domínio do backend.
- `NEXT_PUBLIC_API_URL` apontando para a API publicada.
- `NEXT_PUBLIC_FRONTEND_URL` apontando para o domínio Vercel.

---

### 11. Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o Next.js em `http://localhost:3333` |
| `pnpm build` | Gera build de produção |
| `pnpm start` | Executa o build localmente |
| `pnpm lint` | Executa ESLint |
| `pnpm typecheck` | Valida TypeScript sem emitir arquivos |
| `pnpm generate:api` | Regenera cliente Orval a partir da Cheffy API |

---

### 12. Qualidade e Deploy

Antes de abrir PR ou publicar:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Esses comandos validam lint, tipos e build final do Next.js, que é o mesmo caminho usado no deploy.

---

### 13. Licença e Autor

## Autor

**Willian Oliveira**

[![GitHub](https://img.shields.io/badge/GitHub-willianOliveira--dev-181717?style=flat-square&logo=github)](https://github.com/willianOliveira-dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Willian_Oliveira-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/willian-oliveira-66a230353/)
