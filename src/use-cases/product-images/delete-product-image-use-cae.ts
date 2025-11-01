import type { ProductImagesRepository } from "~/repositories/product-images-repository";
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
	}
}
