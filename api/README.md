# 🏪 Vitrine.shop API

API REST completa para plataforma de vitrines online com gestão de produtos, lojas, categorias, usuários e autenticação.

## 🚀 Tecnologias

- **Node.js + Express** - Backend API
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM moderno para TypeScript
- **JWT** - Autenticação com tokens
- **Swagger/OpenAPI** - Documentação interativa da API
- **Vitest** - Framework de testes
- **Docker** - Containerização do banco de dados
- **Biome** - Linter e formatter

## 📋 Pré-requisitos

- **Node.js** 18+ ou **Bun** 1.0+
- **Docker** e **Docker Compose** (para rodar o banco de dados)
- **Git**

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd vitrine.shop/api
```

### 2. Instale as dependências

**Com npm:**
```bash
npm install
```

**Com Bun:**
```bash
bun install
```

### 3. Configure o banco de dados com Docker

O projeto inclui um arquivo `docker-compose.yml` para facilitar a configuração do PostgreSQL:

```bash
docker-compose up -d
```

Isso irá iniciar um container PostgreSQL com as seguintes configurações:
- **Host:** `localhost`
- **Porta:** `5432`
- **Usuário:** `docker`
- **Senha:** `docker`
- **Banco de dados:** `vitrine.shop`

Para parar o banco de dados:
```bash
docker-compose down
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto `api/` com as seguintes variáveis:

```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3333

# Banco de dados (usando Docker Compose)
DATABASE_URL=postgresql://docker:docker@localhost:5432/vitrine.shop

# JWT
JWT_SECRET=sua-chave-secreta-jwt-aqui
JWT_EXPIRES_IN=1h

# Cookies
COOKIE_SECRET=sua-chave-secreta-cookie-aqui

# Better Auth
BETTER_AUTH_URL=http://localhost:3333
API_URL=http://localhost:3333

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

**⚠️ Importante:** 
- Substitua `sua-chave-secreta-jwt-aqui` e `sua-chave-secreta-cookie-aqui` por valores seguros e aleatórios
- Em produção, use variáveis de ambiente seguras e nunca commite o arquivo `.env`

## 🔐 Configuração do Google OAuth

Para habilitar a autenticação com Google, siga os seguintes passos:

### 1. Criar credenciais no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Navegue até **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: Vitrine.shop (ou o nome que preferir)
   - **Authorized JavaScript origins**:
     - `http://localhost:3333` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:3333/api/auth/callback/google` (desenvolvimento)
     - `https://seu-dominio.com/api/auth/callback/google` (produção)
6. Copie o **Client ID** e **Client Secret**

### 2. Configurar variáveis de ambiente

Adicione as credenciais ao arquivo `.env`:

```env
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
```

### 3. Rotas disponíveis

Após a configuração, as seguintes rotas estarão disponíveis:

- **GET** `/api/auth/sign-in/google` - Inicia o fluxo de autenticação Google
- **GET** `/api/auth/callback/google` - Callback do Google após autenticação
- **POST** `/api/auth/link/google` - Vincula conta Google a usuário autenticado
- **POST** `/api/auth/unlink/google` - Desvincula conta Google de usuário autenticado

### 4. Uso no frontend

Para iniciar a autenticação com Google, redirecione o usuário para:

```typescript
window.location.href = 'http://localhost:3333/api/auth/sign-in/google?callbackURL=http://localhost:3000/dashboard';
```

O parâmetro `callbackURL` (opcional) define para onde o usuário será redirecionado após a autenticação bem-sucedida.

### 5. Execute as migrações do banco de dados

```bash
# Gerar as migrações a partir do schema
npm run db:generate

# Aplicar as migrações no banco
npm run db:migrate
```

Ou, se preferir fazer push direto (útil apenas em desenvolvimento):
```bash
npm run db:push
```

### 6. Inicie o servidor

**Modo desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3333`

## 📡 Endpoints Principais

### Health Check
```
GET /api/health
```

### Autenticação
```
POST /api/auth/login
POST /api/auth/logout
```

### Cidades
```
GET    /api/cities
POST   /api/cities
PUT    /api/cities/:id
```

### Categorias
```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Produtos
```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### Lojas (Stores)
```
GET    /api/stores
POST   /api/stores
GET    /api/stores/:id
PUT    /api/stores/:id
DELETE /api/stores/:id
```

### Usuários
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

## 📚 Documentação Swagger

A documentação interativa da API está disponível através do Swagger UI:

```
http://localhost:3333/api-docs
```

Você também pode acessar o JSON do Swagger:
```
http://localhost:3333/api-docs.json
```

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com interface visual
```bash
npm run test:ui
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

## 🗄️ Comandos do Banco de Dados

### Gerar migrações
Gera arquivos de migração baseados nas mudanças no schema:
```bash
npm run db:generate
```

### Aplicar migrações
Aplica as migrações pendentes no banco de dados:
```bash
npm run db:migrate
```

### Push direto (desenvolvimento)
Sincroniza o schema diretamente com o banco (sem criar arquivos de migração):
```bash
npm run db:push
```

### Drizzle Studio
Abre uma interface visual para gerenciar o banco de dados:
```bash
npm run db:studio
```

## 📁 Estrutura do Projeto

```
api/
├── src/
│   ├── config/              # Configurações (env, swagger, constants)
│   ├── database/            # Schema e conexão do banco
│   │   ├── schema/         # Schemas Drizzle ORM
│   │   └── connection.ts   # Conexão com PostgreSQL
│   ├── http/               # Camada HTTP
│   │   ├── controllers/    # Controladores das rotas
│   │   └── middleware/     # Middlewares (auth, upload)
│   ├── repositories/        # Camada de acesso a dados
│   │   ├── drizzle/        # Implementações Drizzle
│   │   └── in-memory/      # Implementações para testes
│   ├── use-cases/          # Lógica de negócio
│   │   ├── @errors/        # Erros customizados
│   │   └── @factories/     # Factories para criação de use cases
│   ├── services/           # Serviços externos (Firebase, Storage)
│   ├── utils/              # Utilitários (JWT, cookies, logger)
│   └── index.ts            # Arquivo principal do servidor
├── drizzle/                # Migrações geradas (não commitar)
├── dist/                   # Build compilado (gerado)
├── docker-compose.yml      # Configuração Docker para PostgreSQL
├── drizzle.config.ts       # Configuração do Drizzle Kit
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
└── vitest.config.ts        # Configuração Vitest
```

## 🔑 Autenticação

A API utiliza autenticação JWT com suporte a:
- **Bearer Token** (via header `Authorization: Bearer <token>`)
- **Cookie** (via cookie `authToken`)

### Exemplo de login:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

A resposta incluirá o token JWT que deve ser usado nas requisições autenticadas.

## 🚀 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor em modo desenvolvimento com hot reload |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia servidor em modo produção |
| `npm test` | Executa todos os testes |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:ui` | Abre interface visual de testes |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run db:generate` | Gera migrações do banco |
| `npm run db:migrate` | Aplica migrações no banco |
| `npm run db:push` | Sincroniza schema diretamente |
| `npm run db:studio` | Abre Drizzle Studio |

## 📝 Importações com Alias

O projeto está configurado com alias `~/*` para facilitar as importações:

```typescript
// ✅ Ao invés de caminhos relativos:
import { env } from '../../../config/env';

// ✅ Use o alias ~/*:
import { env } from '~/config/env';
```

## 🔧 Configuração do Ambiente

### Desenvolvimento
- `NODE_ENV=development`
- Hot reload habilitado
- CORS permissivo
- Logs detalhados

### Produção
- `NODE_ENV=production`
- Build otimizado
- CORS configurado
- Logs essenciais

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se o Docker está rodando: `docker ps`
- Verifique se o container PostgreSQL está ativo: `docker-compose ps`
- Confirme se a `DATABASE_URL` no `.env` está correta

### Erro: "Port already in use"
- Altere a porta no arquivo `.env`: `PORT=3334`
- Ou pare o processo que está usando a porta 3333

### Erro: "JWT_SECRET is required"
- Certifique-se de que todas as variáveis de ambiente estão configuradas no arquivo `.env`

## 📖 Exemplos de Requisições

Você pode usar o arquivo `server.http` para testar a API diretamente no VS Code com a extensão REST Client.

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Abra um Pull Request

## 📄 Licença

Privado - Uso interno
