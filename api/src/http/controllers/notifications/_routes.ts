import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { authenticatedRateLimit } from "~/http/middleware/rate-limit";
import { deleteNotificationController } from "./delete";
import { findAllNotificationsController } from "./find-all";
import { markAllNotificationsAsReadController } from "./mark-all-as-read";
import { markNotificationAsReadController } from "./mark-as-read";
import { streamNotificationsController } from "./stream";

export const notificationsRoutes = Router();

// SSE endpoint para notificações em tempo real
// Não usamos authenticateMiddleware aqui porque EventSource não suporta headers customizados
// A autenticação é feita dentro do controller usando query param ou cookie
notificationsRoutes.get(
	"/notifications/stream",
	streamNotificationsController,
);

// Listar notificações
notificationsRoutes.get(
	"/notifications",
	authenticatedRateLimit,
	authenticateMiddleware,
	findAllNotificationsController,
);

// Marcar notificação como lida
notificationsRoutes.put(
	"/notifications/:id/read",
	authenticatedRateLimit,
	authenticateMiddleware,
	markNotificationAsReadController,
);

// Marcar todas como lidas
notificationsRoutes.put(
	"/notifications/read-all",
	authenticatedRateLimit,
	authenticateMiddleware,
	markAllNotificationsAsReadController,
);

// Deletar notificação
notificationsRoutes.delete(
	"/notifications/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	deleteNotificationController,
);

