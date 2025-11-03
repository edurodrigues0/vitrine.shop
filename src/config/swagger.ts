import type { Express } from "express";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

function getControllerFiles(dir: string, fileList: string[] = []): string[] {
	const files = readdirSync(dir);

	files.forEach((file) => {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			// Ignora diretórios com extensão .ts (como product-variations.ts)
			if (!file.endsWith(".ts")) {
				getControllerFiles(filePath, fileList);
			}
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
				url: "http://localhost:3000/api",
				description: "Servidor de Desenvolvimento",
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
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
