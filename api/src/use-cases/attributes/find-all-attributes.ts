import type { Pagination } from "~/@types/pagination";
import type { Attribute } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";

interface FindAllAttributesUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
	};
}

interface FindAllAttributesUseCaseResponse {
	attributes: Attribute[];
	pagination: Pagination;
}

export class FindAllAttributesUseCase {
	constructor(private readonly attributesRepository: AttributesRepository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllAttributesUseCaseRequest): Promise<FindAllAttributesUseCaseResponse> {
		const { attributes, pagination } =
			await this.attributesRepository.findAll({
				page,
				limit,
				filters,
			});

		return { attributes, pagination };
	}
}

