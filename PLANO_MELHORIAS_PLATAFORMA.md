# Plano de Implementação - Melhorias na Plataforma Vitrine.Shop

## 1. Sistema Completo de Paleta de Cores

### 1.1. Atualização do Schema e Formulário
**Arquivo:** `web/src/app/(protected)/loja/cadastro/page.tsx`

**Campos a adicionar:**
- `primaryColor` (--color-primary)
- `primaryGradient` (--color-primary-gradient) - opcional
- `secondaryColor` (--color-secondary)
- `bgColor` (--color-bg)
- `surfaceColor` (--color-surface)
- `textColor` (--color-text)
- `textSecondaryColor` (--color-text-secondary)
- `highlightColor` (--color-highlight)
- `borderColor` (--color-border)
- `hoverColor` (--color-hover)
- `overlayColor` (--color-overlay) - opcional

### 1.2. Aplicação Dinâmica das Cores
**Arquivos a modificar:**
- `web/src/app/cidade/[city]/loja/[slug]/layout.tsx` - Já implementado ✓
- `web/src/app/cidade/[city]/produto/[id]/layout.tsx` - Já implementado ✓

### 1.3. Preview das Configurações
**Arquivo:** `web/src/app/(protected)/loja/preview/page.tsx` - Já existe ✓

**Melhorias necessárias:**
- Garantir que todas as cores sejam aplicadas corretamente
- Adicionar produtos de exemplo para visualização
- Melhorar layout do preview

## 2. Revisão dos Dropdowns

**Arquivos a modificar:**
- `web/src/components/ui/select.tsx` (se existir)
- Todos os `<select>` nativos devem ser substituídos por componentes estilizados

**Estilos a aplicar:**
- Bordas arredondadas (rounded-lg)
- Sombras suaves
- Hover states
- Focus states
- Transições suaves

## 3. Melhorias Visuais na Gestão

**Arquivos a modificar:**
- `web/src/app/(protected)/loja/page.tsx` - Página de listagem
- `web/src/app/(protected)/loja/cadastro/page.tsx` - Página de edição

**Melhorias:**
- Layout em grid moderno
- Cards com sombras e hover effects
- Tipografia melhorada
- Espaçamento consistente
- Ícones e badges visuais
- Animações suaves

## Status Atual

✅ Backend types atualizados (StoreTheme com todas as propriedades)
✅ Layouts públicos aplicando CSS variables
✅ Preview page existente
⚠️ Formulário de cadastro com apenas 3 cores (precisa expansão)
❌ Dropdowns não estilizados
❌ Páginas de gestão precisam de melhorias visuais

## Próximos Passos

1. Expandir formulário de cadastro com todos os campos de cor
2. Atualizar mutations para enviar estrutura correta
3. Melhorar preview page
4. Estilizar dropdowns
5. Melhorar páginas de gestão
