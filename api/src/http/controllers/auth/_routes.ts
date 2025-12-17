import { Router } from "express";
import { authRateLimit } from "~/http/middleware/rate-limit";
import { meController } from "./me";
import { refreshTokenController } from "./refresh-token";
import { signOutController } from "./sign-out";
import { googleSignInController } from "./google";

const authRoutes = Router();

// Login e logout são gerenciados automaticamente pelo Better Auth em /api/auth/sign-in/email e /api/auth/sign-out
authRoutes.post("/auth/refresh", authRateLimit, refreshTokenController);
authRoutes.get("/me", meController);
authRoutes.post("/auth/sign-out", signOutController);
authRoutes.get("/auth/sign-in/google", googleSignInController)

export { authRoutes };
