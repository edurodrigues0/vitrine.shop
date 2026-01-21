import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DrizzleORM } from "~/database/connection";

// Construir lista de origens confiáveis
const buildTrustedOrigins = (): string[] => {
	const origins: string[] = [];
	
	// Adicionar origens de desenvolvimento
	if (process.env.NODE_ENV === "development") {
		origins.push("http://localhost:3333");
		origins.push("http://localhost:3000");
	}
	
	// Adicionar URL do frontend se configurada
	if (process.env.FRONTEND_URL) {
		origins.push(process.env.FRONTEND_URL);
	}
	
	// Adicionar URL do Better Auth se configurada
	if (process.env.BETTER_AUTH_URL) {
		origins.push(process.env.BETTER_AUTH_URL);
	}
	
	return origins;
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3333",
  basePath: "/api/auth",
  database: drizzleAdapter(DrizzleORM, {
    provider: "pg",
  }),
  user: {
    modelName: "users",
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7, // 7 dias em segundos
    updateAge: 60 * 60 * 24, // Atualiza a sessão a cada 1 dia
  },
  token: {
    modelName: "tokens",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: process.env.GOOGLE_CLIENT_REDIRECT_URI as string,
      prompt: "select_account",
    },
  },
  advanced: {
    disableOriginCheck: false,
  },
  trustedOrigins: buildTrustedOrigins(),
  appName: "Vitrine Lojas Online",
  plugins: [],
})
