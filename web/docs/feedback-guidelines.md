# Diretrizes de Feedback Visual

## Tokens Globais

| Token | Descrição | Claro | Escuro |
| --- | --- | --- | --- |
| `--feedback-hover-surface` | Superfície usada em estados hover de elementos interativos | `210 40% 97%` | `217 33% 19%` |
| `--feedback-hover-border` | Borda usada em hover para botões/cards | `214 32% 88%` | `217 33% 35%` |
| `--feedback-active-surface` | Superfície durante `active`/press | `217 91% 96%` | `217 33% 22%` |
| `--feedback-active-border` | Borda durante active | `214 32% 82%` | `217 33% 40%` |
| `--feedback-disabled-opacity` | Opacidade padrão para estados desabilitados | `0.55` | `0.4` |
| `--feedback-transition` | Tempo/easing padrão para microinterações | `150ms ease` | `150ms ease` |
| `--feedback-press-scale` | Escala aplicada ao clicar (`active`) | `0.97` | `0.97` |

## Estados Recomendados por Componente

### Botões (`Button`)
- Props esperadas: `isLoading`, `isSuccess`, `isError`, `disabled`.
- Loading: exibir spinner (`Loader2`) alinhado ao conteúdo, manter largura do botão.
- Success: flash de cor (`bg-success` + ícone check) por 1–2s antes de voltar ao estado padrão.
- Error: aplicar `bg-destructive/90`, mostrar ícone e mensagem via tooltip/toast.
- Hover: usar surface/border dos tokens acima, aplicar `transition: background-color var(--feedback-transition)`.
- Active: `transform: scale(var(--feedback-press-scale))`.
- Focus: `outline: 2px solid hsl(var(--ring))` + `outline-offset: 2px`.

### Inputs (`Input`, `Textarea`, `Select`)
- Estados: `default`, `focus`, `error`, `success`, `disabled`.
- Focus: `box-shadow: 0 0 0 3px hsl(var(--ring) / 0.15)`.
- Error: `border-destructive`, label e helper text com cor `text-destructive`.
- Success: `border-success`, ícone opcional (`Check`) à direita.
- Loading: usar placeholder shimmer ou skeleton para conteúdo dependente de fetch.

### Cards
- Hover: aplicar `background-color: hsl(var(--feedback-hover-surface))`, `border-color: hsl(var(--feedback-hover-border))`, `box-shadow: var(--shadow-md)`.
- Active (se clicável): `scale(var(--feedback-press-scale))` + `background-color: hsl(var(--feedback-active-surface))`.
- Selecionado: `border-primary`, `box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2)`.

### Listas/Tabelas
- Linhas interativas: mesmo padrão de hover/active.
- Seleção múltipla: marcar linha com `bg-primary/10`, ícone check, badge "Selecionado".
- Loading: skeleton row (altura 48px) com animação `animate-pulse`.

### Modais/Dialog
- Ações primárias: `Button` com `isLoading` ao confirmar.
- Ao enviar: desabilitar inputs, mostrar spinner central.
- Sucesso: exibir estado inline (ex.: badge "Salvo"), fechar modal após timeout opcional.
- Erro: mostrar `Alert`/toast, destacar campo problemático.

### Toasts/Alertas
- Padronizar cores:
  - Sucesso: `bg-success` + `text-success-foreground`.
  - Erro: `bg-destructive` + `text-destructive-foreground`.
  - Info: `bg-primary` + `text-primary-foreground`.
- Incluir ícone correspondente (Check, AlertTriangle, Info).
- `autoClose`: 4s sucesso/info, 6s erro.

### Skeletons / Loading
- Criar componentes `SkeletonCard`, `SkeletonRow`, `SkeletonInput`.
- Usar `animate-pulse` com gradiente leve (`bg-muted` no claro, `bg-muted/60` no escuro).
- Não bloquear layout: alturas/larguras iguais aos componentes reais.

## Fluxos Prioritários

1. **Autenticação**
   - Formulários com spinner no botão e validação inline.
   - Mensagem de erro abaixo do botão e toast opcional.

2. **Gestão de Produtos/Pedidos**
   - Operações CRUD com loading na ação clicada (botão ou card).
   - Feedback inline (ex.: badge "Atualizado"), além de toast.

3. **Checkout/Carrinho**
   - Botão "Finalizar" com loading/spinner.
   - Estados de sucesso/erro destacados próximo ao total.

4. **Configurações**
   - Ao salvar preferências: spinner no botão e mensagem "Preferências salvas".

## Acessibilidade
- Contraste mínimo 4.5:1 para estados texto/fundo.
- `focus-visible` obrigatório para elementos focáveis.
- Usar `aria-live` para mensagens de sucesso/erro.
- Garantir que animações não excedam 200ms para evitar distrair.

## Próximos Passos
1. Atualizar componentes base implementando os tokens acima.
2. Revisar fluxos prioritários aplicando feedback consistente.
3. Padronizar toasts e microinterações conforme diretrizes.

## Componentes/Fluxos Atualizados
- `Button`, `Input`, `Card`, `AlertDialog` – suportam estados de loading/sucesso/erro.
- Autenticação, Produtos, Pedidos, Checkout – já utilizam os novos padrões.
- Toasts centralizados em `@/lib/toast` com durações e estilos consistentes.
- Microinterações reutilizáveis (`hover-lift`, animações de fade/slide).

## Referências
- Inventário inicial: `web/docs/feedback-inventory.md`
- Resultados de testes e acessibilidade: `web/docs/feedback-testing.md`
