import type { Pagination } from "~/@types/pagination";
import type { Attribute } from "~/database/schema";

export interface FindAllAttributesParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
	};
}

export interface UpdateAttributeParams {
	id: string;
	data: {
		name?: string;
	};
}

export interface AttributesRepository {
	create({ name }: { name: string }): Promise<Attribute>;

	findById({ id }: { id: string }): Promise<Attribute | null>;

	findByName({ name }: { name: string }): Promise<Attribute | null>;

	findAll({ page, limit, filters }: FindAllAttributesParams): Promise<{
		attributes: Attribute[];
		pagination: Pagination;
	}>;

	update({ id, data }: UpdateAttributeParams): Promise<Attribute | null>;

	delete({ id }: { id: string }): Promise<void>;
}

