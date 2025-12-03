/**
 * Gera um slug a partir de um texto
 * Remove acentos, converte para minúsculas e substitui caracteres especiais por hífens
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remove acentos
		.replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por hífen
		.replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
}



