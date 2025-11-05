import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { authRateLimit, publicRateLimit } from "~/http/middleware/rate-limit";
import { loginController } from "./login";
import { logoutController } from "./logout";
import { meController } from "./me";
import { refreshTokenController } from "./refresh-token";

const authRoutes = Router();

authRoutes.post("/auth/login", authRateLimit, loginController);
authRoutes.post("/auth/refresh", authRateLimit, refreshTokenController);
authRoutes.post("/auth/logout", authenticateMiddleware, logoutController);
authRoutes.get("/auth/me", authenticateMiddleware, meController);

export { authRoutes };
