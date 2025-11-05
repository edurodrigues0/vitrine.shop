import type { Request, Response, NextFunction } from "express";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";
import type { AuthenticatedRequest } from "./authenticate";

/**
 * Middleware para verificar se o usuário é dono da loja
 */
export async function requireStoreOwner(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		const storeId = request.params.storeId || request.params.id;
		const userId = request.user?.id;

		if (!storeId) {
			return response.status(400).json({
				message: "Store ID is required",
			});
		}

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id: storeId });

		if (!store) {
			return response.status(404).json({
				message: "Store not found",
			});
		}

		// Verificar se o usuário é o dono da loja
		if (store.ownerId !== userId) {
			return response.status(403).json({
				message: "You do not have permission to access this store",
			});
		}

		// Adicionar a loja à requisição para uso posterior
		(request as AuthenticatedRequest & { store: typeof store }).store = store;

		next();
	} catch (error) {
		console.error("Error in requireStoreOwner middleware:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

/**
 * Middleware para verificar se o usuário é dono do produto ou da loja
 */
export async function requireProductOwner(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		const productId = request.params.productId || request.params.id;
		const userId = request.user?.id;

		if (!productId) {
			return response.status(400).json({
				message: "Product ID is required",
			});
		}

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		// Buscar o produto para obter o storeId
		const { makeFindProductByIdUseCase } = await import(
			"~/use-cases/@factories/products/make-find-product-by-id-use-case"
		);
		const findProductByIdUseCase = makeFindProductByIdUseCase();
		const { product } = await findProductByIdUseCase.execute({ id: productId });

		if (!product) {
			return response.status(404).json({
				message: "Product not found",
			});
		}

		// Verificar se o usuário é dono da loja do produto
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id: product.storeId });

		if (!store || store.ownerId !== userId) {
			return response.status(403).json({
				message: "You do not have permission to access this product",
			});
		}

		next();
	} catch (error) {
		console.error("Error in requireProductOwner middleware:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

/**
 * Middleware para verificar se o usuário é dono do pedido ou da loja
 */
export async function requireOrderOwner(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		const orderId = request.params.orderId || request.params.id;
		const userId = request.user?.id;

		if (!orderId) {
			return response.status(400).json({
				message: "Order ID is required",
			});
		}

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		// Buscar o pedido para obter o storeId
		const { makeFindOrderByIdUseCase } = await import(
			"~/use-cases/@factories/orders/make-find-order-by-id-use-case"
		);
		const findOrderByIdUseCase = makeFindOrderByIdUseCase();
		const { order } = await findOrderByIdUseCase.execute({ id: orderId });

		if (!order) {
			return response.status(404).json({
				message: "Order not found",
			});
		}

		// Verificar se o usuário é dono da loja do pedido
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id: order.storeId });

		if (!store || store.ownerId !== userId) {
			return response.status(403).json({
				message: "You do not have permission to access this order",
			});
		}

		next();
	} catch (error) {
		console.error("Error in requireOrderOwner middleware:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

