import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { logger } from "~/utils/logger";
import { authRoutes } from "./http/controllers/auth/_routes";
import { citiesRoutes } from "./http/controllers/cities/_routes";
import { productsRoutes } from "./http/controllers/products/_routes";
import { storesRoutes } from "./http/controllers/stores/_routes";
import { usersRoutes } from "./http/controllers/users/_routes";

dotenv.config();

const app = express();

app.use(
	cors({
		credentials: true,
		origin: "*",
	}),
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rotas
app.use("/api", citiesRoutes);
app.use("/api", productsRoutes);
app.use("/api", storesRoutes);
app.use("/api", usersRoutes);
app.use("/api", authRoutes);

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
