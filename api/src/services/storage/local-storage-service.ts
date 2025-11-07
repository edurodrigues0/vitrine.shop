import { promises as fs } from "fs";
import { join } from "path";

export class LocalStorageService {
	private readonly uploadsDir: string;
	private readonly baseUrl: string;

	constructor() {
		// Diretório de uploads relativo à raiz do projeto
		this.uploadsDir = join(process.cwd(), "uploads", "products");
		// URL base para acessar as imagens (ajuste conforme sua configuração)
		this.baseUrl = process.env.APP_URL || "http://localhost:3333";
	}

	/**
	 * Garante que o diretório de uploads existe
	 */
	private async ensureUploadsDir(): Promise<void> {
		try {
			await fs.access(this.uploadsDir);
		} catch {
			await fs.mkdir(this.uploadsDir, { recursive: true });
		}
	}

	/**
	 * Faz upload de uma imagem e retorna a URL
	 */
	async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
		await this.ensureUploadsDir();

		const filePath = join(this.uploadsDir, fileName);
		await fs.writeFile(filePath, imageBuffer);

		// Retorna a URL pública da imagem
		const url = `${this.baseUrl}/uploads/products/${fileName}`;
		return url;
	}

	/**
	 * Remove uma imagem do storage
	 */
	async deleteImage(fileName: string): Promise<void> {
		try {
			const filePath = join(this.uploadsDir, fileName);
			await fs.unlink(filePath);
		} catch (error) {
			// Se o arquivo não existir, não é um erro crítico
			console.error(`Erro ao deletar imagem ${fileName}:`, error);
		}
	}

	/**
	 * Verifica se uma imagem existe
	 */
	async imageExists(fileName: string): Promise<boolean> {
		try {
			const filePath = join(this.uploadsDir, fileName);
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}
}

