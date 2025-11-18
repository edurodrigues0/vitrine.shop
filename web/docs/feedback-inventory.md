# Feedback Visual – Inventário Inicial

## Fluxos Principais

### Autenticação (Login / Registro)
- Botões exibem apenas texto alterado ("Entrando...") mas não mostram spinner/loading consistente.
- Falta feedback visual quando login falha (toast só no catch manual; não há estados visíveis no formulário).
- Links auxiliares (esqueci minha senha) parecem texto comum; ausência de hover diferenciado.
- Campos de entrada não mostram estado de sucesso ou erro além do texto.

### Dashboard
- Cards de estatísticas reagem no hover, porém não indicam ações clicáveis (alguns não levam a lugar nenhum, outros sim).
- Lista de ações rápidas (`quickActions`) não exibe estado de loading ao navegar; sem indicação visual após clique.

### Gestão de Produtos
- `ProductCard` mostra botões para alterar estoque, excluir, editar:
  - Apenas desabilita botão durante mutações (`updateQuantityMutation.isPending`), sem spinner.
  - Feedback de erro/sucesso depende de toast (quando existir), mas card permanece igual.
  - Seleção múltipla não deixa evidente quando item está selecionado (ring atual é sutil no modo escuro).
- Ao criar/editar produto, botões de salvar não possuem loading nem estados de sucesso.

### Pedidos
- Alteração de status exibe "Atualizando..." texto, mas botões não mostram loading individual.
- Falta confirmação visual clara após troca de status (apenas mudança da tag de status).

### Checkout / Carrinho
- Checkout modal possui spinner global, porém ações finais (botão enviar pedido) não têm loading/spinner.
- Remover itens do carrinho/limpar não tem feedback imediato (apenas desaparece).

## Componentes Globais

### Botões (`Button`)
- Variantes não possuem props para `isLoading`/`isSuccess`.
- Não há indicador visual de erro/sucesso (cores definidas, mas sem estados automáticos).

### Inputs / Form Fields
- Apenas estado de erro via mensagem. Sem feedback positivo ou foco persistente.

### Toasts/Alertas
- Uso não padronizado; algumas ações usam `sonner`, outras não têm feedback.
- Estilo dos toasts não segue tokens globais (cores padrões do `sonner`).

### Skeletons / Loading States
- Alguns carregamentos utilizam `<Loader2>` isolado; falta skeleton consistente para listas/cards.

### Links / Navegação
- Links dentro de navegação (sidebar) dependem apenas de cor/fundo, mas não há indicador de carregamento quando rota demora.

## Oportunidades Gerais

1. Introduzir prop `isLoading` nos componentes interativos (botões, ícones) com spinner e desabilitar clique.
2. Padronizar toasts de sucesso/erro/informação usando tokens do tema.
3. Adotar skeletons para listagens (produtos, pedidos, dashboard) durante `isLoading`.
4. Adicionar microinterações consistentes nos estados `hover`/`active` (transições suaves, escala, sombra).
5. Garantir estados de foco visíveis (principalmente para teclado) em botões, links, inputs.
6. Exibir mensagens de sucesso diretamente no contexto (ex.: "Produto salvo" dentro do card) além do toast.

---
_Status: Inventário inicial gerado. Próxima etapa: definir tokens e diretrizes._
