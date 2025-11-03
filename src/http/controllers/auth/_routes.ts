import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { loginController } from "./login";
import { logoutController } from "./logout";
import { meController } from "./me";
import { refreshTokenController } from "./refresh-token";

const authRoutes = Router();

authRoutes.post("/auth/login", loginController);
authRoutes.post("/auth/refresh", refreshTokenController);
authRoutes.post("/auth/logout", logoutController);
authRoutes.get("/auth/me", authenticateMiddleware, meController);

export { authRoutes };
