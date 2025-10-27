import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface FindProductByIdUseCaseRequest {
	id: string;
}

interface FindProductByIdUseCaseResponse {
	product: Product | null;
}

export class FindProductByIdUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({
		id,
	}: FindProductByIdUseCaseRequest): Promise<FindProductByIdUseCaseResponse> {
		const product = await this.productsRepository.findById({ id });

		if (!product) {
			throw new Error("Product not found");
		}

		return { product };
	}
}
