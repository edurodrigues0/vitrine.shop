import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { loginController } from "./login";
import { logoutController } from "./logout";
import { meController } from "./me";

const authRoutes = Router();

authRoutes.post("/auth/login", loginController);
authRoutes.post("/auth/logout", logoutController);
authRoutes.get("/auth/me", authenticateMiddleware, meController);

export { authRoutes };
