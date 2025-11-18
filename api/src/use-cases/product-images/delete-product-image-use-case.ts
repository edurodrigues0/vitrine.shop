import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import { ProductImageNotFoundError } from "../@errors/product-images/product-image-not-found-error";
import { FirebaseStorageService } from "~/services/storage/firestore-storage-service";
import { LocalStorageService } from "~/services/storage/local-storage-service";
import { R2StorageService } from "~/services/storage/r2-storage-service";

interface DeleteProductImageUseCaseRequest {
	id: string;
}

export class DeleteProductImageUseCase {
	constructor(
		private readonly productImagesRepository: ProductImagesRepository,
	) {}

	async execute({ id }: DeleteProductImageUseCaseRequest): Promise<void> {
		const productImage = await this.productImagesRepository.findById({ id });

		if (!productImage) {
			throw new ProductImageNotFoundError();
		}

		// Extrair o nome do arquivo da URL para deletar do storage
		const url = productImage.url;

		// Tentar deletar do storage baseado no tipo de URL
		try {
			// Verificar se é URL do R2
			let isR2Url = false;
			if (R2StorageService.isConfigured()) {
				isR2Url =
					url.includes("r2.dev") ||
					url.includes("r2.cloudflarestorage.com");

				// Verificar se é domínio customizado do R2
				if (!isR2Url && process.env.R2_PUBLIC_URL) {
					try {
						const urlObj = new URL(url);
						const publicUrlObj = new URL(process.env.R2_PUBLIC_URL);
						isR2Url = urlObj.hostname === publicUrlObj.hostname;
					} catch {
						// Se falhar ao fazer parse, continuar com outras verificações
					}
				}
			}

			if (isR2Url) {
				const storageService = new R2StorageService();
				const fileName = storageService.extractFileNameFromUrl(url);
				if (fileName) {
					await storageService.deleteImage(fileName);
				}
			}
			// Verificar se é URL do Firebase
			else if (
				FirebaseStorageService.isConfigured() &&
				url.includes("firebasestorage.googleapis.com")
			) {
				const storageService = new FirebaseStorageService();
				// Para Firebase, precisamos extrair o path do storage
				const pathMatch = url.match(/products%2F([^?]+)/);
				if (pathMatch) {
					await storageService.deleteImage(pathMatch[1]);
				} else {
					// Fallback: extrair nome do arquivo
					const fileName = url.split("/").pop() || "";
					await storageService.deleteImage(fileName);
				}
			}
			// Fallback para LocalStorage
			else {
				const storageService = new LocalStorageService();
				const fileName = url.split("/").pop() || "";
				await storageService.deleteImage(fileName);
			}
		} catch (error) {
			// Log do erro mas não falhar a operação se o arquivo não existir no storage
			console.warn("Erro ao deletar arquivo do storage:", error);
		}

		await this.productImagesRepository.delete({ id });
	}
}
