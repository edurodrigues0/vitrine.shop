import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import { redisImageCacheService } from "~/services/cache/redis-image-cache-service";
import { ProductImageNotFoundError } from "../@errors/product-images/product-image-not-found-error";
import { FirebaseStorageService } from "~/services/storage/firestore-storage-service";
import { LocalStorageService } from "~/services/storage/local-storage-service";

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
		
		// Tentar deletar do storage
		try {
			// Extrair o nome do arquivo da URL
			const fileName = url.split("/").pop() || "";
			
			if (FirebaseStorageService.isConfigured()) {
				const storageService = new FirebaseStorageService();
				// Se for uma URL do Firebase, tentar extrair o path correto
				if (url.includes("firebasestorage.googleapis.com")) {
					// Para Firebase, precisamos extrair o path do storage
					const pathMatch = url.match(/products%2F([^?]+)/);
					if (pathMatch) {
						await storageService.deleteImage(pathMatch[1]);
					}
				} else {
					await storageService.deleteImage(fileName);
				}
			} else {
				const storageService = new LocalStorageService();
				await storageService.deleteImage(fileName);
			}
		} catch (error) {
			// Log do erro mas não falhar a operação se o arquivo não existir no storage
			console.warn("Erro ao deletar arquivo do storage:", error);
		}

		await this.productImagesRepository.delete({ id });

		// Remover URL da imagem do Redis
		try {
			await redisImageCacheService.deleteImageUrl(id);
		} catch (error) {
			// Log do erro mas não falha a exclusão da imagem
			console.error("Erro ao remover imagem do Redis:", error);
		}
	}
}
