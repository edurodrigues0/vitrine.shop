# Implementação de Busca Dinâmica de Produtos na Landing Page

## Resumo das Alterações

Substituí o card de loja de exemplo na Landing Page por um componente de busca dinâmica de produtos que permite aos usuários encontrar produtos em tempo real conforme digitam.

## Arquivos Criados

### 1. `src/components/product-search.tsx`
Componente principal de busca de produtos com as seguintes funcionalidades:
- **Busca em tempo real**: Utiliza debounce de 300ms para otimizar as requisições à API
- **Exibição de resultados**: Mostra nome do produto, preço e detalhes (cor/tamanho)
- **Localização do usuário**: Exibe a cidade do usuário (obtida do localStorage)
- **Estados visuais**: Loading, resultados vazios e estado inicial
- **Design responsivo**: Mantém o padrão visual da página com gradientes e glassmorphism

**Recursos implementados:**
- Busca produtos por nome via API
- Carrega variações de produtos (cores e tamanhos)
- Calcula o menor preço quando há múltiplas variações
- Formata preços em Real brasileiro
- Scrollbar customizado para a lista de resultados
- Animações e transições suaves

### 2. `src/hooks/use-debounce.ts`
Hook customizado para debounce que:
- Atrasa a execução de funções durante a digitação
- Reduz o número de chamadas à API
- Melhora a performance geral da aplicação

## Arquivos Modificados

### 1. `src/components/hero-section.tsx`
- **Removido**: Card de exemplo da loja com estatísticas estáticas
- **Adicionado**: Componente `ProductSearch` no lado direito da hero section
- **Mantido**: Todo o conteúdo do lado esquerdo (título, descrição, botões, estatísticas)
- **Limpeza**: Removidos imports não utilizados (Store, Package, ShoppingCart, MessageCircle, Card)

### 2. `src/app/globals.css`
- **Adicionado**: Estilos customizados para scrollbar
- **Suporte**: Modo claro e escuro
- **Efeitos**: Hover states e transições suaves

## Fluxo de Funcionamento

1. **Usuário digita** no campo de busca
2. **Debounce aguarda** 300ms após a última digitação
3. **API é chamada** com o termo de busca
4. **Produtos são buscados** via `productsService.findAll()`
5. **Variações são carregadas** para cada produto via `productVariationsService.findByProductId()`
6. **Resultados são exibidos** com:
   - Nome do produto
   - Preço (menor preço se houver variações)
   - Cores disponíveis (até 3)
   - Tamanhos disponíveis (até 3)
   - Descrição (limitada a 2 linhas)

## Estrutura de Dados

### Produto com Variações
```typescript
interface ProductWithVariations extends Product {
  variations?: ProductVariation[];
}
```

### Informações Exibidas
- **Nome**: `product.name`
- **Preço**: Menor valor entre `variation.discountPrice` ou `variation.price`
- **Cores**: Array único de `variation.color`
- **Tamanhos**: Array único de `variation.size`
- **Descrição**: `product.description` (truncada)

## Melhorias de UX

1. **Feedback Visual**:
   - Ícone de loading durante a busca
   - Mensagem quando não há resultados
   - Mensagem inicial incentivando a busca

2. **Design Consistente**:
   - Gradientes azul/roxo mantidos
   - Glassmorphism effect no card principal
   - Hover states nos resultados
   - Transições suaves

3. **Responsividade**:
   - Componente oculto em telas pequenas (mantém o comportamento original)
   - Visível apenas em `lg:block`

4. **Performance**:
   - Debounce para evitar requisições excessivas
   - Limite de 6 produtos por busca
   - Tratamento de erros silencioso (não quebra a UI)

## Próximos Passos Sugeridos

1. **Geolocalização**: Implementar detecção automática da cidade do usuário
2. **Filtro por cidade**: Adicionar filtro `cityId` na busca de produtos
3. **Click nos resultados**: Adicionar navegação para página do produto
4. **Imagens**: Incluir imagens dos produtos nos resultados
5. **Cache**: Implementar cache local dos resultados de busca

## Dependências

- `lucide-react`: Ícones (Search, Package, MapPin, Loader2, ShoppingBag)
- `@/services/products-service`: Busca de produtos
- `@/services/product-variations-service`: Busca de variações
- `@/hooks/use-debounce`: Hook de debounce customizado
- `@/components/ui/input`: Componente de input
- `@/components/ui/card`: Componente de card

## Notas Técnicas

- O componente é client-side (`"use client"`)
- Utiliza React hooks (useState, useEffect, useCallback)
- Formatação de moeda em pt-BR
- Preços armazenados em centavos (divididos por 100 para exibição)
