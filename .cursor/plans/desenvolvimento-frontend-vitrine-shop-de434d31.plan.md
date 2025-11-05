<!-- de434d31-8f10-461f-8f02-b6efdb65fcfd 9f11c2f4-9e05-469f-9806-15678d661237 -->
# Completar e Robustecer Plataforma Vitrine.shop

## Estado Atual - O que já existe

### Backend

- API REST completa com Express + TypeScript
- Autenticação JWT (Bearer + Cookie)
- CRUD completo: Users, Stores, Products, Variations, Images, Categories, Cities
- Schema de subscriptions (banco de dados)
- Upload de imagens (Firebase Storage)
- Documentação Swagger
- Testes unitários

### Frontend

- Landing page completa
- Autenticação (login/registro)
- Navegação por cidade
- Visualização de lojas e produtos
- Carrinho de compras
- Checkout via WhatsApp
- Dashboard básico (dashboard, produtos, loja)
- Header/footer condicionais

## Funcionalidades Críticas Faltantes

### 1. Sistema de Pedidos/Encomendas (Backend + Frontend)

**Prioridade: ALTA**

**Backend:**

- Criar schema `orders` (id, storeId, customerName, customerPhone, customerEmail, items, total, status, createdAt)
- Criar schema `order_items` (id, orderId, productVariationId, quantity, price)
- Use cases: create-order, find-orders-by-store, update-order-status
- Endpoints: POST /api/orders, GET /api/orders, GET /api/orders/:id, PUT /api/orders/:id/status

**Frontend:**

- Dashboard: página de pedidos (`/dashboard/pedidos`)
- Lista de pedidos com status (PENDENTE, CONFIRMADO, PREPARANDO, ENVIADO, ENTREGUE, CANCELADO)
- Filtros por status e data
- Detalhes do pedido com informações do cliente
- Atualização de status do pedido

**Impacto:** Sem isso, não há rastreamento de vendas nem controle de estoque automático.

### 2. Atualização Automática de Estoque

**Prioridade: ALTA**

**Backend:**

- Ao criar pedido, reduzir estoque das variações
- Validação de estoque disponível antes de criar pedido
- Endpoint para atualizar estoque manualmente (dashboard)

**Frontend:**

- Validação de estoque no checkout
- Alertas quando estoque está baixo
- Dashboard: gerenciamento de estoque

**Impacto:** Evita vender produtos sem estoque disponível.

### 3. Página de Cadastro/Edição de Loja

**Prioridade: MÉDIA**

**Frontend:**

- Criar `/dashboard/loja/cadastro` (criar/editar)
- Formulário completo com todos os campos
- Upload de logo e banner
- Seleção de cidade
- Validação de CNPJ/CPF
- Preview da loja

**Impacto:** Lojistas não conseguem criar/editar lojas pela interface.

### 4. Dashboard - Estatísticas

**Prioridade: MÉDIA**

**Frontend:**

- Criar `/dashboard/estatisticas`
- Gráficos de vendas (últimos 30 dias, 7 dias)
- Total de pedidos, receita, produtos mais vendidos
- Estatísticas de visualizações (futuro)
- Usar biblioteca de gráficos (recharts ou chart.js)

**Backend:**

- Endpoint GET /api/stores/:id/statistics
- Agregar dados de pedidos e produtos

### 5. Dashboard - Configurações

**Prioridade: BAIXA**

**Frontend:**

- Criar `/dashboard/configuracoes`
- Editar perfil do usuário
- Alterar senha
- Configurações de notificações
- Preferências de tema

### 6. Melhorias no Filtro de Lojas por Cidade

**Prioridade: MÉDIA**

**Backend:**

- Adicionar filtro `cityId` no `findAllStores`
- Otimizar query com JOIN adequado

**Frontend:**

- Usar filtro do backend ao invés de filtrar no cliente

### 7. Sistema de Upload de Imagens no Frontend

**Prioridade: MÉDIA**

**Frontend:**

- Componente de upload de imagens
- Preview antes de enviar
- Upload múltiplo para produtos
- Integração com endpoint POST /api/product-images
- Tratamento de erros e loading states

### 8. Validação de Estoque no Carrinho

**Prioridade: ALTA**

**Frontend:**

- Verificar estoque disponível antes de adicionar ao carrinho
- Validar quantidade disponível vs solicitada
- Atualizar estoque em tempo real (quando possível)
- Alertas quando produto fica sem estoque

### 9. Busca e Filtros Avançados

**Prioridade: MÉDIA**

**Frontend:**

- Barra de busca global na landing page
- Filtros por categoria, preço, cidade
- Ordenação (preço, nome, mais recente)
- Filtros de lojas (status, cidade)

**Backend:**

- Melhorar queries de busca com índices
- Filtro por range de preço
- Filtro por categoria (já existe, melhorar)

### 10. Sistema de Assinaturas/Pagamento

**Prioridade: BAIXA (futuro)**

**Backend:**

- Integração com gateway de pagamento (Stripe, Mercado Pago)
- Webhooks para atualizar status de assinatura
- Endpoints para gerenciar assinaturas

**Frontend:**

- Página de planos e preços
- Checkout de assinatura
- Gerenciamento de assinatura no dashboard

### 11. Melhorias de UX e Performance

**Prioridade: MÉDIA**

**Frontend:**

- Paginação em listas de produtos/lojas
- Lazy loading de imagens
- Skeleton loaders
- Toast notifications melhoradas
- Error boundaries
- SEO melhorado (meta tags dinâmicas)
- Compressão de imagens

### 12. Segurança e Validações

**Prioridade: ALTA**

**Backend:**

- Rate limiting nas rotas
- Validação de permissões (owner só edita própria loja)
- Sanitização de inputs
- Validação de uploads (tipo, tamanho)
- Logs de auditoria

**Frontend:**

- Validação de formulários robusta
- Proteção CSRF
- Sanitização de dados antes de enviar

### 13. Testes

**Prioridade: MÉDIA**

**Frontend:**

- Testes unitários de componentes
- Testes de integração de fluxos críticos
- Testes E2E (Playwright/Cypress)

### 14. Documentação

**Prioridade: BAIXA**

- README completo
- Guia de instalação
- Documentação de API (já existe Swagger)
- Guia de deploy

### 15. Funcionalidades Adicionais

**Prioridade: BAIXA (futuro)**

- Favoritos/wishlist
- Avaliações de produtos
- Notificações push
- Chat integrado
- Histórico de pedidos do cliente
- Cupons de desconto
- Relatórios avançados

## Priorização Recomendada

### Fase 1 - Essencial (Sprint 1-2)

1. Sistema de Pedidos (backend + frontend)
2. Atualização automática de estoque
3. Validação de estoque no carrinho
4. Página de cadastro/edição de loja

### Fase 2 - Importante (Sprint 3-4)

5. Dashboard de estatísticas
6. Melhorias no filtro por cidade
7. Upload de imagens no frontend
8. Busca e filtros avançados

### Fase 3 - Melhorias (Sprint 5-6)

9. Dashboard de configurações
10. Melhorias de UX e performance
11. Segurança e validações
12. Testes

### Fase 4 - Futuro

13. Sistema de assinaturas/pagamento
14. Funcionalidades adicionais
15. Documentação completa

## Arquivos que Precisam ser Criados

### Backend

- `api/src/database/schema/orders.ts`
- `api/src/database/schema/order-items.ts`
- `api/src/use-cases/orders/*`
- `api/src/http/controllers/orders/*`
- `api/src/http/middleware/rate-limit.ts`
- `api/src/http/middleware/permissions.ts`

### Frontend

- `web/src/app/dashboard/pedidos/page.tsx`
- `web/src/app/dashboard/loja/cadastro/page.tsx`
- `web/src/app/dashboard/estatisticas/page.tsx`
- `web/src/app/dashboard/configuracoes/page.tsx`
- `web/src/components/image-upload.tsx`
- `web/src/services/orders-service.ts`
- `web/src/dtos/order.ts`

### To-dos

- [ ] Corrigir login.ts - adicionar 'role' ao tipo de retorno do AuthenticateUseCase
- [ ] Corrigir find-all.ts - Product não tem campos de variação (price, stock, etc)
- [ ] Corrigir import incorreto em make-find-product-images-by-product-id-use-case.ts
- [ ] Corrigir imports de CreateProductVariationParams e UpdateProductVariationParams em products-repository.ts
- [ ] Corrigir stores-repository.ts - problema com theme nullable