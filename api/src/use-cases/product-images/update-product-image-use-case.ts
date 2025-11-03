import type { ProductImage } from "~/database/schema";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import { FailedToUpdateProductImageError } from "../@errors/product-images/failed-to-update-product-image-error";
import { ProductImageNotFoundError } from "../@errors/product-images/product-image-not-found-error";

interface UpdateProductImageUseCaseRequest {
	id: string;
	data: {
		url?: string;
	};
}

interface UpdateProductImageUseCaseResponse {
	productImage: ProductImage;
}

export class UpdateProductImageUseCase {
	constructor(
		private readonly productImagesRepository: ProductImagesRepository,
	) {}

	async execute({
		id,
		data,
	}: UpdateProductImageUseCaseRequest): Promise<UpdateProductImageUseCaseResponse> {
		const productImage = await this.productImagesRepository.findById({ id });

		if (!productImage) {
			throw new ProductImageNotFoundError();
		}

		const updatedProductImage = await this.productImagesRepository.update({
			id,
			data,
		});

		if (!updatedProductImage) {
			throw new FailedToUpdateProductImageError();
		}

		return { productImage: updatedProductImage };
	}
}
