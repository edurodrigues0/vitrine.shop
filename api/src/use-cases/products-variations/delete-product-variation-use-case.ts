import type { ProductVariationsRepository } from "~/repositories/product-variations";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";

interface DeleteProductVariationUseCaseRequest {
	id: string;
}

export class DeleteProductVariationUseCase {
	constructor(
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({ id }: DeleteProductVariationUseCaseRequest): Promise<void> {
		const productVariation = await this.productVariationsRepository.findById({
			id,
		});

		if (!productVariation) {
			throw new ProductVariationNotFoundError();
		}

		await this.productVariationsRepository.delete({ id });
	}
}
