import type { Response } from "express";

interface SSEClient {
	userId: string;
	response: Response;
}

class SSEService {
	private clients: Map<string, SSEClient[]> = new Map();

	/**
	 * Adiciona um novo cliente SSE
	 */
	addClient(userId: string, response: Response): void {
		// Configurar headers SSE
		response.setHeader("Content-Type", "text/event-stream");
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Connection", "keep-alive");
		response.setHeader("X-Accel-Buffering", "no"); // Desabilitar buffering do nginx
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Credentials", "true");

		// Enviar mensagem inicial de conexão
		try {
			response.write(`event: connected\ndata: ${JSON.stringify({ type: "connected", message: "Conectado ao servidor de notificações" })}\n\n`);
		} catch (error) {
			console.error("Error sending initial SSE message:", error);
		}

		// Adicionar cliente à lista
		if (!this.clients.has(userId)) {
			this.clients.set(userId, []);
		}
		this.clients.get(userId)!.push({ userId, response });

		// Remover cliente quando conexão for fechada
		response.on("close", () => {
			this.removeClient(userId, response);
		});

		// Tratar erros de escrita
		response.on("error", (error) => {
			console.error(`SSE: Response error for userId ${userId}:`, error);
			this.removeClient(userId, response);
		});
	}

	/**
	 * Remove um cliente SSE
	 */
	private removeClient(userId: string, response: Response): void {
		const userClients = this.clients.get(userId);
		if (userClients) {
			const index = userClients.findIndex((client) => client.response === response);
			if (index !== -1) {
				userClients.splice(index, 1);
				if (userClients.length === 0) {
					this.clients.delete(userId);
				}
			}
		}
	}

	/**
	 * Envia uma notificação para um usuário específico
	 */
	sendNotification(userId: string, data: {
		type: string;
		title: string;
		message: string;
		notificationId?: string;
		relatedId?: string;
		relatedType?: string;
	}): void {
		const userClients = this.clients.get(userId);
		if (userClients) {
			const message = `event: notification\ndata: ${JSON.stringify(data)}\n\n`;
			userClients.forEach((client) => {
				try {
					if (!client.response.writableEnded) {
						client.response.write(message);
					} else {
						// Cliente desconectado, remover
						this.removeClient(userId, client.response);
					}
				} catch (error) {
					console.error(`SSE: Error sending notification to userId ${userId}:`, error);
					// Cliente desconectado, remover
					this.removeClient(userId, client.response);
				}
			});
		} else {
			console.log(`SSE: No clients found for userId ${userId}`);
		}
	}

	/**
	 * Envia uma notificação para múltiplos usuários
	 */
	sendNotificationToUsers(userIds: string[], data: {
		type: string;
		title: string;
		message: string;
		notificationId?: string;
		relatedId?: string;
		relatedType?: string;
	}): void {
		userIds.forEach((userId) => {
			this.sendNotification(userId, data);
		});
	}

	/**
	 * Retorna o número de clientes conectados
	 */
	getClientCount(): number {
		let count = 0;
		this.clients.forEach((userClients) => {
			count += userClients.length;
		});
		return count;
	}

	/**
	 * Retorna o número de clientes conectados para um usuário específico
	 */
	getClientCountForUser(userId: string): number {
		return this.clients.get(userId)?.length ?? 0;
	}
}

export const sseService = new SSEService();

