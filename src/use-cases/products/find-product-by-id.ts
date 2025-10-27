import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

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
			throw new ProductNotFoundError();
		}

		return { product };
	}
}
