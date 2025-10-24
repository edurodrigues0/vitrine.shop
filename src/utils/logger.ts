/**
 * Utilitário de logging
 * Exemplo de uso do alias ~/utils/logger
 */

import { env } from "~/config/env";

type LogLevel = "info" | "warn" | "error" | "debug";

export const logger = {
	info: (message: string, ...args: any[]) => {
		console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
	},

	warn: (message: string, ...args: any[]) => {
		console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
	},

	error: (message: string, ...args: any[]) => {
		console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
	},

	debug: (message: string, ...args: any[]) => {
		if (env.NODE_ENV === "development") {
			console.debug(
				`[DEBUG] ${new Date().toISOString()} - ${message}`,
				...args,
			);
		}
	},
};

export default logger;
