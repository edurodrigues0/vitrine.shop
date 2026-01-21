import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { join } from "path";
import { setupSwagger } from "~/config/swagger";
import { logger } from "~/utils/logger";
import { addressesRoutes } from "./http/controllers/addresses/_routes";
import { attributesRoutes } from "./http/controllers/attributes/_routes";
import { attributesValuesRoutes } from "./http/controllers/attributes-values/_routes";
import { authRoutes } from "./http/controllers/auth/_routes";
import { categoriesRoutes } from "./http/controllers/categories/_routes";
import { citiesRoutes } from "./http/controllers/cities/_routes";
import { ordersRoutes } from "./http/controllers/orders/_routes";
import { productImagesRoutes } from "./http/controllers/product-images/_routes";
import { productsRoutes } from "./http/controllers/products/_routes";
import { productVariationsRoutes } from "./http/controllers/product-variations.ts/_routes";
import { stockRoutes } from "./http/controllers/stock/_routes";
import { storesRoutes } from "./http/controllers/stores/_routes";
import { subscriptionsRoutes } from "./http/controllers/subscriptions/_routes";
import { usersRoutes } from "./http/controllers/users/_routes";
import { variantAttributesRoutes } from "./http/controllers/variant-attributes/_routes";
import { notificationsRoutes } from "./http/controllers/notifications/_routes";
import { errorHandlerMiddleware } from "./http/middleware/error-handler";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./services/auth";

dotenv.config();

const app = express();

// Helmet para proteção de headers HTTP
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", "data:", "https:"],
				connectSrc: ["'self'"],
				fontSrc: ["'self'", "data:"],
			},
		},
		crossOriginEmbedderPolicy: false, // Necessário para compatibilidade com alguns serviços
	}),
);

app.use(
	cors({
		credentials: true,
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}
			if (process.env.NODE_ENV === "development") {
				return callback(null, true);
			}
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
// IMPORTANTE: Webhook do Stripe precisa de raw body, então deve vir ANTES do express.json()
app.use(
	"/api/subscriptions/webhook",
	express.raw({ type: "application/json" }),
);

app.use(express.urlencoded({ extended: true }));
// express.json() deve vir DEPOIS do Better Auth para evitar conflitos
app.use(cookieParser());

// express.json() deve vir DEPOIS do Better Auth conforme documentação
app.use(express.json());

// Swagger Documentation
setupSwagger(app);

// Servir arquivos estáticos (imagens)
app.use("/uploads", express.static(join(process.cwd(), "uploads")));

app.all("/api/auth/*splat", toNodeHandler(auth));

// const authHandler = toNodeHandler(auth);
// app.use("/api/auth", (req, res) => {
// 	return authHandler(req, res);
// });

app.use("/api", citiesRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", productsRoutes);
app.use("/api", productImagesRoutes);
app.use("/api", productVariationsRoutes);
app.use("/api", stockRoutes);
app.use("/api", storesRoutes);
app.use("/api", usersRoutes);
app.use("/api", authRoutes);
app.use("/api", ordersRoutes);
app.use("/api", notificationsRoutes);
app.use("/api", addressesRoutes);
app.use("/api", subscriptionsRoutes);
app.use("/api", attributesRoutes);
app.use("/api", attributesValuesRoutes);
app.use("/api", variantAttributesRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
	});
});

// Error handler middleware deve ser o último middleware registrado
app.use(errorHandlerMiddleware);

export default app;

// Inicia o servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		logger.info(`🚀 Servidor rodando na porta ${PORT}`);
		logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
		logger.info(`🔗 http://localhost:${PORT}`);
	});
}
