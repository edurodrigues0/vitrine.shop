import type { ProductImage } from "~/database/schema";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";

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

		return { productImages };
	}
}
