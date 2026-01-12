import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Attributes Errors
import { AttributeNotFoundError } from "~/use-cases/@errors/attributes/attribute-not-found-error";
import { AttributeAlreadyExistsError } from "~/use-cases/@errors/attributes/attribute-already-exists-error";
import { FailedToCreateAttributeError } from "~/use-cases/@errors/attributes/failed-to-create-attribute-error";
import { FailedToUpdateAttributeError } from "~/use-cases/@errors/attributes/failed-to-update-attribute-error";

// AttributesValues Errors
import { AttributeValueNotFoundError } from "~/use-cases/@errors/attributes-values/attribute-value-not-found-error";
import { AttributeValueAlreadyExistsError } from "~/use-cases/@errors/attributes-values/attribute-value-already-exists-error";
import { InvalidAttributeValueError } from "~/use-cases/@errors/attributes-values/invalid-attribute-value-error";
import { FailedToCreateAttributeValueError } from "~/use-cases/@errors/attributes-values/failed-to-create-attribute-value-error";
import { FailedToUpdateAttributeValueError } from "~/use-cases/@errors/attributes-values/failed-to-update-attribute-value-error";

// VariantAttributes Errors
import { VariantAttributeNotFoundError } from "~/use-cases/@errors/variant-attributes/variant-attribute-not-found-error";
import { VariantAttributeAlreadyExistsError } from "~/use-cases/@errors/variant-attributes/variant-attribute-already-exists-error";
import { FailedToCreateVariantAttributeError } from "~/use-cases/@errors/variant-attributes/failed-to-create-variant-attribute-error";

// Stock Errors
import { StockNotFoundError } from "~/use-cases/@errors/stock/stock-not-found-error";
import { FailedToCreateStockError } from "~/use-cases/@errors/stock/failed-to-create-stock-error";
import { FailedToUpdateStockError } from "~/use-cases/@errors/stock/failed-to-update-stock-error";

// Categories Errors
import { CategoryNotFoundError } from "~/use-cases/@errors/categories/category-not-found-error";
import { CategoryAlreadyExistsError } from "~/use-cases/@errors/categories/category-already-exists-error";
import { FailedToUpdateCategoryError } from "~/use-cases/@errors/categories/failed-to-update-category-error";

// Products Errors
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { FailedToUpdateProductError } from "~/use-cases/@errors/products/failed-to-update-product-error";

// ProductVariations Errors
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { FailedToCreateProductVariationError } from "~/use-cases/@errors/product-variations/failed-to-create-product-variation-error";
import { FailedToUpdateProductVariationError } from "~/use-cases/@errors/product-variations/failed-to-update-product-variation-error";

// ProductImages Errors
import { ProductImageNotFoundError } from "~/use-cases/@errors/product-images/product-image-not-found-error";
import { FailedToCreateProductImageError } from "~/use-cases/@errors/product-images/failed-to-create-product-image-error";
import { FailedToUpdateProductImageError } from "~/use-cases/@errors/product-images/failed-to-update-product-image-error";

// Stores Errors
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { StoreWithSameCnpjCpfError } from "~/use-cases/@errors/stores/store-with-same-cpnjcpf-error";
import { StoreWithSameWhatsappError } from "~/use-cases/@errors/stores/store-with-same-whatsapp-error";
import { StoreWithSameSlugError } from "~/use-cases/@errors/stores/store-with-same-slug";
import { FailedToUpdateStoreError } from "~/use-cases/@errors/stores/failed-to-update-store-error";

// Users Errors
import { UserNotFoundError } from "~/use-cases/@errors/users/user-not-found-error";
import { UserAlreadyExistsError } from "~/use-cases/@errors/users/user-already-exists-error";
import { InvalidCredentialsError } from "~/use-cases/@errors/users/invalid-credentials-error";
import { InvalidTokenError } from "~/use-cases/@errors/users/invalid-token-error";

// Cities Errors
import { CityNotFoundError } from "~/use-cases/@errors/cities/city-not-found-error";
import { CityAlreadyExistsError } from "~/use-cases/@errors/cities/city-already-exists-error";

// Addresses Errors
import { AddressNotFoundError } from "~/use-cases/@errors/addresses/address-not-found-error";

// Orders Errors
import { OrderNotFoundError } from "~/use-cases/@errors/orders/order-not-found-error";
import { InsufficientStockError } from "~/use-cases/@errors/orders/insufficient-stock-error";

// Subscriptions Errors
import { SubscriptionNotFoundError } from "~/use-cases/@errors/subscriptions/subscription-not-found-error";
import { SubscriptionAlreadyExistsError } from "~/use-cases/@errors/subscriptions/subscription-already-exists-error";
import { FailedToCreateSubscriptionError } from "~/use-cases/@errors/subscriptions/failed-to-create-subscription-error";

// Plans Errors
import { UserLimitExceededError } from "~/use-cases/@errors/plans/user-limit-exceeded-error";
import { StoreLimitExceededError } from "~/use-cases/@errors/plans/store-limit-exceeded-error";
import { ProductLimitExceededError } from "~/use-cases/@errors/plans/product-limit-exceeded-error";
import { SubscriptionRequiredError } from "~/use-cases/@errors/plans/subscription-required-error";

export function errorHandlerMiddleware(
	error: Error,
	request: Request,
	response: Response,
	next: NextFunction,
) {
	console.error("Error handler middleware:", error);

	// Zod Validation Errors
	if (error instanceof ZodError) {
		return response.status(400).json({
			message: "Validation error",
			issues: error.issues,
		});
	}

	// 401 - Unauthorized Errors
	if (
		error instanceof InvalidCredentialsError ||
		error instanceof InvalidTokenError
	) {
		return response.status(401).json({
			message: error.message,
		});
	}

	// 403 - Forbidden Errors
	if (
		error instanceof UserLimitExceededError ||
		error instanceof StoreLimitExceededError ||
		error instanceof ProductLimitExceededError ||
		error instanceof SubscriptionRequiredError
	) {
		return response.status(403).json({
			message: error.message,
		});
	}

	// 404 - Not Found Errors
	if (
		error instanceof AttributeNotFoundError ||
		error instanceof AttributeValueNotFoundError ||
		error instanceof VariantAttributeNotFoundError ||
		error instanceof StockNotFoundError ||
		error instanceof CategoryNotFoundError ||
		error instanceof ProductNotFoundError ||
		error instanceof ProductVariationNotFoundError ||
		error instanceof ProductImageNotFoundError ||
		error instanceof StoreNotFoundError ||
		error instanceof UserNotFoundError ||
		error instanceof CityNotFoundError ||
		error instanceof AddressNotFoundError ||
		error instanceof OrderNotFoundError ||
		error instanceof SubscriptionNotFoundError
	) {
		return response.status(404).json({
			message: error.message,
		});
	}

	// 409 - Conflict Errors (Already Exists)
	if (
		error instanceof AttributeAlreadyExistsError ||
		error instanceof AttributeValueAlreadyExistsError ||
		error instanceof VariantAttributeAlreadyExistsError ||
		error instanceof CategoryAlreadyExistsError ||
		error instanceof UserAlreadyExistsError ||
		error instanceof CityAlreadyExistsError ||
		error instanceof StoreWithSameCnpjCpfError ||
		error instanceof StoreWithSameWhatsappError ||
		error instanceof StoreWithSameSlugError ||
		error instanceof SubscriptionAlreadyExistsError
	) {
		return response.status(409).json({
			message: error.message,
		});
	}

	// 400 - Bad Request Errors (Invalid, Validation, Business Rules)
	if (
		error instanceof InvalidAttributeValueError ||
		error instanceof InsufficientStockError
	) {
		return response.status(400).json({
			message: error.message,
		});
	}

	// 422 - Unprocessable Entity (Domain Rules Violated)
	if (
		error instanceof FailedToCreateAttributeError ||
		error instanceof FailedToUpdateAttributeError ||
		error instanceof FailedToCreateAttributeValueError ||
		error instanceof FailedToUpdateAttributeValueError ||
		error instanceof FailedToCreateVariantAttributeError ||
		error instanceof FailedToCreateStockError ||
		error instanceof FailedToUpdateStockError ||
		error instanceof FailedToUpdateCategoryError ||
		error instanceof FailedToUpdateProductError ||
		error instanceof FailedToCreateProductVariationError ||
		error instanceof FailedToUpdateProductVariationError ||
		error instanceof FailedToCreateProductImageError ||
		error instanceof FailedToUpdateProductImageError ||
		error instanceof FailedToUpdateStoreError ||
		error instanceof FailedToCreateSubscriptionError
	) {
		return response.status(422).json({
			message: error.message,
		});
	}

	// Default 500 Error
	return response.status(500).json({
		message: error.message || "Internal server error",
	});
}

