import type { Pagination } from "~/@types/pagination";
import type { Attribute } from "~/database/schema";
import type {
	AttributesRepository,
	FindAllAttributesParams,
	UpdateAttributeParams,
} from "../attributes-repository";

export class InMemoryAttributesRepository implements AttributesRepository {
	public items: Attribute[] = [];

	async create({ name }: { name: string }): Promise<Attribute> {
		const id = crypto.randomUUID();

		const attribute: Attribute = {
			id,
			name,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(attribute);
		return attribute;
	}

	async findById({ id }: { id: string }): Promise<Attribute | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByName({ name }: { name: string }): Promise<Attribute | null> {
		return this.items.find((item) => item.name === name) ?? null;
	}

	async findAll({ page, limit, filters }: FindAllAttributesParams): Promise<{
		attributes: Attribute[];
		pagination: Pagination;
	}> {
		const { name } = filters;
		let attributes = this.items;

		if (name) {
			attributes = attributes.filter((item) =>
				item.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		const totalItems = attributes.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedAttributes = attributes.slice(
			(page - 1) * limit,
			page * limit,
		);

		return {
			attributes: paginatedAttributes,
			pagination: {
				totalItems,
				totalPages,
				perPage: limit,
				currentPage: page,
			},
		};
	}

	async update({ id, data }: UpdateAttributeParams): Promise<Attribute | null> {
		const attributeIndex = this.items.findIndex((item) => item.id === id);

		if (attributeIndex < 0) {
			return null;
		}

		const currentAttribute = this.items[attributeIndex];

		if (!currentAttribute) {
			return null;
		}

		const updatedAttribute: Attribute = {
			...currentAttribute,
			name: data.name ?? currentAttribute.name,
			updatedAt: new Date(),
		};

		this.items[attributeIndex] = updatedAttribute;
		return updatedAttribute;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const attributeIndex = this.items.findIndex((item) => item.id === id);
		if (attributeIndex >= 0) {
			this.items.splice(attributeIndex, 1);
		}
	}
}

