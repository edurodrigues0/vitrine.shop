import type { ProductImage } from "~/database/schema";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import type { ProductsRespository } from "~/repositories/products-respository";
import { FailedToCreateProductImageError } from "../@errors/product-images/failed-to-create-product-image-error";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

interface CreateProductImageUseCaseRequest {
	productId: string;
	url: string;
}

interface CreateProductImageUseCaseResponse {
	productImage: ProductImage;
}

export class CreateProductImageUseCase {
	constructor(
		private readonly productImagesRepository: ProductImagesRepository,
		private readonly productsRepository: ProductsRespository,
	) {}

	async execute({
		productId,
		url,
	}: CreateProductImageUseCaseRequest): Promise<CreateProductImageUseCaseResponse> {
		const existingProduct = await this.productsRepository.findById({
			id: productId,
		});

		if (!existingProduct) {
			throw new ProductNotFoundError();
		}

		const productImage = await this.productImagesRepository.create({
			productId,
			url,
		});

		if (!productImage) {
			throw new FailedToCreateProductImageError();
		}

		return { productImage };
	}
}
