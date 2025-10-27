import type { ProductsRespository } from "~/repositories/products-respository";

interface DeleteProductUseCaseRequest {
	id: string;
}

export class DeleteProductUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({ id }: DeleteProductUseCaseRequest): Promise<void> {
		const product = await this.productsRepository.findById({ id });

		if (!product) {
			throw new Error("Product not found");
		}

		await this.productsRepository.delete({ id });
	}
}
