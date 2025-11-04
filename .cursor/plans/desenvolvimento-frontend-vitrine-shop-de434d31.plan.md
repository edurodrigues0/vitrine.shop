<!-- de434d31-8f10-461f-8f02-b6efdb65fcfd 5a7eb885-291c-4cfb-a3a5-5c3dccc9de51 -->
# Plano de Desenvolvimento Frontend - Vitrine.shop

## Contexto e Situação Atual

### Backend (API)

- API REST completa em Express + TypeScript
- Endpoints: Auth, Users, Stores, Products, Product Variations, Product Images, Categories, Cities
- Autenticação JWT (Bearer Token + Cookie)
- Documentação Swagger disponível

### Frontend Atual

- Next.js 16 com App Router
- Páginas: Home (landing page), Login
- Componentes: Header, Footer, LoginForm, ThemeToggle
- UI: shadcn/ui components básicos
- React Query instalado mas não configurado
- React Hook Form + Zod instalados mas não configurados
- Sem integração com API backend

## Estrutura de Desenvolvimento

### 1. Configuração Base e Infraestrutura

#### 1.1 Configuração React Query

- Criar `src/lib/react-query.ts` com QueryClient configurado
- Wrapper Provider no layout.tsx
- Configurar cache e retry policies

#### 1.2 API Client

- Criar `src/lib/api-client.ts` com função fetch wrapper
- Configurar baseURL, interceptors para auth
- Tratamento de erros padronizado
- Suporte para Bearer Token e Cookie auth

#### 1.3 DTOs e Tipos

- Criar `src/dtos/` com tipos TypeScript
- Mapear tipos do backend (User, Store, Product, ProductVariation, etc.)
- Tipos para requests e responses

#### 1.4 Hooks e Services

- Criar `src/hooks/` para custom hooks
- Criar `src/services/` para funções de API
- Usar React Query para queries e mutations

#### 1.5 Auth Layout e Proteção

- Criar `src/components/auth-layout.tsx` para páginas protegidas
- Middleware/guards para rotas autenticadas
- Contexto de autenticação com React Context ou Zustand

### 2. Autenticação e Usuário

#### 2.1 Página de Registro

- Criar `src/app/register/page.tsx`
- Formulário com React Hook Form + Zod
- Integração com POST /api/users
- Validação de campos (nome, email, senha, role)
- Redirecionamento após registro

#### 2.2 Melhorar Login

- Integrar `src/components/login-form.tsx` com API
- POST /api/auth/login
- Armazenar token (cookie/localStorage)
- Redirecionamento após login

#### 2.3 Perfil do Usuário

- Criar `src/app/profile/page.tsx`
- GET /api/auth/me para dados do usuário
- Edição de perfil (PUT /api/users/:id)

### 3. Seleção de Cidade e Navegação

#### 3.1 Seletor de Cidade

- Criar `src/components/city-selector.tsx`
- Listar cidades (GET /api/cities)
- Context/State para cidade selecionada
- Persistir seleção (localStorage)

#### 3.2 Página de Cidade

- Criar `src/app/cidade/[city]/page.tsx`
- Dynamic route para slug da cidade
- Exibir lojas da cidade (GET /api/stores com filtro)
- Lista de produtos da cidade (GET /api/products)

### 4. Lojas (Stores)

#### 4.1 Listagem de Lojas

- Componente `src/components/store-list.tsx`
- Cards de lojas com informações
- Filtros e busca
- Paginação

#### 4.2 Página da Loja

- Criar `src/app/cidade/[city]/loja/[slug]/page.tsx`
- GET /api/stores/:slug para dados da loja
- Exibir informações: nome, descrição, logo, contato
- Lista de produtos da loja (GET /api/products com storeId)

#### 4.3 Dashboard da Loja (Proprietário)

- Criar `src/app/dashboard/loja/page.tsx` (protegida)
- GET /api/stores/:id para dados da loja
- Estatísticas e informações
- Ações rápidas

#### 4.4 Cadastro/Edição de Loja

- Criar `src/app/dashboard/loja/cadastro/page.tsx`
- Formulário com React Hook Form + Zod
- POST /api/stores (criar)
- PUT /api/stores/:id (editar)
- Upload de logo e banner (se disponível)

### 5. Produtos

#### 5.1 Listagem de Produtos

- Componente `src/components/product-list.tsx`
- Cards de produtos com imagens
- Filtros: categoria, preço, busca
- Paginação (GET /api/products)

#### 5.2 Página do Produto

- Criar `src/app/cidade/[city]/produto/[id]/page.tsx`
- GET /api/products/:id
- GET /api/product-variations/:productId para variações
- GET /api/product-images/:productVariationId para imagens
- Seleção de variação (tamanho, cor)
- Informações: preço, estoque, descrição

#### 5.3 Cadastro/Edição de Produto (Dashboard)

- Criar `src/app/dashboard/produtos/page.tsx` (lista)
- Criar `src/app/dashboard/produtos/cadastro/page.tsx`
- Criar `src/app/dashboard/produtos/[id]/editar/page.tsx`
- Formulário com React Hook Form + Zod
- POST /api/products
- PUT /api/products/:id
- Upload de imagens (se disponível)

#### 5.4 Variações de Produto

- Componente para gerenciar variações
- POST /api/product-variations
- PUT /api/product-variations/:id
- DELETE /api/product-variations/:id
- Campos: tamanho, cor, preço, estoque, peso, dimensões

#### 5.5 Imagens de Produto

- Componente para upload/gerenciar imagens
- POST /api/product-images
- DELETE /api/product-images/:id
- Marcar imagem principal

### 6. Carrinho de Compras

#### 6.1 Context/Hook de Carrinho

- Criar `src/contexts/cart-context.tsx` ou hook
- Estado: itens, loja selecionada
- Validação: não misturar itens de lojas diferentes
- Persistência (localStorage)

#### 6.2 Componente de Carrinho

- Criar `src/components/cart.tsx` ou drawer
- Lista de itens
- Cálculo de total
- Botão finalizar

#### 6.3 Finalização do Pedido

- Criar `src/app/cidade/[city]/checkout/page.tsx`
- Resumo do pedido
- Geração de mensagem WhatsApp
- Formato: lista de produtos + total
- Link direto para WhatsApp Web/App

### 7. Categorias

#### 7.1 Navegação por Categoria

- Componente `src/components/category-nav.tsx`
- GET /api/categories
- Filtro de produtos por categoria
- Breadcrumbs

#### 7.2 Página de Categoria

- Criar `src/app/cidade/[city]/categoria/[slug]/page.tsx`
- GET /api/categories/:slug
- Lista de produtos da categoria

### 8. Dashboard e Gestão

#### 8.1 Layout do Dashboard

- Criar `src/app/dashboard/layout.tsx`
- Sidebar de navegação
- Menu: Loja, Produtos, Pedidos, Estatísticas
- Usar auth-layout.tsx

#### 8.2 Páginas do Dashboard

- Dashboard home: estatísticas gerais
- Gestão de produtos: CRUD completo
- Gestão de loja: edição de informações
- Gestão de usuários (se admin): GET /api/users

### 9. Melhorias e Features Adicionais

#### 9.1 Busca e Filtros

- Componente de busca global
- Filtros avançados (preço, categoria, loja)
- URL params para compartilhamento

#### 9.2 Favoritos

- Sistema de favoritos (localStorage ou API se disponível)
- Salvar produtos/lojas favoritas

#### 9.3 Notificações

- Toast notifications (sonner já instalado)
- Feedback de ações (sucesso/erro)

#### 9.4 Loading States

- Skeleton loaders para listas
- Loading spinners
- Estados vazios

#### 9.5 Tratamento de Erros

- Páginas de erro (404, 500)
- Error boundaries
- Mensagens de erro amigáveis

### 10. Otimizações e Performance

#### 10.1 Imagens

- Otimização com next/image
- Lazy loading
- Placeholders

#### 10.2 Cache

- Configurar cache do React Query
- Cache de dados estáticos
- Revalidação estratégica

#### 10.3 SEO

- Metadata dinâmica por página
- Open Graph tags
- Structured data (JSON-LD)

## Ordem de Implementação Recomendada

1. **Fase 1 - Fundação**: Configuração base (React Query, API Client, Auth, DTOs)
2. **Fase 2 - Autenticação**: Login, Registro, Perfil
3. **Fase 3 - Navegação**: Seletor de cidade, listagem de lojas
4. **Fase 4 - Produtos**: Visualização, busca, filtros
5. **Fase 5 - Carrinho**: Context, componente, finalização WhatsApp
6. **Fase 6 - Dashboard**: Gestão de loja e produtos
7. **Fase 7 - Polimento**: Otimizações, UX, tratamento de erros

## Observações Técnicas

- Seguir padrões das diretrizes: kebab-case, componentes organizados, React Hook Form + Zod
- Manter App Router (Next.js 16) - adaptar diretrizes se necessário
- Usar fetch nativo ou adicionar axios conforme preferência
- Considerar migração de fontes (Playfair_Display + Poppins) conforme diretrizes
- Todas as páginas protegidas devem usar auth-layout.tsx
- API routes em `src/app/api/` (App Router) ou `src/pages/api/` (se migrar para Page Router)

### To-dos

- [ ] Configurar React Query, API Client, DTOs e estrutura base de hooks/services
- [ ] Implementar sistema de autenticação completo (login, registro, contexto, auth-layout)
- [ ] Criar seletor de cidade e sistema de navegação por cidade
- [ ] Implementar páginas de listagem e detalhes de lojas
- [ ] Implementar páginas de listagem e detalhes de produtos com variações
- [ ] Implementar sistema de carrinho com validação de loja única e integração WhatsApp
- [ ] Criar dashboard completo com gestão de loja e produtos
- [ ] Implementar CRUD completo de produtos, variações e imagens no dashboard
- [ ] Implementar navegação e filtros por categorias
- [ ] Adicionar loading states, error handling, busca, filtros avançados e otimizações