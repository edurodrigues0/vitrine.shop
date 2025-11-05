# Instruções para Executar o Seed do Banco de Dados

Este documento explica como executar o seed completo do banco de dados com todos os dados de exemplo.

## Pré-requisitos

1. **Banco de dados PostgreSQL configurado e rodando**
2. **Variável de ambiente `DATABASE_URL` configurada** no arquivo `.env` do diretório `api`
3. **Node.js e npm instalados**

## Passos para Executar

### 1. Aplicar as Migrations

Antes de executar o seed, é necessário aplicar as migrations do banco de dados para criar/atualizar as tabelas, incluindo os novos campos `price` e `quantity` na tabela `products`.

**Nota**: Se o `db:push` apresentar erros, você pode aplicar a migration manualmente executando:

```bash
cd api
npx tsx --env-file=.env -e "
import { sql } from 'drizzle-orm';
import { DrizzleORM } from './src/database/connection';
(async () => {
  await DrizzleORM.execute(sql\`ALTER TABLE products ADD COLUMN IF NOT EXISTS price integer\`);
  await DrizzleORM.execute(sql\`ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 0 NOT NULL\`);
  console.log('Migration aplicada!');
  process.exit(0);
})();
"
```

Ou simplesmente execute o seed que tentará aplicar automaticamente se necessário.

### 2. Executar o Seed

Após aplicar as migrations, execute o seed:

```bash
cd api
npm run db:seed
```

Ou diretamente:

```bash
cd api
npx tsx --env-file=.env src/database/run-seed.ts
```

## O que o Seed Cria

O seed cria os seguintes dados de exemplo:

- **10 Cidades**: São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Porto Alegre, Salvador, Brasília, Fortaleza, Recife, Manaus
- **10 Categorias**: Roupas, Eletrônicos, Casa, Beleza, Esportes, Livros, Brinquedos, Pet Shop, Alimentos, Automotivo
- **10 Usuários**: 1 Admin + 9 Owners
- **10 Lojas**: Diferentes tipos de lojas distribuídas pelas cidades
- **10 Produtos**: Com os campos `price` (preço em centavos) e `quantity` (quantidade em estoque) preenchidos
- **Variações de Produtos**: Variações de tamanho e cor para alguns produtos
- **Imagens de Produtos**: Imagens associadas às variações
- **Endereços**: Endereços das lojas
- **Assinaturas**: Planos de assinatura para algumas lojas

## Credenciais de Acesso

Após executar o seed, você pode usar as seguintes credenciais para fazer login:

- **Admin**: 
  - Email: `admin@vitrine.shop`
  - Senha: `12345678`

- **Owners** (dono de loja):
  - Email: `maria@exemplo.com` / Senha: `12345678`
  - Email: `joao@exemplo.com` / Senha: `12345678`
  - Email: `ana@exemplo.com` / Senha: `12345678`
  - Email: `carlos@exemplo.com` / Senha: `12345678`
  - Email: `julia@exemplo.com` / Senha: `12345678`
  - Email: `pedro@exemplo.com` / Senha: `12345678`
  - Email: `fernanda@exemplo.com` / Senha: `12345678`
  - Email: `roberto@exemplo.com` / Senha: `12345678`
  - Email: `camila@exemplo.com` / Senha: `12345678`

## Notas Importantes

⚠️ **Atenção**: O seed **apaga todos os dados existentes** antes de criar os novos dados. Use apenas em ambiente de desenvolvimento ou teste.

⚠️ **Price e Quantity**: Os produtos agora incluem os campos `price` (preço em centavos) e `quantity` (quantidade em estoque). Esses campos são opcionais na tabela, mas o seed os preenche com valores de exemplo.

## Troubleshooting

### Erro: "relation does not exist"
- Execute `npm run db:push` primeiro para criar as tabelas

### Erro: "column does not exist"
- Certifique-se de que aplicou a migration mais recente que adiciona os campos `price` e `quantity`

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Verifique se a `DATABASE_URL` no arquivo `.env` está correta

## Comandos Úteis

```bash
# Ver estrutura do banco
npm run db:studio

# Gerar nova migration após alterar schemas
npm run db:generate

# Aplicar migrations
npm run db:push

# Executar seed
npm run db:seed
```

