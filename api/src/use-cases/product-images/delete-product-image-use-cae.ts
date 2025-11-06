import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import { redisImageCacheService } from "~/services/cache/redis-image-cache-service";
import { ProductImageNotFoundError } from "../@errors/product-images/product-image-not-found-error";

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
