import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads", "products");
const PORT = process.env.PORT || "3333";
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;

// Garantir que o diretório existe
async function ensureUploadsDir() {
	if (!existsSync(UPLOADS_DIR)) {
		await mkdir(UPLOADS_DIR, { recursive: true });
	}
}

export class LocalStorageService {
	async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
		await ensureUploadsDir();
		const filePath = join(UPLOADS_DIR, fileName);
		await writeFile(filePath, imageBuffer);
		// Retornar URL pública da imagem
		return `${API_BASE_URL}/uploads/products/${fileName}`;
	}

	async deleteImage(fileName: string): Promise<void> {
		const filePath = join(UPLOADS_DIR, fileName);
		if (existsSync(filePath)) {
			await unlink(filePath);
		}
	}
}

