# Vitrine.Shop - Guia de Inicialização

## 🚀 Visão Geral

Este é um projeto full-stack com:
- **Frontend**: Next.js 13+ (em `/web`)
- **Backend**: Node.js com Express (em `/api`)

## 📋 Pré-requisitos

- [Bun](https://bun.sh/) (recomendado) ou Node.js 18+
- [Docker](https://www.docker.com/) (opcional, para banco de dados)
- Conta no [Firebase](https://firebase.google.com/) (para autenticação)

## 🛠️ Configuração Inicial

### 1. Clonar o repositório

```bash
git clone https://github.com/edurodrigues0/vitrine.shop.git
cd vitrine.shop
```

### 2. Configurar o Backend (API)

```bash
# Instalar dependências
cd api
bun install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar o arquivo .env com suas credenciais
```

### 3. Configurar o Frontend

```bash
cd ../web
bun install
cp .env.example .env.local
# Configurar as variáveis de ambiente do frontend
```

## 🚀 Executando o Projeto

### Opção 1: Usando Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d

# Em outro terminal, rodar as migrações
cd api
bun run db:migrate
```

### Opção 2: Sem Docker

1. Iniciar o Backend:
   ```bash
   cd api
   bun run dev
   # API estará disponível em http://localhost:3333
   ```

2. Iniciar o Frontend:
   ```bash
   cd web
   bun run dev
   # Acesse http://localhost:3000
   ```

## 🔧 Comandos Úteis

### Backend
```bash
# Rodar migrações
bun run db:migrate

# Popular banco de dados com dados iniciais
bun run db:seed

# Rodar testes
bun test
```

### Frontend
```bash
# Rodar em modo desenvolvimento
bun run dev

# Build para produção
bun run build

# Iniciar servidor de produção
bun start
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3333
- **Documentação da API**: http://localhost:3333/api-docs
- **Banco de Dados (se usando Docker)**:
  - Host: localhost:5432
  - Database: vitrine.shop
  - Usuário: docker
  - Senha: docker

## 🔒 Variáveis de Ambiente

### Backend (api/.env)
```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/vitrine.shop
JWT_SECRET=sua_chave_secreta_aqui
# Outras variáveis necessárias...
```

### Frontend (web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
# Outras variáveis necessárias...
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
