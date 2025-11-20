import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
} from "@aws-sdk/client-s3";

export class R2StorageService {
	private readonly s3Client: S3Client;
	private readonly bucketName: string;
	private readonly publicUrl: string;

	constructor() {
		const accountId = process.env.R2_ACCOUNT_ID;
		const accessKeyId = process.env.R2_ACCESS_KEY_ID;
		const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
		const bucketName = process.env.R2_BUCKET_NAME;
		const publicUrl = process.env.R2_PUBLIC_URL;

		if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
			throw new Error(
				"R2 storage não está configurado. Configure as variáveis de ambiente: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME",
			);
		}

		this.bucketName = bucketName;
		
		// Usar R2_PUBLIC_URL se configurada, caso contrário usar formato padrão
		this.publicUrl = publicUrl || `https://pub-${accountId}.r2.dev`;

		this.s3Client = new S3Client({
			region: "auto",
			endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		});
	}

	/**
	 * Faz upload de uma imagem para um path específico
	 * @param imageBuffer Buffer da imagem
	 * @param fileName Nome do arquivo
	 * @param path Path do diretório (ex: "products", "stores", "branches")
	 * @returns URL pública da imagem
	 */
	async uploadImageToPath(
		imageBuffer: Buffer,
		fileName: string,
		path: string = "products",
	): Promise<string> {
		try {
			// Usar o path fornecido, garantindo que não tenha barras extras
			const normalizedPath = path.replace(/^\/+|\/+$/g, ''); // Remove barras no início e fim
			const key = `${normalizedPath}/${fileName}`;
			const contentType = this.getContentType(fileName);

			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: imageBuffer,
				ContentType: contentType,
				// Tornar o arquivo público (se o bucket permitir)
				// Nota: Isso requer que o bucket tenha políticas públicas configuradas
			});

			await this.s3Client.send(command);

			const imageUrl = `${this.publicUrl}/${key}`;

			return imageUrl;
		} catch (error) {
			console.error("Error uploading image to R2:", error);
			throw new Error("Failed to upload image to R2");
		}
	}

	/**
	 * Faz upload de uma imagem para products/ (mantido para compatibilidade)
	 * @deprecated Use uploadImageToPath com path explícito
	 */
	async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
		return this.uploadImageToPath(imageBuffer, fileName, "products");
	}

	/**
	 * Remove uma imagem do storage
	 * @param fileName Nome do arquivo ou URL completa
	 * @param path Path do diretório (ex: "products", "stores", "branches"). Se não fornecido, tenta extrair da URL
	 */
	async deleteImage(fileName: string, path?: string): Promise<void> {
		try {
			// Padronizar path para products/ (plural)
			// Se fileName já contém o path completo, extrair apenas o nome
			const cleanFileName = fileName.includes("/")
				? fileName.split("/").pop() || fileName
				: fileName;
			const key = `products/${cleanFileName}`;

			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			await this.s3Client.send(command);
		} catch (error) {
			console.error("Error deleting image from R2:", error);
			throw new Error("Failed to delete image from R2");
		}
	}

	/**
	 * Verifica se uma imagem existe no storage
	 * @param fileName Nome do arquivo ou URL completa
	 * @param path Path do diretório (ex: "products", "stores", "branches"). Se não fornecido, tenta extrair da URL
	 */
	async imageExists(fileName: string, path?: string): Promise<boolean> {
		try {
			const key = `products/${fileName}`;

			const command = new HeadObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			await this.s3Client.send(command);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Determina o content type baseado na extensão do arquivo
	 */
	private getContentType(fileName: string): string {
		const extension = fileName.split(".").pop()?.toLowerCase();

		const contentTypes: Record<string, string> = {
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			webp: "image/webp",
			gif: "image/gif",
		};

		return contentTypes[extension || ""] || "image/jpeg";
	}

	/**
	 * Extrai o nome do arquivo de uma URL do R2
	 */
	extractFileNameFromUrl(url: string): string {
		try {

			const urlObj = new URL(url);
			const pathParts = urlObj.pathname.split("/").filter(Boolean);

			// Procurar por "products" no path e pegar o que vem depois
			const productsIndex = pathParts.indexOf("products");
			if (productsIndex !== -1 && productsIndex < pathParts.length - 1) {
				const fileName = pathParts[productsIndex + 1];
				if (fileName) {
					return fileName;
				}
			}

			// Se não encontrar "products", pegar o último elemento do path
			const lastPart = pathParts[pathParts.length - 1];
			return lastPart || "";
		} catch {
			// Se falhar ao fazer parse da URL, tentar extrair manualmente
			const parts = url.split("/");
			return parts[parts.length - 1] || "";
		}
	}

	/**
	 * Verifica se o R2 está configurado
	 */
	static isConfigured(): boolean {
		return !!(
			process.env.R2_ACCOUNT_ID &&
			process.env.R2_ACCESS_KEY_ID &&
			process.env.R2_SECRET_ACCESS_KEY &&
			process.env.R2_BUCKET_NAME
		);
	}
}
