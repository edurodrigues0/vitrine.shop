# Feedback Visual – Testes e Acessibilidade

## Cenários Exercitados

1. **Autenticação (Login)**
   - Botão "Entrar" exibe spinner (`isLoading`) e desabilita enquanto aguarda resposta.
   - Mensagem de erro inline com `aria-live="polite"`.
   - Links de apoio (`Esqueceu sua senha?`, `Cadastre-se`) usam classe `link-text` e têm foco visível.

2. **Dashboard > Produtos**
   - Exclusão simples usa `AlertDialog` com spinner no botão confirmar e mensagem de status.
   - Seleção de múltiplos produtos mantém destaque (`data-selected`, `hover-lift`).
   - Ajuste de estoque com botões `+/-` mostra loading apenas no item acionado.

3. **Dashboard > Pedidos**
   - Ações de mudança de status exibem spinner e mensagem "Atualizando status...".
   - Botões não ligados ao status atual permanecem desabilitados durante operação.
   - Toasts padronizados para sucesso/erro.

4. **Checkout Modal**
   - Formulário desabilita campos durante envio e exibe erro inline.
   - Confirmação apresenta step "Finalizar Pedido" com instruções.

5. **Quick Actions / Cards**
   - Cartões recebem `hover-lift` (elevação + transição) e foco visível.

## Acessibilidade

- `focus-visible` presente em botões, links e cards interativos.
- Mensagens dinâmicas utilizam `aria-live` (`polite`/`assertive`).
- Toasters padronizados com durações definidas (sucesso 4s, erro 6s).
- Contraste revisado via tokens (`--feedback-hover-surface`, `--feedback-hover-border`).

## Pendências Observadas

- **Inputs** ainda não exibem estado visual de sucesso (apenas erro) – pode ser adicionado quando validações positivas forem necessárias.
- **Links externos (WhatsApp, e-mail)**: apesar de terem `link-text`, não possuem ícones descritivos (`aria-label` opcional).
- **Feedback auditivo**: considerar uso futuro de `toast.promise` para eventos longos.

## Recomendação de Próximos Passos

1. Automatizar testes de foco/tabulação (Playwright / Cypress acessibility).
2. Adicionar variações de `Input` com ícone de sucesso/erro.
3. Monitorar feedback de usuários sobre clareza das mensagens.
