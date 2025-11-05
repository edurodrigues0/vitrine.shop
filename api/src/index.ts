import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { setupSwagger } from "~/config/swagger";
import { logger } from "~/utils/logger";
import { authRoutes } from "./http/controllers/auth/_routes";
import { categoriesRoutes } from "./http/controllers/categories/_routes";
import { citiesRoutes } from "./http/controllers/cities/_routes";
import { ordersRoutes } from "./http/controllers/orders/_routes";
import { productImagesRoutes } from "./http/controllers/product-images/_routes";
import { productsRoutes } from "./http/controllers/products/_routes";
import { storesRoutes } from "./http/controllers/stores/_routes";
import { usersRoutes } from "./http/controllers/users/_routes";

dotenv.config();

const app = express();

// CORS - Deve vir antes de outros middlewares
app.use(
	cors({
		credentials: true,
		origin: (origin, callback) => {
			// Permite requisições sem origin (como mobile apps, Postman, Swagger UI do mesmo servidor)
			if (!origin) {
				return callback(null, true);
			}
			// Permite todas as origens em desenvolvimento
			if (process.env.NODE_ENV === "development") {
				return callback(null, true);
			}
			// Em produção, você pode validar origens específicas aqui
			return callback(null, true);
		},
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
			"Access-Control-Request-Method",
			"Access-Control-Request-Headers",
		],
		exposedHeaders: ["Content-Type", "Authorization"],
		optionsSuccessStatus: 200,
		preflightContinue: false,
	}),
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Documentation
setupSwagger(app);

// Rotas
app.use("/api", citiesRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", productsRoutes);
app.use("/api", productImagesRoutes);
app.use("/api", storesRoutes);
app.use("/api", usersRoutes);
app.use("/api", authRoutes);
app.use("/api", ordersRoutes);

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
