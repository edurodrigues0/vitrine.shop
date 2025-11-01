import type { ProductImage } from "~/database/schema";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";

interface FindProductImagesByProductIdUseCaseRequest {
	productId: string;
}

interface FindProductImagesByProductIdUseCaseResponse {
	productImages: ProductImage[];
}

export class FindProductImagesByProductIdUseCase {
	constructor(
		private readonly productImagesRepository: ProductImagesRepository,
	) {}

	async execute({
		productId,
	}: FindProductImagesByProductIdUseCaseRequest): Promise<FindProductImagesByProductIdUseCaseResponse> {
		const productImages =
			await this.productImagesRepository.findProductImagesByProductId({
				productId,
			});

		return { productImages };
	}
}
