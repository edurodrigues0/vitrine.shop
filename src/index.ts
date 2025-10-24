import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import { env } from "~/config/env";
import { logger } from "~/utils/logger";
import { errorHandler } from "~/middleware/errorHandler";
import routes from "~/routes";

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/api", routes);

// Rota de health check
app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		environment: env.NODE_ENV,
	});
});

// Rota raiz
app.get("/", (_req: Request, res: Response) => {
	res.json({
		message: "API de Controle Financeiro Multi-empresa",
		version: "1.0.0",
		endpoints: {
			health: "/health",
			api: "/api",
		},
	});
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicia o servidor
const PORT = env.PORT;
app.listen(PORT, () => {
	logger.info(`🚀 Servidor rodando na porta ${PORT}`);
	logger.info(`📊 Ambiente: ${env.NODE_ENV}`);
	logger.info(`🔗 http://localhost:${PORT}`);
});

export default app;
