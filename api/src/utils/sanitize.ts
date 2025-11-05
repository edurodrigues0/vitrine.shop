/**
 * Utilitários para sanitização de strings e dados
 */

/**
 * Remove caracteres HTML e scripts de uma string
 */
export function sanitizeString(input: string): string {
	if (typeof input !== "string") {
		return "";
	}

	return input
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
		.replace(/<[^>]*>/g, "") // Remove tags HTML
		.replace(/javascript:/gi, "") // Remove javascript:
		.replace(/on\w+\s*=/gi, "") // Remove event handlers
		.trim();
}

/**
 * Sanitiza um objeto, aplicando sanitização em todas as strings
 */
export function sanitizeObject<T extends Record<string, unknown>>(
	obj: T,
): T {
	const sanitized = { ...obj };

	for (const key in sanitized) {
		const value = sanitized[key];
		if (typeof value === "string") {
			sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>];
		} else if (value && typeof value === "object" && !Array.isArray(value)) {
			sanitized[key] = sanitizeObject(
				value as Record<string, unknown>,
			) as T[Extract<keyof T, string>];
		} else if (Array.isArray(value)) {
			sanitized[key] = value.map((item) => {
				if (typeof item === "string") {
					return sanitizeString(item);
				}
				if (item && typeof item === "object") {
					return sanitizeObject(item as Record<string, unknown>);
				}
				return item;
			}) as T[Extract<keyof T, string>];
		}
	}

	return sanitized;
}

/**
 * Valida e sanitiza uma URL
 */
export function sanitizeUrl(url: string): string | null {
	if (typeof url !== "string") {
		return null;
	}

	const sanitized = sanitizeString(url);
	
	// Validar formato básico de URL
	try {
		const parsedUrl = new URL(sanitized);
		// Permitir apenas http e https
		if (!["http:", "https:"].includes(parsedUrl.protocol)) {
			return null;
		}
		return sanitized;
	} catch {
		return null;
	}
}

/**
 * Valida e sanitiza um email
 */
export function sanitizeEmail(email: string): string | null {
	if (typeof email !== "string") {
		return null;
	}

	const sanitized = sanitizeString(email);
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (emailRegex.test(sanitized)) {
		return sanitized.toLowerCase();
	}

	return null;
}

/**
 * Valida e sanitiza um número de telefone (apenas dígitos)
 */
export function sanitizePhone(phone: string): string | null {
	if (typeof phone !== "string") {
		return null;
	}

	// Remove tudo que não é dígito
	const sanitized = phone.replace(/\D/g, "");

	// Validar tamanho mínimo e máximo
	if (sanitized.length < 10 || sanitized.length > 15) {
		return null;
	}

	return sanitized;
}

