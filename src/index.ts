import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { logger } from "~/utils/logger";
import { citiesRoutes } from "./http/controllers/cities/_routes";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/api", citiesRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
	});
});

// Inicia o servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
	logger.info(`🚀 Servidor rodando na porta ${PORT}`);
	logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
	logger.info(`🔗 http://localhost:${PORT}`);
});

export default app;
