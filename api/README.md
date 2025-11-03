# Sistema de Controle Financeiro Multi-empresa

Sistema de controle financeiro empresarial com autenticação, gestão de usuários e dashboards dinâmicos.

## 🚀 Tecnologias

- **Node.js + Express** - Backend API
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **Drizzle ORM** - ORM moderno para TypeScript
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📁 Estrutura de Pastas

```
mais-prompts/
├── src/
│   ├── index.ts           # Arquivo principal do servidor
│   ├── config/
│   │   └── env.ts         # Configurações de ambiente
│   └── routes/
│       └── index.ts       # Rotas da API
├── dist/                  # Build compilado (gerado)
├── .env                   # Variáveis de ambiente (não commitado)
├── .env.example           # Exemplo de variáveis
├── tsconfig.json          # Configuração TypeScript
└── package.json           # Dependências e scripts
```

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis:

```bash
cp .env.example .env
```

### 3. Configurar banco de dados

Ajuste a variável `DATABASE_URL` no arquivo `.env` com suas credenciais do PostgreSQL.

## 🎯 Scripts Disponíveis

### Desenvolvimento (com hot reload)
```bash
npm run dev
```
Inicia o servidor em modo desenvolvimento com recarga automática usando `tsx`.

### Build (compilação)
```bash
npm run build
```
Compila o TypeScript para JavaScript na pasta `dist/`.

### Produção
```bash
npm start
```
Executa o código compilado da pasta `dist/`.

## 🔗 Importações com Alias

O projeto está configurado com alias `~/*` para facilitar as importações:

```typescript
// ✅ Ao invés de usar caminhos relativos:
import { env } from '../../../config/env';

// ✅ Use o alias ~/*:
import { env } from '~/config/env';
```

## 📡 Endpoints da API

### Health Check
```
GET /health
```

### Rotas principais
```
GET /api/transactions  # Lista de transações
GET /api/companies     # Lista de empresas
GET /api/users         # Lista de usuários
```

## 🏗️ Próximos Passos

1. Configurar Prisma ORM
2. Criar schemas de banco de dados
3. Implementar autenticação com JWT
4. Criar middleware de autorização
5. Implementar CRUD de empresas
6. Implementar CRUD de usuários
7. Implementar sistema de transações financeiras
8. Criar dashboards e relatórios

## 📝 Licença

Privado - Uso interno
