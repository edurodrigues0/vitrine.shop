import type { Attribute, AttributeValue, Product, ProductImage, ProductVariation, Stock, VariantAttribute } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";
import type { AttributesValuesRepository } from "~/repositories/attributes-values-repository";
import type { ProductImagesRepository } from "~/repositories/product-images-repository";
import type { ProductsRespository } from "~/repositories/products-respository";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { StockRepository } from "~/repositories/stock-repository";
import type { VariantAttributesRepository } from "~/repositories/variant-attributes-repository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

interface FindProductDetailsByIdUseCaseRequest {
	id: string;
}

interface ProductVariationWithDetails extends ProductVariation {
	stock: Stock | null;
	images: ProductImage[];
	attributes: Array<{
		attribute: Attribute;
		values: AttributeValue[];
	}>;
}

interface FindProductDetailsByIdUseCaseResponse {
	product: Product;
	variations: ProductVariationWithDetails[];
}

export class FindProductDetailsByIdUseCase {
	constructor(
		private readonly productsRepository: ProductsRespository,
		private readonly productVariationsRepository: ProductVariationsRepository,
		private readonly stockRepository: StockRepository,
		private readonly productImagesRepository: ProductImagesRepository,
		private readonly variantAttributesRepository: VariantAttributesRepository,
		private readonly attributesRepository: AttributesRepository,
		private readonly attributesValuesRepository: AttributesValuesRepository,
	) {}

	async execute({
		id,
	}: FindProductDetailsByIdUseCaseRequest): Promise<FindProductDetailsByIdUseCaseResponse> {
		const product = await this.productsRepository.findById({ id });

		if (!product) {
			throw new ProductNotFoundError();
		}

		// Buscar todas as variações do produto
		const variations = await this.productVariationsRepository.findByProductId({
			productId: id,
		});

		// Para cada variação, buscar estoque, imagens e atributos
		const variationsWithDetails: ProductVariationWithDetails[] = await Promise.all(
			variations.map(async (variation) => {
				// Buscar estoque
				const stock = await this.stockRepository.findByVariantId({
					variantId: variation.id,
				});

				// Buscar imagens
				const images = await this.productImagesRepository.findProductImagesByProductId({
					productVariationId: variation.id,
				});

				// Buscar atributos da variação
				const variantAttributes = await this.variantAttributesRepository.findByVariantId({
					variantId: variation.id,
				});

				// Para cada atributo, buscar os valores
				const attributesWithValues = await Promise.all(
					variantAttributes.map(async (variantAttribute) => {
						const attribute = await this.attributesRepository.findById({
							id: variantAttribute.attributeId,
						});

						if (!attribute) {
							return null;
						}

						const values = await this.attributesValuesRepository.findByAttributeId({
							attributeId: attribute.id,
						});

						return {
							attribute,
							values,
						};
					}),
				);

				// Filtrar valores nulos
				const validAttributes = attributesWithValues.filter(
					(attr): attr is { attribute: Attribute; values: AttributeValue[] } =>
						attr !== null,
				);

				return {
					...variation,
					stock,
					images,
					attributes: validAttributes,
				};
			}),
		);

		return {
			product,
			variations: variationsWithDetails,
		};
	}
}

