import type { ProductImage } from "~/database/schema";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import { redisImageCacheService } from "~/services/cache/redis-image-cache-service";
import { FailedToCreateProductImageError } from "../@errors/product-images/failed-to-create-product-image-error";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";

interface CreateProductImageUseCaseRequest {
	productVariationId: string;
	url: string;
}

interface CreateProductImageUseCaseResponse {
	productImage: ProductImage;
}

export class CreateProductImageUseCase {
	constructor(
		private readonly productImagesRepository: ProductImagesRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		productVariationId,
		url,
	}: CreateProductImageUseCaseRequest): Promise<CreateProductImageUseCaseResponse> {
		const existingProductVariation =
			await this.productVariationsRepository.findById({
				id: productVariationId,
			});

		if (!existingProductVariation) {
			throw new ProductVariationNotFoundError();
		}

		const productImage = await this.productImagesRepository.create({
			productVariationId,
			url,
		});

		if (!productImage) {
			throw new FailedToCreateProductImageError();
		}

		// Armazenar URL da imagem no Redis
		try {
			await redisImageCacheService.setImageUrl(productImage.id, productImage.url);
		} catch (error) {
			// Log do erro mas não falha a criação da imagem
			console.error("Erro ao salvar imagem no Redis:", error);
		}

		return { productImage };
	}
}
