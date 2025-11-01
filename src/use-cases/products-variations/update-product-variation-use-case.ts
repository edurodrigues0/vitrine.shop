import type { ProductVariation } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import { FailedToUpdateProductVariationError } from "../@errors/product-variations/failed-to-update-product-variation-error";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";

interface UpdateProductVariationUseCaseRequest {
	id: string;
	data: {
		size?: string;
		color?: string;
		weight?: string;
		dimensions?: Record<string, unknown>;
	};
}

interface UpdateProductVariationUseCaseResponse {
	productVariation: ProductVariation;
}

export class UpdateProductVariationUseCase {
	constructor(
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		id,
		data,
	}: UpdateProductVariationUseCaseRequest): Promise<UpdateProductVariationUseCaseResponse> {
		const productVariation = await this.productVariationsRepository.findById({
			id,
		});

		if (!productVariation) {
			throw new ProductVariationNotFoundError();
		}

		const updatedProductVariation =
			await this.productVariationsRepository.update({
				id,
				data,
			});

		if (!updatedProductVariation) {
			throw new FailedToUpdateProductVariationError();
		}

		return { productVariation: updatedProductVariation };
	}
}
