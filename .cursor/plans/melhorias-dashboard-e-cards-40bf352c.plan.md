<!-- 40bf352c-fd38-44af-8bcb-d74db6a1478b e020815f-2ac7-4381-906a-ad2762fa8c5c -->
# Sistema Completo de Produtos, Carrinho e Pedidos

## 1. Corrigir e Implementar Edição de Produtos

### 1.1 Criar página de edição

- **Arquivo:** `web/src/app/dashboard/produtos/[id]/editar/page.tsx`
- Criar página de edição que carrega dados do produto via `productsService.findById()`
- Campos obrigatórios: nome, descrição, quantidade, preço, categoria
- Campos opcionais: tamanho, cor, variações

### 1.2 Atualizar DTOs e Services

- **Arquivo:** `web/src/dtos/product.ts`
- Adicionar `price` e `quantity` ao `Product` interface
- Atualizar `UpdateProductRequest` para incluir `price` e `quantity`
- **Arquivo:** `web/src/services/products-service.ts`
- Garantir que `update` suporta os novos campos

### 1.3 Ajustar Backend (se necessário)

- **Arquivo:** `api/src/http/controllers/products/update.ts`
- Verificar se aceita `price` e `quantity` no schema de validação
- Atualizar caso necessário

## 2. Sistema de Variações de Produtos

### 2.1 Modal/Popup de Variações

- **Arquivo:** `web/src/components/product-variations-modal.tsx` (novo)
- Criar modal para gerenciar variações:
- Seleção de tipo: cor, tamanho, ou ambos
- Formulário para criar variações com campos: nome, preço, quantidade, cor/tamanho
- Lista de variações existentes com opção de editar/excluir

### 2.2 Integrar modal na página de edição

- Adicionar botão "Gerenciar Variações" na página de edição
- Abrir modal ao clicar
- Carregar variações existentes via `productVariationsService.findByProductId()`

### 2.3 Serviços de Variações

- **Arquivo:** `web/src/services/product-variations-service.ts`
- Verificar se existe método `findByProductId()`
- Adicionar se necessário
- Verificar métodos `create`, `update`, `delete`

### 2.4 Atualizar página de criação

- **Arquivo:** `web/src/app/dashboard/produtos/cadastro/page.tsx`
- Adicionar campos `price` e `quantity` obrigatórios
- Integrar modal de variações após criação do produto

## 3. Melhorias no Carrinho

### 3.1 Validação de loja única

- **Arquivo:** `web/src/contexts/cart-context.tsx`
- Já implementado via `canAddItem()` - verificar se está funcionando corretamente
- Adicionar mensagem de erro mais clara quando tentar adicionar produto de loja diferente

### 3.2 Melhorar visualização do carrinho

- **Arquivo:** `web/src/components/cart.tsx`
- Já exibe: nome, quantidade, preço unitário, preço total
- Adicionar exibição de imagem do produto (se disponível)
- Melhorar layout e responsividade

## 4. Checkout e Finalização de Pedidos

### 4.1 Atualizar página de checkout

- **Arquivo:** `web/src/app/cidade/[city]/checkout/page.tsx`
- Adicionar formulário para coletar:
- Nome do cliente (obrigatório)
- WhatsApp (obrigatório)
- Botão "Prosseguir com a solicitação" → abre etapa final
- Botão "Realizar pedido" → cria pedido no backend e gera link WhatsApp

### 4.2 Criar serviço de pedidos (frontend)

- **Arquivo:** `web/src/services/orders-service.ts`
- Verificar se existe
- Adicionar método `create` se não existir
- Método deve enviar dados do carrinho + dados do cliente

### 4.3 Ajustar backend de criação de pedidos

- **Arquivo:** `api/src/http/controllers/orders/create.ts`
- Verificar se já aceita os dados necessários
- Garantir que cria pedido + itens do pedido corretamente

### 4.4 Geração de mensagem WhatsApp

- Após criar pedido, gerar mensagem formatada com:
- Dados do cliente (nome, WhatsApp)
- Lista de itens (produto, variação, quantidade, preço)
- Total
- Link direto para WhatsApp da loja

## 5. Visualização de Pedidos no Dashboard

### 5.1 Melhorar página de pedidos

- **Arquivo:** `web/src/app/dashboard/pedidos/page.tsx`
- Adicionar filtros:
- Nome do cliente (input de busca)
- Número do WhatsApp (input de busca)
- Título do pedido (criar campo "title" no backend ou usar ID)
- Exibir itens do pedido em cards estilizados
- Mostrar informações completas: produtos, variações, quantidades, preços

### 5.2 Serviço de busca de pedidos

- **Arquivo:** `web/src/services/orders-service.ts`
- Verificar método `findAll()` e adicionar suporte a filtros se necessário
- Adicionar método `findById()` para buscar detalhes completos com itens

### 5.3 Endpoint de busca com filtros (backend)

- **Arquivo:** `api/src/http/controllers/orders/find-by-store.ts`
- Adicionar filtros opcionais: `customerName`, `customerPhone`
- Atualizar schema de validação de query params

### 5.4 Endpoint de itens do pedido

- **Arquivo:** `api/src/http/controllers/orders/find-items.ts`
- Verificar se já existe e retorna itens com produtos e variações
- Garantir que inclui todas as informações necessárias

## 6. Integração com Estatísticas

### 6.1 Atualizar estatísticas em tempo real

- **Arquivo:** `web/src/app/dashboard/estatisticas/page.tsx`
- Já exibe dados de pedidos
- Adicionar invalidação de queries após criar pedido
- Usar `useQueryClient.invalidateQueries(["statistics"])` após criar pedido

### 6.2 Backend de estatísticas

- **Arquivo:** `api/src/http/controllers/stores/statistics.ts`
- Verificar se já inclui dados de pedidos (total, receita, etc.)
- Garantir que está atualizado corretamente

### 6.3 Atualizar DTOs de estatísticas

- **Arquivo:** `web/src/dtos/store-statistics.ts`
- Verificar se inclui todos os campos necessários
- Adicionar campos de pedidos se necessário

## 7. Ajustes Finais

### 7.1 Validações

- Validar campos obrigatórios em todos os formulários
- Mensagens de erro claras
- Validação de estoque ao adicionar ao carrinho

### 7.2 UX/UI

- Feedback visual (loading, sucesso, erro)
- Toast notifications para ações importantes
- Confirmação antes de ações destrutivas

### 7.3 Testes

- Testar fluxo completo: criar produto → adicionar variações → adicionar ao carrinho → finalizar pedido
- Verificar integração com estatísticas
- Testar filtros de pedidos

### To-dos

- [ ] Melhorar cards de lojas na página de cidade: adicionar nome, descrição, cidade, ícones Instagram/WhatsApp e quantidade de produtos
- [ ] Remover transparência em menus e dropdowns (SearchBar, CitySelector, Header) para tema escuro com fundo sólido
- [ ] Adicionar logo da loja acima do menu no dashboard sidebar
- [ ] Implementar sidebar expansível/recolhível no dashboard com persistência em localStorage
- [ ] Adicionar campo de upload de múltiplas imagens no formulário de criação de produto
- [ ] Melhorar visualização da página Minha Loja com melhor layout e apresentação
- [ ] Criar sistema de tracking de visitas: schema, repository, controller e endpoint no backend
- [ ] Integrar tracking de visitas: registrar visitas na página da loja e exibir estatísticas no dashboard
- [ ] Criar header do dashboard com botão voltar, filtro de cidades e toggle de tema
- [ ] Criar página de edição de produto em /dashboard/produtos/[id]/editar com campos obrigatórios e opcionais
- [ ] Atualizar DTOs e services para incluir price e quantity nos produtos
- [ ] Criar modal de gerenciamento de variações de produtos com suporte a cor, tamanho ou ambos
- [ ] Atualizar página de criação de produto para incluir campos price e quantity obrigatórios
- [ ] Melhorar visualização do carrinho e adicionar validações de loja única
- [ ] Atualizar página de checkout para coletar dados do cliente e criar pedido no backend
- [ ] Implementar serviço de pedidos no frontend com método create
- [ ] Adicionar filtros (nome, WhatsApp) na página de pedidos do dashboard
- [ ] Atualizar backend para suportar filtros de busca em pedidos
- [ ] Exibir itens completos dos pedidos com produtos e variações em cards estilizados
- [ ] Integrar criação de pedidos com atualização de estatísticas em tempo real
- [ ] Gerar mensagem WhatsApp formatada após criar pedido com todos os dados do pedido