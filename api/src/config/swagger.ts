import type { Express } from "express";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env";

function getControllerFiles(dir: string, fileList: string[] = []): string[] {
	const files = readdirSync(dir);

	files.forEach((file) => {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			getControllerFiles(filePath, fileList);
		} else if (file.endsWith(".ts") && !file.startsWith("_routes")) {
			fileList.push(filePath);
		}
	});

	return fileList;
}

const controllersPath = join(process.cwd(), "src", "http", "controllers");
const apiFiles = getControllerFiles(controllersPath);

const swaggerOptions: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Vitrine.shop API",
			version: "1.0.0",
			description:
				"API completa para plataforma de vitrines online com gestão de produtos, lojas, categorias e usuários.",
			contact: {
				name: "API Support",
				email: "support@vitrine.shop",
			},
		},
		servers: [
			{
				url: `http://localhost:${env.PORT}/api`,
				description: "Servidor de Desenvolvimento Local",
			},
			{
				url: "https://api.vitrine.shop/api",
				description: "Servidor de Produção",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "Token JWT obtido através do endpoint /auth/login",
				},
				cookieAuth: {
					type: "apiKey",
					in: "cookie",
					name: "authToken",
					description: "Token de autenticação armazenado em cookie",
				},
			},
			schemas: {
				Error: {
					type: "object",
					properties: {
						message: {
							type: "string",
							description: "Mensagem de erro",
						},
						issues: {
							type: "array",
							items: {
								type: "object",
								properties: {
									path: {
										type: "array",
										items: { type: "string" },
									},
									message: { type: "string" },
								},
							},
							description: "Detalhes de validação (quando aplicável)",
						},
					},
				},
				ValidationError: {
					type: "object",
					properties: {
						message: {
							type: "string",
							example: "Validation error",
						},
						issues: {
							type: "array",
							items: {
								type: "object",
							},
						},
					},
				},
			},
		},
		security: [
			{
				bearerAuth: [],
				cookieAuth: [],
			},
		],
	},
	apis: apiFiles,
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
	// Endpoint para servir o JSON do Swagger com CORS completo
	app.get("/api-docs.json", (req, res) => {
		const origin = req.headers.origin;
		if (origin) {
			res.setHeader("Access-Control-Allow-Origin", origin);
		} else {
			res.setHeader("Access-Control-Allow-Origin", "*");
		}
		res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With",
		);
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.setHeader("Content-Type", "application/json; charset=utf-8");
		res.send(swaggerSpec);
	});

	// Handler OPTIONS para o endpoint JSON
	app.options("/api-docs.json", (req, res) => {
		const origin = req.headers.origin;
		if (origin) {
			res.setHeader("Access-Control-Allow-Origin", origin);
		} else {
			res.setHeader("Access-Control-Allow-Origin", "*");
		}
		res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With",
		);
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.sendStatus(200);
	});

	// Configuração do Swagger UI - passando o objeto diretamente
	// Isso evita que o Swagger UI tente buscar de uma URL externa
	app.use(
		"/api-docs",
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			customCss: ".swagger-ui .topbar { display: none }",
			customSiteTitle: "Vitrine.shop API Documentation",
			swaggerOptions: {
				persistAuthorization: true,
				displayRequestDuration: true,
				filter: true,
				tryItOutEnabled: true,
			},
		}),
	);
}
