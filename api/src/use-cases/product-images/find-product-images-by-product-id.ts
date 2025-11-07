import type { ProductImage } from "~/database/schema";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import { redisImageCacheService } from "~/services/cache/redis-image-cache-service";

interface FindProductImagesByProductVariationIdUseCaseRequest {
	productVariationId: string;
}

interface FindProductImagesByProductVariationIdUseCaseResponse {
	productImages: ProductImage[];
}

export class FindProductImagesByProductVariationIdUseCase {
	constructor(
		private readonly productImagesRepository: ProductImagesRepository,
	) {}

	async execute({
		productVariationId,
	}: FindProductImagesByProductVariationIdUseCaseRequest): Promise<FindProductImagesByProductVariationIdUseCaseResponse> {
		const productImages =
			await this.productImagesRepository.findProductImagesByProductId({
				productVariationId,
			});

		// Armazenar todas as URLs no Redis para cache futuro
		if (productImages.length > 0) {
			try {
				const imagesToCache = productImages.map((image) => ({
					id: image.id,
					url: image.url,
				}));
				await redisImageCacheService.setMultipleImageUrls(imagesToCache);
			} catch (error) {
				// Log do erro mas não falha a busca
				console.error("Erro ao salvar imagens no Redis:", error);
			}
		}

		return { productImages };
	}
}
