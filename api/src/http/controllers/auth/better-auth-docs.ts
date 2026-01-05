/**
 * @swagger
 * /auth/sign-up/email:
 *   post:
 *     summary: Cria uma nova conta de usuário (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para criar uma nova conta usando email e senha.
 *       O campo `name` é opcional e será preenchido automaticamente com a parte do email antes do @ se não fornecido.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Senha do usuário (mínimo 8 caracteres)
 *                 example: "senha123"
 *               name:
 *                 type: string
 *                 description: Nome do usuário (opcional, será preenchido automaticamente se não fornecido)
 *                 example: "João Silva"
 *     responses:
 *       200:
 *         description: Conta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID único do usuário (text)
 *                       example: "MRmketTXwV8sEdr5vVyquaRpdbf6omq9"
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       description: Nome do usuário
 *                       example: "João Silva"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email do usuário
 *                       example: "usuario@example.com"
 *                     emailVerified:
 *                       type: boolean
 *                       description: Indica se o email foi verificado
 *                       example: false
 *                     image:
 *                       type: string
 *                       nullable: true
 *                       description: URL da imagem de perfil
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Data de criação da conta
 *                 session:
 *                   type: object
 *                   description: Sessão criada automaticamente
 *       400:
 *         description: Erro de validação ou email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already registered"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/sign-in/email:
 *   post:
 *     summary: Autentica um usuário com email e senha (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para fazer login usando email e senha.
 *       Retorna uma sessão válida que pode ser usada para autenticação em requisições subsequentes.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de sessão criado automaticamente pelo Better Auth
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID único do usuário
 *                       example: "MRmketTXwV8sEdr5vVyquaRpdbf6omq9"
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       description: Nome do usuário
 *                       example: "João Silva"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email do usuário
 *                       example: "usuario@example.com"
 *                     emailVerified:
 *                       type: boolean
 *                       description: Indica se o email foi verificado
 *                       example: false
 *                     image:
 *                       type: string
 *                       nullable: true
 *                       description: URL da imagem de perfil
 *                 session:
 *                   type: object
 *                   description: Sessão criada
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID da sessão
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Data de expiração da sessão
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/session:
 *   get:
 *     summary: Obtém a sessão atual do usuário (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para obter informações da sessão atual do usuário autenticado.
 *       Retorna os dados do usuário e da sessão se o usuário estiver autenticado.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sessão encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID único do usuário
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       description: Nome do usuário
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email do usuário
 *                     emailVerified:
 *                       type: boolean
 *                       description: Indica se o email foi verificado
 *                     image:
 *                       type: string
 *                       nullable: true
 *                       description: URL da imagem de perfil
 *                 session:
 *                   type: object
 *                   description: Informações da sessão
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID da sessão
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Data de expiração da sessão
 *       401:
 *         description: Usuário não autenticado ou sessão inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/sign-in/google:
 *   get:
 *     summary: Inicia o fluxo de autenticação com Google OAuth (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para iniciar o fluxo de autenticação OAuth com Google.
 *       Este endpoint redireciona o usuário para a página de login do Google.
 *       Após a autenticação bem-sucedida, o Google redireciona para `/api/auth/callback/google`.
 *       
 *       **Configuração necessária:**
 *       - Configure as credenciais do Google no arquivo `.env`:
 *         - `GOOGLE_CLIENT_ID`: ID do cliente OAuth do Google
 *         - `GOOGLE_CLIENT_SECRET`: Secret do cliente OAuth do Google
 *         - `GOOGLE_CLIENT_KEY`: Chave do cliente OAuth do Google
 *       - Configure o URI de redirecionamento no Google Cloud Console:
 *         - `http://localhost:3333/api/auth/callback/google` (desenvolvimento)
 *         - `https://seu-dominio.com/api/auth/callback/google` (produção)
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: callbackURL
 *         schema:
 *           type: string
 *         description: URL de redirecionamento após autenticação bem-sucedida (opcional)
 *         example: "http://localhost:3000/dashboard"
 *     responses:
 *       302:
 *         description: Redirecionamento para a página de login do Google
 *         headers:
 *           Location:
 *             description: URL de autenticação do Google
 *             schema:
 *               type: string
 *               example: "https://accounts.google.com/o/oauth2/v2/auth?..."
 *       400:
 *         description: Erro na configuração do OAuth ou credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Google OAuth not configured"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /auth/callback/google:
 *   get:
 *     summary: Callback do Google OAuth após autenticação (Better Auth)
 *     description: |
 *       Endpoint de callback do Better Auth que recebe a resposta do Google após o usuário autenticar.
 *       Este endpoint é chamado automaticamente pelo Google após a autenticação bem-sucedida.
 *       Cria uma sessão para o usuário e redireciona para a URL especificada ou para a página padrão.
 *       
 *       **Fluxo:**
 *       1. Usuário acessa `/api/auth/sign-in/google`
 *       2. É redirecionado para o Google para autenticar
 *       3. Google redireciona para `/api/auth/callback/google?code=...`
 *       4. Better Auth processa o código e cria a sessão
 *       5. Usuário é redirecionado para a URL de callback ou página padrão
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Código de autorização retornado pelo Google
 *         required: true
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Estado CSRF retornado pelo Google
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Código de erro se a autenticação falhou
 *         example: "access_denied"
 *     responses:
 *       302:
 *         description: Redirecionamento após autenticação bem-sucedida
 *         headers:
 *           Location:
 *             description: URL de redirecionamento (callbackURL ou padrão)
 *             schema:
 *               type: string
 *               example: "http://localhost:3000/dashboard"
 *           Set-Cookie:
 *             description: Cookie de sessão criado automaticamente pelo Better Auth
 *             schema:
 *               type: string
 *       400:
 *         description: Erro na autenticação (código inválido, estado CSRF inválido, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid authorization code"
 *       401:
 *         description: Autenticação negada pelo usuário ou erro no Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "access_denied"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /auth/link/google:
 *   post:
 *     summary: Vincula uma conta Google a um usuário autenticado (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para vincular uma conta Google a um usuário já autenticado.
 *       Útil para permitir que usuários vinculem múltiplos provedores de autenticação à mesma conta.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conta Google vinculada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Google account linked successfully"
 *                 account:
 *                   type: object
 *                   description: Informações da conta vinculada
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /auth/unlink/google:
 *   post:
 *     summary: Desvincula uma conta Google de um usuário autenticado (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para desvincular uma conta Google de um usuário autenticado.
 *       O usuário deve ter pelo menos um método de autenticação alternativo configurado.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conta Google desvinculada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Google account unlinked successfully"
 *       400:
 *         description: Não é possível desvincular (último método de autenticação)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cannot unlink last authentication method"
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Este arquivo contém apenas documentação Swagger para as rotas automáticas do Better Auth
// As rotas são gerenciadas automaticamente pelo Better Auth em /api/auth/*

