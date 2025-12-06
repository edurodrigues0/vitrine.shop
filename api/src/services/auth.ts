import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DrizzleORM } from "~/database/connection";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.API_URL || "http://localhost:3333",
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
    },
  },
  advanced: {
    disableOriginCheck: true,
  },
  // trustedOrigins: [
  //   "http://localhost:3333",
  //   "http://localhost:3000",
  //   process.env.FRONTEND_URL || "http://localhost:3000",
  // ],
  plugins: [],
})
