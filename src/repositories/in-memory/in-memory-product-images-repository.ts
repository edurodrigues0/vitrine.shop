import type { ProductImage } from "~/database/schema";
import type {
	CreateProductImageParams,
	ProductImagesRepository,
	UpdateProductImageParams,
} from "../product-images-repository";

export class InMemoryProductImagesRepository
	implements ProductImagesRepository
{
	public items: ProductImage[] = [];

	async create({
		productId,
		url,
	}: CreateProductImageParams): Promise<ProductImage | null> {
		const id = crypto.randomUUID();
		const createdAt = new Date();

		const productImage: ProductImage = {
			id,
			productId,
			url,
			createdAt,
		};

		this.items.push(productImage);

		return productImage;
	}

	async findById({ id }: { id: string }): Promise<ProductImage | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findProductImagesByProductId({
		productId,
	}: {
		productId: string;
	}): Promise<ProductImage[]> {
		const productImages = this.items.filter(
			(item) => item.productId === productId,
		);

		return productImages;
	}

	async update({
		id,
		data,
	}: UpdateProductImageParams): Promise<ProductImage | null> {
		const productImageIndex = this.items.findIndex((item) => item.id === id);

		if (productImageIndex < 0) {
			return null;
		}

		const currentProductImage = this.items[productImageIndex];

		if (!currentProductImage) {
			return null;
		}

		const updatedProductImage: ProductImage = {
			...currentProductImage,
			...data,
		};

		this.items[productImageIndex] = updatedProductImage;

		return updatedProductImage;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const productImageIndex = this.items.findIndex((item) => item.id === id);

		if (productImageIndex >= 0) {
			this.items.splice(productImageIndex, 1);
		}
	}
}
